// helpers.tsx
import React, { createContext, useContext, useState, ReactNode } from "react";
import { Platform, ToastAndroid, Alert } from "react-native";
import { View, Text } from "react-native";

/**
 * Translations object (en / hi)
 * Keep this the same as your previous translations; I kept keys you used.
 */
export const translations: any = {
  en: {
    dashboard: "Dashboard",
    scanner: "Scanner",
    farmReportDashboard: "Farm Report Dashboard",
    farmerName: "Farmer Name",
    address: "Address",
    status: "Status",
    preSowing: "Pre-Sowing (What to Plant?)",
    postSowing: "Post-Sowing (Crop Management)",
    recentActivity: "Recent Activity",
    lastScan: "Last Scan",
    cropAnalysis: "AI Crop Analysis",
    nextAction: "Next Action",
    scanFarm: "Scan Farm/Upload Photo",
    reportsHistory: "Reports/History",
    cropRecommendation: "Crop Recommendation",
    profitability: "Profitability Estimate",
    soilHealth: "Soil Health",
    advice: "Stage-Specific Advice",
    calendar: "Farm Actions Calendar",
    completed: "Completed",
    today: "Today",
    upcoming: "Upcoming",
    howToUse: "How to Use",
    step1: "Select advisory stage.",
    step2: "Upload crop/soil photo.",
    step3: "Fill details, generate report.",
    scannerHeader: "Farm Scanner",
    subHeader: "Upload crop/soil photo for AI analysis.",
    stageLabel: "Advisory Stage",
    pre: "Pre-Sowing",
    post: "Post-Sowing",
    takePhoto: "Take Picture",
    uploadFromGallery: "Upload from Gallery",
    analyzing: "Analyzing image...",
    aiComplete: "AI Image Analysis Complete",
    cropType: "Crop Type",
    soilTexture: "Soil Texture",
    confidence: "Confidence",
    reviewDetails: "Review Your Details",
    farmArea: "Farm Area (e.g., 50 acres)",
    farmAddress: "Farm Address",
    cropHistory: "Previous Crop",
    plannedCrop: "Planned Crop",
    sowingDate: "Planned Sowing Date",
    actualCrop: "Actual Crop",
    irrigation: "Irrigation Method",
    fertilizersUsed: "Fertilizers Used",
    pestUse: "Pesticides Used",
    expectedYield: "Expected Yield",
    generateReport: "Generate Report",
    resetForm: "Reset Form",
    missingData: "Missing Data",
    selectImagePrompt: "Select and analyze image before submit.",
    missingDetails: "Missing Details",
    fillFormPrompt: "Fill all required fields.",
    success: "Success",
    reportReady: "Farm report generated!",
    error: "Error",
    failReport: "Failed to generate report.",
    locationUnavailable: "Location Unavailable",
    language: "Language",
    completedAction: "Fertilizer applied",
    upcomingAction: "Irrigate on Thursday",
    todayAction: "Seed Sowing Today",
    reportGenerated: "Report generated and saved locally.",
  },
  hi: {
    dashboard: "डैशबोर्ड",
    scanner: "स्कैनर",
    farmReportDashboard: "फार्म रिपोर्ट डैशबोर्ड",
    farmerName: "किसान नाम",
    address: "पता",
    status: "स्थिति",
    preSowing: "बुवाई से पहले (क्या लगाएं?)",
    postSowing: "बुवाई के बाद (फसल प्रबंधन)",
    recentActivity: "हाल की गतिविधि",
    lastScan: "अंतिम स्कैन",
    cropAnalysis: "AI फसल विश्लेषण",
    nextAction: "अगली कार्रवाई",
    scanFarm: "फार्म स्कैन/फोटो अपलोड करें",
    reportsHistory: "रिपोर्ट/इतिहास",
    cropRecommendation: "फसल सिफारिश",
    profitability: "लाभ अनुमान",
    soilHealth: "मिट्टी स्वास्थ्य",
    advice: "चरण विशेष सलाह",
    calendar: "खेती कैलेंडर",
    completed: "पूरा",
    today: "आज",
    upcoming: "आगामी",
    howToUse: "कैसे उपयोग करें",
    step1: "परामर्श चरण चुनें।",
    step2: "फसल/मिट्टी फोटो अपलोड करें।",
    step3: "विवरण भरें, रिपोर्ट बनाएं।",
    scannerHeader: "फार्म स्कैनर",
    subHeader: "AI विश्लेषण के लिए फसल/मिट्टी फोटो अपलोड करें।",
    stageLabel: "परामर्श चरण",
    pre: "बुवाई से पहले",
    post: "बुवाई के बाद",
    takePhoto: "चित्र लें",
    uploadFromGallery: "गैलरी से अपलोड करें",
    analyzing: "चित्र विश्लेषण हो रहा है...",
    aiComplete: "AI चित्र विश्लेषण पूर्ण",
    cropType: "फसल का प्रकार",
    soilTexture: "मिट्टी बनावट",
    confidence: "विश्वास",
    reviewDetails: "अपनी जानकारी देखें",
    farmArea: "फ़ार्म क्षेत्र (जैसे, ५० एकड़)",
    farmAddress: "फ़ार्म का पता",
    cropHistory: "पिछली फसल",
    plannedCrop: "योजित फसल",
    sowingDate: "योजित बुवाई तिथि",
    actualCrop: "वास्तविक फसल",
    irrigation: "सिंचाई प्रकार",
    fertilizersUsed: "प्रयुक्त उर्वरक",
    pestUse: "प्रयुक्त कीटनाशक",
    expectedYield: "अपेक्षित उपज",
    generateReport: "रिपोर्ट बनाएं",
    resetForm: "फ़ॉर्म रीसेट करें",
    missingData: "जानकारी अधूरी",
    selectImagePrompt: "जमा करने से पहले छवि चुनें और विश्लेषण करें।",
    missingDetails: "विवरण अधूरी",
    fillFormPrompt: "सभी आवश्यक फ़ील्ड भरें।",
    success: "सफलता",
    reportReady: "फार्म रिपोर्ट बन गई!",
    error: "त्रुटि",
    failReport: "रिपोर्ट बनाने में विफल।",
    locationUnavailable: "स्थान उपलब्ध नहीं",
    language: "भाषा",
    completedAction: "उर्वरक डाला गया",
    upcomingAction: "गुरुवार को सिंचाई करें",
    todayAction: "आज बीज बुवाई",
    reportGenerated: "रिपोर्ट बनाई और स्थानीय रूप से सहेजी गई।",
  },
};

