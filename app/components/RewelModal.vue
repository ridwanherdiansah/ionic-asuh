<script setup lang="ts">
import { RED_FLAGS, GEJALA, SARAN, TEMA, type KondisiPola } from '~/data/konten'

const emit = defineEmits<{ tutup: [] }>()
const { catat, kondisi, polaAktif, tema } = useAsuh()
const { getar, cekNyaman } = useUi()
const langkah = ref<1 | 2 | 3>(1)
const flags = ref<string[]>([])
const gejala = ref<string[]>([])
const waktu = ref(keInput(Date.now()))
const msWaktu = computed(() => dariInput(waktu.value))
const waktuValid = computed(() => !Number.isNaN(msWaktu.value) && msWaktu.value <= Date.now() + 60_000)

const toggle = (arr: string[], id: string) => {
  const i = arr.indexOf(id)
  i >= 0 ? arr.splice(i, 1) : arr.push(id)
  getar(8)
}
const simpan = () => {
  if (!flags.value.length && !gejala.value.length) return emit('tutup')
  // tanda bahaya selalu dicatat "sekarang" agar peringatan langsung aktif
  const t = flags.value.length || !waktuValid.value ? Date.now() : msWaktu.value
  catat('gejala', { flags: [...flags.value], gejala: [...gejala.value] }, t)
  langkah.value = 3
}
const lanjut = () => (flags.value.length ? simpan() : (langkah.value = 2))
const saran = computed(() => (kondisi.value in SARAN ? SARAN[kondisi.value as KondisiPola] : null))
const lihatPola = () => {
  emit('tutup')
  navigateTo('/tabs/pola')
}
const bukaCekNyaman = () => {
  emit('tutup')
  setTimeout(() => (cekNyaman.value = true), 300)
}
const JUDUL = { 1: 'Cek tanda bahaya', 2: 'Apa yang terlihat?', 3: 'Hasil' }
const IKON = { 1: 'ph:siren-duotone', 2: 'ph:magnifying-glass-duotone', 3: 'ph:clipboard-text-duotone' }
</script>

