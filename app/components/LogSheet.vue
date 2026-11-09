<script setup lang="ts">
import {
  JENIS_INFO, POPOK, ringkasGejala, CARA_MINUM, SISI, ISI_SUSU, TEKSTUR, REAKSI, PORSI_SDM,
  targetMinum, targetMakan, targetAir, MAKS_SUSU_SETAHUN,
} from '~/data/konten'
import type { Jenis, Log } from '~/composables/useAsuh'

const props = defineProps<{ log?: Log; jenisAwal?: Jenis; botol?: boolean }>()
const emit = defineEmits<{ tutup: [] }>()
const { simpanManual, state, usiaMinggu, fitur, ringkasHari } = useAsuh()
const { aksi, umpan } = useUi()

// makan & air hanya muncul setelah usianya cukup (atau saat mengubah catatan lama jenis itu)
const PILIHAN = computed<Jenis[]>(() => [
  'minum', 'tidur', 'nangis', 'popok',
  ...((fitur.value.makan || props.log?.jenis === 'makan') ? ['makan' as const] : []),
  ...((fitur.value.air || props.log?.jenis === 'air') ? ['air' as const] : []),
])
const DURASI: Record<string, number[]> = { minum: [5, 10, 15, 20, 30], tidur: [30, 60, 90, 120, 180], nangis: [5, 15, 30, 60, 120] }

const edit = !!props.log
const jenis = ref<Jenis>(props.log?.jenis ?? props.jenisAwal ?? 'minum')
const sekarang = Date.now()
// satu objek reactive: bisa diikat v-model langsung di dalam v-for (ref di dalam array template ter-unwrap jadi string)
const waktu = reactive({
  mulai: keInput(props.log?.mulai ?? sekarang - 15 * 60_000),
  selesai: keInput(props.log?.selesai ?? sekarang),
})
type Kunci = keyof typeof waktu
const sendawa = ref<boolean>(props.log?.data?.sendawa ?? true)
const tipePopok = ref<string>(props.log?.data?.tipe ?? 'basah')

// --- menyusu: langsung (durasi) / botol (ml) ---
const d0 = props.log?.data ?? {}
const tMinum = computed(() => targetMinum(usiaMinggu.value))
const cara = ref<'langsung' | 'botol'>(d0.cara ?? (props.botol ? 'botol' : 'langsung'))
const sisi = ref<string | null>(d0.sisi ?? null)
const ISI = computed(() => ISI_SUSU.filter((x) => usiaMinggu.value >= x.minMinggu || d0.isi === x.id))
const isi = ref<string>(d0.isi ?? (fitur.value.uht ? 'uht' : 'asip'))
const ml = ref<number | null>(props.log?.jenis === 'minum' ? d0.ml ?? null : null)
const mlAir = ref<number | null>(props.log?.jenis === 'air' ? d0.ml ?? null : null)
const tAir = computed(() => targetAir(usiaMinggu.value))
const tambahMl = (x: number | null, n: number) => Math.max(0, (Number(x) || 0) + n) || null
const geserMlBotol = (n: number) => (ml.value = tambahMl(ml.value, n))
const geserMlAir = (n: number) => (mlAir.value = tambahMl(mlAir.value, n))
const statusMl = computed(() => {
  if (!ml.value) return null
  const t = tMinum.value
  if (ml.value < t.min) return { teks: 'Sedikit di bawah takaran umum', kelas: 'text-amber-600' }
  if (ml.value > t.max + 30) return { teks: 'Di atas takaran umum, perhatikan tanda kenyang', kelas: 'text-amber-600' }
  return { teks: 'Sesuai takaran usia', kelas: 'text-emerald-600' }
})
// usia ≥ 1 tahun: total susu hari itu (termasuk catatan ini)
const susuHariIni = computed(() => {
  if (!fitur.value.uht || jenis.value !== 'minum' || cara.value !== 'botol') return 0
  const lama = props.log?.jenis === 'minum' && props.log.data?.cara === 'botol' ? Number(props.log.data.ml) || 0 : 0
  return ringkasHari(new Date(msMulai.value || Date.now()).toDateString()).ml - lama + (ml.value ?? 0)
})

