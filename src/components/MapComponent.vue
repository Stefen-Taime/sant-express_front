<template>
  <div ref="mapContainer" :style="{ width, height }" class="map-container"></div>
</template>

<script src="./MapComponent.js"></script>

<style>
.map-container {
  position: relative;
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.popup-content {
  padding: 0.5rem;
  max-width: 250px;
}

.popup-content h3 {
  margin-top: 0;
  margin-bottom: 0.5rem;
  font-size: 1rem;
}

.popup-content p {
  margin-top: 0.25rem;
  margin-bottom: 0.25rem;
  font-size: 0.875rem;
}

.mapboxgl-popup-content {
  padding: 0.75rem;
  border-radius: 0.375rem;
}

.dark .mapboxgl-popup-content {
  background-color: #1f2937;
  color: #f3f4f6;
}

.dark .mapboxgl-popup-tip {
  border-top-color: #1f2937;
  border-bottom-color: #1f2937;
}
</style>
