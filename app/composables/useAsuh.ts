import { ambang, targetMinum, FITUR_USIA, TEMA, USIA_MPASI, USIA_UHT, type Kondisi, type KondisiPola, type Tema } from '~/data/konten'

export type Jenis = 'minum' | 'tidur' | 'popok' | 'nangis' | 'gejala' | 'makan' | 'air'
export type Timer = 'minum' | 'tidur' | 'nangis'
export type Log = { id: string; jenis: Jenis; mulai: number; selesai?: number; data?: Record<string, any> }
type State = {
  profil: { nama: string; lahir: string } | null
  logs: Log[]
  aktif: Partial<Record<Timer, number>>
  daruratSelesai: number
  reset: Partial<Record<KondisiPola, number>> // kapan orang tua menekan "Sudah membaik"
  diumumkan: string[] // kartu fitur-baru-per-usia yang sudah ditutup
}

const KUNCI = 'asuh:v1'
const MENIT = 60_000
const JAM = 60 * MENIT
const HARI = 24 * JAM
export const AMBANG_POLA = 0.6
const JENIS_VALID: Jenis[] = ['minum', 'tidur', 'popok', 'nangis', 'gejala', 'makan', 'air']

const kosong = (): State => ({ profil: null, logs: [], aktif: {}, daruratSelesai: 0, reset: {}, diumumkan: [] })

// shortcut: localStorage cukup untuk MVP di WebView; ganti ke Capacitor Preferences/SQLite saat build Android.
function muat(): State {
  try {
    const s = JSON.parse(localStorage.getItem(KUNCI) || '')
    if (s && Array.isArray(s.logs)) return { ...kosong(), ...s }
  } catch {}
  return kosong()
}

const state = reactive<State>(muat())
watch(state, (s) => {
  try { localStorage.setItem(KUNCI, JSON.stringify(s)) } catch {}
}, { deep: true })

const now = ref(Date.now())
setInterval(() => (now.value = Date.now()), 30_000)

const clamp = (x: number) => Math.max(0, Math.min(1, x))
const durasiMenit = (l: Log) => ((l.selesai ?? now.value) - l.mulai) / MENIT
const terakhir = (j: Jenis) => state.logs.filter((l) => l.jenis === j).sort((a, b) => b.mulai - a.mulai)[0]
const dalam = (j: Jenis, ms: number) => state.logs.filter((l) => l.jenis === j && l.mulai >= now.value - ms)
const lahirMs = (lahir: string) => {
  const [y, m, d] = lahir.split('-').map(Number)
  return new Date(y!, m! - 1, d!).getTime()
}

// gabungkan warna semua pola aktif jadi satu gradasi latar
function buatTema(daftar: Tema[]) {
  const t = daftar[0]!
  const warna = daftar.length === 1 ? t.warna : [t.warna[0], ...daftar.map((x) => x.warna[1]), daftar.at(-1)!.warna[2]]
  const stop = warna.map((c, i) => `${c} ${Math.round((i / (warna.length - 1)) * 100)}%`).join(', ')
  return {
    ...t,
    bg: `radial-gradient(90% 45% at 50% 18%, rgba(255,255,255,.28), transparent 70%), linear-gradient(175deg, ${stop})`,
  }
}

type Kriteria = { label: string; ok: boolean; wajib?: boolean }
// tundaJam: lama pola diistirahatkan setelah "Sudah membaik" (pola berbasis riwayat panjang butuh jeda lebih lama)
type PolaDef = { kondisi: KondisiPola; berlaku: boolean; alasan?: string; tundaJam?: number; kriteria: Kriteria[] }

