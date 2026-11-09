<script setup lang="ts">
import { CEK_NYAMAN, TENANGKAN, type CekNyaman } from '~/data/konten'

const emit = defineEmits<{ tutup: [] }>()
const { state, now, bar, usiaMinggu, terakhir, catat } = useAsuh()
const { rewel, umpan, getar } = useUi()

// petunjuk otomatis dari catatan; item yang "mungkin" ditaruh paling depan
const petunjuk = computed<Record<string, { teks: string; mungkin: boolean }>>(() => {
  const p: Record<string, { teks: string; mungkin: boolean }> = {}
  const tm = terakhir('minum'), tp = terakhir('popok')
  if (state.aktif.minum) p.lapar = { teks: 'Sedang menyusu', mungkin: false }
  else if (tm) p.lapar = { teks: `Terakhir menyusu ${formatLalu(tm.selesai ?? tm.mulai, now.value)}`, mungkin: bar.value.kenyang !== null && bar.value.kenyang < 0.35 }
  if (tp) p.popok = { teks: `Terakhir ganti popok ${formatLalu(tp.mulai, now.value)}`, mungkin: bar.value.popok !== null && bar.value.popok < 0.35 }
  if (tm?.data?.sendawa === false) p.sendawa = { teks: 'Menyusu terakhir belum sendawa', mungkin: true }
  if (bar.value.energi !== null && bar.value.energi < 0.3) p.ngantuk = { teks: 'Sudah bangun cukup lama untuk usianya', mungkin: true }
  return p
})

const daftar = CEK_NYAMAN
  .filter((c) => !c.minUsiaMinggu || usiaMinggu.value >= c.minUsiaMinggu)
  .sort((a, b) => Number(!!petunjuk.value[b.id]?.mungkin) - Number(!!petunjuk.value[a.id]?.mungkin))

const i = ref(0)
const tahap = ref<'cek' | 'solusi' | 'hasil'>('cek')
const ditemukan = ref<string[]>([])
const aman = ref<string[]>([])
const kini = computed<CekNyaman | undefined>(() => daftar[i.value])

const maju = () => {
  tahap.value = 'cek'
  if (i.value < daftar.length - 1) i.value++
  else selesai()
}
const tandaiAman = () => { aman.value.push(kini.value!.id); getar(8); maju() }
const tandaiKetemu = () => { ditemukan.value.push(kini.value!.id); getar(15); tahap.value = 'solusi' }
const lewati = () => maju()

let tersimpan = false
const selesai = () => {
  tahap.value = 'hasil'
  hentikanUkur()
  if (!tersimpan && (ditemukan.value.length || aman.value.length)) {
    catat('gejala', { cek: { ditemukan: [...ditemukan.value], aman: [...aman.value] } })
    tersimpan = true
    umpan({ pesan: 'Hasil cek kenyamanan dicatat', ikon: 'ph:list-checks-duotone' })
  }
}
const cekBahaya = () => {
  emit('tutup')
  setTimeout(() => (rewel.value = true), 300)
}
const item = (id: string) => CEK_NYAMAN.find((c) => c.id === id)!

// ---- pengukur bising (perkiraan kasar dari mikrofon) ----
const db = ref<number | null>(null)
const statusUkur = ref<'diam' | 'ukur' | 'gagal'>('diam')
let stream: MediaStream | null = null
let ctx: AudioContext | null = null
function hentikanUkur() {
  stream?.getTracks().forEach((t) => t.stop())
  ctx?.close().catch(() => {})
  stream = null
  ctx = null
}
onUnmounted(hentikanUkur)
async function ukurBising() {
  statusUkur.value = 'ukur'
  db.value = null
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } })
    ctx = new AudioContext()
    const an = ctx.createAnalyser()
    an.fftSize = 2048
    ctx.createMediaStreamSource(stream).connect(an)
    const buf = new Float32Array(an.fftSize)
    const sampel: number[] = []
    const t0 = performance.now()
    await new Promise<void>((selesaiUkur) => {
      const loop = () => {
        if (!ctx) return selesaiUkur()
        an.getFloatTimeDomainData(buf)
        let s = 0
        for (const v of buf) s += v * v
        // shortcut: dBFS + 94 ≈ dB SPL untuk mikrofon HP umumnya; tidak terkalibrasi, hanya perkiraan kasar
        const d = 20 * Math.log10(Math.max(Math.sqrt(s / buf.length), 1e-8)) + 94
        sampel.push(d)
        db.value = Math.round(Math.max(20, d))
        performance.now() - t0 < 3000 ? requestAnimationFrame(loop) : selesaiUkur()
      }
      loop()
    })
    if (sampel.length) db.value = Math.round(Math.max(20, sampel.reduce((a, b) => a + b, 0) / sampel.length))
    statusUkur.value = 'diam'
  } catch {
    statusUkur.value = 'gagal'
  } finally {
    hentikanUkur()
  }
}
const kategoriBising = computed(() =>
  db.value === null ? null
  : db.value < 45 ? { t: 'Tenang', c: 'bg-emerald-100 text-emerald-700' }
  : db.value < 60 ? { t: 'Sedang', c: 'bg-amber-100 text-amber-700' }
  : { t: 'Bising', c: 'bg-rose-100 text-rose-700' },
)
</script>

