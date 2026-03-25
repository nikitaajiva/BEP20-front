"use client";
import { useEffect } from "react";

export default function LanguageSelector() {
  useEffect(() => {
    // Avoid re-injecting script
    if (document.getElementById("google-translate-script")) return;

    const script = document.createElement("script");
    script.id = "google-translate-script";
    script.src =
      "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    document.body.appendChild(script);

    window.googleTranslateElementInit = function () {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: "en",
          includedLanguages: "en,hi,fr,de,es,ar,bn",
          layout: google.translate.TranslateElement.InlineLayout.HORIZONTAL,
        },
        "google_translate_element"
      );
    };
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        top: "10px",
        right: "20%",
        zIndex: 9999,
        backgroundColor: "#181f3a",
        padding: "6px 12px",
        borderRadius: "8px",
        boxShadow: "0 0 6px rgba(0,0,0,0.4)",
      }}
    >
      <div id="google_translate_element"></div>
    </div>
  );
}
