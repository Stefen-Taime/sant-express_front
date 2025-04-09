import { defineComponent, onMounted, ref, watch } from 'vue';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useEtablissementStore } from '@/stores/etablissement';
import { useUrgenceStore } from '@/stores/urgence';
import { useUserStore } from '@/stores/user';
import { useI18n } from 'vue-i18n';

export default defineComponent({
  name: 'MapComponent',
  props: {
    height: {
      type: String,
      default: '500px'
    },
    width: {
      type: String,
      default: '100%'
    },
    showControls: {
      type: Boolean,
      default: true
    }
  },
  setup(props) {
    const mapContainer = ref(null);
    const map = ref(null);
    const markers = ref([]);
    const etablissementStore = useEtablissementStore();
    const urgenceStore = useUrgenceStore();
    const userStore = useUserStore();
    const { t } = useI18n();
    
    const mapToken = 'pk.eyJ1Ijoic3RlZmVudGFpbWUiLCJhIjoiY200YWRneGd1MDZoNDJrcTU2dmd4MDVhayJ9.jAvxm_j2gpUKVCls1dpfRg';
    
    // Fonction pour déterminer la couleur du marqueur en fonction du taux d'occupation
    const getMarkerColor = (etablissementId) => {
      const urgence = urgenceStore.getUrgenceByEtablissementId(etablissementId);
      
      if (!urgence) return '#3182ce'; // Couleur par défaut (bleu)
      
      const taux = urgence.taux_occupation;
      
      if (taux < 80) return '#68d391'; // Vert
      if (taux < 100) return '#f6ad55'; // Orange
      return '#f56565'; // Rouge
    };
    
    // Fonction pour créer un élément de marqueur personnalisé
    const createCustomMarker = (etablissementId) => {
      const color = getMarkerColor(etablissementId);
      
      const el = document.createElement('div');
      el.className = 'marker';
      el.style.backgroundColor = color;
      el.style.width = '25px';
      el.style.height = '25px';
      el.style.borderRadius = '50%';
      el.style.border = '2px solid white';
      el.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.3)';
      
      return el;
    };
    
    // Initialisation de la carte
    const initializeMap = () => {
      if (map.value) return;
      
      mapboxgl.accessToken = mapToken;
      
      map.value = new mapboxgl.Map({
        container: mapContainer.value,
        style: userStore.darkMode ? 'mapbox://styles/mapbox/dark-v10' : 'mapbox://styles/mapbox/light-v10',
        center: [-73.5673, 45.5017], // Montréal par défaut
        zoom: 11
      });
      
      // Ajout des contrôles si nécessaire
      if (props.showControls) {
        map.value.addControl(new mapboxgl.NavigationControl(), 'top-right');
        map.value.addControl(new mapboxgl.GeolocateControl({
          positionOptions: {
            enableHighAccuracy: true
          },
          trackUserLocation: true
        }), 'top-right');
      }
      
      // Chargement des établissements une fois la carte chargée
      map.value.on('load', () => {
        loadEtablissements();
      });
    };
    
    // Chargement des établissements sur la carte
    const loadEtablissements = async () => {
      if (!map.value) return;
      
      // Suppression des marqueurs existants
      clearMarkers();
      
      // Si les données ne sont pas déjà chargées, les récupérer
      if (etablissementStore.etablissementsCarte.length === 0) {
        await etablissementStore.fetchEtablissementsCarte();
      }
      
      // Si les données d'urgence ne sont pas déjà chargées, les récupérer
      if (urgenceStore.urgences.length === 0) {
        await urgenceStore.fetchUrgences();
      }
      
      // Création des marqueurs pour chaque établissement
      if (etablissementStore.etablissementsCarte.features) {
        etablissementStore.etablissementsCarte.features.forEach(feature => {
          const { id, nom_installation } = feature.properties;
          const [lng, lat] = feature.geometry.coordinates;
          
          // Création du popup
          const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
            <div class="popup-content">
              <h3 class="font-bold">${nom_installation}</h3>
              <p>${feature.properties.adresse}, ${feature.properties.ville}</p>
              ${createUrgenceInfo(id)}
              <a href="#/etablissement/${id}" class="text-blue-500 hover:underline">${t('establishment.details')}</a>
            </div>
          `);
          
          // Création du marqueur
          const marker = new mapboxgl.Marker(createCustomMarker(id))
            .setLngLat([lng, lat])
            .setPopup(popup)
            .addTo(map.value);
          
          markers.value.push(marker);
        });
        
        // Si l'utilisateur a une position, centrer la carte sur sa position
        if (userStore.position) {
          map.value.flyTo({
            center: [userStore.position.longitude, userStore.position.latitude],
            zoom: 12
          });
        }
      }
    };
    
    // Création du contenu HTML pour les informations d'urgence
    const createUrgenceInfo = (etablissementId) => {
      const urgence = urgenceStore.getUrgenceByEtablissementId(etablissementId);
      
      if (!urgence) return '<p>Aucune information disponible</p>';
      
      let statusClass = 'text-green-500';
      let statusText = t('status.normal');
      
      if (urgence.taux_occupation >= 100) {
        statusClass = 'text-red-500';
        statusText = t('status.critical');
      } else if (urgence.taux_occupation >= 80) {
        statusClass = 'text-orange-500';
        statusText = t('status.busy');
      }
      
      return `
        <div class="mt-2">
          <p><span class="font-medium">${t('establishment.occupation')}:</span> 
            <span class="${statusClass}">${urgence.taux_occupation}% (${statusText})</span>
          </p>
          <p><span class="font-medium">${t('establishment.patients')}:</span> ${urgence.patients_en_attente}</p>
          <p><span class="font-medium">${t('establishment.civiere')}:</span> ${urgence.patients_24h}</p>
        </div>
      `;
    };
    
    // Suppression des marqueurs
    const clearMarkers = () => {
      markers.value.forEach(marker => marker.remove());
      markers.value = [];
    };
    
    // Centrer la carte sur un établissement spécifique
    const centerOnEtablissement = (etablissementId) => {
      const etablissement = etablissementStore.getEtablissementById(etablissementId);
      
      if (etablissement && etablissement.latitude && etablissement.longitude) {
        map.value.flyTo({
          center: [etablissement.longitude, etablissement.latitude],
          zoom: 15
        });
        
        // Trouver et ouvrir le popup du marqueur correspondant
        markers.value.forEach(marker => {
          const markerLngLat = marker.getLngLat();
          
          if (markerLngLat.lng === etablissement.longitude && markerLngLat.lat === etablissement.latitude) {
            marker.togglePopup();
          }
        });
      }
    };
    
    // Filtrer les établissements affichés sur la carte
const filterEtablissements = (filtres) => {
  clearMarkers();
  
  // Utiliser la variable filtres ou désactiver l'avertissement ESLint
  // eslint-disable-next-line no-unused-vars
  console.log('Filtres appliqués:', filtres);
  
  // Logique de filtrage à implémenter en fonction des besoins
  loadEtablissements();
};
    
    // Initialisation de la carte au montage du composant
    onMounted(() => {
      initializeMap();
    });
    
    // Observer les changements de mode sombre
    watch(() => userStore.darkMode, (newValue) => {
      if (map.value) {
        map.value.setStyle(newValue ? 'mapbox://styles/mapbox/dark-v10' : 'mapbox://styles/mapbox/light-v10');
      }
    });
    
    return {
      mapContainer,
      centerOnEtablissement,
      filterEtablissements
    };
  }
});
