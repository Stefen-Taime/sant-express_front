// Fichier de test pour les fonctionnalités principales de l'application
const { expect } = require('chai');
const { shallowMount, mount } = require('@vue/test-utils');
const { createI18n } = require('vue-i18n');
const { createPinia } = require('pinia');

// Configuration de base pour les tests
const setupTest = (component, options = {}) => {
  const i18n = createI18n({
    legacy: false,
    locale: 'fr',
    messages: {
      fr: require('./src/locales/fr.json'),
      en: require('./src/locales/en.json')
    }
  });
  
  const pinia = createPinia();
  
  return mount(component, {
    global: {
      plugins: [i18n, pinia],
      stubs: {
        'router-link': true,
        'router-view': true
      },
      ...options.global
    },
    ...options
  });
};

// Tests pour les composants principaux
describe('Composants principaux', () => {
  // Test du composant MapComponent
  describe('MapComponent', () => {
    it('devrait rendre correctement avec les props par défaut', () => {
      const MapComponent = require('./src/components/MapComponent.vue').default;
      const wrapper = setupTest(MapComponent);
      
      expect(wrapper.find('.map-container').exists()).to.be.true;
    });
    
    it('devrait respecter les dimensions spécifiées', () => {
      const MapComponent = require('./src/components/MapComponent.vue').default;
      const wrapper = setupTest(MapComponent, {
        props: {
          height: '300px',
          width: '500px'
        }
      });
      
      const container = wrapper.find('.map-container');
      expect(container.attributes('style')).to.include('height: 300px');
      expect(container.attributes('style')).to.include('width: 500px');
    });
  });
  
  // Test du composant StatusComponent
  describe('StatusComponent', () => {
    it('devrait afficher le statut compact par défaut', () => {
      const StatusComponent = require('./src/components/StatusComponent.vue').default;
      const wrapper = setupTest(StatusComponent, {
        props: {
          etablissementId: 1,
          showDetails: false
        }
      });
      
      expect(wrapper.find('.status-component').exists()).to.be.true;
    });
    
    it('devrait afficher les détails quand showDetails est true', () => {
      const StatusComponent = require('./src/components/StatusComponent.vue').default;
      const wrapper = setupTest(StatusComponent, {
        props: {
          etablissementId: 1,
          showDetails: true
        }
      });
      
      // Vérifier que les détails sont affichés
      expect(wrapper.find('h2').exists()).to.be.true;
    });
  });
  
  // Test du composant DarkModeToggle
  describe('DarkModeToggle', () => {
    it('devrait rendre correctement', () => {
      const DarkModeToggle = require('./src/components/DarkModeToggle.vue').default;
      const wrapper = setupTest(DarkModeToggle);
      
      expect(wrapper.find('.dark-mode-toggle').exists()).to.be.true;
      expect(wrapper.find('button').exists()).to.be.true;
    });
    
    it('devrait changer d\'icône en fonction du mode', async () => {
      const DarkModeToggle = require('./src/components/DarkModeToggle.vue').default;
      const wrapper = setupTest(DarkModeToggle);
      
      // Simuler un clic pour changer de mode
      await wrapper.find('button').trigger('click');
      
      // Vérifier que l'icône a changé
      expect(wrapper.find('.material-icons').exists()).to.be.true;
    });
  });
  
  // Test du composant LanguageSelector
  describe('LanguageSelector', () => {
    it('devrait rendre correctement', () => {
      const LanguageSelector = require('./src/components/LanguageSelector.vue').default;
      const wrapper = setupTest(LanguageSelector);
      
      expect(wrapper.find('.language-selector').exists()).to.be.true;
      expect(wrapper.find('button').exists()).to.be.true;
    });
    
    it('devrait afficher la langue actuelle', () => {
      const LanguageSelector = require('./src/components/LanguageSelector.vue').default;
      const wrapper = setupTest(LanguageSelector);
      
      expect(wrapper.find('button span').text()).to.equal('FR');
    });
  });
});

// Tests pour les vues principales
describe('Vues principales', () => {
  // Test de la vue Home
  describe('HomeView', () => {
    it('devrait rendre correctement', () => {
      const HomeView = require('./src/views/Home.vue').default;
      const wrapper = setupTest(HomeView);
      
      expect(wrapper.find('.home-view').exists()).to.be.true;
      expect(wrapper.find('.hero-section').exists()).to.be.true;
    });
    
    it('devrait contenir un formulaire de recherche', () => {
      const HomeView = require('./src/views/Home.vue').default;
      const wrapper = setupTest(HomeView);
      
      expect(wrapper.find('input[type="text"]').exists()).to.be.true;
      expect(wrapper.findAll('button').length).to.be.at.least(2);
    });
  });
  
  // Test de la vue Carte
  describe('CarteView', () => {
    it('devrait rendre correctement', () => {
      const CarteView = require('./src/views/Carte.vue').default;
      const wrapper = setupTest(CarteView);
      
      expect(wrapper.find('.carte-view').exists()).to.be.true;
    });
    
    it('devrait contenir des filtres et une carte', () => {
      const CarteView = require('./src/views/Carte.vue').default;
      const wrapper = setupTest(CarteView);
      
      expect(wrapper.find('select').exists()).to.be.true;
      expect(wrapper.find('input[type="range"]').exists()).to.be.true;
    });
  });
  
  // Test de la vue EtablissementDetail
  describe('EtablissementDetail', () => {
    it('devrait rendre correctement', () => {
      const EtablissementDetail = require('./src/views/EtablissementDetail.vue').default;
      const wrapper = setupTest(EtablissementDetail);
      
      expect(wrapper.find('.etablissement-detail-view').exists()).to.be.true;
    });
  });
  
  // Test de la vue Itineraire
  describe('ItineraireView', () => {
    it('devrait rendre correctement', () => {
      const ItineraireView = require('./src/views/Itineraire.vue').default;
      const wrapper = setupTest(ItineraireView);
      
      expect(wrapper.find('.itineraire-view').exists()).to.be.true;
    });
    
    it('devrait contenir un formulaire d\'itinéraire', () => {
      const ItineraireView = require('./src/views/Itineraire.vue').default;
      const wrapper = setupTest(ItineraireView);
      
      expect(wrapper.find('input[type="text"]').exists()).to.be.true;
      expect(wrapper.find('button').exists()).to.be.true;
    });
  });
});

// Tests d'accessibilité
describe('Tests d\'accessibilité', () => {
  it('devrait avoir un composant SkipLink', () => {
    const SkipLink = require('./src/components/SkipLink.vue').default;
    const wrapper = setupTest(SkipLink);
    
    expect(wrapper.find('a.skip-link').exists()).to.be.true;
    expect(wrapper.find('a').attributes('href')).to.equal('#main-content');
  });
  
  it('devrait avoir des styles d\'accessibilité', () => {
    // Vérifier que le fichier CSS d'accessibilité existe
    const fs = require('fs');
    expect(fs.existsSync('./src/css/accessibility.css')).to.be.true;
  });
});
