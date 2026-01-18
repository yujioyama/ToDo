// i18n.js
// シンプルなi18nユーティリティ

let currentLang = "en";
let translations = {};

async function loadLocale(lang) {
  const localeUrl = new URL(`./locales/${lang}.json`, import.meta.url);
  const response = await fetch(localeUrl);
  if (!response.ok) {
    throw new Error(`Failed to load locale: ${lang} (${response.status})`);
  }
  translations = await response.json();
  currentLang = lang;
  return translations;
}

function getTranslation(key) {
  return translations[key] || key;
}

function setLanguage(lang) {
  return loadLocale(lang).then(() => {
    document.dispatchEvent(
      new CustomEvent("languageChanged", { detail: lang })
    );
  });
}

export { getTranslation, setLanguage, loadLocale, currentLang };
