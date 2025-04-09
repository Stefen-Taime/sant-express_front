<template>
  <div class="language-selector">
    <button 
      @click="toggleLanguage" 
      class="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
      :title="currentLanguage === 'fr' ? 'Switch to English' : 'Passer en français'"
    >
      <span class="font-medium">{{ currentLanguage.toUpperCase() }}</span>
    </button>
  </div>
</template>

<script>
import { defineComponent, computed } from 'vue';
import { useUserStore } from '@/stores/user';
import { useI18n } from 'vue-i18n';

export default defineComponent({
  name: 'LanguageSelector',
  setup() {
    const userStore = useUserStore();
    const { locale } = useI18n();
    
    const currentLanguage = computed(() => userStore.language);
    
    const toggleLanguage = () => {
      const newLang = currentLanguage.value === 'fr' ? 'en' : 'fr';
      userStore.setLanguage(newLang);
      locale.value = newLang;
    };
    
    return {
      currentLanguage,
      toggleLanguage
    };
  }
});
</script>