<template>
  <ion-content>
    <div class="space-y-4 p-5 pb-10">
      <div class="flex items-center justify-between">
        <h2 class="flex items-center gap-2 text-2xl font-black text-slate-800">
          <Icon :name="IKON[langkah]" class="size-7" :class="langkah === 1 ? 'text-red-500' : 'text-violet-500'" /> {{ JUDUL[langkah] }}
        </h2>
        <button class="grid size-10 place-items-center rounded-full bg-slate-200/70 active:scale-90" aria-label="Tutup" @click="emit('tutup')">
          <Icon name="ph:x-bold" class="size-5" />
        </button>
      </div>
      <div class="flex gap-1.5" role="progressbar" :aria-valuenow="langkah" aria-valuemin="1" aria-valuemax="3">
        <span v-for="i in 3" :key="i" class="h-1.5 flex-1 rounded-full transition-all duration-500" :class="i <= langkah ? (flags.length ? 'bg-red-500' : 'bg-violet-500') : 'bg-slate-200'" />
      </div>

      <Transition name="geser" mode="out-in">
        <!-- 1. tanda bahaya -->
        <div v-if="langkah === 1" key="1" class="space-y-2.5">
          <p class="text-sm font-semibold text-slate-600">Centang bila ada salah satu. Kalau ada, jangan menunggu.</p>
          <button
            v-for="f in RED_FLAGS" :key="f.id" type="button"
            class="flex w-full items-center gap-3 rounded-2xl p-3 text-left font-bold transition active:scale-[.98]"
            :class="flags.includes(f.id) ? 'bg-red-500 text-white shadow-lg shadow-red-500/30' : 'bg-white text-slate-700 shadow-sm'"
            :aria-pressed="flags.includes(f.id)"
            @click="toggle(flags, f.id)"
          >
            <span class="grid size-10 shrink-0 place-items-center rounded-xl" :class="flags.includes(f.id) ? 'bg-white/20' : 'bg-red-50 text-red-500'">
              <Icon :name="f.ikon" class="size-6" />
            </span>
            <span class="flex-1 text-sm">{{ f.label }}</span>
            <Icon :name="flags.includes(f.id) ? 'ph:check-circle-fill' : 'ph:circle-bold'" class="size-6 shrink-0" :class="flags.includes(f.id) ? '' : 'text-slate-300'" />
          </button>
          <button class="btn w-full text-lg text-white shadow-lg" :class="flags.length ? 'animate-pulse bg-red-600' : 'bg-gradient-to-r from-teal-500 to-sky-500'" @click="lanjut">
            <Icon :name="flags.length ? 'ph:siren-duotone' : 'ph:check-circle-duotone'" class="size-6" />
            {{ flags.length ? `${flags.length} tanda bahaya → Langkah darurat` : 'Tidak ada, lanjut' }}
          </button>
        </div>

        <!-- 2. gejala -->
        <div v-else-if="langkah === 2" key="2" class="space-y-4">
          <p class="text-sm font-semibold text-slate-600">Pilih semua yang cocok.</p>
          <div class="grid grid-cols-2 gap-2">
            <button
              v-for="g in GEJALA" :key="g.id" type="button"
              class="flex flex-col items-start gap-2 rounded-2xl p-3 text-left text-sm font-bold transition duration-200 active:scale-95"
              :class="gejala.includes(g.id) ? 'scale-[1.03] bg-violet-500 text-white shadow-lg shadow-violet-500/30' : 'bg-white text-slate-700 shadow-sm'"
              :aria-pressed="gejala.includes(g.id)"
              @click="toggle(gejala, g.id)"
            >
              <span class="flex w-full items-center justify-between">
                <Icon :name="g.ikon" class="size-7" :class="gejala.includes(g.id) ? '' : 'text-violet-500'" />
                <Icon v-if="gejala.includes(g.id)" name="ph:check-circle-fill" class="size-5" />
              </span>
              {{ g.label }}
            </button>
          </div>
          <section class="card space-y-2">
            <p class="judul-kartu"><Icon name="ph:clock-duotone" class="size-5 text-violet-500" /> Kapan terlihat?</p>
            <div class="flex gap-2 overflow-x-auto pb-1">
              <button v-for="m in [0, 15, 30, 60, 120]" :key="m" type="button" class="chip shrink-0 bg-slate-100 text-slate-700" @click="waktu = keInput(Date.now() - m * 60_000)">
                {{ m === 0 ? 'Sekarang' : m < 60 ? `${m} mnt lalu` : `${m / 60} jam lalu` }}
              </button>
            </div>
            <input v-model="waktu" type="datetime-local" :max="keInput(Date.now())" aria-label="Waktu gejala" class="input" />
            <p v-if="!waktuValid" class="text-sm font-bold text-rose-600">Waktu tidak boleh di masa depan</p>
          </section>
          <div class="flex gap-2">
            <button class="btn flex-1 bg-white text-slate-600" @click="langkah = 1"><Icon name="ph:arrow-left-bold" class="size-5" /> Kembali</button>
            <button class="btn flex-[2] bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-lg" :disabled="!gejala.length" @click="simpan">
              Lihat hasil ({{ gejala.length }}) <Icon name="ph:arrow-right-bold" class="size-5" />
            </button>
          </div>
        </div>

        <!-- 3. hasil -->
        <div v-else key="3" class="space-y-4">
          <DaruratCard v-if="kondisi === 'darurat'" />
          <template v-else>
            <div class="animate-muncul rounded-[28px] p-5 text-center shadow-lg" :style="{ background: tema.bg }">
              <span class="mx-auto grid size-16 place-items-center rounded-full bg-white/85 shadow" :style="{ color: tema.accent }">
                <Icon :name="tema.ikon" class="size-9" />
              </span>
              <p class="mt-2 text-2xl font-extrabold text-white">{{ polaAktif.length ? polaAktif.map((p) => TEMA[p.kondisi].label).join(' + ') : 'Belum ada pola menonjol' }}</p>
              <p class="text-sm font-semibold text-white/80">Bukan diagnosis, ini kecocokan pola dari catatanmu</p>
            </div>
            <button class="flex w-full items-center gap-3 rounded-[24px] p-4 text-left shadow-lg active:scale-[.98]" :class="polaAktif.length ? 'bg-white text-slate-800' : 'bg-sky-500 text-white'" @click="bukaCekNyaman">
              <Icon name="ph:list-checks-duotone" class="size-8 shrink-0" :class="polaAktif.length ? 'text-sky-500' : ''" />
              <span class="flex-1">
                <span class="block font-extrabold leading-tight">{{ polaAktif.length ? 'Cek kenyamanan juga' : 'Masih nangis? Cek kenyamanan' }}</span>
                <span class="text-xs font-semibold opacity-80">Gerah, kedinginan, bising, popok, rambut melilit…</span>
              </span>
              <Icon name="ph:caret-right-bold" class="size-5" />
            </button>
            <div class="card"><PolaBar :jumlah="3" /></div>
            <div class="card">
              <p class="judul-kartu"><Icon name="ph:lightbulb-duotone" class="size-5 text-amber-500" /> Coba sekarang</p>
              <ol v-if="saran" class="mt-2 list-decimal space-y-1 pl-5 text-sm font-semibold text-slate-700">
                <li v-for="l in saran.langkah.slice(0, 3)" :key="l">{{ l }}</li>
              </ol>
              <p v-else class="mt-2 text-sm font-semibold text-slate-700">
                Cek kebutuhan dasar (lapar, popok, suhu), lalu gendong dengan tenang. Terus catat tangisan & menyusu supaya polanya terlihat. Bila tidak bisa ditenangkan atau muncul tanda bahaya, hubungi dokter.
              </p>
            </div>
          </template>
          <div class="flex gap-2">
            <button class="btn flex-1 bg-white text-slate-600" @click="emit('tutup')">Tutup</button>
            <button class="btn-utama flex-[2]" @click="lihatPola"><Icon name="ph:chart-bar-duotone" class="size-5" /> Detail & sumber</button>
          </div>
        </div>
      </Transition>
    </div>
  </ion-content>
</template>
