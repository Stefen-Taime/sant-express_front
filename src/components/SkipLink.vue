<template>
  <a href="#main-content" class="skip-link">
    {{ $t('accessibility.skipToContent') }}
  </a>
</template>

<script>
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'SkipLink'
});
</script>
