<template>
  <div class="carte-view">
    <div class="container mx-auto px-4 py-6">
      <h1 class="text-2xl font-bold mb-4">{{ $t('map.title') }}</h1>
      
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <!-- Filtres -->
        <div class="lg:col-span-1 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
          <h2 class="text-xl font-semibold mb-3">{{ $t('filters.title') }}</h2>
          
          <div class="mb-4">
            <label class="block text-sm font-medium mb-1">{{ $t('filters.type') }}</label>
            <select v-model="filtres.type" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary">
              <option value="tous">Tous</option>
              <option value="Hospitals">Hôpitaux</option>
              <option value="Clinics">Cliniques</option>
              <option value="CLSC">CLSC</option>
            </select>
          </div>
          
          <div class="mb-4">
            <label class="block text-sm font-medium mb-1">{{ $t('filters.distance') }}</label>
            <input 
              type="range" 
              v-model.number="filtres.distance" 
              min="5" 
              max="50" 
              step="5"
              class="w-full"
            />
            <div class="text-sm text-gray-600 dark:text-gray-400 text-right">{{ filtres.distance }} km</div>
          </div>
          
          <div class="mb-4">
            <label class="block text-sm font-medium mb-1">{{ $t('filters.services') }}</label>
            <div class="space-y-2">
              <div class="flex items-center">
                <input type="checkbox" id="urgence" value="urgence" v-model="filtres.services" class="mr-2" />
                <label for="urgence">Urgence 24/7</label>
              </div>
              <div class="flex items-center">
                <input type="checkbox" id="pediatrie" value="pediatrie" v-model="filtres.services" class="mr-2" />
                <label for="pediatrie">Pédiatrie</label>
              </div>
              <div class="flex items-center">
                <input type="checkbox" id="geriatrie" value="geriatrie" v-model="filtres.services" class="mr-2" />
                <label for="geriatrie">Gériatrie</label>
              </div>
            </div>
          </div>
          
          <div class="flex space-x-2">
            <button 
              @click="appliquerFiltres" 
              class="btn btn-primary flex-1"
            >
              {{ $t('filters.apply') }}
            </button>
            <button 
              @click="reinitialiserFiltres" 
              class="btn bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 flex-1"
            >
              {{ $t('filters.reset') }}
            </button>
          </div>
        </div>
        
        <!-- Carte -->
        <div class="lg:col-span-3">
          <MapComponent 
            ref="mapComponent"
            height="600px" 
            :showControls="true"
          />
          
          <!-- Légende -->
          <div class="mt-4 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <h3 class="text-lg font-semibold mb-2">{{ $t('map.legend') }}</h3>
            <div class="flex items-center space-x-6">
              <div class="flex items-center">
                <div class="w-4 h-4 rounded-full bg-green-400 mr-2"></div>
                <span>{{ $t('map.normal') }}</span>
              </div>
              <div class="flex items-center">
                <div class="w-4 h-4 rounded-full bg-orange-400 mr-2"></div>
                <span>{{ $t('map.busy') }}</span>
              </div>
              <div class="flex items-center">
                <div class="w-4 h-4 rounded-full bg-red-500 mr-2"></div>
                <span>{{ $t('map.critical') }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, onMounted } from 'vue';
import { useEtablissementStore } from '@/stores/etablissement';
import { useUrgenceStore } from '@/stores/urgence';
import { useUserStore } from '@/stores/user';
import MapComponent from '@/components/MapComponent.vue';

export default defineComponent({
  name: 'CarteView',
  components: {
    MapComponent
  },
  setup() {
    const mapComponent = ref(null);
    const etablissementStore = useEtablissementStore();
    const urgenceStore = useUrgenceStore();
    const userStore = useUserStore();
    
    const filtres = ref({
      type: 'tous',
      services: [],
      distance: 20
    });
    
    const appliquerFiltres = () => {
      etablissementStore.setFiltres(filtres.value);
      
      if (mapComponent.value) {
        mapComponent.value.filterEtablissements(filtres.value);
      }
    };
    
    const reinitialiserFiltres = () => {
      filtres.value = {
        type: 'tous',
        services: [],
        distance: 20
      };
      
      appliquerFiltres();
    };
    
    onMounted(async () => {
      // Charger les données d'urgence si elles ne sont pas déjà chargées
      if (urgenceStore.urgences.length === 0) {
        await urgenceStore.fetchUrgences();
      }
      
      // Essayer d'obtenir la position de l'utilisateur
      try {
        await userStore.getUserPosition();
      } catch (error) {
        console.error('Erreur de géolocalisation:', error);
      }
    });
    
    return {
      mapComponent,
      filtres,
      appliquerFiltres,
      reinitialiserFiltres
    };
  }
});
</script>
