<template>
  <div class="status-component">
    <!-- Statut actuel -->
    <div v-if="loading" class="flex justify-center py-4">
      <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
    </div>
    
    <div v-else>
      <!-- Affichage compact -->
      <div v-if="!showDetails" class="flex items-center">
        <div class="px-2 py-1 rounded-full text-sm font-medium mr-2"
             :class="getStatusClass()">
          {{ getStatusText() }}
        </div>
        
        <span v-if="urgence" class="text-sm">
          {{ formaterPourcentage(urgence.taux_occupation) }} · {{ urgence.patients_en_attente || 0 }} en attente
        </span>
        <span v-else class="text-sm text-gray-500 dark:text-gray-400">
          Aucune donnée
        </span>
      </div>
      
      <!-- Historique simple -->
      <div v-if="showHistory && !loadingHistory && historicalModeData.length > 0" class="mt-6">
        <!-- Le titre est conditionnel et n'est affiché que si historyTitle est défini -->
        <h3 v-if="historyTitle" class="text-lg font-bold mb-3">{{ historyTitle }}</h3>
        
        <!-- Résumé des données -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div class="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
            <p class="text-sm text-gray-600 dark:text-gray-400">Taux moyen</p>
            <p class="text-xl font-bold" :class="getOccupationClass(tauxOccupationMoyen)">
              {{ formaterPourcentage(tauxOccupationMoyen) }}
            </p>
          </div>
          
          <div class="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
            <p class="text-sm text-gray-600 dark:text-gray-400">Taux maximum</p>
            <p class="text-xl font-bold text-red-600 dark:text-red-400">
              {{ formaterPourcentage(tauxOccupationMax) }}
            </p>
          </div>
          
          <div class="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
            <p class="text-sm text-gray-600 dark:text-gray-400">Taux minimum</p>
            <p class="text-xl font-bold text-green-600 dark:text-green-400">
              {{ formaterPourcentage(tauxOccupationMin) }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, computed, onMounted, watch } from 'vue';
import { useUrgenceStore } from '@/stores/urgence';

export default defineComponent({
  name: 'StatusComponent',
  props: {
    etablissementId: {
      type: Number,
      required: true
    },
    showDetails: {
      type: Boolean,
      default: false
    },
    showHistory: {
      type: Boolean,
      default: false
    },
    historyTitle: {
      type: String,
      default: null
    }
  },
  setup(props) {
    const loading = ref(false);
    const loadingHistory = ref(false);
    const historicalData = ref([]);
    const historicalRawData = ref([]);
    const dataMode = ref('api');

    const urgenceStore = useUrgenceStore();

    const urgence = computed(() => {
      return urgenceStore.getUrgenceByEtablissementId(props.etablissementId);
    });

    const historicalModeData = computed(() => {
      return dataMode.value === 'api' 
        ? historicalData.value 
        : historicalRawData.value.slice(0, 20);
    });
    
    const tauxOccupationMoyen = computed(() => {
      if (historicalModeData.value.length === 0) return 0;
      
      const values = historicalModeData.value
        .map(item => item.taux_occupation)
        .filter(val => val !== null && val !== undefined);
      
      return values.length > 0 
        ? values.reduce((sum, val) => sum + val, 0) / values.length 
        : 0;
    });
    
    const tauxOccupationMax = computed(() => {
      if (historicalModeData.value.length === 0) return 0;
      
      const values = historicalModeData.value
        .map(item => dataMode.value === 'api' ? (item.taux_max || item.taux_occupation) : item.taux_occupation)
        .filter(val => val !== null && val !== undefined);
      
      return values.length > 0 ? Math.max(...values) : 0;
    });
    
    const tauxOccupationMin = computed(() => {
      if (historicalModeData.value.length === 0) return 0;
      
      const values = historicalModeData.value
        .map(item => dataMode.value === 'api' ? (item.taux_min || item.taux_occupation) : item.taux_occupation)
        .filter(val => val !== null && val !== undefined);
      
      return values.length > 0 ? Math.min(...values) : 0;
    });

    const formaterPourcentage = (valeur) => {
      if (valeur === undefined || valeur === null) return '0%';
      return Math.round(valeur) + '%';
    };

    const getStatusClass = () => {
      if (!urgence.value) {
        return 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      }

      const taux = urgence.value.taux_occupation;
      if (taux < 80) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      if (taux < 100) return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    };

    const getStatusText = () => {
      if (!urgence.value) return 'Inconnu';

      const taux = urgence.value.taux_occupation;
      if (taux < 80) return 'Normal';
      if (taux < 100) return 'Occupé';
      return 'Saturé';
    };

    const getOccupationClass = (taux) => {
      if (taux === undefined || taux === null) return '';
      if (taux < 80) return 'text-green-600 dark:text-green-400';
      if (taux < 100) return 'text-orange-600 dark:text-orange-400';
      return 'text-red-600 dark:text-red-400';
    };

    const formatDate = (dateString) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('fr-CA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    };

    const changeDataMode = (mode) => {
      dataMode.value = mode;
    };
    
    const loadHistorique = async () => {
      if (!props.showHistory) return;
      
      console.log('Chargement de l\'historique pour:', props.etablissementId);
      loadingHistory.value = true;
      
      try {
        // Version simplifiée - juste charger les données graphiques
        const url = `/api/urgences/historique/graphique/${props.etablissementId}?jours=7&interval=jour`;
        const response = await fetch(url);
        
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data)) {
            historicalData.value = data;
          }
        }
      } catch (err) {
        console.error('Erreur:', err);
      } finally {
        loadingHistory.value = false;
      }
    };

    // Charger les données au montage
    onMounted(() => {
      if (props.showHistory) {
        loadHistorique();
      }
    });

    // Observer les changements
    watch(() => props.etablissementId, () => {
      if (props.showHistory) {
        loadHistorique();
      }
    });

    watch(() => props.showHistory, (newValue) => {
      if (newValue) {
        loadHistorique();
      }
    });

    return {
      urgence,
      loading,
      loadingHistory,
      historicalData,
      historicalRawData,
      historicalModeData,
      dataMode,
      tauxOccupationMoyen,
      tauxOccupationMax,
      tauxOccupationMin,
      getStatusClass,
      getStatusText,
      getOccupationClass,
      formatDate,
      formaterPourcentage,
      changeDataMode,
      loadHistorique
    };
  }
});
</script>

<style scoped>
.status-component {
  width: 100%;
}
</style>