<template>
  <div class="itineraire-view">
    <div class="container mx-auto px-4 py-6">
      <div v-if="loading" class="flex justify-center py-8">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
      
      <div v-else-if="error" class="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 p-4 rounded-lg mb-6">
        {{ error }}
      </div>
      
      <div v-else-if="etablissement">
        <!-- En-tête -->
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 class="text-2xl md:text-3xl font-bold">{{ $t('directions.title') }} {{ etablissement.nom_installation }}</h1>
            <p class="text-gray-600 dark:text-gray-400">{{ etablissement.adresse }}, {{ etablissement.ville }}</p>
          </div>
          
          <div class="mt-4 md:mt-0">
            <router-link 
              :to="`/etablissement/${etablissement.id}`" 
              class="btn bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 flex items-center"
            >
              <span class="material-icons mr-1">arrow_back</span>
              Retour
            </router-link>
          </div>
        </div>
        
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Formulaire d'itinéraire -->
          <div class="lg:col-span-1">
            <div class="card mb-6">
              <h2 class="text-xl font-bold mb-4">{{ $t('directions.calculate') }}</h2>
              
              <div class="mb-4">
                <label class="block text-sm font-medium mb-1">{{ $t('directions.start') }}</label>
                <div class="flex">
                  <input 
                    type="text" 
                    v-model="startAddress" 
                    :placeholder="$t('search.placeholder')" 
                    class="input rounded-r-none"
                  />
                  <button 
                    @click="useCurrentLocation" 
                    class="px-3 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 rounded-r-md"
                    title="Utiliser ma position"
                  >
                    <span class="material-icons">my_location</span>
                  </button>
                </div>
              </div>
              
              <div class="mb-4">
                <label class="block text-sm font-medium mb-1">{{ $t('directions.destination') }}</label>
                <input 
                  type="text" 
                  :value="etablissement.adresse + ', ' + etablissement.ville" 
                  disabled
                  class="input bg-gray-100 dark:bg-gray-700"
                />
              </div>
              
              <button 
                @click="calculateRoute" 
                class="btn btn-primary w-full flex items-center justify-center"
                :disabled="!startAddress && !userPosition"
              >
                <span class="material-icons mr-1">directions</span>
                {{ $t('directions.calculate') }}
              </button>
            </div>
            
            <!-- Détails de l'itinéraire -->
            <div v-if="routeDetails" class="card">
              <h2 class="text-xl font-bold mb-4">Détails de l'itinéraire</h2>
              
              <div class="mb-4">
                <div class="flex items-center mb-2">
                  <span class="material-icons text-primary mr-2">route</span>
                  <p class="font-medium">{{ $t('directions.distance') }}: {{ routeDetails.distance }}</p>
                </div>
                <div class="flex items-center mb-4">
                  <span class="material-icons text-primary mr-2">schedule</span>
                  <p class="font-medium">{{ $t('directions.duration') }}: {{ routeDetails.duration }}</p>
                </div>
                
                <a 
                  :href="getNavigationUrl()" 
                  target="_blank" 
                  class="btn btn-primary w-full flex items-center justify-center"
                >
                  <span class="material-icons mr-1">navigation</span>
                  {{ $t('directions.navigate') }}
                </a>
              </div>
              
              <!-- Instructions de l'itinéraire -->
              <div class="mt-4">
                <h3 class="font-bold mb-2">Instructions</h3>
                <ul class="space-y-3">
                  <li v-for="(step, index) in routeDetails.steps" :key="index" class="flex">
                    <span class="material-icons text-gray-600 dark:text-gray-400 mr-2 flex-shrink-0">{{ getStepIcon(step.maneuver) }}</span>
                    <span>{{ step.instruction }}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          <!-- Carte -->
          <div class="lg:col-span-2">
            <div class="card">
              <MapComponent 
                ref="mapComponent"
                height="600px" 
                :showControls="true"
              />
            </div>
          </div>
        </div>
      </div>
      
      <div v-else class="text-center py-8">
        <p class="text-xl text-gray-600 dark:text-gray-400">Établissement non trouvé</p>
        <router-link to="/" class="btn btn-primary mt-4">Retour à l'accueil</router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useEtablissementStore } from '@/stores/etablissement';
