<template>
  <div class="home-view">
    <div class="hero-section bg-primary-light dark:bg-primary-dark py-12 px-4">
      <div class="container mx-auto text-center">
        <h1 class="text-3xl md:text-4xl font-bold text-white mb-4">{{ $t('app.title') }}</h1>
        <p class="text-xl text-white mb-8">{{ $t('app.tagline') }}</p>
        
        <!-- Barre de recherche -->
        <div class="max-w-2xl mx-auto">
          <div class="flex flex-col md:flex-row gap-2">
            <div class="relative flex-grow">
              <input 
                type="text" 
                v-model="searchQuery" 
                :placeholder="$t('search.placeholder')" 
                class="input pr-10 w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary"
                @keyup.enter="searchEtablissements"
                @input="suggestAddresses"
              />
              <button 
                v-if="searchQuery" 
                @click="searchQuery = ''" 
                class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
              >
                <span class="material-icons">close</span>
              </button>
              
              <!-- Liste de suggestions d'adresses -->
              <div v-if="addressSuggestions.length > 0" class="absolute z-10 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md mt-1 shadow-lg">
                <div 
                  v-for="(suggestion, index) in addressSuggestions" 
                  :key="index"
                  @click="selectAddress(suggestion)"
                  class="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                >
                  {{ suggestion.description }}
                </div>
              </div>
            </div>
            <button 
              @click="searchEtablissements" 
              class="btn btn-secondary flex items-center justify-center"
            >
              <span class="material-icons mr-1">search</span>
              {{ $t('search.button') }}
            </button>
            <button 
              @click="useCurrentLocation" 
              class="btn bg-white text-primary hover:bg-gray-100 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 flex items-center justify-center"
            >
              <span class="material-icons mr-1">my_location</span>
              {{ $t('search.useLocation') }}
            </button>
          </div>
          <p v-if="locationError" class="mt-2 text-red-200">{{ locationError }}</p>
        </div>
      </div>
    </div>
    
    <div class="container mx-auto px-4 py-8">
      <!-- Filtres -->
      <div class="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        <div class="flex flex-wrap items-center gap-4">
          <div>
            <label class="block text-sm font-medium mb-1">{{ $t('filters.type') }}</label>
            <select v-model="filtres.type" class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary">
              <option value="tous">Tous</option>
              <option value="Hospitals">Hôpitaux</option>
              <option value="Clinics">Cliniques</option>
              <option value="CLSC">CLSC</option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-1">{{ $t('filters.distance') }}</label>
            <div class="flex items-center gap-2">
              <input 
                type="range" 
                v-model.number="filtres.distance" 
                min="5" 
                max="50" 
                step="5"
              />
              <span>{{ filtres.distance }} km</span>
            </div>
          </div>
          
          <div class="flex-grow"></div>
          
          <div class="flex gap-2">
            <button 
              @click="appliquerFiltres" 
              class="btn btn-primary"
            >
              {{ $t('filters.apply') }}
            </button>
            <button 
              @click="reinitialiserFiltres" 
              class="btn bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            >
              {{ $t('filters.reset') }}
            </button>
          </div>
        </div>
      </div>
      
      <!-- Résultats de recherche -->
      <div v-if="loading" class="flex justify-center py-8">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
      
      <div v-else-if="etablissements.length === 0 && etablissementStore.hasSearched" class="text-center py-8">
        <p class="text-xl text-gray-600 dark:text-gray-400">{{ $t('search.noResults') }}</p>
      </div>
      
      <div v-else-if="etablissements.length === 0 && !etablissementStore.hasSearched" class="text-center py-8">
        <p class="text-xl text-gray-600 dark:text-gray-400">{{ $t('search.initialMessage') }}</p>
        <div class="flex justify-center mt-4">
          <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
      
      <div v-else-if="etablissements.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div 
          v-for="etablissement in etablissements" 
          :key="etablissement.id" 
          class="card hover:shadow-lg transition-shadow duration-200"
        >
          <div class="flex justify-between items-start mb-2">
            <h2 class="text-xl font-bold">{{ etablissement.nom_installation }}</h2>
            <div 
              class="px-2 py-1 rounded-full text-sm font-medium"
              :class="getStatusClass(etablissement.id)"
            >
              {{ getStatusText(etablissement.id) }}
            </div>
          </div>
          
          <p class="text-gray-600 dark:text-gray-400 mb-2">{{ etablissement.adresse }}, {{ etablissement.ville }}</p>
          
          <p v-if="etablissement.distance" class="text-sm text-gray-500 dark:text-gray-500 mb-3">
            {{ $t('establishment.distance', { distance: etablissement.distance.toFixed(1) }) }}
          </p>
          
          <div class="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
            <div class="grid grid-cols-2 gap-2 mb-3">
              <div>
                <p class="text-sm font-medium">{{ $t('establishment.patients') }}</p>
                <p class="text-lg">{{ getUrgenceInfo(etablissement.id, 'patients_en_attente') || '0' }}</p>
              </div>
              <div>
                <p class="text-sm font-medium">{{ $t('establishment.civiere') }}</p>
                <p class="text-lg">{{ getUrgenceInfo(etablissement.id, 'patients_24h') || '0' }}</p>
              </div>
            </div>
            
            <div class="flex justify-between mt-4">
              <router-link 
                :to="`/etablissement/${etablissement.id}`" 
                class="text-primary hover:text-primary-dark dark:text-primary-light dark:hover:text-primary flex items-center"
              >
                <span class="material-icons mr-1">info</span>
                {{ $t('establishment.details') }}
              </router-link>
              
              <router-link 
                :to="`/itineraire/${etablissement.id}`" 
                class="text-primary hover:text-primary-dark dark:text-primary-light dark:hover:text-primary flex items-center"
              >
                <span class="material-icons mr-1">directions</span>
                {{ $t('establishment.directions') }}
              </router-link>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Carte des résultats -->
      <div v-if="etablissements.length > 0" class="mt-8">
        <h2 class="text-2xl font-bold mb-4">{{ $t('map.title') }}</h2>
        <MapComponent 
          ref="mapComponent"
          height="400px" 
          :showControls="true"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, computed, onMounted } from 'vue';