export function useAsuh() {
  const usiaMinggu = computed(() =>
    state.profil ? Math.max(0, Math.floor((now.value - lahirMs(state.profil.lahir)) / (7 * HARI))) : 0,
  )
  const batas = computed(() => ambang(usiaMinggu.value))
  // fitur yang terbuka sesuai usia
  const fitur = computed(() => ({ makan: usiaMinggu.value >= USIA_MPASI, air: usiaMinggu.value >= USIA_MPASI, uht: usiaMinggu.value >= USIA_UHT }))
  const pengumuman = computed(() => FITUR_USIA.find((f) => usiaMinggu.value >= f.minggu && !state.diumumkan.includes(f.id)) ?? null)

  // log yang sedang berjalan ikut dihitung (selesai = sekarang)
  const denganAktif = (j: Timer) => [
    ...state.logs.filter((l) => l.jenis === j),
    ...(state.aktif[j] ? [{ id: 'aktif', jenis: j, mulai: state.aktif[j]! } as Log] : []),
  ]

  const perHari = (j: Timer, mode: 'menit' | 'jumlah') => {
    const m: Record<string, number> = {}
    for (const l of denganAktif(j)) {
      if (l.mulai < now.value - 7 * HARI) continue
      const k = new Date(l.mulai).toDateString()
      m[k] = (m[k] ?? 0) + (mode === 'menit' ? durasiMenit(l) : 1)
    }
    return m
  }
  const nangisPerHari = computed(() => perHari('nangis', 'menit'))
  const nangisHariIni = computed(() => nangisPerHari.value[new Date(now.value).toDateString()] ?? 0)

  // grafik 7 hari: menit (nangis/tidur) atau jumlah (minum)
  const seri7 = (j: Timer) => {
    const mode = j === 'minum' ? 'jumlah' : 'menit'
    const m = perHari(j, mode)
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now.value - (6 - i) * HARI)
      return { label: d.toLocaleDateString('id-ID', { weekday: 'short' }), nilai: m[d.toDateString()] ?? 0, mode }
    })
  }

  // gejala dalam 24 jam, hanya yang dicatat setelah "Sudah membaik" untuk pola itu
  const gejalaUntuk = (k: KondisiPola) => {
    const sejak = Math.max(now.value - HARI, state.reset[k] ?? 0)
    return new Set(state.logs.filter((l) => l.jenis === 'gejala' && l.mulai > sejak).flatMap((l) => l.data?.gejala ?? []))
  }

  const redFlag = computed<string[]>(() => {
    const l = state.logs
      .filter((x) => x.jenis === 'gejala' && x.data?.flags?.length && x.mulai > now.value - 12 * JAM && x.mulai > state.daruratSelesai)
      .sort((a, b) => b.mulai - a.mulai)[0]
    return l?.data?.flags ?? []
  })

  // lama bangun sejak tidur terakhir; tidur < 10 menit (atau timer yang tak sengaja ditekan) tidak dianggap istirahat
  const menitBangun = computed(() => {
    if (state.aktif.tidur && now.value - state.aktif.tidur >= 10 * MENIT) return 0
    const t = state.logs
      .filter((l) => l.jenis === 'tidur' && l.selesai && l.selesai - l.mulai >= 10 * MENIT)
      .sort((a, b) => b.selesai! - a.selesai!)[0]
    return t ? (now.value - t.selesai!) / MENIT : null
  })

  // hitungan harian hanya adil bila app sudah dipakai >24 jam DAN ada cukup catatan hari ini
  const cukupData = computed(
    () => state.logs.some((l) => l.mulai < now.value - HARI) && state.logs.filter((l) => l.mulai >= now.value - HARI).length >= 3,
  )

  const pola = computed(() => {
    const b = batas.value
    const minum24 = dalam('minum', HARI)
    const tidur24 = dalam('tidur', HARI)
    const basah24 = dalam('popok', HARI).filter((l) => l.data?.tipe !== 'bab').length
    const tanpaSendawa = minum24.filter((l) => l.data?.sendawa === false).length
    const nangis7 = denganAktif('nangis').filter((l) => l.mulai > now.value - 7 * HARI)
    const nangisSore = nangis7.filter((l) => new Date(l.mulai).getHours() >= 16)
    const lewatJendela = menitBangun.value !== null && menitBangun.value > b.jendelaBangunMenit
    const tm = terakhir('minum')
    const jedaMinumJam = state.aktif.minum ? 0 : tm ? (now.value - (tm.selesai ?? tm.mulai)) / JAM : null
    const tt = terakhir('tidur')
    const tidurLama =
      (state.aktif.tidur && (now.value - state.aktif.tidur) / JAM > b.maksTidurJam) ||
      (!!tt?.selesai && now.value - tt.selesai < 2 * JAM && durasiMenit(tt) / 60 > b.maksTidurJam)
    const cd = cukupData.value
    const kurangData = cd ? '' : ' (data belum cukup)'
    // jenis yang tidak pernah dicatat jangan dianggap "kurang" (orang tua mungkin memang tidak mencatatnya)
    const dicatat = (j: Jenis) => state.logs.some((l) => l.jenis === j && l.mulai >= now.value - 2 * HARI)
    const adaPopok = dicatat('popok'), adaMinum = dicatat('minum')
    const adaTidur = tidur24.length > 0 || !!state.aktif.tidur
    // tidur panjang (malam) wajar untuk bayi >= 4 minggu; bayi lebih kecil ditangani pola kelebihanTidur
    const jedaBerarti = jedaMinumJam !== null && !(state.aktif.tidur && usiaMinggu.value >= 4)

    const daftar: PolaDef[] = [
      {
        kondisi: 'kelebihanTidur', berlaku: usiaMinggu.value < 4, alasan: 'Hanya untuk bayi < 4 minggu',
        kriteria: [
          { label: `Tidur lebih dari ${b.maksTidurJam} jam tanpa bangun`, ok: !!tidurLama, wajib: true },
          { label: `Belum menyusu lebih dari ${b.maksTidurJam} jam`, ok: jedaMinumJam === null ? !!tidurLama : jedaMinumJam > b.maksTidurJam },
        ],
      },
      {
        kondisi: 'kurangAsupan', berlaku: true,
        kriteria: [
          { label: `Popok basah 24 jam < ${b.minPopokBasah} (${basah24})${adaPopok ? kurangData : ' (popok belum dicatat)'}`, ok: cd && adaPopok && basah24 < b.minPopokBasah },
          { label: `Menyusu 24 jam < ${b.minMinum}× (${minum24.length}×)${adaMinum ? kurangData : ' (menyusu belum dicatat)'}`, ok: cd && adaMinum && minum24.length < b.minMinum },
          { label: `Jeda menyusu > ${b.maksJedaMinumJam * 1.5} jam saat bangun`, ok: jedaBerarti && jedaMinumJam! > b.maksJedaMinumJam * 1.5 },
        ],
      },
      {
        kondisi: 'kolik', berlaku: usiaMinggu.value < 20, alasan: 'Kolik umumnya hanya < 5 bulan', tundaJam: 24,
        kriteria: [
          { label: 'Menangis ≥ 3 jam/hari, ≥ 3 hari dalam seminggu', ok: Object.values(nangisPerHari.value).filter((m) => m >= 180).length >= 3, wajib: true },
          { label: 'Tangisan lebih banyak sore–malam', ok: nangis7.length >= 3 && nangisSore.length / nangis7.length >= 0.5 },
          { label: 'Menangis lama tanpa sebab jelas', ok: gejalaUntuk('kolik').has('nangisTanpaSebab') },
        ],
      },
      {
        kondisi: 'kembung', berlaku: true,
        kriteria: (() => {
          const g = gejalaUntuk('kembung')
          return [
            { label: 'Perut keras / tampak kembung', ok: g.has('perutKeras') },
            { label: 'Kaki ditekuk ke perut', ok: g.has('kakiTekuk') },
            { label: 'Sering kentut / mengejan', ok: g.has('kentut') },
            { label: 'Rewel setelah menyusu', ok: g.has('rewelSetelahMinum') },
            { label: 'Sering tidak sendawa setelah menyusu', ok: minum24.length >= 2 && tanpaSendawa / minum24.length >= 0.5 },
          ]
        })(),
      },
      {
        kondisi: 'overstimulasi', berlaku: true,
        kriteria: (() => {
          const g = gejalaUntuk('overstimulasi')
          return [
            { label: 'Memalingkan muka / menghindari tatapan', ok: g.has('palingMuka') },
            { label: 'Tangan mengepal / punggung melengkung', ok: g.has('tanganKepal') },
            { label: 'Habis suasana ramai', ok: g.has('ramai') },
            { label: `Bangun lebih dari ${b.jendelaBangunMenit} menit`, ok: lewatJendela },
          ]
        })(),
      },
      {
        kondisi: 'kurangTidur', berlaku: true, tundaJam: 6,
        kriteria: [
          { label: `Total tidur 24 jam < ${b.minTidurJam} jam${adaTidur ? kurangData : ' (tidur belum dicatat)'}`, ok: cd && adaTidur && tidur24.reduce((s, l) => s + durasiMenit(l), 0) < b.minTidurJam * 60 },
          { label: `Bangun lebih dari ${b.jendelaBangunMenit} menit`, ok: lewatJendela },
          { label: 'Banyak menangis hari ini (> 1 jam)', ok: nangisHariIni.value > 60 },
        ],
      },
    ]

    return daftar.map((p) => {
      const skor = p.berlaku ? p.kriteria.filter((k) => k.ok).length / p.kriteria.length : 0
      const r = state.reset[p.kondisi] ?? 0
      // setelah "Sudah membaik", pola istirahat (default 1 jam) kecuali ada gejala/tanda bahaya BARU
      const gejalaBaru = state.logs.some((l) => l.jenis === 'gejala' && l.mulai > r && (l.data?.gejala?.length || l.data?.flags?.length))
      const ditunda = r > 0 && now.value < r + (p.tundaJam ?? 1) * JAM && !gejalaBaru
      const wajibOk = p.kriteria.every((k) => !k.wajib || k.ok)
      const aktif = p.berlaku && !ditunda && skor >= AMBANG_POLA && wajibOk
      // persen sudah tinggi tapi syarat wajib belum terpenuhi → jelaskan di UI
      const kurangWajib = p.berlaku && !ditunda && skor >= AMBANG_POLA && !wajibOk
      return { ...p, skor, aktif, ditunda, kurangWajib }
    })
  })

  const polaAktif = computed(() => pola.value.filter((p) => p.aktif).sort((a, b) => b.skor - a.skor))
  const kondisi = computed<Kondisi>(() => (redFlag.value.length ? 'darurat' : polaAktif.value[0]?.kondisi ?? 'normal'))
  const tema = computed(() =>
    kondisi.value === 'darurat' ? buatTema([TEMA.darurat])
    : polaAktif.value.length ? buatTema(polaAktif.value.map((p) => TEMA[p.kondisi]))
    : buatTema([TEMA.normal]),
  )

  // Level "isi ulang" seperti baterai: naik bertahap selama aktivitas (menyusu/tidur), turun selama jeda.
  // Dihitung maju dari riwayat 3 hari, jadi tidur/menyusu sebentar hanya menambah sedikit (bukan langsung 100%).
  // isi(l): porsi tetap (0..1) untuk catatan yang terukur (ml botol, makan); undefined = pakai durasi
  const levelIsiUlang = (j: Timer, isiPenuhMenit: number, habisMenit: number, isi?: (l: Log) => number | undefined, ikut: Jenis[] = []): number | null => {
    const riwayat = state.logs
      .filter((l) => ((l.jenis === j && l.selesai) || ikut.includes(l.jenis)) && l.mulai > now.value - 3 * HARI)
      .sort((a, b) => a.mulai - b.mulai)
    let level: number | null = null
    let tAkhir = 0
    const kuras = (t: number) => (level === null ? 0.5 : clamp(level - Math.max(0, t - tAkhir) / MENIT / habisMenit)) // tanpa riwayat: anggap setengah
    for (const l of riwayat) {
      const akhir = l.selesai ?? l.mulai
      level = clamp(kuras(l.mulai) + (isi?.(l) ?? (akhir - l.mulai) / MENIT / isiPenuhMenit))
      tAkhir = Math.max(tAkhir, akhir)
    }
    const aktif = state.aktif[j]
    if (aktif) return clamp(kuras(aktif) + (now.value - aktif) / MENIT / isiPenuhMenit)
    return level === null ? null : kuras(now.value)
  }

  const isiKenyang = (l: Log) => {
    if (l.jenis === 'makan') return ({ menolak: 0.05, sedikit: 0.3, alergi: 0.1 } as Record<string, number>)[l.data?.reaksi] ?? 0.6
    if (l.data?.cara === 'botol' && l.data?.ml) return l.data.ml / targetMinum(usiaMinggu.value).max
    return undefined
  }
  const bar = computed(() => {
    const b = batas.value
    const tp = terakhir('popok')
    const jamSejak = (t: number) => (now.value - t) / JAM
    return {
      kenyang: levelIsiUlang('minum', 15, b.maksJedaMinumJam * 60, isiKenyang, ['makan']),
      energi: levelIsiUlang('tidur', Math.min(b.jendelaBangunMenit, 120), b.jendelaBangunMenit),
      popok: tp ? clamp(1 - jamSejak(tp.mulai) / 3) : null,
      mood: state.logs.length || state.aktif.nangis ? clamp(1 - nangisHariIni.value / 180) : null,
    }
  })

  const ekspresi = computed(() => {
    if (kondisi.value === 'darurat') return 'darurat'
    if (state.aktif.nangis) return 'nangis'
    if (state.aktif.tidur) return 'tidur'
    if (state.aktif.minum) return 'minum'
    const m: Partial<Record<Kondisi, string>> = { kolik: 'nangis', kembung: 'kembung', overstimulasi: 'pusing', kurangTidur: 'ngantuk', kurangAsupan: 'sedih', kelebihanTidur: 'tidur' }
    if (m[kondisi.value]) return m[kondisi.value]!
    const v = Object.values(bar.value).filter((x): x is number => x !== null)
    return v.some((x) => x < 0.25) ? 'sedih' : 'senang'
  })

  const pesanAvatar = computed(() => {
    const p: Record<Kondisi, string> = {
      darurat: 'Aku butuh dokter sekarang!',
      kelebihanTidur: 'Aku sudah bobo lama… bangunkan aku untuk menyusu ya',
      kolik: 'Perutku nggak nyaman… gendong & shh-shh ya',
      kembung: 'Perutku begah, sendawain aku ya',
      overstimulasi: 'Terlalu ramai… ajak aku ke tempat tenang',
      kurangTidur: 'Mataku berat, aku ngantuk',
      kurangAsupan: 'Aku perlu menyusu lebih sering',
      normal: '',
    }
    if (kondisi.value === 'darurat' || kondisi.value === 'kelebihanTidur') return p[kondisi.value]
    if (state.aktif.tidur) return 'Zzz… sstt, aku lagi bobo'
    if (state.aktif.nangis) return 'Huaa… peluk aku dong'
    if (state.aktif.minum) return 'Nyam nyam… enak!'
    if (p[kondisi.value]) return p[kondisi.value]
    const b = bar.value
    if (b.kenyang !== null && b.kenyang < 0.25) return 'Kayaknya aku mulai lapar'
    if (b.popok !== null && b.popok < 0.25) return 'Popokku perlu dicek'
    if (b.energi !== null && b.energi < 0.25) return 'Aku mulai capek…'
    if (!state.logs.length) return 'Halo! Yuk catat kegiatanku hari ini'
    return 'Aku senang! Makasih sudah merawatku'
  })

  const ringkasHari = (key: string) => {
    const hari = state.logs.filter((l) => new Date(l.mulai).toDateString() === key)
    const menit = (j: Jenis) => hari.filter((l) => l.jenis === j).reduce((s, l) => s + durasiMenit(l), 0)
    return {
      minum: hari.filter((l) => l.jenis === 'minum').length,
      tidurMenit: menit('tidur'),
      basah: hari.filter((l) => l.jenis === 'popok' && l.data?.tipe !== 'bab').length,
      bab: hari.filter((l) => l.jenis === 'popok' && l.data?.tipe !== 'basah').length,
      nangisMenit: menit('nangis'),
      gejala: hari.filter((l) => l.jenis === 'gejala').length,
      ml: hari.reduce((s, l) => s + (l.jenis === 'minum' && l.data?.cara === 'botol' ? Number(l.data.ml) || 0 : 0), 0),
      makan: hari.filter((l) => l.jenis === 'makan').length,
      makanSdm: hari.reduce((s, l) => s + (l.jenis === 'makan' ? Number(l.data?.porsi) || 0 : 0), 0),
      airMl: hari.reduce((s, l) => s + (l.jenis === 'air' ? Number(l.data?.ml) || 0 : 0), 0),
    }
  }

  // --- aksi ---
  const id = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
  const mulai = (j: Timer, ms = Date.now()) => { state.aktif[j] = ms }
  const selesai = (j: Timer, data?: Log['data']) => {
    const m = state.aktif[j]
    if (!m) return
    const log: Log = { id: id(), jenis: j, mulai: m, selesai: Date.now(), data }
    state.logs.push(log)
    delete state.aktif[j]
    return log
  }
  const catat = (jenis: Jenis, data?: Log['data'], mulai = Date.now()) => {
    const log: Log = { id: id(), jenis, mulai, data }
    state.logs.push(log)
    return log
  }
  const simpanManual = (log: Omit<Log, 'id'> & { id?: string }) => {
    const i = log.id ? state.logs.findIndex((l) => l.id === log.id) : -1
    if (i >= 0) state.logs[i] = { ...log, id: log.id! }
    else state.logs.push({ ...log, id: id() })
  }
  const hapus = (lid: string) => {
    const log = state.logs.find((l) => l.id === lid)
    state.logs = state.logs.filter((l) => l.id !== lid)
    return log
  }

  const ekspor = () => JSON.stringify({ app: 'asuh', versi: 1, diekspor: new Date().toISOString(), data: state }, null, 2)
  // validasi file cadangan sebelum menimpa data
  const impor = (teks: string) => {
    const j = JSON.parse(teks)
    const d = j?.data
    if (j?.app !== 'asuh' || !d || !Array.isArray(d.logs)) throw new Error('Bukan file cadangan Asuh')
    const logs = d.logs.filter((l: any) => typeof l?.id === 'string' && JENIS_VALID.includes(l.jenis) && Number.isFinite(l.mulai))
    const profil = d.profil && typeof d.profil.nama === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d.profil.lahir) ? { nama: d.profil.nama.slice(0, 30), lahir: d.profil.lahir } : null
    Object.assign(state, { ...kosong(), profil, logs, daruratSelesai: Number(d.daruratSelesai) || 0, reset: d.reset ?? {}, diumumkan: Array.isArray(d.diumumkan) ? d.diumumkan.filter((x: any) => typeof x === 'string') : [] })
    return logs.length
  }

  return {
    state, now, usiaMinggu, batas, fitur, pengumuman,
    tutupPengumuman: (id: string) => { if (!state.diumumkan.includes(id)) state.diumumkan.push(id) }, pola, polaAktif, kondisi, tema, bar, ekspresi, redFlag, pesanAvatar, cukupData,
    setProfil: (nama: string, lahir: string) => { state.profil = { nama, lahir } },
    mulai, selesai, catat, simpanManual, hapus, ringkasHari, seri7, terakhir, durasiMenit, ekspor, impor,
    pulihkan: (log: Log) => { state.logs.push(log) },
    batalTimer: (j: Timer) => { delete state.aktif[j] },
    daruratDitangani: () => { state.daruratSelesai = Date.now() },
    sudahMembaik: (k: KondisiPola) => { state.reset[k] = Date.now() },
    resetSemua: () => { Object.assign(state, kosong()) },
  }
}
