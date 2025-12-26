import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { I18nManager, Alert } from "react-native";

import en from "./en.json";
import he from "./he.json";

const RTL_LANGUAGES = ["he", "ar"]; // Hebrew and Arabic

export function initI18n(defaultLanguage: string = "he") {
  i18n.use(initReactI18next).init({
    resources: {
      en: { translation: en },
      he: { translation: he },
    },
    lng: defaultLanguage,
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
  });

  // Set RTL based on language
  const isRTL = RTL_LANGUAGES.includes(defaultLanguage);
  if (I18nManager.isRTL !== isRTL) {
    I18nManager.forceRTL(isRTL);
  }
}

// Function to change language at runtime
export async function changeLanguage(languageCode: string) {
  await i18n.changeLanguage(languageCode);
  
  // Update RTL setting
  const isRTL = RTL_LANGUAGES.includes(languageCode);
  if (I18nManager.isRTL !== isRTL) {
    I18nManager.forceRTL(isRTL);
    
    // Alert user to restart app
    Alert.alert(
      "Restart Required",
      "Please close and reopen the app for the language change to take full effect.",
      [{ text: "OK" }]
    );
  }
}

export default i18n;
