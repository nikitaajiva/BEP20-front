"use client";
import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import AuthGuard from "@/components/auth/AuthGuard";

/* ================= TRANSLATIONS ================= */
const translations = {
  English: {
    title: "BEPVault Presentation (English)",
    description: "Official project documentation in English.",
    download: "Download",
  },
  Indonesian: {
    title: "Presentasi BEPVault (Indonesian)",
    description: "Dokumentasi resmi proyek dalam Bahasa Indonesia.",
    download: "Unduh",
  },
  Chinese: {
    title: "BEPVault 演示文稿 (Chinese)",
    description: "官方项目文档（中文）。",
    download: "下载",
  },
  Urdu: {
    title: "BEPVault پریزنٹیشن (Urdu)",
    description: "اردو میں پروجیکٹ کی سرکاری دستاویزات۔",
    download: "ڈاؤن لوڈ کریں",
  },
  Filipino: {
    title: "BEPVault Presentasyon (Filipino)",
    description: "Opisyal na dokumentasyon ng proyekto sa Filipino.",
    download: "I-download",
  },
  Spanish: {
    title: "Presentación de BEPVault (Spanish)",
    description: "Documentación oficial del proyecto en Español.",
    download: "Descargar",
  },
  Vietnamese: {
    title: "Bài thuyết trình BEPVault (Vietnamese)",
    description: "Tài liệu chính thức của dự án bằng tiếng Việt.",
    download: "Tải xuống",
  },
  Russian: {
    title: "Презентация BEPVault (Russian)",
    description: "Официальная проектная документация на русском.",
    download: "Скачать",
  },
  French: {
    title: "Présentation BEPVault (French)",
    description: "Documentation officielle du projet en Français.",
    download: "Télécharger",
  },

  /* ====== NEWLY ADDED LANGUAGES ====== */
  Danish: {
    title: "BEPVault Præsentation (Danish)",
    description: "Officiel projektdokumentation på dansk.",
    download: "Download",
  },
  Finnish: {
    title: "BEPVault Esitys (Finnish)",
    description: "Virallinen projektidokumentaatio suomeksi.",
    download: "Lataa",
  },
  German: {
    title: "BEPVault Präsentation (German)",
    description: "Offizielle Projektdokumentation auf Deutsch.",
    download: "Herunterladen",
  },
  Italian: {
    title: "Presentazione BEPVault (Italian)",
    description: "Documentazione ufficiale del progetto in Italiano.",
    download: "Scarica",
  },
  Korean: {
    title: "BEPVault 프레젠테이션 (Korean)",
    description: "한국어로 된 공식 프로젝트 문서입니다.",
    download: "다운로드",
  },
  Norwegian: {
    title: "BEPVault Presentasjon (Norwegian)",
    description: "Offisiell prosjektdokumentasjon på norsk.",
    download: "Last ned",
  },
  Portuguese: {
    title: "Apresentação BEPVault (Portuguese)",
    description: "Documentação oficial do projeto em Português.",
    download: "Baixar",
  },
  Swedish: {
    title: "BEPVault Presentation (Swedish)",
    description: "Officiell projektdokumentation på svenska.",
    download: "Ladda ner",
  },
  Thai: {
    title: "การนำเสนอ BEPVault (Thai)",
    description: "เอกสารโครงการอย่างเป็นทางการภาษาไทย",
    download: "ดาวน์โหลด",
  },

  Unknown: {
    title: "BEPVault Presentation",
    description: "Official project documentation.",
    download: "Download",
  },
};

/* ================= PARSER ================= */
const parseDocInfo = (filename) => {
  const match = filename.match(/\[([^\]]+)\]/);
  let lang = "English";

  if (match) {
    lang = match[1].toLowerCase();
    lang = lang.charAt(0).toUpperCase() + lang.slice(1);
  }

  return {
    language: lang,
    path: `/docs/${filename}`,
    ...(translations[lang] || translations.Unknown),
  };
};

/* ================= FILE LIST ================= */
const docFilenames = [
  "BEPVault.pdf",
  "BEPVault[Indonesian].pdf",
  "BEPVault[CHINESE].pdf",
  "BEPVault[Urdu].pdf",
  "BEPVault[filipino].pdf",
  "BEPVault[spanish].pdf",
  "BEPVault[vietnamese].pdf",
  "BEPVault[russian].pdf",
  "BEPVault[FRENCH].pdf",

  // 🔹 Added from screenshot
  "BEPVault[Danish].pdf",
  "BEPVault[Finnish].pdf",
  "BEPVault[German].pdf",
  "BEPVault[Italian].pdf",
  "BEPVault[korean].pdf",
  "BEPVault[norwegian].pdf",
  "BEPVault[portuguese].pdf",
  "BEPVault[swedish].pdf",
  "BEPVault[THAI].pdf",
];

const documents = docFilenames
  .map(parseDocInfo)
  .sort((a, b) => a.language.localeCompare(b.language));

/* ================= PAGE ================= */
export default function DocsPage() {
  return (
    <AuthGuard>
      <div className="container-xxl flex-grow-1 container-p-y">
        <div
          className="fw-bold py-3 mb-4"
          style={{
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <h4>
            <span className="text-muted fw-light">Resources /</span> Documents
          </h4>

          <a
            href="/dashboard"
            className="btn"
            style={{
              background: "linear-gradient(90deg, #ffd700 0%, #ffc107 100%)",
              color: "#000",
              borderRadius: "12px",
              padding: "0.75rem 1.5rem",
              fontWeight: "bold",
            }}
          >
            Back to dashboard
          </a>
        </div>

        <div className="row">
          {documents.map((doc) => (
            <div key={doc.path} className="col-md-6 col-lg-4 mb-4">
              <div
                className="card h-100"
                style={{
                  background: "#000000",
                  borderRadius: "22px",
                  border: "1px solid rgba(255,215,0,0.15)",
                }}
              >
                <div className="card-body d-flex flex-column align-items-center text-center">
                  <i
                    className="ri-file-pdf-2-line mb-3"
                    style={{ fontSize: "4rem", color: "#ffd700" }}
                  />
                  <h5 className="text-white">{doc.title}</h5>
                  <p style={{ color: "#b3baff" }}>{doc.description}</p>
                  <a
                    href={doc.path}
                    download
                    className="btn mt-auto"
                    style={{
                      background:
                        "linear-gradient(90deg, #ffd700 0%, #ffc107 100%)",
                      color: "#000",
                      borderRadius: "12px",
                      padding: "0.75rem 1.5rem",
                      fontWeight: "bold",
                    }}
                  >
                    <i className="ri-download-2-line me-2" />
                    {doc.download}
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AuthGuard>
  );
}
