<script setup lang="ts">
import { RED_FLAGS } from '~/data/konten'

const { redFlag, daruratDitangani } = useAsuh()
const daftar = computed(() => RED_FLAGS.filter((f) => redFlag.value.includes(f.id)))
const ditangani = () => {
  if (confirm('Bayi sudah diperiksa dokter / tenaga kesehatan?')) daruratDitangani()
}
</script>

<template>
  <div class="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-red-600 to-rose-700 p-5 text-white shadow-2xl shadow-red-900/40 ring-4 ring-white/80" role="alert">
    <Icon name="ph:siren-duotone" class="absolute -right-4 -top-4 size-28 opacity-15" />
    <div class="flex items-center gap-3">
      <span class="grid size-12 shrink-0 animate-pulse place-items-center rounded-2xl bg-white text-red-600">
        <Icon name="ph:siren-duotone" class="size-7" />
      </span>
      <div>
        <p class="text-xl font-black leading-tight">Segera ke dokter / IGD</p>
        <p class="text-sm font-bold opacity-90">Jangan tunggu, jangan coba tips di rumah dulu.</p>
      </div>
    </div>
    <ul class="mt-4 space-y-2">
      <li v-for="f in daftar" :key="f.id" class="flex items-center gap-2 rounded-2xl bg-white/15 px-3 py-2 font-bold">
        <Icon :name="f.ikon" class="size-5 shrink-0" /> {{ f.label }}
      </li>
    </ul>
    <div class="mt-4 grid grid-cols-2 gap-2">
      <a href="tel:119" class="btn bg-white text-red-600">
        <Icon name="ph:phone-call-duotone" class="size-5" /> Telepon 119
      </a>
      <a href="https://www.google.com/maps/search/IGD+rumah+sakit+terdekat" target="_blank" rel="noopener" class="btn bg-red-900/60 text-white">
        <Icon name="ph:hospital-duotone" class="size-5" /> IGD terdekat
      </a>
    </div>
    <button class="mt-2 w-full rounded-2xl py-2 text-sm font-bold text-white/80 underline-offset-2 hover:underline" @click="ditangani">
      Sudah diperiksa dokter
    </button>
  </div>
</template>
