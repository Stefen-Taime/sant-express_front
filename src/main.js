import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { createI18n } from 'vue-i18n'
// Puis vos CSS personnalisés
import './css/tailwind.css'
import './css/accessibility.css'
import 'material-design-icons-font/iconfont/material-icons.css'

// Messages de traduction
import fr from './locales/fr.json'
import en from './locales/en.json'

// Configuration de i18n
const i18n = createI18n({
  legacy: false,
  locale: 'fr',
  fallbackLocale: 'fr',
  messages: {
    fr: fr.fr,  // Notez le fr.fr pour extraire les traductions françaises
    en: en.en   // Notez le en.en pour extraire les traductions anglaises
  }
})

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(i18n)

app.mount('#app')
