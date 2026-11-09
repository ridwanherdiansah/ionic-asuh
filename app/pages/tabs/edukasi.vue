<script setup lang="ts">
import { EDUKASI, RED_FLAGS } from '~/data/konten'

const { usiaMinggu } = useAsuh()
const faseAktif = computed(() => (usiaMinggu.value < 13 ? 0 : usiaMinggu.value < 26 ? 1 : 2))
const buka = ref<number | null>(faseAktif.value)
const bukaBahaya = ref(false)
</script>

<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <div class="mx-auto max-w-md space-y-4 px-4 pb-36 pt-[calc(env(safe-area-inset-top)+16px)] text-white">
        <PageHead judul="Edukasi" sub="Panduan per fase usia" ikon="ph:book-open-duotone" />

        <!-- pilih fase (kapsul) -->
        <div class="grid grid-cols-3 gap-2.5">
          <button
            v-for="(f, i) in EDUKASI" :key="f.fase"
            class="relative flex flex-col items-center gap-1.5 rounded-[26px] py-4 ring-1 transition active:scale-95"
            :class="buka === i ? 'bg-white text-slate-800 shadow-xl ring-white' : 'bg-white/12 ring-white/20'"
            :aria-pressed="buka === i"
            @click="buka = buka === i ? null : i"
          >
            <span v-if="i === faseAktif" class="absolute -top-2 rounded-full bg-emerald-400 px-2 py-0.5 text-[9px] font-extrabold uppercase text-emerald-950">sekarang</span>
            <Icon :name="f.ikon" class="size-8" />
            <span class="text-sm font-extrabold">{{ f.fase }}</span>
          </button>
        </div>

        <Transition name="pop" mode="out-in">
          <div v-if="buka !== null" :key="buka" class="space-y-3">
            <section class="kaca">
              <p class="label-kecil">Yang perlu diketahui · {{ EDUKASI[buka]!.fase }}</p>
              <ul class="mt-2 space-y-2">
                <li v-for="p in EDUKASI[buka]!.poin" :key="p" class="flex gap-2 text-sm font-medium">
                  <Icon name="ph:check-circle-duotone" class="mt-0.5 size-4 shrink-0" /> {{ p }}
                </li>
              </ul>
            </section>
            <section class="panel-gelap">
              <p class="flex items-center gap-1.5 font-extrabold"><Icon name="ph:lightbulb-filament-duotone" class="size-5 text-amber-300" /> Tips</p>
              <ul class="mt-1 divide-y divide-white/10">
                <li v-for="t in EDUKASI[buka]!.tips" :key="t" class="py-2.5 text-sm font-medium text-white/90">{{ t }}</li>
              </ul>
            </section>
          </div>
        </Transition>

        <!-- kapan ke dokter -->
        <section class="panel-gelap">
          <button class="flex w-full items-center gap-3 text-left" :aria-expanded="bukaBahaya" @click="bukaBahaya = !bukaBahaya">
            <span class="grid size-12 shrink-0 place-items-center rounded-full bg-red-500"><Icon name="ph:siren-duotone" class="size-7" /></span>
            <span class="flex-1">
              <span class="block text-lg font-extrabold">Kapan harus ke dokter?</span>
              <span class="text-xs font-medium text-white/60">{{ RED_FLAGS.length }} tanda bahaya yang wajib dikenali</span>
            </span>
            <Icon name="ph:caret-down-bold" class="size-5 text-white/60 transition-transform" :class="{ 'rotate-180': bukaBahaya }" />
          </button>
          <Transition name="pop">
            <ul v-if="bukaBahaya" class="mt-3 divide-y divide-white/10">
              <li v-for="f in RED_FLAGS" :key="f.id" class="flex items-center gap-3 py-2.5 text-sm font-semibold">
                <Icon :name="f.ikon" class="size-5 shrink-0 text-red-300" /> {{ f.label }}
              </li>
            </ul>
          </Transition>
        </section>

        <p class="kaca flex items-start gap-3 text-xs font-medium text-white/80">
          <Icon name="ph:flask-duotone" class="size-5 shrink-0 text-amber-300" /> Konten ini masih draf dan perlu direview dokter anak sebelum rilis.
        </p>
      </div>
    </ion-content>
  </ion-page>
</template>
