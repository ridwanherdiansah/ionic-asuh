<script setup lang="ts">
const { tema } = useAsuh()
// warna latar & aksen seluruh app mengikuti pola yang aktif
watchEffect(() => {
  const s = document.documentElement.style
  s.setProperty('--asuh-bg', tema.value.bg)
  s.setProperty('--asuh-accent', tema.value.accent)
})
useHead({
  meta: [{ name: 'theme-color', content: () => tema.value.accent }],
})
</script>

<template>
  <ion-app>
    <ion-router-outlet />
  </ion-app>
</template>
