// konversi ms <-> nilai <input type="datetime-local"> (zona waktu lokal)
export const keInput = (ms: number) => {
  if (!Number.isFinite(ms)) return '' // tanggal tidak valid → kolom kosong, bukan RangeError
  const d = new Date(ms)
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 16)
}
export const dariInput = (s: string) => new Date(s).getTime()

export const formatDurasi = (menit: number) =>
  menit < 60 ? `${Math.round(menit)} mnt` : `${Math.floor(menit / 60)} j ${Math.round(menit % 60)} mnt`

// "12:05" / "1:02:09" untuk timer yang sedang jalan
export const formatStopwatch = (ms: number) => {
  const s = Math.max(0, Math.floor(ms / 1000))
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), d = s % 60
  const dua = (n: number) => String(n).padStart(2, '0')
  return h ? `${h}:${dua(m)}:${dua(d)}` : `${dua(m)}:${dua(d)}`
}

export const formatLalu = (ms: number, now = Date.now()) => {
  const m = Math.floor((now - ms) / 60_000)
  if (m < 1) return 'baru saja'
  if (m < 60) return `${m} mnt lalu`
  const j = Math.floor(m / 60)
  return j < 24 ? `${j} jam lalu` : `${Math.floor(j / 24)} hari lalu`
}

// usia dari tanggal lahir "YYYY-MM-DD"; null bila tanggal di masa depan
export const hitungUsia = (lahir: string, now = Date.now()) => {
  const [y, mo, d] = lahir.split('-').map(Number)
  const hari = Math.floor((now - new Date(y!, mo! - 1, d!).getTime()) / 864e5)
  if (Number.isNaN(hari) || hari < 0) return null
  const teks =
    hari < 14 ? `${hari} hari`
    : hari < 91 ? `${Math.floor(hari / 7)} minggu`
    : hari < 365 ? `${Math.floor(hari / 30.44)} bulan`
    : `${Math.floor(hari / 365)} tahun${hari % 365 >= 7 ? ` ${Math.floor((hari % 365) / 7)} minggu` : ''}`
  return { hari, teks }
}