// --- makan (MPASI) ---
const tMakan = computed(() => targetMakan(usiaMinggu.value))
const menu = ref<string>(d0.menu ?? '')
const porsi = ref<number>(d0.porsi ?? 3)
const tekstur = ref<string>(d0.tekstur ?? tMakan.value.tekstur)
const reaksi = ref<string>(d0.reaksi ?? 'lahap')
const baru = ref<boolean>(!!d0.baru)
// menu yang pernah dicatat, untuk isi cepat
const menuLama = computed(() => [...new Set(state.logs.filter((l) => l.jenis === 'makan' && l.data?.menu).sort((a, b) => b.mulai - a.mulai).map((l) => l.data!.menu as string))].slice(0, 6))
// aturan 3 hari: makanan baru terakhir dalam 3 hari
const baruTerakhir = computed(() =>
  state.logs
    .filter((l) => l.jenis === 'makan' && l.data?.baru && l.id !== props.log?.id && l.mulai > Date.now() - 3 * 864e5)
    .sort((a, b) => b.mulai - a.mulai)[0],
)

const info = computed(() => JENIS_INFO[jenis.value])
const pakaiDurasi = computed(() => !['popok', 'gejala', 'makan', 'air'].includes(jenis.value))
const msMulai = computed(() => dariInput(waktu.mulai))
const msSelesai = computed(() => dariInput(waktu.selesai))
const KOLOM = computed<Kunci[]>(() => (pakaiDurasi.value ? ['mulai', 'selesai'] : ['mulai']))
const NAMA_KOLOM = computed(() => ({ mulai: pakaiDurasi.value ? 'Mulai' : 'Jam', selesai: 'Selesai' }))
const durasi = computed(() => (msSelesai.value - msMulai.value) / 60_000)

const galat = computed(() => {
  if (!waktu.mulai || Number.isNaN(msMulai.value)) return 'Isi jam mulai'
  if (msMulai.value > Date.now() + 60_000) return 'Waktu tidak boleh di masa depan'
  if (pakaiDurasi.value) {
    if (Number.isNaN(msSelesai.value)) return 'Isi jam selesai'
    if (durasi.value <= 0) return 'Jam selesai harus setelah jam mulai'
    if (msSelesai.value > Date.now() + 60_000) return 'Jam selesai tidak boleh di masa depan'
    if (durasi.value > 12 * 60) return 'Durasi lebih dari 12 jam, cek lagi ya'
  }
  if (jenis.value === 'minum' && cara.value === 'botol') {
    if (!ml.value || ml.value <= 0) return 'Isi jumlah susu (ml)'
    if (ml.value > 400) return 'Lebih dari 400 ml sekali minum, cek lagi ya'
  }
  if (jenis.value === 'makan' && !menu.value.trim()) return 'Isi menu makanan'
  if (jenis.value === 'air') {
    if (!mlAir.value || mlAir.value <= 0) return 'Isi jumlah air (ml)'
    if (mlAir.value > 300) return 'Lebih dari 300 ml sekali minum, cek lagi ya'
  }
  return ''
})

const LALU = [
  { n: 'Barusan', m: 0 }, { n: '15 mnt', m: 15 }, { n: '30 mnt', m: 30 },
  { n: '1 jam', m: 60 }, { n: '2 jam', m: 120 }, { n: '3 jam', m: 180 },
]
// geser seluruh rentang ke "X lalu", durasi tetap
const aturLalu = (m: number) => {
  const d = pakaiDurasi.value && durasi.value > 0 ? durasi.value : 0
  const akhir = Date.now() - m * 60_000
  waktu.selesai = keInput(akhir)
  waktu.mulai = keInput(akhir - d * 60_000)
}
// durasi dihitung mundur dari jam selesai (atau dari sekarang bila selesai kosong), supaya tidak jatuh ke masa depan
const aturDurasi = (m: number) => {
  if (Number.isNaN(msSelesai.value)) waktu.selesai = keInput(Date.now())
  waktu.mulai = keInput(dariInput(waktu.selesai) - m * 60_000)
}
// kolom kosong/tidak valid: mulai dari sekarang, jangan error
const geser = (k: Kunci, m: number) => {
  const ms = dariInput(waktu[k])
  waktu[k] = keInput((Number.isNaN(ms) ? Date.now() : ms) + m * 60_000)
}

