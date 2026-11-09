<script setup lang="ts">
defineProps<{ judul: string; sub?: string; ikon: string }>()
</script>

<template>
  <header class="flex items-center gap-3 text-white">
    <span class="grid size-12 shrink-0 place-items-center rounded-full bg-white/15 ring-1 ring-white/25 backdrop-blur">
      <Icon :name="ikon" class="size-6" />
    </span>
    <div class="min-w-0 flex-1">
      <h1 class="truncate text-2xl font-extrabold leading-tight">{{ judul }}</h1>
      <p v-if="sub" class="truncate text-sm font-medium text-white/70">{{ sub }}</p>
    </div>
    <slot />
  </header>
</template>
