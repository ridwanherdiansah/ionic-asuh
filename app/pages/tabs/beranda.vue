<script setup lang="ts">
import { EDUKASI, JENIS_INFO, POPOK, SARAN, TEMA, ringkasGejala, ringkasAsupan, MAKS_SUSU_SETAHUN } from '~/data/konten'
import type { Log, Timer } from '~/composables/useAsuh'

const {
  state, now, kondisi, tema, bar, ekspresi, pesanAvatar, pola, polaAktif, usiaMinggu,
  terakhir, ringkasHari, mulai, sudahMembaik, durasiMenit, fitur, pengumuman, tutupPengumuman,
} = useAsuh()
const { aksi, tambah, rewel, pengaturan, sheet, cekNyaman, umpan, getar } = useUi()

// setelah onboarding selesai, kembali ke atas (posisi scroll onboarding terbawa)
const konten = ref<{ $el: HTMLIonContentElement }>()
watch(() => state.profil, () => konten.value?.$el.scrollToTop(0))

const usia = computed(() => (state.profil ? hitungUsia(state.profil.lahir, now.value)?.teks : ''))
const tanggal = computed(() => new Date(now.value).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' }))

// detik untuk stopwatch
const detik = ref(Date.now())
const tick = setInterval(() => (detik.value = Date.now()), 1000)
onUnmounted(() => clearInterval(tick))

// angka besar hero: berapa lama sejak terakhir menyusu
const hero = computed(() => {
  if (state.aktif.minum) return { angka: formatStopwatch(detik.value - state.aktif.minum), ket: 'sedang menyusu' }
  const tm = terakhir('minum')
  if (!tm) return { angka: usia.value?.split(' ')[0] ?? '0', satuan: usia.value?.split(' ')[1], ket: 'usia si kecil · belum ada catatan menyusu' }
  const m = Math.max(0, Math.floor((now.value - (tm.selesai ?? tm.mulai)) / 60_000))
  return m < 60
    ? { angka: String(m), satuan: 'mnt', ket: 'sejak terakhir menyusu' }
    : { angka: `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}`, satuan: 'jam', ket: 'sejak terakhir menyusu' }
})
const judulKondisi = computed(() => (polaAktif.value.length ? polaAktif.value.map((p) => TEMA[p.kondisi].label).join(' · ') : TEMA[kondisi.value].label))

const STAT = computed(() => [
  { label: 'Kenyang', ikon: 'tabler:baby-bottle', nilai: bar.value.kenyang },
  { label: 'Energi', ikon: 'ph:lightning-duotone', nilai: bar.value.energi },
  { label: 'Popok', ikon: 'tabler:diaper', nilai: bar.value.popok },
  { label: 'Mood', ikon: 'ph:smiley-duotone', nilai: bar.value.mood },
])

// topbar kapsul pola: aktif dulu, lalu yang berlaku, urut skor
const kapsul = computed(() =>
  [...pola.value].sort((a, b) => Number(b.aktif) - Number(a.aktif) || Number(b.berlaku) - Number(a.berlaku) || b.skor - a.skor),
)
const infoPola = ref(false)

// avatar
const sapa = ref(0)
const ketukAvatar = () => { sapa.value++; getar(10) }

// timer berjalan
const TIMER: Timer[] = ['minum', 'tidur', 'nangis']
// timer yang berjalan selama ini kemungkinan lupa dihentikan
const BATAS_LUPA: Record<Timer, number> = { minum: 90 * 60_000, tidur: 8 * 3600_000, nangis: 3 * 3600_000 }
const berjalan = computed(() => TIMER.filter((j) => state.aktif[j]))
const jamMulai = (t?: number) => (t ? new Date(t).toTimeString().slice(0, 5) : '')
// input jam saja; kalau hasilnya di masa depan berarti kemarin
const ubahMulai = (j: Timer, hhmm: string) => {
  if (!hhmm) return
  const [h, m] = hhmm.split(':').map(Number)
  const d = new Date()
  d.setHours(h!, m!, 0, 0)
  mulai(j, d.getTime() > Date.now() ? d.getTime() - 864e5 : d.getTime())
}

// kartu kapsul "hari ini"
const hariIni = computed(() => ringkasHari(new Date(now.value).toDateString()))
const singkat = (menit: number) => formatDurasi(menit).replace(' mnt', 'm').replace(' j ', 'j ')
const HARI_INI = computed(() => [
  { j: 'minum' as const, nilai: `${hariIni.value.minum}×`, sub: hariIni.value.ml ? `${hariIni.value.ml} ml` : '' },
  { j: 'tidur' as const, nilai: singkat(hariIni.value.tidurMenit) },
  { j: 'popok' as const, nilai: `${hariIni.value.basah + hariIni.value.bab}×` },
  { j: 'nangis' as const, nilai: `${Math.round(hariIni.value.nangisMenit)}m` },
])
const ASUPAN = computed(() => [
  { j: 'makan' as const, nilai: hariIni.value.makan ? `${hariIni.value.makan}× · ${hariIni.value.makanSdm} sdm` : 'Belum' },
  { j: 'air' as const, nilai: hariIni.value.airMl ? `${hariIni.value.airMl} ml` : 'Belum' },
])
const susuBerlebih = computed(() => fitur.value.uht && hariIni.value.ml > MAKS_SUSU_SETAHUN)
const tekanKapsul = (j: Timer | 'popok') => {
  if (j === 'popok') return (tambah.value = true)
  state.aktif[j] ? aksi.selesai(j, j === 'minum' ? { sendawa: true } : undefined) : aksi.mulai(j)
}

// catatan terakhir (panel gelap)
const terbaru = computed(() => [...state.logs].sort((a, b) => b.mulai - a.mulai).slice(0, 5))
const jam = (t: number) => new Date(t).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
const detail = (l: Log) => {
  if (l.jenis === 'popok') return POPOK.find((p) => p.id === l.data?.tipe)?.nama ?? ''
  if (l.jenis === 'gejala') return ringkasGejala(l.data)
  if (l.jenis === 'makan' || l.jenis === 'air') return ringkasAsupan(l.jenis, l.data)
  if (l.jenis === 'minum' && l.data?.cara === 'botol') return ringkasAsupan('minum', l.data)
  return formatDurasi(durasiMenit(l))
}

// saran pola aktif
const membaik = (k: keyof typeof SARAN) => {
  sudahMembaik(k)
  umpan({ pesan: `Syukurlah! ${TEMA[k].label} ditandai membaik`, ikon: 'ph:hand-heart-duotone' })
}

// tips harian sesuai fase usia
const fase = computed(() => EDUKASI[usiaMinggu.value < 13 ? 0 : usiaMinggu.value < 26 ? 1 : 2]!)
const geserTips = ref(0)
const tips = computed(() => fase.value.tips[(Math.floor(now.value / 864e5) + geserTips.value) % fase.value.tips.length])
</script>

<template>
  <ion-page>
    <ion-content ref="konten" :fullscreen="true">
      <div class="mx-auto max-w-md px-4 pb-36 text-white">
        <div v-if="!state.profil" class="pt-[calc(env(safe-area-inset-top)+16px)]"><OnboardingForm /></div>

        <template v-else>
          <!-- ===== header ===== -->
          <header class="flex items-center justify-between gap-2 pt-[calc(env(safe-area-inset-top)+12px)]">
            <button class="grid size-11 place-items-center rounded-full bg-white/15 ring-1 ring-white/25 backdrop-blur active:scale-90" aria-label="Pengaturan" @click="pengaturan = true">
              <Icon name="ph:gear-six-duotone" class="size-6" />
            </button>
            <div class="min-w-0 text-center">
              <p class="flex items-center justify-center gap-1.5 truncate text-lg font-extrabold"><Icon name="ph:baby-duotone" class="size-5 shrink-0" /> {{ state.profil.nama }}</p>
              <span class="mt-0.5 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-semibold">
                <span class="size-1.5 rounded-full bg-emerald-300" /> {{ usia }}
              </span>
            </div>
            <button class="grid size-11 place-items-center rounded-full bg-white/15 ring-1 ring-white/25 backdrop-blur active:scale-90" aria-label="Bayi rewel atau ada gejala" @click="rewel = true">
              <Icon name="ph:first-aid-kit-duotone" class="size-6" />
            </button>
          </header>

          <!-- ===== topbar kapsul pola ===== -->
          <div class="sticky top-0 z-20 -mx-4 mt-3 px-4 pb-2 pt-[calc(env(safe-area-inset-top)+6px)] backdrop-blur-xl">
            <div class="flex items-center justify-between px-1">
              <button class="label-kecil flex items-center gap-1.5" :aria-expanded="infoPola" @click="infoPola = !infoPola">
                Kecocokan pola <Icon name="ph:info-bold" class="size-3.5" />
              </button>
              <NuxtLink to="/tabs/pola" class="flex items-center gap-0.5 text-xs font-bold text-white/80">Detail <Icon name="ph:caret-right-bold" class="size-3.5" /></NuxtLink>
            </div>
            <Transition name="pop">
              <p v-if="infoPola" class="mt-2 rounded-2xl bg-slate-950/50 p-3 text-[11px] font-medium leading-snug text-white/85 backdrop-blur">
                % = kriteria pedoman yang terpenuhi dari catatanmu, <b>bukan</b> kemungkinan penyakit. Kapsul menyala putih (aktif) mulai 60% <b>dan</b> bila syarat wajibnya terpenuhi (mis. kolik: menangis ≥3 jam/hari selama ≥3 hari), lalu warna layar ikut berubah.
              </p>
            </Transition>
            <TransitionGroup tag="div" name="daftar" class="-mx-4 mt-2 flex gap-2.5 overflow-x-auto px-4 py-1.5 [scrollbar-width:none]">
              <NuxtLink v-for="p in kapsul" :key="p.kondisi" to="/tabs/pola" class="active:scale-95">
                <PolaBubble :kondisi="p.kondisi" :skor="p.skor" :aktif="p.aktif" :berlaku="p.berlaku" :ok="p.kriteria.filter((k) => k.ok).length" :total="p.kriteria.length" />
              </NuxtLink>
            </TransitionGroup>
          </div>

          <div class="space-y-4">
            <Transition name="pop"><DaruratCard v-if="kondisi === 'darurat'" /></Transition>

            <!-- fitur baru sesuai usia -->
            <Transition name="pop">
              <section v-if="pengumuman" class="flex items-start gap-3 rounded-[28px] bg-white p-4 text-slate-800 shadow-xl">
                <span class="grid size-12 shrink-0 place-items-center rounded-full bg-gradient-to-br from-lime-400 to-emerald-500 text-white shadow"><Icon :name="pengumuman.ikon" class="size-7" /></span>
                <div class="min-w-0 flex-1">
                  <p class="flex items-center gap-1 font-black leading-tight"><Icon name="ph:sparkle-duotone" class="size-4 text-amber-500" /> {{ pengumuman.judul }}</p>
                  <p class="mt-1 text-sm font-medium leading-snug text-slate-600">{{ pengumuman.isi }}</p>
                  <button class="mt-3 rounded-full bg-slate-900 px-4 py-2 text-sm font-bold text-white active:scale-95" @click="tutupPengumuman(pengumuman.id)">Oke, mengerti</button>
                </div>
              </section>
            </Transition>

            <!-- ===== hero ===== -->
            <section class="flex flex-col items-center text-center">
              <Transition name="pop" mode="out-in">
                <p :key="pesanAvatar" class="relative z-10 -mb-1 max-w-[85%] rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-lg">
                  {{ pesanAvatar }}
                  <span class="absolute -bottom-1 left-1/2 size-3 -translate-x-1/2 rotate-45 bg-white" />
                </p>
              </Transition>
              <button class="animate-masuk-kiri" aria-label="Sapa si kecil" @click="ketukAvatar">
                <BabyAvatar :ekspresi="ekspresi" :sapa="sapa" ukuran="w-44" />
              </button>
              <p class="mt-1 flex items-center gap-1.5 text-lg font-bold">
                <Icon :name="tema.ikon" class="size-5" /> {{ judulKondisi }}
              </p>
              <p class="mt-1 flex items-start justify-center font-extrabold leading-none tracking-tight">
                <span class="text-[72px]">{{ hero.angka }}</span>
                <span v-if="hero.satuan" class="mt-3 text-xl font-bold text-white/80">{{ hero.satuan }}</span>
              </p>
              <p class="text-sm font-medium text-white/75">{{ hero.ket }} · {{ tanggal }}</p>

              <!-- statistik -->
              <div class="kaca mt-4 grid w-full grid-cols-4 divide-x divide-white/15 px-1 py-3">
                <div v-for="s in STAT" :key="s.label" class="flex flex-col items-center gap-0.5" role="meter" :aria-label="s.label" :aria-valuenow="s.nilai === null ? undefined : Math.round(s.nilai * 100)" aria-valuemin="0" aria-valuemax="100">
                  <Icon :name="s.ikon" class="size-5" :class="s.nilai !== null && s.nilai < 0.25 ? 'text-rose-300' : 'text-white/85'" />
                  <span class="text-sm font-extrabold" :class="{ 'text-rose-200': s.nilai !== null && s.nilai < 0.25 }">{{ s.nilai === null ? '—' : `${Math.round(s.nilai * 100)}%` }}</span>
                  <span class="text-[10px] font-medium text-white/60">{{ s.label }}</span>
                </div>
              </div>
            </section>

            <!-- ===== timer berjalan ===== -->
            <TransitionGroup tag="div" name="daftar" class="space-y-2">
              <section v-for="j in berjalan" :key="j" class="kaca flex flex-wrap items-center gap-3 p-3">
                <span class="grid size-12 shrink-0 place-items-center rounded-full bg-gradient-to-br text-white shadow-lg" :class="JENIS_INFO[j].grad"><Icon :name="JENIS_INFO[j].ikon" class="size-6 animate-pulse" /></span>
                <div class="min-w-0 flex-1">
                  <p class="label-kecil">{{ JENIS_INFO[j].nama }} berjalan</p>
                  <p class="font-mono text-2xl font-extrabold tabular-nums leading-none">{{ formatStopwatch(detik - state.aktif[j]!) }}</p>
                  <p v-if="detik - state.aktif[j]! > BATAS_LUPA[j]" class="mt-1 flex items-center gap-1 text-[11px] font-bold text-amber-200">
                    <Icon name="ph:warning-circle-duotone" class="size-3.5" /> Lupa dihentikan? Ubah jam mulai atau tekan Selesai
                  </p>
                  <label class="mt-0.5 flex items-center gap-1 text-[11px] font-medium text-white/70">sejak
                    <input type="time" :value="jamMulai(state.aktif[j])" class="rounded-md bg-white/15 px-1 font-bold text-white" :aria-label="`Ubah jam mulai ${JENIS_INFO[j].nama}`" @change="ubahMulai(j, ($event.target as HTMLInputElement).value)" />
                  </label>
                </div>
                <div class="flex flex-col gap-1">
                  <button class="flex items-center gap-1 rounded-full bg-white px-3.5 py-2 text-sm font-bold text-slate-800 active:scale-95" @click="aksi.selesai(j, j === 'minum' ? { sendawa: true } : undefined)">
                    <Icon name="ph:stop-fill" class="size-4" /> {{ j === 'minum' ? 'Sendawa' : 'Selesai' }}
                  </button>
                  <button v-if="j === 'minum'" class="rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold active:scale-95" @click="aksi.selesai('minum', { sendawa: false })">Belum sendawa</button>
                </div>
                <!-- bayi masih menangis: pandu cek kenyamanan -->
                <button
                  v-if="j === 'nangis'"
                  class="flex w-full items-center gap-2 rounded-2xl bg-white/90 px-3 py-2.5 text-left text-sm font-bold text-slate-800 active:scale-[.98]"
                  :class="{ 'animate-denyut': detik - state.aktif.nangis! > 5 * 60_000 }"
                  @click="cekNyaman = true"
                >
                  <Icon name="ph:list-checks-duotone" class="size-5 shrink-0 text-sky-500" />
                  <span class="flex-1">{{ detik - state.aktif.nangis! > 10 * 60_000 ? 'Sudah lebih dari 10 menit, yuk cek kenyamanan' : 'Masih nangis? Cek gerah, dingin, bising…' }}</span>
                  <Icon name="ph:caret-right-bold" class="size-4 text-slate-400" />
                </button>
              </section>
            </TransitionGroup>

            <!-- ===== hari ini (kapsul) ===== -->
            <section>
              <div class="mb-2 flex items-center justify-between px-1">
                <h2 class="text-lg font-extrabold">Hari ini</h2>
                <NuxtLink to="/tabs/riwayat" class="flex items-center gap-0.5 text-sm font-semibold text-white/80">Riwayat <Icon name="ph:caret-right-bold" class="size-4" /></NuxtLink>
              </div>
              <div class="grid grid-cols-4 gap-2.5">
                <button
                  v-for="k in HARI_INI" :key="k.j"
                  class="flex flex-col items-center gap-1.5 rounded-[26px] py-4 ring-1 transition active:scale-95"
                  :class="k.j !== 'popok' && state.aktif[k.j] ? 'bg-white text-slate-800 shadow-xl ring-white' : 'bg-white/12 ring-white/20'"
                  :aria-label="`${JENIS_INFO[k.j].nama}: ${k.nilai} hari ini`"
                  @click="tekanKapsul(k.j)"
                >
                  <span class="text-base font-extrabold">{{ k.nilai }}</span>
                  <Icon :name="JENIS_INFO[k.j].ikon" class="size-8" :style="k.j !== 'popok' && state.aktif[k.j] ? { color: JENIS_INFO[k.j].warna } : {}" />
                  <span class="text-[11px] font-semibold opacity-80">{{ JENIS_INFO[k.j].nama }}</span>
                  <span v-if="'sub' in k && k.sub" class="-mt-1 text-[10px] font-bold opacity-70">{{ k.sub }}</span>
                </button>
              </div>
              <div v-if="fitur.makan" class="mt-2.5 grid grid-cols-2 gap-2.5">
                <button
                  v-for="k in ASUPAN" :key="k.j"
                  class="flex items-center gap-3 rounded-[26px] bg-white/12 px-4 py-3 text-left ring-1 ring-white/20 transition active:scale-95"
                  :aria-label="`Catat ${JENIS_INFO[k.j].nama}: ${k.nilai} hari ini`"
                  @click="sheet = { jenis: k.j }"
                >
                  <Icon :name="JENIS_INFO[k.j].ikon" class="size-8 shrink-0" />
                  <span class="min-w-0">
                    <span class="block truncate text-sm font-extrabold">{{ k.nilai }}</span>
                    <span class="block text-[11px] font-semibold opacity-80">{{ JENIS_INFO[k.j].nama }}</span>
                  </span>
                </button>
              </div>
              <p v-if="susuBerlebih" class="mt-2 flex items-center gap-1.5 rounded-2xl bg-amber-400/20 px-3 py-2 text-[11px] font-bold text-amber-100">
                <Icon name="ph:warning-circle-duotone" class="size-4 shrink-0" /> Susu hari ini {{ hariIni.ml }} ml, lebih dari ±{{ MAKS_SUSU_SETAHUN }} ml. Utamakan makan.
              </p>
              <p class="mt-2 px-1 text-[11px] font-medium text-white/60">Ketuk kapsul untuk mulai/selesai · tombol + untuk isi manual</p>
            </section>

            <!-- ===== saran pola aktif ===== -->
            <TransitionGroup tag="div" name="daftar" class="space-y-3">
              <section v-for="p in polaAktif" :key="p.kondisi" class="kaca">
                <div class="flex items-start gap-3">
                  <span class="grid size-11 shrink-0 place-items-center rounded-full bg-white shadow" :style="{ color: TEMA[p.kondisi].accent }">
                    <Icon :name="TEMA[p.kondisi].ikon" class="size-6" />
                  </span>
                  <div class="min-w-0 flex-1">
                    <p class="label-kecil">Saran · {{ TEMA[p.kondisi].label }}</p>
                    <p class="font-extrabold leading-tight">{{ SARAN[p.kondisi].judul }}</p>
                    <ul class="mt-2 space-y-1.5 text-sm font-medium text-white/90">
                      <li v-for="l in SARAN[p.kondisi].langkah.slice(0, 2)" :key="l" class="flex gap-2">
                        <Icon name="ph:check-circle-duotone" class="mt-0.5 size-4 shrink-0" /> {{ l }}
                      </li>
                    </ul>
                  </div>
                </div>
                <div class="mt-3 grid grid-cols-2 gap-2">
                  <button class="flex items-center justify-center gap-1.5 rounded-full bg-white py-2.5 text-sm font-bold text-slate-800 active:scale-95" @click="membaik(p.kondisi)">
                    <Icon name="ph:hand-heart-duotone" class="size-4 text-emerald-600" /> Sudah membaik
                  </button>
                  <NuxtLink to="/tabs/pola" class="flex items-center justify-center gap-1.5 rounded-full bg-white/15 py-2.5 text-sm font-bold active:scale-95">
                    <Icon name="ph:books-duotone" class="size-4" /> Semua saran
                  </NuxtLink>
                </div>
              </section>
            </TransitionGroup>

            <!-- ===== catatan terakhir (panel gelap) ===== -->
            <section class="panel-gelap">
              <div class="mb-1 flex items-center justify-between">
                <h2 class="flex items-center gap-2 font-extrabold"><Icon name="ph:clock-counter-clockwise-duotone" class="size-5" /> Catatan terakhir</h2>
                <NuxtLink to="/tabs/riwayat" class="text-xs font-semibold text-white/60">Semua</NuxtLink>
              </div>
              <ul v-if="terbaru.length" class="divide-y divide-white/10">
                <li v-for="l in terbaru" :key="l.id">
                  <button class="flex w-full items-center gap-3 py-2.5 text-left active:opacity-70" :aria-label="`Ubah ${JENIS_INFO[l.jenis].nama} ${jam(l.mulai)}`" @click="sheet = { log: l }">
                    <span class="w-12 shrink-0 text-sm font-semibold text-white/60">{{ jam(l.mulai) }}</span>
                    <Icon :name="l.data?.flags?.length ? 'ph:siren-duotone' : JENIS_INFO[l.jenis].ikon" class="size-6 shrink-0" :class="l.data?.flags?.length ? 'text-red-400' : ''" :style="l.data?.flags?.length ? {} : { color: JENIS_INFO[l.jenis].warna }" />
                    <span class="w-20 shrink-0 text-sm font-semibold">{{ JENIS_INFO[l.jenis].nama }}</span>
                    <span class="min-w-0 flex-1 truncate text-right text-sm font-bold">{{ detail(l) }}</span>
                  </button>
                </li>
              </ul>
              <p v-else class="py-4 text-center text-sm font-medium text-white/60">Belum ada catatan. Ketuk + untuk mulai.</p>
            </section>

            <!-- ===== tips ===== -->
            <section class="kaca">
              <div class="flex items-center justify-between">
                <p class="label-kecil flex items-center gap-1.5"><Icon name="ph:lightbulb-filament-duotone" class="size-4 text-amber-300" /> Tips hari ini · {{ fase.fase }}</p>
                <button class="grid size-8 place-items-center rounded-full bg-white/15 active:scale-90" aria-label="Tips lain" @click="geserTips++">
                  <Icon name="ph:shuffle-bold" class="size-4" />
                </button>
              </div>
              <Transition name="pop" mode="out-in">
                <p :key="tips" class="mt-2 font-semibold leading-snug">{{ tips }}</p>
              </Transition>
            </section>
          </div>
        </template>
      </div>
    </ion-content>
  </ion-page>
</template>