const simpan = () => {
  if (galat.value) return
  const data =
    jenis.value === 'minum'
      ? cara.value === 'botol'
        ? { sendawa: sendawa.value, cara: 'botol', ml: ml.value, isi: isi.value }
        : { sendawa: sendawa.value, cara: 'langsung', ...(sisi.value ? { sisi: sisi.value } : {}) }
    : jenis.value === 'popok' ? { tipe: tipePopok.value }
    : jenis.value === 'makan' ? { menu: menu.value.trim().slice(0, 60), porsi: porsi.value, tekstur: tekstur.value, reaksi: reaksi.value, baru: baru.value }
    : jenis.value === 'air' ? { ml: mlAir.value }
    : props.log?.data
  simpanManual({ id: props.log?.id, jenis: jenis.value, mulai: msMulai.value, selesai: pakaiDurasi.value ? msSelesai.value : undefined, data })
  umpan({ pesan: edit ? 'Perubahan disimpan' : `${info.value.nama} dicatat`, ikon: 'ph:check-circle-duotone' })
  emit('tutup')
}
const hapusIni = () => {
  if (!props.log) return
  aksi.hapus(props.log.id)
  emit('tutup')
}
</script>

<template>
  <ion-content>
    <div class="space-y-5 p-5 pb-12">
      <div class="flex items-center justify-between">
        <h2 class="flex items-center gap-2 text-2xl font-black text-slate-800">
          <Icon :name="edit ? 'ph:pencil-simple-line-duotone' : 'ph:clock-counter-clockwise-duotone'" class="size-7 text-violet-500" />
          {{ edit ? 'Ubah catatan' : 'Catat manual' }}
        </h2>
        <button class="grid size-10 place-items-center rounded-full bg-slate-200/70 active:scale-90" aria-label="Tutup" @click="emit('tutup')">
          <Icon name="ph:x-bold" class="size-5" />
        </button>
      </div>

      <!-- jenis -->
      <div v-if="jenis !== 'gejala'" class="grid gap-2" :class="PILIHAN.length > 4 ? 'grid-cols-3' : 'grid-cols-4'">
        <button
          v-for="j in PILIHAN" :key="j" type="button" :disabled="edit && jenis !== j"
          class="flex flex-col items-center gap-1 rounded-2xl bg-gradient-to-br py-3 text-white shadow transition-all duration-300"
          :class="[JENIS_INFO[j].grad, jenis === j ? 'scale-105 shadow-lg ring-4 ring-white ring-offset-2 ring-offset-slate-100' : 'scale-95 opacity-40 disabled:opacity-15']"
          :aria-pressed="jenis === j"
          @click="jenis = j"
        >
          <Icon :name="JENIS_INFO[j].ikon" class="size-8" :class="{ 'animate-bounce': jenis === j }" />
          <span class="text-[11px] font-black">{{ JENIS_INFO[j].nama }}</span>
        </button>
      </div>
      <div v-else class="flex items-start gap-3 rounded-2xl bg-violet-50 p-3 text-sm font-bold text-violet-900">
        <Icon name="ph:stethoscope-duotone" class="size-6 shrink-0" />
        {{ ringkasGejala(log?.data) }}
      </div>

      <!-- kapan -->
      <section class="card space-y-3">
        <p class="judul-kartu"><Icon name="ph:clock-duotone" class="size-5 text-violet-500" /> Kapan?</p>
        <div class="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          <button v-for="c in LALU" :key="c.m" type="button" class="chip shrink-0 bg-slate-100 text-slate-700" @click="aturLalu(c.m)">
            {{ c.m ? `${c.n} lalu` : c.n }}
          </button>
        </div>
        <div class="grid gap-3" :class="pakaiDurasi ? 'grid-cols-2' : 'grid-cols-1'">
          <div v-for="k in KOLOM" :key="k">
            <label class="text-xs font-black uppercase tracking-wide text-slate-500">
              {{ NAMA_KOLOM[k] }}
              <input v-model="waktu[k]" type="datetime-local" :max="keInput(Date.now())" class="input mt-1 px-2 text-sm" />
            </label>
            <div class="mt-1 flex gap-1">
              <button type="button" class="flex-1 rounded-xl bg-slate-100 py-1.5 text-xs font-black active:scale-90" :aria-label="`${NAMA_KOLOM[k]} mundur 5 menit`" @click="geser(k, -5)">−5 mnt</button>
              <button type="button" class="flex-1 rounded-xl bg-slate-100 py-1.5 text-xs font-black active:scale-90" :aria-label="`${NAMA_KOLOM[k]} maju 5 menit`" @click="geser(k, 5)">+5 mnt</button>
            </div>
          </div>
        </div>
      </section>

      <!-- durasi -->
      <section v-if="pakaiDurasi" class="card space-y-3">
        <div class="flex items-center justify-between">
          <p class="judul-kartu"><Icon name="ph:timer-duotone" class="size-5 text-violet-500" /> Berapa lama?</p>
          <p class="bg-gradient-to-r bg-clip-text text-2xl font-black text-transparent" :class="info.grad">{{ durasi > 0 ? formatDurasi(durasi) : '—' }}</p>
        </div>
        <div class="grid grid-cols-5 gap-2">
          <button
            v-for="m in DURASI[jenis]" :key="m" type="button"
            class="rounded-2xl py-2.5 text-sm font-black transition active:scale-90"
            :class="Math.round(durasi) === m ? `bg-gradient-to-br text-white shadow ${info.grad}` : 'bg-slate-100 text-slate-600'"
            @click="aturDurasi(m)"
          >{{ m < 60 ? `${m}m` : `${m / 60}j` }}</button>
        </div>
      </section>

      <!-- detail -->
      <!-- menyusu: cara -->
      <section v-if="jenis === 'minum'" class="card space-y-3">
        <div class="grid grid-cols-2 gap-1 rounded-2xl bg-slate-100 p-1" role="tablist">
          <button
            v-for="c in CARA_MINUM" :key="c.id" type="button" role="tab" :aria-selected="cara === c.id"
            class="flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-black transition"
            :class="cara === c.id ? 'bg-white text-amber-600 shadow' : 'text-slate-500'"
            @click="cara = c.id"
          ><Icon :name="c.ikon" class="size-5" /> {{ c.nama }}</button>
        </div>

        <template v-if="cara === 'langsung'">
          <p class="text-xs font-black uppercase tracking-wide text-slate-500">Payudara (opsional)</p>
          <div class="grid grid-cols-3 gap-2">
            <button
              v-for="x in SISI" :key="x.id" type="button"
              class="rounded-2xl py-2.5 text-sm font-black transition active:scale-95"
              :class="sisi === x.id ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow' : 'bg-slate-100 text-slate-600'"
              :aria-pressed="sisi === x.id"
              @click="sisi = sisi === x.id ? null : x.id"
            >{{ x.nama }}</button>
          </div>
          <p class="text-xs font-bold text-slate-500">Menyusu langsung tidak bisa diukur ml, jadi yang dicatat durasinya.</p>
        </template>

        <template v-else>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="x in ISI" :key="x.id" type="button" class="chip"
              :class="isi === x.id ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600'"
              :aria-pressed="isi === x.id" @click="isi = x.id"
            >{{ x.nama }}</button>
          </div>
          <div class="flex items-center justify-between gap-2">
            <button type="button" class="grid size-12 shrink-0 place-items-center rounded-2xl bg-slate-100 active:scale-90" aria-label="Kurangi 10 ml" @click="geserMlBotol(-10)"><Icon name="ph:minus-bold" class="size-5" /></button>
            <label class="flex min-w-0 flex-1 items-baseline justify-center gap-1">
              <input v-model.number="ml" type="number" inputmode="numeric" min="0" max="400" placeholder="0" class="w-24 bg-transparent text-center text-5xl font-black text-slate-800 outline-none" aria-label="Jumlah susu dalam ml" />
              <span class="text-xl font-black text-slate-400">ml</span>
            </label>
            <button type="button" class="grid size-12 shrink-0 place-items-center rounded-2xl bg-slate-100 active:scale-90" aria-label="Tambah 10 ml" @click="geserMlBotol(10)"><Icon name="ph:plus-bold" class="size-5" /></button>
          </div>
          <div class="grid grid-cols-5 gap-2">
            <button
              v-for="m in tMinum.pilihan" :key="m" type="button"
              class="rounded-2xl py-2.5 text-sm font-black transition active:scale-90"
              :class="ml === m ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow' : m >= tMinum.min && m <= tMinum.max ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-200' : 'bg-slate-100 text-slate-600'"
              @click="ml = m"
            >{{ m }}</button>
          </div>
          <div class="rounded-2xl bg-amber-50 p-3 text-xs font-bold text-amber-900">
            <p class="flex items-center gap-1.5"><Icon name="ph:info-duotone" class="size-4 shrink-0" /> Takaran umum usia ini: <b>{{ tMinum.min }}–{{ tMinum.max }} ml</b> sekali minum, {{ tMinum.frek }}/hari</p>
            <p v-if="statusMl" class="mt-1" :class="statusMl.kelas">{{ statusMl.teks }}. Ikuti tanda lapar & kenyang bayi, angka ini hanya patokan.</p>
            <p v-if="susuHariIni > MAKS_SUSU_SETAHUN" class="mt-1 text-rose-600">Total susu hari ini {{ susuHariIni }} ml, lebih dari ±{{ MAKS_SUSU_SETAHUN }} ml. Susu berlebih bisa mengurangi nafsu makan.</p>
          </div>
        </template>
      </section>

      <section v-if="jenis === 'minum'" class="grid grid-cols-2 gap-2">
        <button type="button" class="btn" :class="sendawa ? 'bg-emerald-500 text-white shadow-lg' : 'bg-white text-slate-500'" @click="sendawa = true">
          <Icon name="ph:smiley-duotone" class="size-5" /> Sudah sendawa
        </button>
        <button type="button" class="btn" :class="!sendawa ? 'bg-amber-500 text-white shadow-lg' : 'bg-white text-slate-500'" @click="sendawa = false">
          <Icon name="ph:smiley-meh-duotone" class="size-5" /> Belum sendawa
        </button>
      </section>
      <section v-if="jenis === 'popok'" class="grid grid-cols-3 gap-2">
        <button
          v-for="t in POPOK" :key="t.id" type="button"
          class="flex flex-col items-center gap-1 rounded-2xl p-3 font-black transition active:scale-95"
          :class="tipePopok === t.id ? 'bg-gradient-to-br from-sky-400 to-cyan-500 text-white shadow-lg' : 'bg-white text-slate-600'"
          @click="tipePopok = t.id"
        ><Icon :name="t.ikon" class="size-7" />{{ t.nama }}</button>
      </section>

      <!-- makan (MPASI) -->
      <template v-if="jenis === 'makan'">
        <section class="card space-y-3">
          <p class="judul-kartu"><Icon name="ph:cooking-pot-duotone" class="size-5 text-emerald-500" /> Menu</p>
          <input v-model="menu" type="text" maxlength="60" placeholder="mis. bubur ayam wortel" class="input" aria-label="Menu makanan" />
          <div v-if="menuLama.length" class="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
            <button v-for="m in menuLama" :key="m" type="button" class="chip shrink-0 bg-slate-100 text-slate-700" @click="menu = m">{{ m }}</button>
          </div>
          <button
            type="button" class="flex w-full items-center gap-2 rounded-2xl p-3 text-left text-sm font-black transition"
            :class="baru ? 'bg-emerald-500 text-white shadow' : 'bg-slate-100 text-slate-600'"
            :aria-pressed="baru" @click="baru = !baru"
          ><Icon :name="baru ? 'ph:check-square-duotone' : 'ph:square-bold'" class="size-5" /> Makanan baru (pertama kali dicoba)</button>
          <p v-if="baru && baruTerakhir" class="flex items-start gap-2 rounded-2xl bg-amber-50 p-3 text-xs font-bold text-amber-800">
            <Icon name="ph:hourglass-medium-duotone" class="size-4 shrink-0" />
            Makanan baru terakhir "{{ baruTerakhir.data?.menu }}" {{ formatLalu(baruTerakhir.mulai) }}. Sebaiknya tunggu ±3 hari sebelum mengenalkan makanan baru lain, supaya mudah tahu penyebab bila ada alergi.
          </p>
        </section>

        <section class="card space-y-3">
          <div class="flex items-center justify-between">
            <p class="judul-kartu"><Icon name="ph:bowl-food-duotone" class="size-5 text-emerald-500" /> Porsi</p>
            <p class="text-2xl font-black text-emerald-600">{{ porsi }} sdm</p>
          </div>
          <div class="grid grid-cols-7 gap-1.5">
            <button
              v-for="p in PORSI_SDM" :key="p" type="button"
              class="rounded-xl py-2 text-sm font-black transition active:scale-90"
              :class="porsi === p ? 'bg-gradient-to-br from-lime-400 to-emerald-500 text-white shadow' : 'bg-slate-100 text-slate-600'"
              @click="porsi = p"
            >{{ p }}</button>
          </div>
          <p class="text-xs font-bold text-slate-500">16 sdm ≈ 1 mangkuk (250 ml)</p>
          <p class="text-xs font-black uppercase tracking-wide text-slate-500">Tekstur</p>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="t in TEKSTUR" :key="t.id" type="button" class="chip"
              :class="tekstur === t.id ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-600'"
              :aria-pressed="tekstur === t.id" @click="tekstur = t.id"
            >{{ t.nama }}<Icon v-if="t.id === tMakan.tekstur" name="ph:star-duotone" class="size-3.5" /></button>
          </div>
          <div class="rounded-2xl bg-emerald-50 p-3 text-xs font-bold text-emerald-900">
            <p class="flex items-start gap-1.5"><Icon name="ph:info-duotone" class="size-4 shrink-0" /> <span>Panduan usia ini: <b>{{ tMakan.porsi }}</b> sekali makan, {{ tMakan.kali }} per hari. Tanda ★ = tekstur yang dianjurkan.</span></p>
          </div>
        </section>

        <section class="grid grid-cols-2 gap-2">
          <button
            v-for="x in REAKSI" :key="x.id" type="button" class="btn"
            :class="reaksi === x.id ? (x.id === 'alergi' ? 'bg-rose-500 text-white shadow-lg' : 'bg-emerald-500 text-white shadow-lg') : 'bg-white text-slate-500'"
            :aria-pressed="reaksi === x.id" @click="reaksi = x.id"
          ><Icon :name="x.ikon" class="size-5" /> {{ x.nama }}</button>
        </section>
        <p v-if="reaksi === 'alergi'" class="flex items-start gap-2 rounded-2xl bg-rose-50 p-3 text-sm font-bold text-rose-700" role="alert">
          <Icon name="ph:siren-duotone" class="size-5 shrink-0" />
          Hentikan makanan ini. SEGERA ke IGD bila bibir/wajah bengkak, sesak napas, atau muntah hebat. Ruam ringan: konsultasikan ke dokter sebelum mencoba lagi.
        </p>
      </template>

      <!-- air putih -->
      <section v-if="jenis === 'air'" class="card space-y-3">
        <div class="flex items-center justify-between gap-2">
          <button type="button" class="grid size-12 shrink-0 place-items-center rounded-2xl bg-slate-100 active:scale-90" aria-label="Kurangi 10 ml" @click="geserMlAir(-10)"><Icon name="ph:minus-bold" class="size-5" /></button>
          <label class="flex min-w-0 flex-1 items-baseline justify-center gap-1">
            <input v-model.number="mlAir" type="number" inputmode="numeric" min="0" max="300" placeholder="0" class="w-24 bg-transparent text-center text-5xl font-black text-slate-800 outline-none" aria-label="Jumlah air dalam ml" />
            <span class="text-xl font-black text-slate-400">ml</span>
          </label>
          <button type="button" class="grid size-12 shrink-0 place-items-center rounded-2xl bg-slate-100 active:scale-90" aria-label="Tambah 10 ml" @click="geserMlAir(10)"><Icon name="ph:plus-bold" class="size-5" /></button>
        </div>
        <div class="grid grid-cols-5 gap-2">
          <button
            v-for="m in tAir.pilihan" :key="m" type="button"
            class="rounded-2xl py-2.5 text-sm font-black transition active:scale-90"
            :class="mlAir === m ? 'bg-gradient-to-br from-cyan-400 to-teal-500 text-white shadow' : 'bg-slate-100 text-slate-600'"
            @click="mlAir = m"
          >{{ m }}</button>
        </div>
        <p class="flex items-start gap-1.5 rounded-2xl bg-teal-50 p-3 text-xs font-bold text-teal-900">
          <Icon name="ph:info-duotone" class="size-4 shrink-0" /> <span>Panduan usia ini: {{ tAir.teks }}. Hari ini: <b>{{ ringkasHari(new Date().toDateString()).airMl }} ml</b>.</span>
        </p>
      </section>

      <p v-if="galat" class="flex items-center justify-center gap-2 rounded-2xl bg-rose-50 p-3 font-bold text-rose-700" role="alert">
        <Icon name="ph:warning-circle-duotone" class="size-5" /> {{ galat }}
      </p>

      <div class="flex gap-2">
        <button v-if="edit" type="button" class="btn bg-rose-50 px-5 text-rose-600" aria-label="Hapus catatan" @click="hapusIni">
          <Icon name="ph:trash-duotone" class="size-6" />
        </button>
        <button type="button" :disabled="!!galat" class="btn flex-1 bg-gradient-to-r text-lg text-white shadow-lg" :class="info.grad" @click="simpan">
          <Icon name="ph:check-circle-duotone" class="size-6" /> {{ edit ? 'Simpan perubahan' : 'Simpan catatan' }}
        </button>
      </div>
    </div>
  </ion-content>
</template>
