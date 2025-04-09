<template>
  <div class="etablissement-detail-view">
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
            <h1 class="text-2xl md:text-3xl font-bold">{{ etablissement.nom_installation }}</h1>
            <p class="text-gray-600 dark:text-gray-400">{{ etablissement.nom_etablissement }}</p>
          </div>
          
          <div class="mt-4 md:mt-0 flex gap-2">
            <router-link 
              :to="`/itineraire/${etablissement.id}`" 
              class="btn btn-primary flex items-center"
            >
              <span class="material-icons mr-1">directions</span>
              {{ $t('establishment.directions') }}
            </router-link>
            
            <router-link 
              to="/" 
              class="btn bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 flex items-center"
            >
              <span class="material-icons mr-1">arrow_back</span>
              Retour
            </router-link>
          </div>
        </div>
        
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Informations principales -->
          <div class="lg:col-span-2">
            <div class="card mb-6">
              <h2 class="text-xl font-bold mb-4">Informations</h2>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p class="text-sm text-gray-600 dark:text-gray-400">Adresse</p>
                  <p class="font-medium">{{ etablissement.adresse }}</p>
                  <p class="font-medium">
                    {{ etablissement.ville }}, {{ etablissement.province }} {{ etablissement.code_postal }}
                  </p>
                </div>
                
                <div>
                  <p class="text-sm text-gray-600 dark:text-gray-400">Type</p>
                  <p class="font-medium">{{ etablissement.type }}</p>
                </div>
              </div>
            </div>
            
            <!-- Statut en temps réel -->
            <div class="card mb-6">
              <div class="flex justify-between items-start mb-4">
                <h2 class="text-xl font-bold">Statut en temps réel</h2>
                <div 
                  class="px-3 py-1 rounded-full text-sm font-medium"
                  :class="getStatusClass()"
                >
                  {{ getStatusText() }}
                </div>
              </div>
              
              <div v-if="urgence" class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div class="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                  <p class="text-sm text-gray-600 dark:text-gray-400">{{ $t('establishment.occupation') }}</p>
                  <p class="text-2xl font-bold" :class="getOccupationClass()">
                    {{ urgence.taux_occupation }}%
                  </p>
                </div>
                
                <div class="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                  <p class="text-sm text-gray-600 dark:text-gray-400">{{ $t('establishment.patients') }}</p>
                  <p class="text-2xl font-bold">{{ urgence.patients_en_attente }}</p>
                </div>
                
                <div class="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                  <p class="text-sm text-gray-600 dark:text-gray-400">{{ $t('establishment.civiere') }}</p>
                  <p class="text-2xl font-bold">{{ urgence.patients_24h }}</p>
                </div>
                
                <div class="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                  <p class="text-sm text-gray-600 dark:text-gray-400">Civières occupées</p>
                  <p class="text-2xl font-bold">
                    {{ urgence.civieres_occupees }} / {{ urgence.civieres_fonctionnelles }}
                  </p>
                </div>
              </div>
              
              <div v-else class="text-gray-600 dark:text-gray-400">
                Aucune information disponible sur le statut en temps réel.
              </div>
              
              <div v-if="urgence" class="mt-4">
                <p class="text-sm text-gray-500 dark:text-gray-500">
                  Dernière mise à jour: {{ formatDate(urgence.date_extraction) }}
                </p>
              </div>
            </div>
            
            <!-- Historique des 7 derniers jours -->
            <div class="card mb-6">
              <!-- On passe le titre au composant StatusComponent -->
              <StatusComponent
                :etablissementId="etablissementId"
                :showDetails="false"
                :showHistory="true"
                :historyTitle="'Historique des 7 derniers jours'"
              />
            </div>
          </div>
          
          <!-- Carte et informations complémentaires -->
          <div class="lg:col-span-1">
            <div class="card mb-6">
              <h2 class="text-xl font-bold mb-4">Localisation</h2>
              
              <MapComponent 
                ref="mapComponent"
                height="250px" 
                :showControls="false"
              />
            </div>
            
            <div class="card mb-6">
              <h2 class="text-xl font-bold mb-4">{{ $t('establishment.services') }}</h2>
              
              <ul class="space-y-2">
                <li class="flex items-center">
                  <span class="material-icons text-green-500 mr-2">check_circle</span>
                  Urgence 24/7
                </li>
                <li class="flex items-center">
                  <span class="material-icons text-green-500 mr-2">check_circle</span>
                  Radiologie
                </li>
                <li class="flex items-center">
                  <span class="material-icons text-green-500 mr-2">check_circle</span>
                  Laboratoire
                </li>
                <li class="flex items-center">
                  <span class="material-icons text-red-500 mr-2">cancel</span>
                  Pédiatrie
                </li>
              </ul>
            </div>
            
            <div class="card">
              <h2 class="text-xl font-bold mb-4">{{ $t('establishment.contact') }}</h2>
              
              <p class="flex items-center mb-2">
                <span class="material-icons mr-2">phone</span>
                <a href="tel:+15141234567" class="text-primary hover:underline">514-123-4567</a>
              </p>
              
              <p class="flex items-center mb-2">
                <span class="material-icons mr-2">language</span>
                <a href="#" class="text-primary hover:underline">Site web</a>
              </p>
              
              <h3 class="font-bold mt-4 mb-2">{{ $t('establishment.hours') }}</h3>
              <p class="mb-1">Lundi - Vendredi: 8h00 - 20h00</p>
              <p class="mb-1">Samedi - Dimanche: 8h00 - 16h00</p>
              <p class="text-green-500 font-medium">Urgence: 24h/24, 7j/7</p>
            </div>
          </div>
        </div>
      </div>
      
      <div v-else class="text-center py-8">
        <p class="text-xl text-gray-600 dark:text-gray-400">Établissement non trouvé</p>
        <router-link to="/" class="btn btn-primary mt-4">
          Retour à l'accueil
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useEtablissementStore } from '@/stores/etablissement';
import { useUrgenceStore } from '@/stores/urgence';

