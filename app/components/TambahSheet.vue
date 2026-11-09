<script setup lang="ts">
import { JENIS_INFO, POPOK, USIA_MPASI } from '~/data/konten'
import type { Jenis, Timer } from '~/composables/useAsuh'

const emit = defineEmits<{ tutup: [] }>()
const { state, fitur, usiaMinggu, ringkasHari } = useAsuh()
const { aksi, sheet, rewel, cekNyaman } = useUi()

const detik = ref(Date.now())
const tick = setInterval(() => (detik.value = Date.now()), 1000)
onUnmounted(() => clearInterval(tick))

const TIMER: Timer[] = ['minum', 'tidur', 'nangis']
const tekanTimer = (j: Timer, data?: Record<string, any>) => {
  state.aktif[j] ? aksi.selesai(j, data) : aksi.mulai(j)
  emit('tutup')
}
const popok = (t: (typeof POPOK)[number]['id']) => {
  aksi.popok(t)
  emit('tutup')
}
// tunggu sheet ini tertutup dulu baru buka modal berikutnya
const lalu = (fn: () => void) => {
  emit('tutup')
  setTimeout(fn, 300)
}
const manual = (j: Jenis) => lalu(() => (sheet.value = { jenis: j }))
const botol = () => lalu(() => (sheet.value = { jenis: 'minum', botol: true }))
const mingguLagi = computed(() => Math.max(1, USIA_MPASI - usiaMinggu.value))
const hariIni = computed(() => ringkasHari(new Date().toDateString()))
</script>

