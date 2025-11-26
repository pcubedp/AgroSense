import React from "react";
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useLanguage, t, useData } from "./helpers";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function DashboardScreen({ onGoToScanner }) {
  const { lang, setLang } = useLanguage();
  const { data } = useData();

  const farmArea = data?.scanDate ? data.scanDate : data?.scanDate ?? "—";

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#f2f8f5" }} contentContainerStyle={{ padding: 18, paddingBottom: 60 }}>
      {/* Language Toggle */}
      <TouchableOpacity onPress={() => setLang(lang === "en" ? "hi" : "en")}
        style={{ alignSelf: "flex-end", backgroundColor: "#32CD32", borderRadius: 8, paddingHorizontal: 16, paddingVertical: 9, marginBottom: 10 }}>
        <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>{t("language", lang)}: {lang === "en" ? "EN" : "HI"}</Text>
      </TouchableOpacity>

      {/* Summary Card */}
      <View style={styles.card}>
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
          <Icon name="person-circle-outline" size={32} color="#006400" />
          <View style={{ marginLeft: 12, maxWidth: SCREEN_WIDTH - 120 }}>
            <Text style={styles.bigBold}>{t("farmerName", lang)}: {data?.farmerName ?? "—"}</Text>
            <Text style={styles.semiBold}>{t("address", lang)}: {data?.address ?? "—"}</Text>
          </View>
        </View>
        <View style={{ marginTop: 10 }}>
          <Text style={styles.stageText}>
            {t("status", lang)}: <Text style={{ color: "#FF8C00" }}>{t(data?.stage === "pre" ? "preSowing" : "postSowing", lang)}</Text>
          </Text>
        </View>
      </View>

      {/* Activity Card */}
      <View style={styles.card}>
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
          <Icon name="time-outline" size={22} color="#4682B4" />
          <Text style={{ fontWeight: "bold", fontSize: 17, marginLeft: 8 }}>{t("recentActivity", lang)}</Text>
        </View>
        <Text>{t("lastScan", lang)}: {data?.scanDate ?? "—"}</Text>
        <Text>{t("cropAnalysis", lang)}: <Text style={{ color: "#006400" }}>{data?.cropAnalysis ?? "—"}</Text></Text>
        <Text>{t("nextAction", lang)}: <Text style={{ color: "#FF8C00" }}>{data?.nextAction ?? "—"}</Text></Text>

        <View style={{ marginTop: 10 }}>
          <TouchableOpacity style={styles.bigButton} onPress={onGoToScanner}>
            <Icon name="scan" size={23} color="#fff" />
            <Text style={styles.buttonText}>{t("scanFarm", lang)}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.bigButton, { backgroundColor: "#4682B4", marginTop: 10 }]}>
            <Icon name="document" size={22} color="#fff" />
            <Text style={styles.buttonText}>{t("reportsHistory", lang)}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recommendation Card */}
      <View style={styles.card}>
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 5 }}>
          <Icon name="leaf" size={25} color="#32CD32" />
          <Text style={styles.bold}>{t("cropRecommendation", lang)}</Text>
        </View>
        <Text>{t("recommendation", lang)}: <Text style={{ color: "#FF8C00" }}>{data?.recommendation ?? "—"}</Text></Text>
        <Text>{t("profitability", lang)}: <Text style={{ color: "#295" }}>{data?.profitability ?? "—"}</Text></Text>
        <Text>{t("soilHealth", lang)}: <Text style={{ color: "#295" }}>{data?.soilHealth ?? "—"}</Text></Text>
        <Text>{t("advice", lang)}: {data?.advice ?? "—"}</Text>
      </View>

      {/* Progress Bar / Calendar */}
      <View style={styles.card}>
        <Text style={styles.bold}>{t("calendar", lang)}</Text>
        <View style={{ flexDirection: "row", marginTop: 10, flexWrap: "wrap", justifyContent: "space-between" }}>
          {(data?.actions || []).map((act, i) =>
            <View key={i} style={{
              alignItems: "center", padding: 8, borderRadius: 12,
              backgroundColor: act.complete ? "#32CD32" : "#eee", width: (SCREEN_WIDTH - 72) / 3
            }}>
              <Icon name={act.complete ? "checkmark-circle-outline" : "ellipse-outline"} size={24} color={act.complete ? "#fff" : "#888"} />
              <Text style={{ color: act.complete ? "#fff" : "#888", fontWeight: "bold", fontSize: 13, marginTop: 6 }}>{t(act.key, lang)}</Text>
            </View>
          )}
        </View>
      </View>

      {/* How-To/Help Card */}
      <View style={styles.card}>
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 3 }}>
          <Icon name="information-circle-outline" size={20} color="#FF8C00" />
          <Text style={styles.bold}>{t("howToUse", lang)}</Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 1 }}>
          <Icon name="list-circle-outline" size={18} color="#006400" />
          <Text style={{ marginLeft: 5 }}>{t("step1", lang)}</Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 1 }}>
          <Icon name="image-outline" size={18} color="#FF8C00" />
          <Text style={{ marginLeft: 5 }}>{t("step2", lang)}</Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 1 }}>
          <Icon name="checkmark-outline" size={18} color="#295" />
          <Text style={{ marginLeft: 5 }}>{t("step3", lang)}</Text>
        </View>
      </View>

      <View style={{ height: 80 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: "#fff", borderRadius: 17, padding: 14, marginBottom: 16, shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 7, elevation: 4 },
  bigBold: { fontWeight: "bold", fontSize: 19, color: "#006400" },
  semiBold: { fontWeight: "600", fontSize: 15, color: "#333" },
  bold: { fontWeight: "bold", fontSize: 16, color: "#FF8C00" },
  stageText: { fontWeight: "bold", fontSize: 14, marginTop: 2 },
  bigButton: { flexDirection: "row", alignItems: "center", backgroundColor: "#FF8C00", borderRadius: 8, padding: 12, marginTop: 10, width: "100%", justifyContent: "center", gap: 8 },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 17, marginLeft: 8 },
});
