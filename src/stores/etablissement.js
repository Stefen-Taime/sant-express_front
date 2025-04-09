import { defineStore } from 'pinia'

export const useEtablissementStore = defineStore('etablissement', {
  state: () => ({
    etablissements: [],
    etablissementsCarte: [],
    etablissementDetail: null,
    loading: false,
    error: null,
    filtres: {
      type: 'tous',
      services: [],
      distance: 20
    },
    hasSearched: false,  // État pour suivre si une recherche a été effectuée
    totalEtablissements: 0,
    currentPage: 1,
    totalPages: 1
  }),
  
  getters: {
    etablissementsFiltres: (state) => {
      // Vérifier que state.etablissements est bien un tableau
      if (!Array.isArray(state.etablissements)) {
        console.warn('state.etablissements n\'est pas un tableau:', state.etablissements);
        return [];
      }
      
      if (state.filtres.type === 'tous' && state.filtres.services.length === 0) {
        return state.etablissements;
      }
      
      return state.etablissements.filter(etab => {
        // Vérifier que l'établissement est valide
        if (!etab) return false;
        
        const typeMatch = state.filtres.type === 'tous' || etab.type === state.filtres.type;
        
        // Vérifier que etab.services existe et est un tableau
        const services = Array.isArray(etab.services) ? etab.services : [];
        const servicesMatch = state.filtres.services.length === 0 ||
          state.filtres.services.every(service => services.includes(service));
        
        return typeMatch && servicesMatch;
      });
    },
    
    getEtablissementById: (state) => (id) => {
      // Vérifier que state.etablissements est bien un tableau
      if (!Array.isArray(state.etablissements)) {
        console.warn('state.etablissements n\'est pas un tableau:', state.etablissements);
        return null;
      }
      
      return state.etablissements.find(etab => etab && etab.id === id) || null;
    }
  },
  
  actions: {
    async fetchEtablissements(position) {
      this.loading = true;
      this.error = null;
      
      try {
        const params = new URLSearchParams();
        if (position) {
          params.append('latitude', position.latitude);
          params.append('longitude', position.longitude);
          params.append('distance', this.filtres.distance);
        }
        
        // Utiliser l'URL correcte qui fonctionnait avant
        console.log(`Tentative d'appel à l'API: /api/etablissements/recherche/proximite?${params.toString()}`);
        const response = await fetch(`/api/etablissements/recherche/proximite?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Données des établissements reçues:', data);
        
        // S'assurer que data est bien un tableau
        this.etablissements = Array.isArray(data) ? data : [];
        this.totalEtablissements = this.etablissements.length;
        this.currentPage = 1;
        this.totalPages = 1;
        
        this.hasSearched = true;  // Marquer qu'une recherche a été effectuée
      } catch (error) {
        this.error = error.message || 'Erreur lors de la récupération des établissements';
        console.error('Erreur de récupération des établissements:', error);
        this.etablissements = [];
      } finally {
        this.loading = false;
      }
    },
    
    async loadMoreEtablissements() {
      // Cette fonction ne sera utilisée que si votre API supporte la pagination
      // Pour l'instant, avec l'endpoint /recherche/proximite, il semble que tous les résultats sont retournés d'un coup
      console.log('La fonction loadMoreEtablissements ne fait rien car l\'API ne supporte pas la pagination');
    },
    
    async fetchEtablissementDetail(id) {
      this.loading = true;
      this.error = null;
      
      try {
        // Utilisation d'un chemin relatif au lieu d'une URL absolue
        const response = await fetch(`/api/etablissements/${id}`);
        
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Détails de l\'établissement reçus:', data);
        
        this.etablissementDetail = data;
      } catch (error) {
        this.error = error.message || 'Erreur lors de la récupération des détails de l\'établissement';
        console.error('Erreur:', error);
        this.etablissementDetail = null;
      } finally {
        this.loading = false;
      }
    },
    
    async fetchEtablissementsCarte() {
      this.loading = true;
      this.error = null;
      
      try {
        // Utilisation d'un chemin relatif au lieu d'une URL absolue
        const response = await fetch('/api/geo/etablissements/geojson');
        
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Données géographiques des établissements reçues:', data);
        
        this.etablissementsCarte = data;
        return data;
      } catch (error) {
        this.error = error.message || 'Erreur lors de la récupération des établissements pour la carte';
        console.error('Erreur:', error);
        this.etablissementsCarte = null;
        return null;
      } finally {
        this.loading = false;
      }
    },
    
    setFiltres(filtres) {
      this.filtres = { ...this.filtres, ...filtres };
      console.log('Filtres mis à jour:', this.filtres);
    },
    
    // Action pour faire une recherche par défaut
    async searchWithDefaultLocation() {
      if (!this.hasSearched && this.etablissements.length === 0) {
        // Utiliser des coordonnées par défaut pour Montréal
        await this.fetchEtablissements({
          latitude: 45.5017,
          longitude: -73.5673
        });
      }
    }
  }
});