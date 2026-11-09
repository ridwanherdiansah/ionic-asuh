<script setup lang="ts">
const { state } = useAsuh()
const { sheet, rewel, tambah, pengaturan, cekNyaman, toast, getar } = useUi()
const route = useRoute()

const KIRI = [
  { tab: 'beranda', ikon: 'ph:house-duotone', ikonAktif: 'ph:house-fill', label: 'Beranda' },
  { tab: 'riwayat', ikon: 'ph:notebook-duotone', ikonAktif: 'ph:notebook-fill', label: 'Riwayat' },
]
const KANAN = [
  { tab: 'pola', ikon: 'ph:chart-bar-duotone', ikonAktif: 'ph:chart-bar-fill', label: 'Pola' },
  { tab: 'edukasi', ikon: 'ph:book-open-duotone', ikonAktif: 'ph:book-open-fill', label: 'Edukasi' },
]
const aktif = (t: string) => route.path.includes(`/tabs/${t}`)
const adaTimer = computed(() => Object.keys(state.aktif).length > 0)

let jeda: ReturnType<typeof setTimeout> | undefined
watch(toast, (t) => {
  clearTimeout(jeda)
  if (t) jeda = setTimeout(() => (toast.value = null), 4500)
})
const batalkan = () => {
  toast.value?.batal?.()
  toast.value = null
}
const bukaTambah = () => {
  getar(8)
  tambah.value = true
}
</script>

<template>
  <ion-page>
    <ion-tabs>
      <ion-router-outlet />
      <ion-tab-bar slot="bottom" class="tabbar" :class="{ hidden: !state.profil }">
        <ion-tab-button v-for="t in KIRI" :key="t.tab" :tab="t.tab" :href="`/tabs/${t.tab}`">
          <Icon :name="aktif(t.tab) ? t.ikonAktif : t.ikon" class="size-6 transition-transform" :class="{ 'scale-110': aktif(t.tab) }" />
          <ion-label class="text-[11px] font-extrabold">{{ t.label }}</ion-label>
        </ion-tab-button>
        <div class="w-20 shrink-0" aria-hidden="true" />
        <ion-tab-button v-for="t in KANAN" :key="t.tab" :tab="t.tab" :href="`/tabs/${t.tab}`">
          <Icon :name="aktif(t.tab) ? t.ikonAktif : t.ikon" class="size-6 transition-transform" :class="{ 'scale-110': aktif(t.tab) }" />
          <ion-label class="text-[11px] font-extrabold">{{ t.label }}</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>

    <!-- tombol tambah di tengah -->
    <button
      v-if="state.profil"
      class="fixed bottom-[calc(env(safe-area-inset-bottom)+24px)] left-1/2 z-50 grid size-[60px] -translate-x-1/2 place-items-center rounded-full bg-white shadow-[0_10px_30px_-6px_rgb(0_0_0/0.5)] ring-[6px] ring-white/20 transition active:scale-90"
      :class="{ 'animate-denyut': adaTimer }"
      :style="{ color: 'var(--asuh-accent)' }"
      aria-label="Tambah catatan"
      @click="bukaTambah"
    >
      <Icon name="ph:plus-bold" class="size-8" />
    </button>

    <!-- notifikasi -->
    <Transition name="pop">
      <div
        v-if="toast"
        class="fixed inset-x-4 top-[calc(env(safe-area-inset-top)+10px)] z-[60] mx-auto flex max-w-md items-center gap-3 rounded-2xl bg-slate-900/95 p-2.5 pl-4 text-white shadow-2xl backdrop-blur"
        role="status" aria-live="polite"
      >
        <Icon :name="toast.ikon ?? 'ph:check-circle-duotone'" class="size-6 shrink-0 text-cyan-300" />
        <p class="min-w-0 flex-1 text-sm font-bold">{{ toast.pesan }}</p>
        <button v-if="toast.batal" class="flex items-center gap-1 rounded-xl bg-white/10 px-3 py-2 text-sm font-black text-cyan-300 active:scale-95" @click="batalkan">
          <Icon name="ph:arrow-counter-clockwise-bold" class="size-4" /> Batalkan
        </button>
      </div>
    </Transition>

    <ion-modal :is-open="tambah" :initial-breakpoint="0.75" :breakpoints="[0, 0.75, 0.95]" @did-dismiss="tambah = false">
      <TambahSheet v-if="tambah" @tutup="tambah = false" />
    </ion-modal>
    <ion-modal :is-open="!!sheet" :initial-breakpoint="0.95" :breakpoints="[0, 0.95]" @did-dismiss="sheet = null">
      <LogSheet v-if="sheet" :log="sheet.log" :jenis-awal="sheet.jenis" :botol="sheet.botol" @tutup="sheet = null" />
    </ion-modal>
    <ion-modal :is-open="rewel" @did-dismiss="rewel = false">
      <RewelModal v-if="rewel" @tutup="rewel = false" />
    </ion-modal>
    <ion-modal :is-open="cekNyaman" @did-dismiss="cekNyaman = false">
      <CekNyamanModal v-if="cekNyaman" @tutup="cekNyaman = false" />
    </ion-modal>
    <ion-modal :is-open="pengaturan" @did-dismiss="pengaturan = false">
      <SettingsSheet v-if="pengaturan" @tutup="pengaturan = false" />
    </ion-modal>
  </ion-page>
</template>

<style scoped>
.tabbar {
  --background: rgb(2 6 23 / 0.62);
  --border: none;
  height: 72px;
  backdrop-filter: blur(20px);
  border-radius: 28px 28px 0 0;
  border-top: 1px solid rgb(255 255 255 / 0.1);
}
ion-tab-button {
  --background: transparent;
  --color: rgb(255 255 255 / 0.5);
  --color-selected: #fff;
}
</style>
