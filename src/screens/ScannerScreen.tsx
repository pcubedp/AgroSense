import React, { useState } from "react";
import { View, Text, ScrollView, TextInput, Image, TouchableOpacity, ActivityIndicator, StyleSheet, Alert } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { useLanguage, t, useToast, useData } from "./helpers";

let GEMINI_KEY: string | null = null;
try {
  const keyFile = require("../gemini-key.json");
  GEMINI_KEY = keyFile?.api_key || keyFile?.key || null;
} catch (err) {
  console.log("gemini-key.json not found or unreadable. Will use mock fallback if API call fails.");
}

function Card({ children, style }: any) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const iniFormPre = { farmArea: "", farmAddress: "", cropHistory: "", plannedCrop: "", sowingDate: "" };
const iniFormPost = { farmArea: "", farmAddress: "", actualCrop: "", irrigation: "", fertilizersUsed: "", pestUse: "", expectedYield: "" };

export default function ScannerScreen({ onBack }) {
  const { lang, setLang } = useLanguage();
  const toastCtx = useToast();
  const { data, setData } = useData();

  const [stage, setStage] = useState<"pre" | "post">("pre");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [form, setForm] = useState(iniFormPre);
  const [submitted, setSubmitted] = useState(false);
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function switchStage(s: "pre" | "post") {
    setStage(s); setSelectedImage(null); setAnalysis(null); setForm(s === "pre" ? iniFormPre : iniFormPost); setSubmitted(false);
  }
  function onInput(key: string, val: string) { setForm(f => ({ ...f, [key]: val })); }

  async function pickImage(fromGallery: boolean) {
    setSelectedImage(null); setAnalysis(null); setIsAnalyzing(false); setSubmitted(false);
    try {
      let result;
      if (fromGallery) {
        const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!perm.granted) { toastCtx.show(t("error", lang), "error"); return; }
        result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8, base64: false });
      } else {
        const perm = await ImagePicker.requestCameraPermissionsAsync();
        if (!perm.granted) { toastCtx.show(t("error", lang), "error"); return; }
        result = await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8, base64: false });
      }
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (err) {
      console.warn(err);
      toastCtx.show(t("error", lang), "error");
    }
  }

  async function fetchLocation() {
    setIsLocationLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setForm(f => ({ ...f, farmAddress: "Permission denied" }));
        return;
      }
      const pos = await Location.getCurrentPositionAsync({});
      const rev = await Location.reverseGeocodeAsync({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
      const a = rev[0];
      const addr = `${a.name ?? ""} ${a.street ?? ""}, ${a.city ?? ""} ${a.region ?? ""} ${a.postalCode ?? ""}`.trim();
      setForm(f => ({ ...f, farmAddress: addr }));
    } catch (e) {
      setForm(f => ({ ...f, farmAddress: t("locationUnavailable", lang) }));
    } finally {
      setIsLocationLoading(false);
    }
  }

  async function handleSubmit() {
    const required = stage === "pre" ? ["farmArea", "farmAddress", "plannedCrop", "sowingDate"] : ["farmArea", "farmAddress", "actualCrop", "irrigation"];
    for (let f of required) if (!form[f]) { toastCtx.show(t("missingDetails", lang), "error"); setSubmitted(true); return; }
    if (!selectedImage) { toastCtx.show(t("missingData", lang), "error"); setSubmitted(true); return; }

    setIsAnalyzing(true);
    setSubmitted(true);

    // Build payload to send
    const payload = {
      farmArea: form.farmArea,
      farmAddress: form.farmAddress,
      cropHistory: form.cropHistory || null,
      plannedCrop: form.plannedCrop || null,
      sowingDate: form.sowingDate || null,
      actualCrop: form.actualCrop || null,
      irrigation: form.irrigation || null,
      fertilizersUsed: form.fertilizersUsed || null,
      pestUse: form.pestUse || null,
      expectedYield: form.expectedYield || null,
      stage,
    };

    try {
      let resultJson: any = null;

      if (GEMINI_KEY) {
        setIsSubmitting(true);

        const promptText = `You are an agricultural assistant. Given this farm data as JSON: ${JSON.stringify(payload)}. 
Return a JSON ONLY object with keys:
"cropRecommendation", "profitability","soilHealth","stageSpecificAdvice".
Use concise values.`;

        const body = {
          prompt: promptText,
          temperature: 0.2,
          maxOutputTokens: 400,
        };

        const url = "https://generativelanguage.googleapis.com/v1beta2/models/text-bison-001:generate";

        const resp = await fetch(`${url}?key=${GEMINI_KEY}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        });

        if (!resp.ok) {
          console.warn("Gemini API returned non-OK", resp.status, await resp.text());
          throw new Error("Gemini API error");
        }

        const respObj = await resp.json();
        let textOutput = null;
        if (respObj?.candidates && respObj.candidates[0]?.content) {
          const content = respObj.candidates[0].content;
          textOutput = content.map((c: any) => c?.text || c).join("");
        } else if (respObj?.candidates && respObj.candidates[0]?.output?.[0]?.content) {
          textOutput = respObj.candidates[0].output?.[0]?.content;
        } else if (typeof respObj?.outputText === "string") {
          textOutput = respObj.outputText;
        } else {
          textOutput = JSON.stringify(respObj);
        }

        try {
          const jsonMatch = textOutput.match(/\{[\s\S]*\}/);
          const jsonStr = jsonMatch ? jsonMatch[0] : textOutput;
          resultJson = JSON.parse(jsonStr);
        } catch (err) {
          console.warn("Failed to parse model output as JSON:", err);
          // fallback: put the full text under 'stageSpecificAdvice'
          resultJson = {
            cropRecommendation: null,
            profitability: null,
            soilHealth: null,
            stageSpecificAdvice: textOutput,
          };
        }
      } else {
        // No key available — use mocked result
        resultJson = {
          cropRecommendation: stage === "pre" ? "Maize (Drought tolerant hybrid)" : "Wheat (High-yield hybrid)",
          profitability: "Moderate to High",
          soilHealth: "Silty clay, amend with organic matter",
          stageSpecificAdvice: stage === "pre" ? "Prepare seedbed, apply basal NPK before sowing." : "Scout for pests and apply foliar feed.",
        };
      }

      // merge into shared data and also update relevant fields for dashboard
      const newDataPatch: any = {
        recommendation: resultJson.cropRecommendation || data?.recommendation,
        profitability: resultJson.profitability || data?.profitability,
        soilHealth: resultJson.soilHealth || data?.soilHealth,
        advice: resultJson.stageSpecificAdvice || data?.advice,
        cropAnalysis: analysis?.cropType ?? data?.cropAnalysis,
        scanDate: new Date().toLocaleDateString(),
      };
      setData(newDataPatch);

      toastCtx.show(t("reportGenerated", lang), "success");
    } catch (err) {
      console.warn("Error during submit:", err);
      toastCtx.show(t("failReport", lang), "error");
      // still update with mock so dashboard shows something
      setData({
        recommendation: "Fallback crop suggestion",
        profitability: "Unknown",
        soilHealth: "Unknown",
        advice: "No remote advice — try again later.",
        scanDate: new Date().toLocaleDateString(),
        cropAnalysis: analysis?.cropType ?? data?.cropAnalysis,
      });
    } finally {
      setIsAnalyzing(false);
      setIsSubmitting(false);
      // navigate back to dashboard (your app uses onBack)
      onBack();
    }
  }

  function handleReset() { switchStage(stage); }

  const requiredFields = stage === "pre" ? ["farmArea", "farmAddress", "plannedCrop", "sowingDate"] : ["farmArea", "farmAddress", "actualCrop", "irrigation"];
  const canSubmit = requiredFields.every(k => !!(form as any)[k]) && !!selectedImage && !isAnalyzing;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#f6f6f8" }} contentContainerStyle={{ padding: 18 }}>
      {/* Language & Stage Toggle */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <TouchableOpacity onPress={() => setLang(lang === "en" ? "hi" : "en")}
          style={styles.langTog}>
          <Text style={styles.langText}>{t("language", lang)}: {lang === "en" ? "EN" : "HI"}</Text>
        </TouchableOpacity>
        <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "center" }}>
            <TouchableOpacity style={[styles.pill, stage === "pre" && styles.pillActive]} onPress={() => switchStage("pre")}>
            <Text style={styles.pillText(stage === "pre")}>{t("pre", lang)}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.pill, stage === "post" && styles.pillActive]} onPress={() => switchStage("post")}>
            <Text style={styles.pillText(stage === "post")}>{t("post", lang)}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.header}>{t("scannerHeader", lang)}</Text>
      <Text style={styles.subHeader}>{t("subHeader", lang)}</Text>

      {/* --- Upload + Preview Card --- */}
      <Card>
        <View style={{ flexDirection: "row", gap: 10 }}>
          <TouchableOpacity style={styles.uploadBtn} onPress={() => pickImage(false)}>
            <Icon name="camera" color="#fff" size={23} /><Text style={styles.uploadBtnText}>{t("takePhoto", lang)}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.uploadBtn, { backgroundColor: "#FF8C00" }]} onPress={() => pickImage(true)}>
            <Icon name="image" color="#fff" size={22} /><Text style={styles.uploadBtnText}>{t("uploadFromGallery", lang)}</Text>
          </TouchableOpacity>
        </View>

        {selectedImage &&
          <View style={{ alignItems: "center", marginTop: 15 }}>
            <Image source={{ uri: selectedImage }} style={styles.imgPreview} />
          </View>
        }

        {isAnalyzing && (
          <View style={{ alignItems: "center", marginVertical: 12 }}>
            <ActivityIndicator color="#006400" size="large" />
            <Text style={{ color: "#006400", fontWeight: "bold", fontSize: 17 }}>{t("analyzing", lang)}</Text>
          </View>
        )}
      </Card>

      {/* --- Form Input Card --- */}
      <Card>
        <Text style={styles.formTitle}>{t("reviewDetails", lang)}</Text>

        <TextInput style={styles.input} placeholder={t("farmArea", lang)} value={form.farmArea}
          onChangeText={v => onInput("farmArea", v)} keyboardType="numeric" />

        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TextInput style={[styles.input, { flex: 1 }]} placeholder={t("farmAddress", lang)} value={form.farmAddress}
            onChangeText={v => onInput("farmAddress", v)} />
          <TouchableOpacity style={styles.locBtn} onPress={fetchLocation}>
            <Icon name="locate-sharp" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {stage === "pre" ? (
          <>
            <TextInput style={styles.input} placeholder={t("cropHistory", lang)} value={form.cropHistory} onChangeText={v => onInput("cropHistory", v)} />
            <TextInput style={styles.input} placeholder={t("plannedCrop", lang)} value={form.plannedCrop} onChangeText={v => onInput("plannedCrop", v)} />
            <TextInput style={styles.input} placeholder={t("sowingDate", lang)} value={form.sowingDate} onChangeText={v => onInput("sowingDate", v)} />
          </>
        ) : (
          <>
            <TextInput style={styles.input} placeholder={t("actualCrop", lang)} value={form.actualCrop} onChangeText={v => onInput("actualCrop", v)} />
            <TextInput style={styles.input} placeholder={t("irrigation", lang)} value={form.irrigation} onChangeText={v => onInput("irrigation", v)} />
            <TextInput style={styles.input} placeholder={t("fertilizersUsed", lang)} value={form.fertilizersUsed} onChangeText={v => onInput("fertilizersUsed", v)} />
            <TextInput style={styles.input} placeholder={t("pestUse", lang)} value={form.pestUse} onChangeText={v => onInput("pestUse", v)} />
            <TextInput style={styles.input} placeholder={t("expectedYield", lang)} value={form.expectedYield} onChangeText={v => onInput("expectedYield", v)} />
          </>
        )}
      </Card>

      {/* --- Button Bar --- */}
      <View style={{ flexDirection: "row", gap: 15, marginVertical: 12, flexWrap: "wrap" }}>
        <TouchableOpacity style={[
          styles.mainActionBtn,
          { backgroundColor: canSubmit ? "#FF8C00" : "#f5c095", flex: 1 }
        ]}
          onPress={handleSubmit} disabled={!canSubmit || isAnalyzing}>
          {isAnalyzing ? <ActivityIndicator color="#fff" /> : <Icon name="analytics-outline" color="#fff" size={22} />}
          <Text style={styles.actionText}>{t("generateReport", lang)}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.mainActionBtn, { backgroundColor: "#888", flex: 1 }]} onPress={handleReset} disabled={isAnalyzing}>
          <Icon name="close-circle-outline" color="#fff" size={20} /><Text style={styles.actionText}>{t("resetForm", lang)}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.mainActionBtn, { backgroundColor: "#295", flex: 1 }]} onPress={onBack}>
          <Icon name="arrow-back" color="#fff" size={20} /><Text style={styles.actionText}>{t("dashboard", lang)}</Text>
        </TouchableOpacity>
      </View>

      {submitted && !canSubmit &&
        <Text style={{ color: "#d00", fontWeight: "bold", marginBottom: 10 }}>{t("fillFormPrompt", lang)}</Text>
      }

      {/* --- Analysis Result Card --- */}
      {analysis && (
        <Card style={{ backgroundColor: "#e6ffe6" }}>
          <Text style={{ fontWeight: "bold", fontSize: 18, marginBottom: 7 }}>{t("aiComplete", lang)}</Text>
          <Text>{t("cropType", lang)}: <Text style={{ fontWeight: "bold", color: "#006400" }}>{analysis.cropType}</Text></Text>
          <Text>{t("soilTexture", lang)}: <Text style={{ fontWeight: "bold", color: "#295" }}>{analysis.soilTexture}</Text></Text>
          <Text style={{ marginVertical: 4 }}>{t("confidence", lang)}:
            <Text style={{ fontWeight: "bold", color: "#006400" }}> {(analysis.confidenceScore * 100).toFixed(1)}%</Text>
          </Text>

          <View style={{ height: 12, width: "100%", backgroundColor: "#eee", borderRadius: 8, marginVertical: 7 }}>
            <View style={{
              width: `${(analysis.confidenceScore * 100)}%`, height: "100%",
              backgroundColor: analysis.confidenceScore > 0.8 ? "#32CD32" : "#FFD700", borderRadius: 8
            }} />
          </View>

          {analysis.confidenceScore < 0.8 &&
            <View style={{ marginTop: 5, backgroundColor: "#fff8e1", padding: 7, borderRadius: 6 }}>
              <Text style={{ color: "#c79005", fontWeight: "bold" }}>
                {lang === "en"
                  ? "Confidence low. Please retake photo."
                  : "विश्वास कम है। कृपया फिर से फोटो लें।"}</Text>
            </View>}
        </Card>
      )}

      <View style={{ height: 42 }} />
    </ScrollView>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  card: { backgroundColor: "#fff", borderRadius: 18, padding: 16, marginBottom: 20, shadowColor: "#000", shadowOpacity: 0.09, shadowRadius: 10, elevation: 4 },
  langTog: { backgroundColor: "#32CD32", borderRadius: 13, paddingHorizontal: 16, paddingVertical: 10 },
  langText: { color: "#fff", fontWeight: "bold", fontSize: 17 },
  pill: {
  paddingVertical: 10,
  paddingHorizontal: 20,
  borderRadius: 25,
  borderWidth: 1,
  borderColor: "#006400",
  marginLeft: 8,
  marginVertical: 5,           // <-- NEW
  backgroundColor: "#fff",

  minWidth: 120,               // <-- NEW (prevents cut on small screens)
  alignItems: "center",        // <-- NEW
  justifyContent: "center"     // <-- NEW
  },
  pillActive: { backgroundColor: "#006400", borderColor: "#006400" },
  pillText: (active) => ({
      color: active ? "#fff" : "#006400",
      fontWeight: "bold",
      fontSize: 15,
      textAlign: "center"
    }),
  header: { fontSize: 27, color: "#006400", fontWeight: "bold", marginBottom: 8 },
  subHeader: { fontSize: 17, color: "#666", marginBottom: 15 },
  uploadBtn: { flexDirection: "row", alignItems: "center", backgroundColor: "#32CD32", borderRadius: 13, paddingVertical: 13, paddingHorizontal: 16, elevation: 2, flex: 1, marginBottom: 2, justifyContent: 'center' },
  uploadBtnText: { color: "#fff", fontWeight: "bold", fontSize: 16, marginLeft: 7 },
  imgPreview: { width: "100%", maxWidth: 400, height: 170, borderRadius: 15, marginTop: 7, marginBottom: 7, resizeMode: "cover", borderWidth: 2, borderColor: "#32CD32" },
  formTitle: { fontWeight: "bold", fontSize: 19, marginBottom: 7, color: "#295" },
  input: { backgroundColor: "#f7f7f7", borderRadius: 9, padding: 14, marginBottom: 12, fontSize: 16, borderWidth: 1, borderColor: "#ccc" },
  mainActionBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#FF8C00", borderRadius: 13, paddingVertical: 14, paddingHorizontal: 10, flex: 1, marginBottom: 6 },
  actionText: { color: "#fff", fontWeight: "bold", fontSize: 16, marginLeft: 6 },
  locBtn: { backgroundColor: "#1E90FF", marginLeft: 8, paddingHorizontal: 12, justifyContent: "center", borderRadius: 8 },
});
