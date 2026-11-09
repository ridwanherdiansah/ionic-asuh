<script setup lang="ts">
import { JENIS_INFO, POPOK, ringkasGejala, ringkasAsupan } from '~/data/konten'
import type { Jenis, Log } from '~/composables/useAsuh'

const { state, durasiMenit, ringkasHari, fitur } = useAsuh()
const { sheet, aksi, tambah } = useUi()
const filter = ref<Jenis | null>(null)
// chip makan/air baru muncul setelah usia 6 bulan (atau bila sudah ada catatannya)
const JENIS_TAMPIL = computed(() =>
  Object.fromEntries(Object.entries(JENIS_INFO).filter(([k]) => !['makan', 'air'].includes(k) || fitur.value.makan || state.logs.some((l) => l.jenis === k))),
)

const perHari = computed(() => {
  const m = new Map<string, { judul: string; logs: Log[] }>()
  const logs = state.logs.filter((l) => !filter.value || l.jenis === filter.value).sort((a, b) => b.mulai - a.mulai)
  const hariIni = new Date().toDateString()
  const kemarin = new Date(Date.now() - 864e5).toDateString()
  for (const l of logs) {
    const k = new Date(l.mulai).toDateString()
    const judul = k === hariIni ? 'Hari ini' : k === kemarin ? 'Kemarin' : new Date(l.mulai).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })
    if (!m.has(k)) m.set(k, { judul, logs: [] })
    m.get(k)!.logs.push(l)
  }
  return [...m.entries()].map(([k, v]) => ({ key: k, ...v, r: ringkasHari(k) }))
})

const jam = (t: number) => new Date(t).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
const bahaya = (l: Log) => !!l.data?.flags?.length
const singkat = (menit: number) => formatDurasi(menit).replace(' mnt', 'm').replace(' j ', 'j ')
const detail = (l: Log) => {
  if (l.jenis === 'popok') return POPOK.find((p) => p.id === l.data?.tipe)?.nama ?? ''
  if (l.jenis === 'gejala') return ringkasGejala(l.data)
  if (l.jenis === 'makan' || l.jenis === 'air') return ringkasAsupan(l.jenis, l.data)
  const d = formatDurasi(durasiMenit(l))
  return l.jenis === 'minum' ? [ringkasAsupan('minum', l.data), d, l.data?.sendawa ? 'sendawa' : 'belum sendawa'].filter(Boolean).join(' · ') : d
}
</script>

