<template>
    <div class="not-found">
      <h1>{{ $t('notFound.title') }}</h1>
      <p>{{ $t('notFound.message') }}</p>
      <router-link to="/">{{ $t('notFound.goHome') }}</router-link>
    </div>
  </template>
  
  <script>
  export default {
    name: 'NotFound'
  }
  </script>
  
  <style scoped>
  .not-found {
    max-width: 600px;
    margin: 0 auto;
    padding: 2rem;
    text-align: center;
  }
  </style>