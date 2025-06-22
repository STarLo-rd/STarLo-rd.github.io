<template>
  <div class="professional-layout">
    <!-- Simple, fast-loading layout -->
    <DefaultTheme.Layout />
  </div>
</template>

<script setup>
import DefaultTheme from 'vitepress/theme'
</script>

<style scoped>
.professional-layout {
  min-height: 100vh;
}

/* Clean transitions only */
.professional-layout :deep(.VPContent) {
  transition: opacity 0.2s ease;
}

/* Remove any heavy animations */
.professional-layout :deep(*) {
  animation: none !important;
}

/* Simple hover effects for interactivity */
.professional-layout :deep(.VPButton:hover) {
  transform: translateY(-1px);
  transition: transform 0.2s ease;
}

.professional-layout :deep(.VPFeature:hover) {
  transform: translateY(-2px);
  transition: transform 0.2s ease;
}
</style> 