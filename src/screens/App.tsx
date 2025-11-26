// App.tsx
import React, { useState } from "react";
import { LanguageProvider } from "./helpers";
import { DataProvider } from "./helpers";
import DashboardScreen from "./DashboardScreen";
import ScannerScreen from "./ScannerScreen";
import { ToastProvider } from "./helpers";

export default function App() {
  const [screen, setScreen] = useState<"dashboard" | "scanner">("dashboard");
  return (
    <LanguageProvider>
      <DataProvider>
        <ToastProvider>
          {screen === "dashboard"
            ? <DashboardScreen onGoToScanner={() => setScreen("scanner")} />
            : <ScannerScreen onBack={() => setScreen("dashboard")} />}
        </ToastProvider>
      </DataProvider>
    </LanguageProvider>
  );
}
