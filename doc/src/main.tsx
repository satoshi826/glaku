import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import {ThemeRoot} from './theme/ThemeRoot.tsx'
import {CssBaseline} from '@mui/material'
import i18next from 'i18next'
import {initReactI18next} from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import translation_en from './i18n/en.json'
import translation_ja from './i18n/ja.json'

const resources = {
  ja: {
    translation: translation_ja
  },
  en: {
    translation: translation_en
  }
}

const STORAGE_KEY = 'my_i18next' as const

i18next
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    detection  : {
      lookupCookie        : STORAGE_KEY,
      lookupLocalStorage  : STORAGE_KEY,
      lookupSessionStorage: STORAGE_KEY
    },
    interpolation: {
      escapeValue: false
    },
    react: {
      transKeepBasicHtmlNodesFor: ['br', 'strong', 'code']
    }
  })


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeRoot>
      <CssBaseline/>
      <App />
    </ThemeRoot>
  </React.StrictMode>
)
