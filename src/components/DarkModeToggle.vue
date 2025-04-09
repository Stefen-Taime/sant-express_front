<template>
  <div class="dark-mode-toggle">
    <button 
      @click="toggleDarkMode" 
      class="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
      :title="isDarkMode ? 'Passer en mode clair' : 'Passer en mode sombre'"
    >
      <span v-if="isDarkMode" class="material-icons text-yellow-400">light_mode</span>
      <span v-else class="material-icons text-gray-700">dark_mode</span>
    </button>
  </div>
</template>

<script>
import { defineComponent, computed } from 'vue';
import { useUserStore } from '@/stores/user';

export default defineComponent({
  name: 'DarkModeToggle',
  setup() {
    const userStore = useUserStore();
    
    const isDarkMode = computed(() => userStore.darkMode);
    
    const toggleDarkMode = () => {
      userStore.setDarkMode(!isDarkMode.value);
    };
    
    return {
      isDarkMode,
      toggleDarkMode
    };
  }
});
</script>
