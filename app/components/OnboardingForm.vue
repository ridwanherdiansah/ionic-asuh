<script setup lang="ts">
const { setProfil } = useAsuh()
const langkah = ref(0)
const nama = ref('')
const lahir = ref('')
const setuju = ref(false)
const sapa = ref(0)
const hariIni = keInput(Date.now()).slice(0, 10)

const usia = computed(() => (lahir.value ? hitungUsia(lahir.value) : null))
const galatLahir = computed(() => {
  if (!lahir.value) return ''
  if (!usia.value) return 'Tanggal lahir tidak boleh di masa depan.'
  if (usia.value.hari >= 365) return `Asuh dibuat untuk bayi 0–12 bulan. ${nama.value.trim() || 'Si kecil'} sudah ${usia.value.teks}.`
  return ''
})
const bisaLanjut = computed(() => [true, nama.value.trim().length > 0, !!lahir.value && !galatLahir.value, setuju.value][langkah.value])
const lanjut = () => {
  if (!bisaLanjut.value) return
  sapa.value++
  if (langkah.value < 3) langkah.value++
  else setProfil(nama.value.trim(), lahir.value)
}
const ekspresi = computed(() => (galatLahir.value ? 'sedih' : langkah.value === 3 ? 'minum' : 'senang'))
const sapaan = computed(() => [
  'Hai! Aku teman kecilmu',
  nama.value.trim() ? `Halo, aku ${nama.value.trim()}!` : 'Siapa namaku?',
  usia.value && !galatLahir.value ? `Aku sudah ${usia.value.teks}!` : 'Kapan aku lahir?',
  'Janji jaga aku baik-baik ya',
][langkah.value])

const FITUR = [
  { ikon: 'ph:timer-duotone', t: 'Catat menyusu, tidur, popok & tangisan', c: 'bg-amber-100 text-amber-600' },
  { ikon: 'ph:palette-duotone', t: 'Warna layar berubah mengikuti pola bayi', c: 'bg-rose-100 text-rose-600' },
  { ikon: 'ph:books-duotone', t: 'Saran berbasis jurnal + tanda bahaya', c: 'bg-sky-100 text-sky-600' },
]
const BAHAYA = [
  { ikon: 'ph:thermometer-hot-duotone', t: 'Demam < 3 bln' },
  { ikon: 'ph:warning-octagon-duotone', t: 'Muntah hijau' },
  { ikon: 'ph:drop-duotone', t: 'Darah di BAB' },
  { ikon: 'ph:battery-empty-duotone', t: 'Lemas' },
  { ikon: 'ph:wind-duotone', t: 'Sesak' },
]
</script>

