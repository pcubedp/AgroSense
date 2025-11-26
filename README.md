# 🌾 **AgroSense – AI Powered Farm Advisory App**

##  **How to Run This Project Locally**

This project is built using **React Native + Expo**, and can be run on:

* **Expo Go (Android / iOS)**
* **Android Emulator (Android Studio)**
* **Web Browser**

Follow the steps below:

---

##  **1. Clone the Repository**

```sh
git clone https://github.com/pcubedp/AgroSense.git
cd AgroSense
```

---

##  **2. Install Dependencies**

```sh
npm install
```

---

##  **3. Start the Expo Development Server**

```sh
npm start
```

This will open **Expo DevTools** in your browser.

---

##  **Run on Your Device (Expo Go)**

### **Android**

1. Install **Expo Go** from Play Store
2. Run:

   ```sh
   npm start
   ```
3. Scan the QR code shown in the terminal or browser
4. The app will open inside **Expo Go**

### **iOS**

1. Install **Expo Go**
2. Scan the QR code using the native camera app
3. It will open automatically in Expo Go

---

##  **Run on Android Emulator (Android Studio)**

### 1️⃣ Install & Configure Android Studio

* Install **Android Studio**
* Open **AVD Manager**
* Create a virtual device (Pixel 5 recommended)

### 2️⃣ Start the Emulator

Click **Play** next to your virtual device.

### 3️⃣ Run App on Emulator

Go to the terminal where Expo is running:

Press:

```
a
```

This will automatically install the Expo client on the emulator and open the app.

---

##  **Run on Web**

```sh
npm run web
```

or press:

```
w
```

in the Expo console.

---

# 📘 **Project Overview**

AgroSense is a mobile-first AI agriculture advisory app that helps farmers by analyzing farm inputs, images, and environmental data to generate actionable recommendations.

### **Core Features**

*  Upload or click farm images
*  Auto-capture location
*  Input farm area, crop type, irrigation, fertilizers
*  AI-powered farm advisory (crop suggestion, soil analysis, profit prediction)
*  Interactive dashboard with stages (Completed / Today / Upcoming)
*  Multilingual support (English + Hindi)

The app uses **Google Gemini AI** (backend) to generate agricultural insights and recommendations.

---

# 🧰 **Tech Stack**

### **Frontend**

* React Native
* Expo
* React Navigation
* React Native Vector Icons
* Expo Image Picker
* Expo Location

### **Backend (Handled Separately by Your Teammate)**

* Google Gemini API
* Custom farm-analysis endpoints

### **Tools**

* Android Studio Emulator
* Expo Go
* Visual Studio Code
* Git & GitHub