// Importation du composant qui gère le statut & l'historique
import StatusComponent from '@/components/StatusComponent.vue';

import MapComponent from '@/components/MapComponent.vue';

export default defineComponent({
  name: 'EtablissementDetail',
  components: {
    MapComponent,
    StatusComponent
  },
  setup() {
    const route = useRoute();
    const etablissementId = parseInt(route.params.id);

    const loading = ref(true);
    const error = ref(null);
    const mapComponent = ref(null);

    const etablissementStore = useEtablissementStore();
    const urgenceStore = useUrgenceStore();

    // Accès en lecture seule (computed) à l'établissement
    const etablissement = computed(() => {
      return etablissementStore.etablissementDetail;
    });

    // Accès en lecture seule (computed) à l'urgence "temps réel" (si plusieurs entrées, c'est la première)
    const urgence = computed(() => {
      return urgenceStore.getUrgenceByEtablissementId(etablissementId);
    });

    // Charger les détails de l'établissement
    const loadEtablissementDetail = async () => {
      loading.value = true;
      error.value = null;

      try {
        await etablissementStore.fetchEtablissementDetail(etablissementId);

        // Récupérer la liste des urgences si non déjà chargées
        if (urgenceStore.urgences.length === 0) {
          await urgenceStore.fetchUrgences();
        }

        // Centrer la carte sur l'établissement (avec un petit délai)
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

    // Classes et texte pour le statut
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

    const getOccupationClass = () => {
      if (!urgence.value) return '';
      const taux = urgence.value.taux_occupation;
      if (taux < 80) return 'text-green-600 dark:text-green-400';
      if (taux < 100) return 'text-orange-600 dark:text-orange-400';
      return 'text-red-600 dark:text-red-400';
    };

    // Formater une date
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

    onMounted(() => {
      loadEtablissementDetail();
    });

    return {
      etablissementId,
      etablissement,
      urgence,
      loading,
      error,
      mapComponent,

      getStatusClass,
      getStatusText,
      getOccupationClass,
      formatDate
    };
  }
});
</script>