<template>
  <ion-content>
    <div class="space-y-4 p-5 pb-12">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="flex items-center gap-2 text-2xl font-extrabold text-slate-800"><Icon name="ph:list-checks-duotone" class="size-7 text-sky-500" /> Cek kenyamanan</h2>
          <p class="text-sm font-medium text-slate-500">Masih nangis? Cek satu per satu, pelan-pelan saja.</p>
        </div>
        <button class="grid size-10 shrink-0 place-items-center rounded-full bg-slate-200/70 active:scale-90" aria-label="Tutup" @click="emit('tutup')">
          <Icon name="ph:x-bold" class="size-5" />
        </button>
      </div>

      <!-- progres -->
      <div class="flex gap-1" role="progressbar" :aria-valuenow="tahap === 'hasil' ? daftar.length : i + 1" aria-valuemin="1" :aria-valuemax="daftar.length">
        <span
          v-for="(c, n) in daftar" :key="c.id" class="h-1.5 flex-1 rounded-full transition-all duration-500"
          :class="ditemukan.includes(c.id) ? 'bg-amber-400' : aman.includes(c.id) ? 'bg-emerald-400' : n === i && tahap !== 'hasil' ? 'bg-sky-500' : 'bg-slate-200'"
        />
      </div>

      <Transition name="geser" mode="out-in">
        <!-- ===== kartu cek ===== -->
        <section v-if="tahap === 'cek' && kini" :key="`cek-${kini.id}`" class="space-y-4">
          <div class="card space-y-3 text-center">
            <p class="text-xs font-bold uppercase tracking-wider text-slate-400">{{ i + 1 }} dari {{ daftar.length }}</p>
            <span class="mx-auto grid size-20 place-items-center rounded-full shadow-inner" :class="kini.bahaya ? 'bg-red-50 text-red-500' : 'bg-sky-50 text-sky-500'">
              <Icon :name="kini.ikon" class="size-11" />
            </span>
            <h3 class="text-2xl font-extrabold text-slate-800">{{ kini.judul }}</h3>
            <p class="font-medium leading-snug text-slate-600">{{ kini.cara }}</p>
            <p v-if="petunjuk[kini.id]" class="mx-auto flex w-fit items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold" :class="petunjuk[kini.id]!.mungkin ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'">
              <Icon :name="petunjuk[kini.id]!.mungkin ? 'ph:sparkle-duotone' : 'ph:info-duotone'" class="size-4" />
              {{ petunjuk[kini.id]!.mungkin ? 'Kemungkinan · ' : '' }}{{ petunjuk[kini.id]!.teks }}
            </p>

            <!-- pengukur bising -->
            <div v-if="kini.ukurBising" class="rounded-2xl bg-slate-50 p-3">
              <button class="btn w-full bg-white text-slate-700 shadow-sm" :disabled="statusUkur === 'ukur'" @click="ukurBising">
                <Icon name="ph:microphone-duotone" class="size-5" :class="{ 'animate-pulse text-rose-500': statusUkur === 'ukur' }" />
                {{ statusUkur === 'ukur' ? 'Mendengarkan 3 detik…' : db === null ? 'Ukur bising pakai mikrofon' : 'Ukur lagi' }}
              </button>
              <div v-if="db !== null" class="mt-2 flex items-center justify-center gap-2">
                <span class="text-3xl font-extrabold tabular-nums text-slate-800">±{{ db }}</span><span class="font-bold text-slate-500">dB</span>
                <span v-if="kategoriBising && statusUkur !== 'ukur'" class="rounded-full px-2.5 py-1 text-xs font-bold" :class="kategoriBising.c">{{ kategoriBising.t }}</span>
              </div>
              <p v-if="statusUkur === 'gagal'" class="mt-2 text-xs font-semibold text-rose-600">Mikrofon tidak bisa dipakai. Izinkan akses mikrofon, atau cek dengan telinga saja.</p>
              <p v-else class="mt-1 text-[11px] font-medium text-slate-400">Perkiraan kasar, tidak terkalibrasi. Di atas ±60 dB sudah tergolong bising untuk bayi.</p>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-2">
            <button class="btn bg-emerald-500 text-white shadow-lg shadow-emerald-500/30" @click="tandaiAman">
              <Icon name="ph:check-bold" class="size-5" /> Aman
            </button>
            <button class="btn text-white shadow-lg" :class="kini.bahaya ? 'bg-red-500 shadow-red-500/30' : 'bg-amber-500 shadow-amber-500/30'" @click="tandaiKetemu">
              <Icon name="ph:magnifying-glass-duotone" class="size-5" /> Ini dia!
            </button>
          </div>
          <div class="flex justify-between px-1">
            <button class="flex items-center gap-1 text-sm font-bold text-slate-400" @click="lewati"><Icon name="ph:skip-forward-duotone" class="size-4" /> Lewati</button>
            <button class="text-sm font-bold text-sky-600" @click="selesai">Selesai cek</button>
          </div>
        </section>

        <!-- ===== solusi untuk penyebab yang ditemukan ===== -->
        <section v-else-if="tahap === 'solusi' && kini" :key="`solusi-${kini.id}`" class="space-y-4">
          <div class="rounded-[28px] p-5 text-white shadow-xl" :class="kini.bahaya ? 'bg-gradient-to-br from-red-500 to-rose-700' : 'bg-gradient-to-br from-amber-400 to-orange-500'">
            <div class="flex items-center gap-3">
              <span class="grid size-14 shrink-0 place-items-center rounded-full bg-white/25"><Icon :name="kini.ikon" class="size-8" /></span>
              <div>
                <p class="text-xs font-bold uppercase tracking-wider opacity-80">Kemungkinan penyebab</p>
                <p class="text-xl font-extrabold leading-tight">{{ kini.judul.replace('?', '') }}</p>
              </div>
            </div>
            <p class="mt-3 font-semibold leading-snug">{{ kini.solusi }}</p>
            <a v-if="kini.bahaya" href="tel:119" class="btn mt-3 w-full bg-white text-red-600"><Icon name="ph:phone-call-duotone" class="size-5" /> Telepon 119</a>
          </div>
          <p class="text-center text-sm font-medium text-slate-500">Coba atasi dulu, lalu lihat apakah tangisan mereda.</p>
          <div class="grid grid-cols-2 gap-2">
            <button class="btn bg-white text-slate-700 shadow-sm" @click="maju">Cek yang lain <Icon name="ph:arrow-right-bold" class="size-4" /></button>
            <button class="btn bg-sky-500 text-white shadow-lg" @click="selesai"><Icon name="ph:check-bold" class="size-5" /> Selesai</button>
          </div>
        </section>

        <!-- ===== hasil ===== -->
        <section v-else key="hasil" class="space-y-4">
          <div v-if="ditemukan.length" class="card space-y-3">
            <p class="judul-kartu"><Icon name="ph:magnifying-glass-duotone" class="size-5 text-amber-500" /> Yang perlu diatasi</p>
            <div v-for="id in ditemukan" :key="id" class="flex gap-3 rounded-2xl p-3" :class="item(id).bahaya ? 'bg-red-50' : 'bg-amber-50'">
              <Icon :name="item(id).ikon" class="mt-0.5 size-6 shrink-0" :class="item(id).bahaya ? 'text-red-500' : 'text-amber-600'" />
              <div>
                <p class="font-extrabold text-slate-800">{{ item(id).judul.replace('?', '') }}</p>
                <p class="text-sm font-medium text-slate-600">{{ item(id).solusi }}</p>
              </div>
            </div>
          </div>
          <div v-else class="card text-center">
            <Icon name="ph:smiley-melting-duotone" class="mx-auto size-14 text-sky-400" />
            <p class="mt-1 text-lg font-extrabold text-slate-800">{{ aman.length ? `${aman.length} hal sudah dicek, semua aman` : 'Belum ada yang dicek' }}</p>
            <p class="text-sm font-medium text-slate-500">Kadang bayi menangis tanpa sebab yang jelas, dan itu normal. Coba teknik menenangkan di bawah.</p>
          </div>

          <div class="card">
            <p class="judul-kartu"><Icon name="ph:hand-heart-duotone" class="size-5 text-rose-500" /> Teknik menenangkan (5S)</p>
            <div class="mt-3 space-y-2">
              <div v-for="(t, n) in TENANGKAN" :key="t.t" class="flex animate-muncul items-center gap-3" :style="{ animationDelay: `${n * 70}ms` }">
                <span class="grid size-10 shrink-0 place-items-center rounded-full bg-rose-50 text-rose-500"><Icon :name="t.ikon" class="size-5" /></span>
                <p class="text-sm font-medium text-slate-600"><b class="text-slate-800">{{ t.t }}.</b> {{ t.d }}</p>
              </div>
            </div>
          </div>

          <div class="flex gap-3 rounded-2xl bg-red-50 p-3 text-sm font-semibold text-red-800">
            <Icon name="ph:hospital-duotone" class="size-5 shrink-0" />
            <p>Hubungi dokter bila bayi tidak bisa ditenangkan lebih dari 1–2 jam, tangisannya melengking tidak biasa, atau muncul tanda bahaya.</p>
          </div>
          <div class="grid grid-cols-2 gap-2">
            <button class="btn bg-white text-red-600 shadow-sm" @click="cekBahaya"><Icon name="ph:siren-duotone" class="size-5" /> Cek tanda bahaya</button>
            <button class="btn bg-sky-500 text-white shadow-lg" @click="emit('tutup')">Tutup</button>
          </div>
        </section>
      </Transition>
    </div>
  </ion-content>
</template>