export function t(key: string, lang: "en" | "hi") {
  return translations[lang][key] || translations["en"][key] || key;
}

/* ---------------- Language context ---------------- */
const LanguageContext = createContext<{ lang: "en" | "hi"; setLang: (l: "en" | "hi") => void }>({ lang: "en", setLang: () => {} });
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<"en" | "hi">("en");
  return <LanguageContext.Provider value={{ lang, setLang }}>{children}</LanguageContext.Provider>;
}
export function useLanguage() {
  return useContext(LanguageContext);
}

/* ---------------- Toast helper ---------------- */
const ToastContext = createContext<{ show: (msg: string, kind?: "success" | "error") => void }>({ show: () => {} });
export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);
  const [type, setType] = useState<"success" | "error" | undefined>(undefined);

  function show(msg: string, kind?: "success" | "error") {
    setMessage(msg);
    setType(kind);
    if (Platform.OS === "android") {
      ToastAndroid.show(msg, ToastAndroid.SHORT);
    } else {
      // For iOS / web, also show an alert as fallback (keeps it simple)
      // but we keep message state to show small toast component
      // (You can replace this with a fancier toast UI later)
      // Alert.alert(kind === 'error' ? 'Error' : 'Info', msg);
    }
    setTimeout(() => setMessage(null), 1800);
  }

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {/* lightweight in-app toast */}
      {message && (
        <View style={{
          position: "absolute",
          bottom: 22,
          left: 22,
          right: 22,
          backgroundColor: type === "success" ? "#32CD32" : "#f44336",
          padding: 12,
          borderRadius: 10,
          alignItems: "center",
          zIndex: 1000
        }}>
          <Text style={{ color: "#fff", fontWeight: "700" }}>{message}</Text>
        </View>
      )}
    </ToastContext.Provider>
  );
}
export function useToast() { return useContext(ToastContext); }

/* ---------------- Shared Data context (mock storage) ----------------
   - This holds the "MOCK_DATA" used by Dashboard. Scanner will update it.
   - We expose it via hook so components re-render when new data arrives.
*/
type AppData = {
  farmerName?: string;
  address?: string;
  stage?: string;
  scanDate?: string;
  cropAnalysis?: string;
  nextAction?: string;
  recommendation?: string;
  profitability?: string;
  soilHealth?: string;
  advice?: string;
  actions?: Array<{ key: string; label: string; complete: boolean }>;
};

const initialData: AppData = {
  farmerName: "Ramesh Yadav",
  address: "Rampur, Meerut",
  stage: "pre",
  scanDate: "21 Nov",
  cropAnalysis: "Wheat (Winter)",
  nextAction: "Add NPK 15-5-10 fertilizer on Friday",
  recommendation: "Wheat (Hybrid)",
  profitability: "Good Profit",
  soilHealth: "Healthy",
  advice: "Prepare soil, add fertilizer before sowing.",
  actions: [
    { key: "completed", label: t("completedAction", "en"), complete: true },
    { key: "today", label: t("todayAction", "en"), complete: true },
    { key: "upcoming", label: t("upcomingAction", "en"), complete: false },
  ],
};

const DataContext = createContext<{ data: AppData; setData: (d: Partial<AppData>) => void }>({
  data: initialData,
  setData: () => {},
});

export function DataProvider({ children }: { children: ReactNode }) {
  const [data, setDataState] = useState<AppData>(initialData);
  const setData = (patch: Partial<AppData>) => {
    setDataState(prev => ({ ...prev, ...patch }));
  };
  return <DataContext.Provider value={{ data, setData }}>{children}</DataContext.Provider>;
}
export function useData() {
  return useContext(DataContext);
}

/* ---------------- Simple RN Card & Button used in your app ---------------- */
import { View as RNView, Text as RNText, TouchableOpacity as RNTouchableOpacity } from "react-native";
export const Card: React.FC<{ children: ReactNode; style?: any }> = ({ children, style }) =>
  <RNView style={{ backgroundColor: "#fff", borderRadius: 12, padding: 14, marginVertical: 12, shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 6, elevation: 3, ...style }}>{children}</RNView>;

export const Button: React.FC<any> = ({ children, onPress, style, disabled, ...rest }) =>
  <RNTouchableOpacity onPress={onPress} disabled={disabled} style={[{ backgroundColor: "#FF8C00", paddingVertical: 12, borderRadius: 10, alignItems: "center" }, disabled ? { opacity: 0.6 } : {}, style]} {...rest}>
    <RNText style={{ color: "#fff", fontWeight: "700" }}>{children}</RNText>
  </RNTouchableOpacity>;
