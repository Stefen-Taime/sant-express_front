import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    position: null,
    darkMode: false,
    language: 'fr'
  }),
  
  actions: {
    async getUserPosition() {
      return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error('La géolocalisation n\'est pas supportée par votre navigateur'))
          return
        }
        
        navigator.geolocation.getCurrentPosition(
          (position) => {
            this.position = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            }
            resolve(this.position)
          },
          (error) => {
            let errorMessage = 'Erreur inconnue'
            switch (error.code) {
              case error.PERMISSION_DENIED:
                errorMessage = 'Vous avez refusé l\'accès à votre position'
                break
              case error.POSITION_UNAVAILABLE:
                errorMessage = 'Votre position n\'est pas disponible'
                break
              case error.TIMEOUT:
                errorMessage = 'La demande de géolocalisation a expiré'
                break
            }
            reject(new Error(errorMessage))
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        )
      })
    },
    
    setDarkMode(value) {
      this.darkMode = value
      localStorage.setItem('darkMode', value ? 'true' : 'false')
      
      if (value) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    },
    
    initDarkMode() {
      const savedMode = localStorage.getItem('darkMode')
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      
      this.setDarkMode(savedMode ? savedMode === 'true' : prefersDark)
    },
    
    setLanguage(lang) {
      this.language = lang
      localStorage.setItem('language', lang)
    },
    
    initLanguage() {
      const savedLang = localStorage.getItem('language')
      const browserLang = navigator.language.split('-')[0]
      
      this.language = savedLang || (browserLang === 'fr' || browserLang === 'en' ? browserLang : 'fr')
    }
  }
})
