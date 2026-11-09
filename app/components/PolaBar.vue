<script setup lang="ts">
import { TEMA } from '~/data/konten'
import { AMBANG_POLA } from '~/composables/useAsuh'

const props = defineProps<{ jumlah?: number; aksi?: boolean }>()
const { pola, sudahMembaik } = useAsuh()
const { umpan } = useUi()
const urut = computed(() =>
  [...pola.value]
    .sort((a, b) => Number(b.aktif) - Number(a.aktif) || Number(b.berlaku) - Number(a.berlaku) || b.skor - a.skor)
    .slice(0, props.jumlah ?? pola.value.length),
)
const membaik = (k: (typeof pola.value)[number]['kondisi']) => {
  sudahMembaik(k)
  umpan({ pesan: `Syukurlah! ${TEMA[k].label} ditandai membaik`, ikon: 'ph:hand-heart-duotone' })
}
</script>

<template>
  <TransitionGroup tag="ul" name="daftar" class="space-y-3">
    <li v-for="p in urut" :key="p.kondisi" :class="{ 'opacity-50': !p.berlaku }">
      <div class="mb-1.5 flex items-center justify-between gap-2">
        <span class="flex min-w-0 items-center gap-2">
          <span class="grid size-8 shrink-0 place-items-center rounded-xl" :style="{ background: `${TEMA[p.kondisi].accent}1f`, color: TEMA[p.kondisi].accent }">
            <Icon :name="TEMA[p.kondisi].ikon" class="size-5" />
          </span>
          <span class="min-w-0">
            <span class="block truncate text-sm font-black text-slate-800">{{ TEMA[p.kondisi].label }}</span>
            <span v-if="!p.berlaku" class="block text-[11px] font-bold text-slate-500">{{ p.alasan }}</span>
            <span v-else-if="p.ditunda" class="block text-[11px] font-bold text-emerald-600">Ditandai membaik · dipantau lagi</span>
          </span>
          <span v-if="p.aktif" class="shrink-0 animate-pulse rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-white" :style="{ background: TEMA[p.kondisi].accent }">aktif</span>
        </span>
        <span class="shrink-0 text-right">
          <span class="text-lg font-black" :style="{ color: p.skor ? TEMA[p.kondisi].accent : '#94a3b8' }">{{ Math.round(p.skor * 100) }}%</span>
          <span class="ml-1 text-xs font-bold text-slate-400">{{ p.kriteria.filter((k) => k.ok).length }}/{{ p.kriteria.length }}</span>
        </span>
      </div>
      <div
        class="relative h-3 overflow-hidden rounded-full bg-slate-200/70"
        role="progressbar" :aria-valuenow="Math.round(p.skor * 100)" aria-valuemin="0" aria-valuemax="100"
        :aria-label="`Kecocokan pola ${TEMA[p.kondisi].label}`"
      >
        <div
          class="h-full rounded-full transition-all duration-1000"
          :style="{ width: `${p.skor * 100}%`, background: `linear-gradient(90deg, ${TEMA[p.kondisi].warna[1]}, ${TEMA[p.kondisi].accent})` }"
        />
        <span class="absolute inset-y-0 w-0.5 bg-slate-500/40" :style="{ left: `${AMBANG_POLA * 100}%` }" />
      </div>
      <button
        v-if="aksi && p.aktif"
        class="chip mt-2 bg-emerald-50 text-emerald-700"
        @click="membaik(p.kondisi)"
      >
        <Icon name="ph:hand-heart-duotone" class="size-4" /> Sudah membaik
      </button>
    </li>
  </TransitionGroup>
</template>