<template>
  <ion-content>
    <div class="space-y-4 p-5 pb-10">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-2xl font-black text-slate-800">Catat apa?</h2>
          <p class="text-sm font-bold text-slate-500">Ketuk untuk mulai sekarang · ikon pensil untuk isi jam sendiri</p>
        </div>
        <button class="grid size-10 place-items-center rounded-full bg-slate-200/70 active:scale-90" aria-label="Tutup" @click="emit('tutup')">
          <Icon name="ph:x-bold" class="size-5" />
        </button>
      </div>

      <!-- timer -->
      <div class="grid grid-cols-3 gap-3">
        <div v-for="(j, i) in TIMER" :key="j" class="animate-muncul relative" :style="{ animationDelay: `${i * 60}ms` }">
          <button
            class="flex aspect-[4/5] w-full flex-col items-center justify-center gap-1 rounded-3xl bg-gradient-to-br p-2 text-white shadow-lg transition active:scale-95"
            :class="[JENIS_INFO[j].grad, state.aktif[j] ? 'ring-4 ring-white ring-offset-2 ring-offset-slate-100' : '']"
            @click="tekanTimer(j, j === 'minum' ? { sendawa: true } : undefined)"
          >
            <Icon :name="JENIS_INFO[j].ikon" class="size-10" :class="{ 'animate-pulse': state.aktif[j] }" />
            <span class="text-sm font-black">{{ JENIS_INFO[j].nama }}</span>
            <span v-if="state.aktif[j]" class="rounded-full bg-white/25 px-2 font-mono text-xs font-black tabular-nums">{{ formatStopwatch(detik - state.aktif[j]!) }}</span>
            <span class="flex items-center gap-1 text-[11px] font-extrabold opacity-90">
              <Icon :name="state.aktif[j] ? 'ph:stop-fill' : 'ph:play-fill'" class="size-3" />{{ state.aktif[j] ? 'Selesai' : 'Mulai' }}
            </span>
          </button>
          <button
            v-if="!state.aktif[j]"
            class="absolute right-1.5 top-1.5 grid size-8 place-items-center rounded-full bg-white/30 text-white active:scale-90"
            :aria-label="`Isi ${JENIS_INFO[j].nama} manual`" @click="manual(j)"
          >
            <Icon name="ph:pencil-simple-bold" class="size-4" />
          </button>
        </div>
      </div>
      <button v-if="state.aktif.minum" class="btn w-full bg-amber-100 text-amber-800" @click="tekanTimer('minum', { sendawa: false })">
        <Icon name="tabler:baby-bottle" class="size-5" /> Selesai menyusu, belum sendawa
      </button>

      <!-- susu botol: catat ml -->
      <button class="flex w-full items-center gap-3 rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 p-4 text-left text-white shadow-lg active:scale-[.98]" @click="botol">
        <Icon name="tabler:bottle" class="size-9 shrink-0" />
        <span class="flex-1"><span class="block font-black leading-tight">Susu botol</span><span class="text-xs font-bold opacity-90">ASI perah / formula · catat ml{{ hariIni.ml ? ` · hari ini ${hariIni.ml} ml` : '' }}</span></span>
        <Icon name="ph:caret-right-bold" class="size-5" />
      </button>

      <!-- makan & air: terbuka usia 6 bulan -->
      <div v-if="fitur.makan" class="grid grid-cols-2 gap-3">
        <button class="flex items-center gap-3 rounded-3xl bg-gradient-to-br from-lime-400 to-emerald-500 p-4 text-left text-white shadow-lg active:scale-95" @click="manual('makan')">
          <Icon name="ph:bowl-food-duotone" class="size-9 shrink-0" />
          <span><span class="block font-black leading-tight">Makan</span><span class="text-xs font-bold opacity-90">{{ hariIni.makan ? `${hariIni.makan}× hari ini` : 'MPASI' }}</span></span>
        </button>
        <button class="flex items-center gap-3 rounded-3xl bg-gradient-to-br from-cyan-400 to-teal-500 p-4 text-left text-white shadow-lg active:scale-95" @click="manual('air')">
          <Icon name="tabler:glass-full" class="size-9 shrink-0" />
          <span><span class="block font-black leading-tight">Air putih</span><span class="text-xs font-bold opacity-90">{{ hariIni.airMl ? `${hariIni.airMl} ml hari ini` : 'Catat ml' }}</span></span>
        </button>
      </div>
      <div v-else class="flex items-center gap-3 rounded-3xl bg-slate-200/60 p-4 text-slate-500">
        <Icon name="ph:lock-simple-duotone" class="size-8 shrink-0" />
        <span class="text-sm font-bold leading-snug">Makan (MPASI) & air putih terbuka di usia 6 bulan, sekitar {{ mingguLagi }} minggu lagi. Sebelum itu cukup ASI/susu formula saja.</span>
      </div>

      <!-- popok -->
      <div class="rounded-3xl bg-gradient-to-br from-sky-400 to-cyan-500 p-3 text-white shadow-lg">
        <div class="mb-2 flex items-center justify-between px-1">
          <span class="flex items-center gap-2 font-black"><Icon name="tabler:diaper" class="size-6" /> Ganti popok</span>
          <button class="grid size-8 place-items-center rounded-full bg-white/25 active:scale-90" aria-label="Isi popok manual" @click="manual('popok')">
            <Icon name="ph:pencil-simple-bold" class="size-4" />
          </button>
        </div>
        <div class="grid grid-cols-3 gap-2">
          <button v-for="p in POPOK" :key="p.id" class="flex flex-col items-center gap-1 rounded-2xl bg-white py-3 text-sky-700 transition active:scale-95" @click="popok(p.id)">
            <Icon :name="p.ikon" class="size-7" /><span class="text-xs font-black">{{ p.nama }}</span>
          </button>
        </div>
      </div>

      <!-- lainnya -->
      <button class="flex w-full items-center gap-3 rounded-3xl bg-gradient-to-br from-sky-400 to-blue-600 p-4 text-left text-white shadow-lg active:scale-[.98]" @click="lalu(() => (cekNyaman = true))">
        <Icon name="ph:list-checks-duotone" class="size-9 shrink-0" />
        <span class="flex-1"><span class="block font-black leading-tight">Masih nangis? Cek kenyamanan</span><span class="text-xs font-bold opacity-90">Gerah, dingin, bising, popok, lapar…</span></span>
        <Icon name="ph:caret-right-bold" class="size-5" />
      </button>
      <div class="grid grid-cols-2 gap-3">
        <button class="flex items-center gap-3 rounded-3xl bg-gradient-to-br from-fuchsia-500 to-rose-500 p-4 text-left text-white shadow-lg active:scale-95" @click="lalu(() => (rewel = true))">
          <Icon name="ph:first-aid-kit-duotone" class="size-9 shrink-0" />
          <span><span class="block font-black leading-tight">Bayi rewel?</span><span class="text-xs font-bold opacity-90">Catat gejala</span></span>
        </button>
        <button class="flex items-center gap-3 rounded-3xl bg-white p-4 text-left text-slate-700 shadow-lg active:scale-95" @click="manual('minum')">
          <Icon name="ph:clock-counter-clockwise-duotone" class="size-9 shrink-0 text-violet-500" />
          <span><span class="block font-black leading-tight">Isi manual</span><span class="text-xs font-bold text-slate-500">Jam sendiri</span></span>
        </button>
      </div>
    </div>
  </ion-content>
</template>
