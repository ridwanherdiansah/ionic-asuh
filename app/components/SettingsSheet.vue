<script setup lang="ts">
const emit = defineEmits<{ tutup: [] }>()
const { state, setProfil, ekspor, impor, resetSemua } = useAsuh()
const { umpan } = useUi()

const nama = ref(state.profil?.nama ?? '')
const lahir = ref(state.profil?.lahir ?? '')
const hariIni = keInput(Date.now()).slice(0, 10)
const usia = computed(() => (lahir.value ? hitungUsia(lahir.value) : null))
const galat = computed(() => {
  if (!nama.value.trim()) return 'Nama tidak boleh kosong'
  if (!usia.value) return 'Tanggal lahir tidak valid'
  if (usia.value.hari >= 365) return `Asuh untuk bayi 0–12 bulan (usia ${usia.value.teks})`
  return ''
})
const berubah = computed(() => nama.value.trim() !== state.profil?.nama || lahir.value !== state.profil?.lahir)
const simpanProfil = () => {
  if (galat.value) return
  setProfil(nama.value.trim(), lahir.value)
  umpan({ pesan: 'Profil disimpan', ikon: 'ph:user-circle-check-duotone' })
}

const cadangkan = async () => {
  const nm = `asuh-cadangan-${hariIni}.json`
  const file = new File([ekspor()], nm, { type: 'application/json' })
  try {
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], title: 'Cadangan Asuh' })
      return
    }
  } catch { return } // dibatalkan pengguna
  const a = document.createElement('a')
  a.href = URL.createObjectURL(file)
  a.download = nm
  a.click()
  URL.revokeObjectURL(a.href)
  umpan({ pesan: 'File cadangan diunduh', ikon: 'ph:download-simple-duotone' })
}

const inputFile = ref<HTMLInputElement>()
const pulihkan = async (ev: Event) => {
  const f = (ev.target as HTMLInputElement).files?.[0]
  if (!f) return
  if (!confirm('Data sekarang akan DIGANTI dengan isi file cadangan. Lanjutkan?')) return
  try {
    const n = impor(await f.text())
    nama.value = state.profil?.nama ?? ''
    lahir.value = state.profil?.lahir ?? ''
    umpan({ pesan: `${n} catatan dipulihkan`, ikon: 'ph:upload-simple-duotone' })
  } catch (e: any) {
    alert(`Gagal memulihkan: ${e?.message ?? 'file rusak'}`)
  } finally {
    if (inputFile.value) inputFile.value.value = ''
  }
}

const hapusSemua = () => {
  if (!confirm(`Hapus SEMUA data ${state.profil?.nama ?? ''} (${state.logs.length} catatan)? Tidak bisa dibatalkan. Sebaiknya cadangkan dulu.`)) return
  resetSemua()
  emit('tutup')
}
</script>

<template>
  <ion-content>
    <div class="space-y-4 p-5 pb-12">
      <div class="flex items-center justify-between">
        <h2 class="flex items-center gap-2 text-2xl font-black text-slate-800"><Icon name="ph:gear-six-duotone" class="size-7 text-slate-500" /> Pengaturan</h2>
        <button class="grid size-10 place-items-center rounded-full bg-slate-200/70 active:scale-90" aria-label="Tutup" @click="emit('tutup')">
          <Icon name="ph:x-bold" class="size-5" />
        </button>
      </div>

      <!-- profil -->
      <section class="card space-y-3">
        <h3 class="judul-kartu"><Icon name="ph:baby-duotone" class="size-5 text-rose-500" /> Profil si kecil</h3>
        <label class="block">
          <span class="text-xs font-black uppercase tracking-wide text-slate-500">Nama panggilan</span>
          <input v-model="nama" maxlength="30" class="input mt-1" />
        </label>
        <label class="block">
          <span class="text-xs font-black uppercase tracking-wide text-slate-500">Tanggal lahir</span>
          <input v-model="lahir" type="date" :max="hariIni" class="input mt-1" />
        </label>
        <p v-if="galat" class="flex items-center gap-2 rounded-2xl bg-rose-50 p-3 text-sm font-bold text-rose-700" role="alert">
          <Icon name="ph:warning-circle-duotone" class="size-5 shrink-0" /> {{ galat }}
        </p>
        <p v-else-if="usia" class="flex items-center gap-2 text-sm font-bold text-emerald-700"><Icon name="ph:cake-duotone" class="size-5" /> Usia {{ usia.teks }}</p>
        <button class="btn-utama w-full" :disabled="!!galat || !berubah" @click="simpanProfil">
          <Icon name="ph:floppy-disk-duotone" class="size-5" /> Simpan profil
        </button>
      </section>

      <!-- data -->
      <section class="card space-y-3">
        <h3 class="judul-kartu"><Icon name="ph:database-duotone" class="size-5 text-sky-500" /> Data</h3>
        <p class="text-sm font-semibold text-slate-600">
          {{ state.logs.length }} catatan tersimpan <b>hanya di HP ini</b>. Cadangkan rutin supaya tidak hilang saat ganti HP atau hapus data browser.
        </p>
        <div class="grid grid-cols-2 gap-2">
          <button class="btn bg-sky-50 text-sky-700" @click="cadangkan"><Icon name="ph:download-simple-duotone" class="size-5" /> Cadangkan</button>
          <button class="btn bg-emerald-50 text-emerald-700" @click="inputFile?.click()"><Icon name="ph:upload-simple-duotone" class="size-5" /> Pulihkan</button>
        </div>
        <input ref="inputFile" type="file" accept="application/json,.json" class="hidden" @change="pulihkan" />
        <button class="btn w-full bg-rose-50 text-rose-600" @click="hapusSemua"><Icon name="ph:trash-duotone" class="size-5" /> Hapus semua data</button>
      </section>

      <!-- tentang -->
      <section class="card space-y-2 text-sm font-semibold text-slate-600">
        <h3 class="judul-kartu"><Icon name="ph:info-duotone" class="size-5 text-violet-500" /> Tentang Asuh</h3>
        <p>Asuh membantu mencatat dan memberi edukasi untuk bayi 0–12 bulan. <b>Bukan pengganti dokter.</b> Persentase pola = kriteria pedoman yang terpenuhi, bukan kemungkinan penyakit.</p>
        <p class="flex items-center gap-2 rounded-2xl bg-amber-50 p-3 text-amber-800"><Icon name="ph:flask-duotone" class="size-5 shrink-0" /> Versi draf: angka acuan masih menunggu review dokter anak.</p>
      </section>
    </div>
  </ion-content>
</template>
