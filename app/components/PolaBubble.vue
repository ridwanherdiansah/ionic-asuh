<script setup lang="ts">
import { TEMA, type KondisiPola } from '~/data/konten'

// kapsul gelembung: "cairan" naik setinggi persentase kriteria yang terpenuhi
const props = defineProps<{ kondisi: KondisiPola; skor: number; aktif: boolean; berlaku: boolean; ok: number; total: number }>()
const t = computed(() => TEMA[props.kondisi])
const persen = computed(() => Math.round(props.skor * 100))
const cairan = computed(() => (props.aktif ? `${t.value.accent}40` : `${t.value.warna[0]}aa`))
</script>

<template>
  <div
    class="relative flex h-[128px] w-[72px] shrink-0 flex-col items-center justify-between overflow-hidden rounded-full py-3.5 ring-1 transition duration-500"
    :class="[aktif ? 'scale-105 bg-white text-slate-800 shadow-xl ring-white' : 'bg-white/12 text-white ring-white/25', { 'opacity-45': !berlaku }]"
    role="progressbar" :aria-valuenow="persen" aria-valuemin="0" aria-valuemax="100"
    :aria-label="`${t.label}: ${persen}% kriteria terpenuhi${aktif ? ', aktif' : ''}`"
  >
    <!-- cairan + ombak + gelembung -->
    <div class="absolute inset-x-0 bottom-0 transition-[height] duration-1000 ease-out" :style="{ height: `${persen}%`, background: cairan }">
      <svg v-if="persen > 0 && persen < 100" class="ombak absolute -top-[7px] left-0 h-2 w-[200%]" viewBox="0 0 200 10" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 5 Q12.5 0 25 5 T50 5 T75 5 T100 5 T125 5 T150 5 T175 5 T200 5 V10 H0Z" :fill="cairan" />
      </svg>
      <span v-if="persen > 0" class="gelembung left-[28%]" />
      <span v-if="persen > 0" class="gelembung left-[60%] [animation-delay:1.1s]" />
    </div>

    <span class="relative text-sm font-extrabold">{{ persen }}%</span>
    <Icon :name="t.ikon" class="relative size-8" :style="aktif ? { color: t.accent } : {}" />
    <span class="relative px-1.5 text-center text-[10px] font-bold leading-tight">{{ berlaku ? t.label : 'n/a' }}</span>
    <span v-if="aktif" class="absolute right-2.5 top-2.5 size-2 animate-ping rounded-full" :style="{ background: t.accent }" />
  </div>
</template>

<style scoped>
.ombak { animation: ombak 2.4s linear infinite; }
.gelembung {
  position: absolute;
  bottom: 2px;
  width: 6px;
  height: 6px;
  border-radius: 9999px;
  background: rgb(255 255 255 / 0.75);
  animation: naik 2.4s ease-in infinite;
}
@keyframes ombak { to { transform: translateX(-50%); } }
@keyframes naik {
  0% { transform: translateY(0) scale(0.6); opacity: 0; }
  20% { opacity: 1; }
  100% { transform: translateY(-60px) scale(1); opacity: 0; }
}
</style>