<template>
  <div class="flex min-h-[calc(100vh-40px)] flex-col py-4">
    <!-- progres -->
    <div class="flex items-center gap-2">
      <button v-if="langkah > 0" class="grid size-10 place-items-center rounded-full bg-white/15 text-white ring-1 ring-white/25 active:scale-90" aria-label="Kembali" @click="langkah--">
        <Icon name="ph:arrow-left-bold" class="size-5" />
      </button>
      <div class="flex flex-1 gap-1.5" role="progressbar" :aria-valuenow="langkah + 1" aria-valuemin="1" aria-valuemax="4">
        <span v-for="i in 4" :key="i" class="h-2 flex-1 rounded-full transition-all duration-500" :class="i <= langkah + 1 ? 'bg-white' : 'bg-white/25'" />
      </div>
    </div>

    <!-- avatar + gelembung -->
    <div class="mt-6 flex items-end justify-center gap-2">
      <BabyAvatar :ekspresi="ekspresi" :sapa="sapa" ukuran="w-36" />
      <Transition name="pop" mode="out-in">
        <p :key="sapaan" class="relative mb-24 max-w-[160px] rounded-2xl rounded-bl-sm bg-white px-4 py-2.5 font-black text-slate-700 shadow-lg">{{ sapaan }}</p>
      </Transition>
    </div>

    <form class="mt-4 flex flex-1 flex-col gap-6" @submit.prevent="lanjut">
      <Transition name="geser" mode="out-in">
        <section v-if="langkah === 0" key="0" class="space-y-3">
          <h1 class="text-center text-5xl font-extrabold tracking-tight text-white">Asuh</h1>
          <p class="text-center font-semibold text-white/80">Catat, pahami, dan tenangkan si kecil 0–12 bulan</p>
          <div v-for="(f, i) in FITUR" :key="f.t" class="kaca flex animate-muncul items-center gap-3 py-3" :style="{ animationDelay: `${i * 120}ms` }">
            <span class="grid size-11 shrink-0 place-items-center rounded-2xl" :class="f.c"><Icon :name="f.ikon" class="size-6" /></span>
            <span class="font-semibold">{{ f.t }}</span>
          </div>
        </section>

        <section v-else-if="langkah === 1" key="1" class="card space-y-3">
          <label for="nama" class="judul-kartu text-xl"><Icon name="ph:baby-duotone" class="size-6 text-rose-500" /> Nama panggilan si kecil</label>
          <input id="nama" v-model="nama" maxlength="30" placeholder="mis. Adek" autofocus class="input py-4 text-2xl font-black text-teal-700" />
          <div class="flex flex-wrap gap-2">
            <button v-for="s in ['Adek', 'Dedek', 'Baby', 'Si Kecil']" :key="s" type="button" class="chip bg-teal-50 text-teal-700" @click="nama = s">{{ s }}</button>
          </div>
        </section>

        <section v-else-if="langkah === 2" key="2" class="card space-y-3">
          <label for="lahir" class="judul-kartu text-xl"><Icon name="ph:cake-duotone" class="size-6 text-amber-500" /> Kapan {{ nama.trim() || 'si kecil' }} lahir?</label>
          <input id="lahir" v-model="lahir" type="date" :max="hariIni" class="input py-4 text-xl font-black text-teal-700" :aria-invalid="!!galatLahir" aria-describedby="info-lahir" />
          <Transition name="pop" mode="out-in">
            <p v-if="galatLahir" id="info-lahir" key="galat" class="flex items-start gap-2 rounded-2xl bg-rose-50 p-3 font-bold text-rose-700" role="alert">
              <Icon name="ph:smiley-sad-duotone" class="size-6 shrink-0" /> {{ galatLahir }}
            </p>
            <p v-else-if="usia" id="info-lahir" key="ok" class="flex items-center gap-2 rounded-2xl bg-emerald-50 p-3 font-bold text-emerald-700">
              <Icon name="ph:confetti-duotone" class="size-6" /> Usia {{ usia.teks }}
            </p>
          </Transition>
        </section>

        <section v-else key="3" class="card space-y-3">
          <p class="judul-kartu text-xl"><Icon name="ph:shield-check-duotone" class="size-6 text-teal-600" /> Satu hal penting</p>
          <p class="font-semibold text-slate-600">Asuh membantu mencatat dan memberi edukasi, <b>bukan pengganti dokter</b>. Bila muncul tanda bahaya seperti ini, langsung ke dokter / IGD:</p>
          <div class="flex flex-wrap gap-2">
            <span v-for="b in BAHAYA" :key="b.t" class="chip bg-red-50 text-red-700"><Icon :name="b.ikon" class="size-4" /> {{ b.t }}</span>
          </div>
          <label class="flex items-center gap-3 rounded-2xl bg-amber-50 p-3 font-bold text-amber-900">
            <input v-model="setuju" type="checkbox" class="size-6 accent-teal-600" /> Saya mengerti
          </label>
        </section>
      </Transition>

      <button type="submit" :disabled="!bisaLanjut" class="btn mt-auto w-full rounded-full bg-white py-4 text-lg text-blue-700 shadow-xl">
        {{ ['Mulai', 'Lanjut', 'Lanjut', 'Selesai, ayo mulai!'][langkah] }}
        <Icon :name="langkah === 3 ? 'ph:confetti-duotone' : 'ph:arrow-right-bold'" class="size-5" />
      </button>
    </form>
  </div>
</template>
