<script setup lang="ts">
import { SARAN, TEMA, JENIS_INFO, CEK_NYAMAN, type KondisiPola } from '~/data/konten'
import type { Timer } from '~/composables/useAsuh'

const { state, now, pola, kondisi, polaAktif, seri7, sudahMembaik, cukupData } = useAsuh()
const { umpan } = useUi()

// grafik 7 hari
const GRAFIK: { j: Timer; garis?: number; garisLabel?: string }[] = [
  { j: 'nangis', garis: 180, garisLabel: '3 jam · ambang kolik' },
  { j: 'tidur' },
  { j: 'minum' },
]
const pilihGrafik = ref(0)
const g = computed(() => GRAFIK[pilihGrafik.value]!)
const data = computed(() => seri7(g.value.j))
const skala = computed(() => Math.max(g.value.garis ? g.value.garis * 1.3 : 1, ...data.value.map((d) => d.nilai), 1))
const pilihHari = ref(6)
const fmt = (n: number, mode: string) => (mode === 'jumlah' ? `${n}×` : formatDurasi(n))

// temuan cek kenyamanan 7 hari: penyebab yang paling sering ditemukan
const temuan = computed(() => {
  const cek = state.logs.filter((l) => l.jenis === 'gejala' && l.data?.cek && l.mulai > now.value - 7 * 864e5)
  const n: Record<string, number> = {}
  for (const l of cek) for (const id of l.data!.cek.ditemukan ?? []) n[id] = (n[id] ?? 0) + 1
  const daftar = Object.entries(n)
    .sort((a, b) => b[1] - a[1])
    .map(([id, jml]) => ({ c: CEK_NYAMAN.find((x) => x.id === id)!, jml }))
    .filter((x) => x.c)
  return { kali: cek.length, daftar }
})

// kartu pola
const urut = computed(() => [...pola.value].sort((a, b) => Number(b.aktif) - Number(a.aktif) || Number(b.berlaku) - Number(a.berlaku) || b.skor - a.skor))
const buka = ref<string | null>(polaAktif.value[0]?.kondisi ?? null)
const membaik = (k: KondisiPola) => {
  sudahMembaik(k)
  umpan({ pesan: `Syukurlah! ${TEMA[k].label} ditandai membaik`, ikon: 'ph:hand-heart-duotone' })
}
</script>

