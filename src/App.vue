<template>
  <div class="app" :class="{ 'dark': isDarkMode }">
    <div class="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">
      <header class="bg-white dark:bg-gray-800 shadow-md">
        <div class="container mx-auto px-4 py-3">
          <div class="flex justify-between items-center">
            <router-link to="/" class="flex items-center">
              <span class="text-primary dark:text-primary-light text-2xl font-bold">{{ $t('app.title') }}</span>
            </router-link>
            
            <div class="flex items-center space-x-4">
              <nav class="hidden md:flex space-x-6">
                <router-link to="/" class="nav-link">{{ $t('nav.home') }}</router-link>
                <router-link to="/carte" class="nav-link">{{ $t('nav.map') }}</router-link>
              </nav>
              
              <LanguageSelector />
              <DarkModeToggle />
            </div>
          </div>
        </div>
      </header>
      
      <main>
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
      
      <footer class="bg-white dark:bg-gray-800 shadow-inner mt-8">
        <div class="container mx-auto px-4 py-6">
          <div class="flex flex-col md:flex-row justify-between items-center">
            <div class="mb-4 md:mb-0">
              <p class="text-gray-600 dark:text-gray-400">&copy; {{ currentYear }} SantéExpress. Tous droits réservés.</p>
            </div>
            
            <div class="flex space-x-4">
              <a href="#" class="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary-light">Conditions d'utilisation</a>
              <a href="#" class="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary-light">Politique de confidentialité</a>
              <a href="#" class="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary-light">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  </div>
</template>

<script>
import { defineComponent, computed, onMounted } from 'vue';
import { useUserStore } from './stores/user';
import DarkModeToggle from './components/DarkModeToggle.vue';
import LanguageSelector from './components/LanguageSelector.vue';

export default defineComponent({
  name: 'App',
  components: {
    DarkModeToggle,
    LanguageSelector
  },
  setup() {
    const userStore = useUserStore();
    
    const isDarkMode = computed(() => userStore.darkMode);
    const currentYear = new Date().getFullYear();
    
    onMounted(() => {
      // Initialiser le mode sombre et la langue au chargement de l'application
      userStore.initDarkMode();
      userStore.initLanguage();
    });
    
    return {
      isDarkMode,
      currentYear
    };
  }
});
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.nav-link {
  @apply text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary-light font-medium;
}

.nav-link.router-link-active {
  @apply text-primary dark:text-primary-light font-semibold;
}
</style>
