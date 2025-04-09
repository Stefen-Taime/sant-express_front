import { defineStore } from 'pinia'

export const useUrgenceStore = defineStore('urgence', {
  state: () => ({
    urgences: [],
    loading: false,
    error: null
  }),
  
  getters: {
    getUrgenceByEtablissementId: (state) => (id) => {
      // Vérifier que state.urgences est bien un tableau
      if (!Array.isArray(state.urgences)) {
        console.warn('state.urgences n\'est pas un tableau:', state.urgences);
        return null;
      }
      
      return state.urgences.find(urgence => 
        urgence && urgence.etablissement_id === id
      ) || null;
    }
  },
  
  actions: {
    async fetchUrgences() {
      this.loading = true;
      this.error = null;
      
      try {
        // Utilisation d'un chemin relatif au lieu d'une URL absolue
        const response = await fetch('/api/urgences/');
        
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Données d\'urgence reçues:', data);
        
        // Extraire le tableau items de la réponse
        this.urgences = data.items || [];
        return this.urgences;
      } catch (error) {
        this.error = error.message || 'Erreur lors de la récupération des données d\'urgence';
        console.error('Erreur:', error);
        this.urgences = [];
        return [];
      } finally {
        this.loading = false;
      }
    },
    
    async fetchRecommandations() {
      this.loading = true;
      this.error = null;
      
      try {
        // Utilisation d'un chemin relatif au lieu d'une URL absolue
        const response = await fetch('/api/recommandations/');
        
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Recommandations reçues:', data);
        
        // Extraire items si présent, sinon utiliser data
        const items = data.items || data;
        
        // Retourner un tableau même si les données ne sont pas un tableau
        return Array.isArray(items) ? items : [];
      } catch (error) {
        this.error = error.message || 'Erreur lors de la récupération des recommandations';
        console.error('Erreur:', error);
        return [];
      } finally {
        this.loading = false;
      }
    }
  }
});