<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <div class="mx-auto max-w-md space-y-4 px-4 pb-36 pt-[calc(env(safe-area-inset-top)+16px)] text-white">
        <PageHead judul="Pola 7 hari" sub="Bukan diagnosis · tunjukkan ke dokter" ikon="ph:chart-bar-duotone" />

        <DaruratCard v-if="kondisi === 'darurat'" />

        <p v-if="!cukupData" class="kaca flex items-start gap-3 py-3 text-sm font-medium">
          <Icon name="ph:hourglass-medium-duotone" class="size-6 shrink-0 text-amber-300" />
          Catat minimal 1 hari penuh supaya hitungan harian (popok, menyusu, total tidur) bisa dinilai.
        </p>

        <!-- grafik -->
        <section class="kaca">
          <div class="flex gap-1 rounded-full bg-slate-950/30 p-1" role="tablist">
            <button
              v-for="(x, i) in GRAFIK" :key="x.j" role="tab" :aria-selected="pilihGrafik === i"
              class="flex flex-1 items-center justify-center gap-1.5 rounded-full py-2 text-xs font-bold transition"
              :class="pilihGrafik === i ? 'bg-white text-slate-800 shadow' : 'text-white/70'"
              @click="pilihGrafik = i"
            ><Icon :name="JENIS_INFO[x.j].ikon" class="size-4" :style="pilihGrafik === i ? { color: JENIS_INFO[x.j].warna } : {}" /> {{ JENIS_INFO[x.j].nama }}</button>
          </div>
          <div class="mt-4 flex items-end justify-between">
            <p class="label-kecil">{{ data[pilihHari]!.label }}</p>
            <p class="text-3xl font-extrabold leading-none">{{ fmt(data[pilihHari]!.nilai, data[pilihHari]!.mode) }}</p>
          </div>
          <div class="relative mt-3 h-40">
            <div v-if="g.garis" class="absolute inset-x-0 border-t-2 border-dashed border-rose-200/70" :style="{ bottom: `${(g.garis / skala) * 100}%` }">
              <span class="absolute -top-5 right-0 text-[10px] font-bold text-rose-100">{{ g.garisLabel }}</span>
            </div>
            <div class="absolute inset-0 flex items-end gap-2">
              <button
                v-for="(d, i) in data" :key="`${g.j}-${i}`"
                class="flex h-full flex-1 flex-col justify-end"
                :aria-label="`${d.label}: ${fmt(d.nilai, d.mode)}`" :aria-pressed="pilihHari === i"
                @click="pilihHari = i"
              >
                <span
                  class="block w-full animate-muncul rounded-full transition-all duration-700"
                  :class="g.garis && d.nilai >= g.garis ? 'bg-rose-300' : pilihHari === i ? 'bg-white' : 'bg-white/35'"
                  :style="{ height: `${Math.max(4, (d.nilai / skala) * 100)}%`, animationDelay: `${i * 50}ms` }"
                />
              </button>
            </div>
          </div>
          <div class="mt-2 flex gap-2">
            <span v-for="(d, i) in data" :key="i" class="flex-1 text-center text-[11px] font-bold" :class="pilihHari === i ? 'text-white' : 'text-white/50'">{{ d.label }}</span>
          </div>
        </section>

        <!-- temuan cek kenyamanan -->
        <section v-if="temuan.kali" class="panel-gelap">
          <div class="flex items-center justify-between">
            <h2 class="flex items-center gap-2 font-extrabold"><Icon name="ph:list-checks-duotone" class="size-5 text-sky-300" /> Temuan cek kenyamanan</h2>
            <span class="text-xs font-semibold text-white/60">{{ temuan.kali }}× cek · 7 hari</span>
          </div>
          <ul v-if="temuan.daftar.length" class="mt-2 divide-y divide-white/10">
            <li v-for="t in temuan.daftar" :key="t.c.id" class="flex items-center gap-3 py-2.5">
              <Icon :name="t.c.ikon" class="size-6 shrink-0" :class="t.c.bahaya ? 'text-red-300' : 'text-amber-300'" />
              <span class="flex-1 text-sm font-semibold">{{ t.c.judul.replace('?', '') }}</span>
              <span class="h-1.5 w-20 overflow-hidden rounded-full bg-white/15"><span class="block h-full rounded-full bg-amber-300" :style="{ width: `${(t.jml / temuan.daftar[0]!.jml) * 100}%` }" /></span>
              <span class="w-8 text-right text-sm font-extrabold">{{ t.jml }}×</span>
            </li>
          </ul>
          <p v-else class="mt-2 text-sm font-medium text-white/70">Semua cek menunjukkan aman. Tangisan mungkin tanpa sebab khusus, dan itu normal.</p>
        </section>

        <!-- kartu pola -->
        <article v-for="p in urut" :key="p.kondisi" class="overflow-hidden rounded-[28px] ring-1 transition" :class="[p.aktif ? 'bg-white text-slate-800 shadow-xl ring-white' : 'bg-white/12 ring-white/20', { 'opacity-55': !p.berlaku }]">
          <button class="flex w-full items-center gap-3 p-4 text-left" :aria-expanded="buka === p.kondisi" @click="buka = buka === p.kondisi ? null : p.kondisi">
            <span class="grid size-12 shrink-0 place-items-center rounded-full" :class="p.aktif ? '' : 'bg-white/15'" :style="p.aktif ? { background: `${TEMA[p.kondisi].accent}1f`, color: TEMA[p.kondisi].accent } : {}">
              <Icon :name="TEMA[p.kondisi].ikon" class="size-7" />
            </span>
            <span class="min-w-0 flex-1">
              <span class="block text-lg font-extrabold leading-tight">{{ TEMA[p.kondisi].label }}</span>
              <span class="block text-xs font-medium" :class="p.aktif ? 'text-slate-500' : 'text-white/65'">
                {{ !p.berlaku ? p.alasan : p.ditunda ? 'Ditandai membaik · dipantau lagi' : p.aktif ? 'Pola aktif · lihat saran' : p.kurangWajib ? 'Syarat wajib belum terpenuhi · belum aktif' : `${p.kriteria.filter((k) => k.ok).length} dari ${p.kriteria.length} kriteria` }}
              </span>
              <span class="mt-2 block h-1.5 overflow-hidden rounded-full" :class="p.aktif ? 'bg-slate-100' : 'bg-white/15'">
                <span class="block h-full rounded-full transition-all duration-1000" :style="{ width: `${p.skor * 100}%`, background: p.aktif ? TEMA[p.kondisi].accent : '#fff' }" />
              </span>
            </span>
            <span class="text-2xl font-extrabold" :style="p.aktif ? { color: TEMA[p.kondisi].accent } : {}">{{ Math.round(p.skor * 100) }}%</span>
          </button>

          <Transition name="pop">
            <div v-if="buka === p.kondisi" class="space-y-3 px-4 pb-4 text-sm">
              <ul class="space-y-1.5">
                <li v-for="k in p.kriteria" :key="k.label" class="flex items-start gap-2 font-semibold" :class="k.ok ? '' : 'opacity-50'">
                  <Icon :name="k.ok ? 'ph:check-circle-fill' : 'ph:circle-dashed-bold'" class="mt-0.5 size-4 shrink-0" :style="k.ok && p.aktif ? { color: TEMA[p.kondisi].accent } : {}" />
                  <span>{{ k.label }}<span v-if="k.wajib" class="ml-1 rounded px-1 text-[10px] font-bold uppercase" :class="p.aktif ? 'bg-slate-100 text-slate-500' : 'bg-white/15'">wajib</span></span>
                </li>
              </ul>
              <div class="rounded-2xl p-3" :class="p.aktif ? 'bg-slate-50' : 'bg-slate-950/25'">
                <p class="flex items-center gap-2 font-extrabold"><Icon name="ph:lightbulb-duotone" class="size-5 text-amber-400" /> {{ SARAN[p.kondisi].judul }}</p>
                <ol class="mt-2 space-y-1.5 font-medium">
                  <li v-for="(l, i) in SARAN[p.kondisi].langkah" :key="l" class="flex gap-2">
                    <span class="grid size-5 shrink-0 place-items-center rounded-full text-[11px] font-extrabold" :class="p.aktif ? 'text-white' : 'bg-white text-slate-800'" :style="p.aktif ? { background: TEMA[p.kondisi].accent } : {}">{{ i + 1 }}</span>{{ l }}
                  </li>
                </ol>
              </div>
              <p class="flex items-start gap-2 rounded-2xl p-3 font-semibold" :class="p.aktif ? 'bg-red-50 text-red-800' : 'bg-red-500/25'">
                <Icon name="ph:hospital-duotone" class="size-5 shrink-0" /> <span><b>Ke dokter:</b> {{ SARAN[p.kondisi].keDokter }}</span>
              </p>
              <div class="text-xs font-medium" :class="p.aktif ? 'text-slate-500' : 'text-white/65'">
                <p class="mb-1 flex items-center gap-1 font-bold"><Icon name="ph:books-duotone" class="size-4" /> Sumber</p>
                <p v-for="s in SARAN[p.kondisi].sumber" :key="s">• {{ s }}</p>
              </div>
              <button v-if="p.aktif" class="flex w-full items-center justify-center gap-2 rounded-full bg-emerald-500 py-3 font-bold text-white shadow-lg active:scale-95" @click="membaik(p.kondisi)">
                <Icon name="ph:hand-heart-duotone" class="size-5" /> Sudah membaik
              </button>
            </div>
          </Transition>
        </article>
      </div>
    </ion-content>
  </ion-page>
</template>