<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <div class="mx-auto max-w-md space-y-4 px-4 pb-36 pt-[calc(env(safe-area-inset-top)+16px)] text-white">
        <PageHead judul="Riwayat" :sub="`${state.logs.length} catatan tersimpan`" ikon="ph:notebook-duotone">
          <button class="grid size-11 place-items-center rounded-full bg-white/15 ring-1 ring-white/25 active:scale-90" aria-label="Catat manual" @click="sheet = {}">
            <Icon name="ph:clock-counter-clockwise-duotone" class="size-6" />
          </button>
        </PageHead>

        <!-- filter -->
        <div class="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
          <button class="chip shrink-0 ring-1" :class="!filter ? 'bg-white text-slate-800 ring-white' : 'bg-white/12 text-white ring-white/20'" @click="filter = null">
            <Icon name="ph:list-bullets-bold" class="size-4" /> Semua
          </button>
          <button
            v-for="(v, k) in JENIS_TAMPIL" :key="k"
            class="chip shrink-0 ring-1"
            :class="filter === k ? 'bg-white text-slate-800 ring-white' : 'bg-white/12 text-white ring-white/20'"
            :aria-pressed="filter === k"
            @click="filter = filter === k ? null : (k as Jenis)"
          ><Icon :name="v.ikon" class="size-4" :style="filter === k ? { color: v.warna } : {}" /> {{ v.nama }}</button>
        </div>

        <!-- kosong -->
        <div v-if="!perHari.length" class="kaca animate-muncul py-10 text-center">
          <Icon name="ph:notebook-duotone" class="mx-auto size-16 text-white/50" />
          <p class="mt-2 font-extrabold">{{ filter ? 'Belum ada catatan jenis ini' : 'Belum ada catatan' }}</p>
          <p class="text-sm font-medium text-white/60">Ketuk tombol + untuk mulai mencatat</p>
          <button class="mx-auto mt-4 flex items-center gap-2 rounded-full bg-white px-5 py-3 font-bold text-slate-800 active:scale-95" @click="tambah = true">
            <Icon name="ph:plus-bold" class="size-5" /> Catat sekarang
          </button>
        </div>

        <section v-for="(h, i) in perHari" :key="h.key" class="panel-gelap animate-muncul" :style="{ animationDelay: `${Math.min(i, 5) * 60}ms` }">
          <h2 class="flex items-center gap-2 font-extrabold capitalize"><Icon name="ph:calendar-dots-duotone" class="size-5 text-white/60" /> {{ h.judul }}</h2>
          <div class="mt-3 grid grid-cols-4 gap-2">
            <div v-for="s in [
              { j: 'minum', v: h.r.ml ? `${h.r.minum}× · ${h.r.ml}ml` : `${h.r.minum}×` },
              { j: 'tidur', v: singkat(h.r.tidurMenit) },
              { j: 'popok', v: `${h.r.basah + h.r.bab}×` },
              { j: 'nangis', v: `${Math.round(h.r.nangisMenit)}m` },
              ...(h.r.makan ? [{ j: 'makan', v: `${h.r.makan}× · ${h.r.makanSdm}sdm` }] : []),
              ...(h.r.airMl ? [{ j: 'air', v: `${h.r.airMl}ml` }] : []),
            ] as const" :key="s.j" class="flex flex-col items-center gap-0.5 rounded-2xl bg-white/8 py-2">
              <Icon :name="JENIS_INFO[s.j].ikon" class="size-5" :style="{ color: JENIS_INFO[s.j].warna }" />
              <span class="text-xs font-extrabold">{{ s.v }}</span>
            </div>
          </div>

          <TransitionGroup tag="ul" name="daftar" class="mt-2 divide-y divide-white/10">
            <li v-for="l in h.logs" :key="l.id" class="flex items-center gap-1">
              <button class="flex min-w-0 flex-1 items-center gap-3 py-3 text-left active:opacity-70" :aria-label="`Ubah ${JENIS_INFO[l.jenis].nama} ${jam(l.mulai)}`" @click="sheet = { log: l }">
                <span class="w-12 shrink-0 text-sm font-semibold text-white/60">{{ jam(l.mulai) }}</span>
                <span class="grid size-9 shrink-0 place-items-center rounded-full" :class="bahaya(l) ? 'bg-red-500' : 'bg-white/10'">
                  <Icon :name="bahaya(l) ? 'ph:siren-duotone' : JENIS_INFO[l.jenis].ikon" class="size-5" :style="bahaya(l) ? {} : { color: JENIS_INFO[l.jenis].warna }" />
                </span>
                <span class="min-w-0 flex-1">
                  <span class="block text-sm font-bold">{{ bahaya(l) ? 'Tanda bahaya' : l.data?.cek ? 'Cek kenyamanan' : JENIS_INFO[l.jenis].nama }}</span>
                  <span class="block truncate text-xs font-medium text-white/60">{{ detail(l) }}</span>
                </span>
              </button>
              <button class="grid size-9 shrink-0 place-items-center rounded-full text-white/40 transition hover:bg-white/10 hover:text-rose-300 active:scale-90" :aria-label="`Hapus ${JENIS_INFO[l.jenis].nama} ${jam(l.mulai)}`" @click="aksi.hapus(l.id)">
                <Icon name="ph:trash-duotone" class="size-5" />
              </button>
            </li>
          </TransitionGroup>
        </section>
      </div>
    </ion-content>
  </ion-page>
</template>