import { useUserStore } from '@/stores/user';
import MapComponent from '@/components/MapComponent.vue';

export default defineComponent({
  name: 'ItineraireView',
  components: {
    MapComponent
  },
  setup() {
    const route = useRoute();
    const etablissementId = parseInt(route.params.id);
    
    const loading = ref(true);
    const error = ref(null);
    const mapComponent = ref(null);
    const startAddress = ref('');
    const routeDetails = ref(null);
    
    const etablissementStore = useEtablissementStore();
    const userStore = useUserStore();
    
    const etablissement = computed(() => {
      return etablissementStore.etablissementDetail;
    });
    
    const userPosition = computed(() => {
      return userStore.position;
    });
    
    // Charger les détails de l'établissement
    const loadEtablissementDetail = async () => {
      loading.value = true;
      error.value = null;
      
      try {
        await etablissementStore.fetchEtablissementDetail(etablissementId);
        
        // Centrer la carte sur l'établissement
        if (mapComponent.value && etablissement.value) {
          setTimeout(() => {
            mapComponent.value.centerOnEtablissement(etablissementId);
          }, 500);
        }
      } catch (err) {
        error.value = err.message || 'Erreur lors du chargement des détails de l\'établissement';
        console.error('Erreur:', err);
      } finally {
        loading.value = false;
      }
    };
    
    // Utiliser la position actuelle de l'utilisateur
    const useCurrentLocation = async () => {
      try {
        await userStore.getUserPosition();
        startAddress.value = 'Ma position actuelle';
      } catch (error) {
        console.error('Erreur de géolocalisation:', error);
      }
    };
    
    // Calculer l'itinéraire
    const calculateRoute = async () => {
      if ((!startAddress.value && !userPosition.value) || !etablissement.value) {
        return;
      }
      
      try {
        // Simuler le calcul d'itinéraire (à remplacer par un appel à une API de routage)
        // Dans une implémentation réelle, on utiliserait l'API Mapbox Directions
        
        // Exemple de réponse simulée
        routeDetails.value = {
          distance: '12.5 km',
          duration: '25 minutes',
          steps: [
            {
              maneuver: 'depart',
              instruction: 'Partir en direction sud sur Rue Principale'
            },
            {
              maneuver: 'turn-right',
              instruction: 'Tourner à droite sur Boulevard Saint-Laurent'
            },
            {
              maneuver: 'turn-left',
              instruction: 'Tourner à gauche sur Avenue du Mont-Royal'
            },
            {
              maneuver: 'straight',
              instruction: 'Continuer tout droit sur Avenue du Mont-Royal'
            },
            {
              maneuver: 'arrive',
              instruction: 'Arriver à destination, sur votre droite'
            }
          ]
        };
        
        // Dans une implémentation réelle, on dessinerait l'itinéraire sur la carte
        // mapComponent.value.drawRoute(routeCoordinates);
        
      } catch (error) {
        console.error('Erreur lors du calcul de l\'itinéraire:', error);
      }
    };
    
    // Obtenir l'URL pour la navigation
    const getNavigationUrl = () => {
      if (!etablissement.value) return '#';
      
      const destination = `${etablissement.value.latitude},${etablissement.value.longitude}`;
      let origin = '';
      
      if (userPosition.value) {
        origin = `${userPosition.value.latitude},${userPosition.value.longitude}`;
      } else {
        // Utiliser l'adresse saisie
        origin = encodeURIComponent(startAddress.value);
      }
      
      // Générer une URL pour Google Maps
      return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;
    };
    
    // Obtenir l'icône pour une étape de l'itinéraire
    const getStepIcon = (maneuver) => {
      switch (maneuver) {
        case 'depart':
          return 'play_arrow';
        case 'arrive':
          return 'place';
        case 'turn-right':
          return 'turn_right';
        case 'turn-left':
          return 'turn_left';
        case 'straight':
          return 'straight';
        default:
          return 'directions';
      }
    };
    
    onMounted(() => {
      loadEtablissementDetail();
    });
    
    return {
      etablissement,
      loading,
      error,
      mapComponent,
      startAddress,
      userPosition,
      routeDetails,
      useCurrentLocation,
      calculateRoute,
      getNavigationUrl,
      getStepIcon
    };
  }
});
</script>