import { useEtablissementStore } from '@/stores/etablissement';
import { useUrgenceStore } from '@/stores/urgence';
import { useUserStore } from '@/stores/user';
import MapComponent from '@/components/MapComponent.vue';

export default defineComponent({
  name: 'HomeView',
  components: {
    MapComponent
  },
  setup() {
    const searchQuery = ref('');
    const loading = ref(false);
    const locationError = ref('');
    const mapComponent = ref(null);
    const addressSuggestions = ref([]);
    const mapInitialized = ref(false);
    
    const etablissementStore = useEtablissementStore();
    const urgenceStore = useUrgenceStore();
    const userStore = useUserStore();
    
    const etablissements = computed(() => {
      return etablissementStore.etablissementsFiltres;
    });
    
    const filtres = ref({
      type: 'tous',
      services: [],
      distance: 20
    });
    
    // Recherche d'établissements par adresse
    const searchEtablissements = async () => {
      loading.value = true;
      locationError.value = '';
      addressSuggestions.value = []; // Effacer les suggestions
      
      try {
        // Si une recherche textuelle est fournie, essayer de la géocoder
        if (searchQuery.value.trim()) {
          // Ici vous devriez appeler votre API de géocodage pour obtenir les coordonnées de l'adresse
          // Pour cet exemple, nous utilisons toujours la position par défaut de Montréal
          console.log('Recherche avec l\'adresse:', searchQuery.value);
        }
        
        // Pour l'instant, nous utilisons juste une position par défaut pour Montréal
        await etablissementStore.fetchEtablissements({
          latitude: 45.5017,  // Montréal
          longitude: -73.5673
        });
        
        // Si la carte est disponible, ajuster la vue
        if (mapInitialized.value && mapComponent.value && typeof mapComponent.value.updateMap === 'function') {
          mapComponent.value.updateMap();
        } else {
          console.log('La carte n\'est pas encore prête ou la méthode updateMap n\'est pas disponible');
        }
      } catch (error) {
        console.error('Erreur lors de la recherche:', error);
      } finally {
        loading.value = false;
      }
    };
    
    // Fonction pour suggérer des adresses basée sur l'entrée de l'utilisateur
    const suggestAddresses = async () => {
      if (!searchQuery.value || searchQuery.value.length < 3) {
        addressSuggestions.value = [];
        return;
      }
      
      try {
        // Utiliser l'API Mapbox pour l'autocomplétion
        const mapboxToken = "pk.eyJ1Ijoic3RlZmVudGFpbWUiLCJhIjoiY200YWRneGd1MDZoNDJrcTU2dmd4MDVhayJ9.jAvxm_j2gpUKVCls1dpfRg";
        const endpoint = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery.value)}.json?access_token=${mapboxToken}&country=ca&types=address,place&language=fr`;
        
        const response = await fetch(endpoint);
        if (!response.ok) {
          throw new Error(`Erreur Mapbox: ${response.status}`);
        }
        
        const data = await response.json();
        addressSuggestions.value = data.features.map(feature => ({
          description: feature.place_name,
          place_id: feature.id,
          coordinates: feature.center // [longitude, latitude]
        }));
      } catch (error) {
        console.error('Erreur lors de la suggestion d\'adresses:', error);
        // Fallback vers la simulation en cas d'erreur
        if (searchQuery.value.toLowerCase().includes('mont')) {
          addressSuggestions.value = [
            { description: "Montréal, QC, Canada", place_id: "montreal_123", coordinates: [-73.5673, 45.5017] },
            { description: "Montréal-Nord, QC, Canada", place_id: "montreal_nord_456", coordinates: [-73.6306, 45.5961] },
            { description: "Mont-Royal, QC, Canada", place_id: "mont_royal_789", coordinates: [-73.6306, 45.5166] }
          ];
        } else if (searchQuery.value.toLowerCase().includes('que')) {
          addressSuggestions.value = [
            { description: "Québec, QC, Canada", place_id: "quebec_123", coordinates: [-71.2082, 46.8139] },
            { description: "Québec Centre-Ville, QC, Canada", place_id: "quebec_cv_456", coordinates: [-71.2270, 46.8131] }
          ];
        } else {
          addressSuggestions.value = [];
        }
      }
    };
    
    // Fonction pour sélectionner une adresse dans la liste des suggestions
    const selectAddress = (suggestion) => {
      searchQuery.value = suggestion.description;
      addressSuggestions.value = [];
      
      // Utiliser les coordonnées fournies
      if (suggestion.coordinates) {
        etablissementStore.fetchEtablissements({
          latitude: suggestion.coordinates[1], // [longitude, latitude]
          longitude: suggestion.coordinates[0]
        }).then(() => {
          if (mapInitialized.value && mapComponent.value && typeof mapComponent.value.updateMap === 'function') {
            mapComponent.value.updateMap();
          }
        });
      } else {
        // Fallback si pas de coordonnées
        searchEtablissements();
      }
    };
    
    // Utiliser la position actuelle de l'utilisateur
    const useCurrentLocation = async () => {
      loading.value = true;
      locationError.value = '';
      addressSuggestions.value = []; // Effacer les suggestions
      
      try {
        await userStore.getUserPosition();
        
        if (userStore.position) {
          await etablissementStore.fetchEtablissements(userStore.position);
          
          // Si la carte est disponible, ajuster la vue
          if (mapInitialized.value && mapComponent.value && typeof mapComponent.value.updateMap === 'function') {
            mapComponent.value.updateMap();
          } else {
            console.log('La carte n\'est pas encore prête ou la méthode updateMap n\'est pas disponible');
          }
        } else {
          throw new Error('Impossible d\'obtenir votre position');
        }
      } catch (error) {
        locationError.value = error.message || 'Erreur lors de la géolocalisation';
        console.error('Erreur de géolocalisation:', error);
      } finally {
        loading.value = false;
      }
    };
    
    // Appliquer les filtres
    const appliquerFiltres = async () => {
      console.log('Application des filtres:', filtres.value);
      etablissementStore.setFiltres(filtres.value);
      
      // Si aucune recherche n'a été effectuée, faire une recherche par défaut
      if (!etablissementStore.hasSearched) {
        await searchEtablissements();
      }
      
      // Mettre à jour la carte
      if (mapInitialized.value && mapComponent.value && typeof mapComponent.value.updateMap === 'function') {
        mapComponent.value.filterEtablissements(filtres.value);
      } else {
        console.log('La carte n\'est pas encore prête ou la méthode filterEtablissements n\'est pas disponible');
      }
    };
    
    // Réinitialiser les filtres
    const reinitialiserFiltres = () => {
      filtres.value = {
        type: 'tous',
        services: [],
        distance: 20
      };
      
      appliquerFiltres();
    };
    
    // Obtenir les informations d'urgence pour un établissement
    const getUrgenceInfo = (etablissementId, field) => {
      const urgence = urgenceStore.getUrgenceByEtablissementId(etablissementId);
      return urgence ? urgence[field] : null;
    };
    
    // Obtenir la classe CSS pour le statut d'un établissement
    const getStatusClass = (etablissementId) => {
      const urgence = urgenceStore.getUrgenceByEtablissementId(etablissementId);
      
      if (!urgence) return 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      
      const taux = urgence.taux_occupation;
      
      if (taux < 80) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      if (taux < 100) return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    };
    
    // Obtenir le texte du statut d'un établissement
    const getStatusText = (etablissementId) => {
      const urgence = urgenceStore.getUrgenceByEtablissementId(etablissementId);
      
      if (!urgence) return '';
      
      const taux = urgence.taux_occupation;
      
      if (taux < 80) return 'Normal';
      if (taux < 100) return 'Occupé';
      return 'Saturé';
    };
    
    onMounted(async () => {
      // Charger les données d'urgence si elles ne sont pas déjà chargées
      if (urgenceStore.urgences.length === 0) {
        try {
          await urgenceStore.fetchUrgences();
        } catch (error) {
          console.error('Erreur lors du chargement des urgences:', error);
        }
      }
      
      // Initialiser la carte
      if (mapComponent.value) {
        try {
          await mapComponent.value.initMap();
          mapInitialized.value = true;
        } catch (error) {
          console.error('Erreur lors de l\'initialisation de la carte:', error);
        }
      }
      
      // Charger automatiquement tous les établissements au démarrage
      try {
        if (!etablissementStore.hasSearched && etablissementStore.etablissements.length === 0) {
          await searchEtablissements();
          
          // On attend un court instant pour que la carte soit bien initialisée
          setTimeout(() => {
            if (mapInitialized.value && mapComponent.value && typeof mapComponent.value.updateMap === 'function' && etablissements.value.length > 0) {
              mapComponent.value.updateMap();
            }
          }, 500);
        }
      } catch (error) {
        console.error('Erreur lors du chargement initial des établissements:', error);
      }
    });
    
    return {
      searchQuery,
      loading,
      locationError,
      addressSuggestions,
      etablissements,
      filtres,
      mapComponent,
      mapInitialized,
      etablissementStore,
      searchEtablissements,
      suggestAddresses,
      selectAddress,
      useCurrentLocation,
      appliquerFiltres,
      reinitialiserFiltres,
      getUrgenceInfo,
      getStatusClass,
      getStatusText
    };
  }
});
</script>