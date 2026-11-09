// Semua angka & teks di file ini SEMENTARA (dari pedoman umum, ditulis dari ingatan).
// shortcut: wajib diganti dengan angka dari jurnal (Wolke 2017, Galland 2012, Rome IV, dll) + direview dokter anak sebelum rilis.

export type KondisiPola = 'kolik' | 'kembung' | 'overstimulasi' | 'kurangTidur' | 'kurangAsupan' | 'kelebihanTidur'
export type Kondisi = 'normal' | 'darurat' | KondisiPola

export type Tema = { warna: [string, string, string]; accent: string; label: string; ikon: string; teksGelap: boolean }

// warna: [terang, tengah, gelap] — gradasi pekat ala aplikasi cuaca, teks putih di atasnya
export const TEMA: Record<Kondisi, Tema> = {
  normal: { warna: ['#60a5fa', '#3b82f6', '#1e3a8a'], accent: '#2563eb', label: 'Semua aman', ikon: 'ph:sun-duotone', teksGelap: false },
  kolik: { warna: ['#fb7185', '#e11d48', '#881337'], accent: '#e11d48', label: 'Pola kolik', ikon: 'tabler:mood-cry', teksGelap: false },
  kembung: { warna: ['#fbbf24', '#f97316', '#9a3412'], accent: '#ea580c', label: 'Kembung', ikon: 'ph:wind-duotone', teksGelap: false },
  overstimulasi: { warna: ['#c084fc', '#9333ea', '#4c1d95'], accent: '#9333ea', label: 'Overstimulasi', ikon: 'ph:waves-duotone', teksGelap: false },
  kurangTidur: { warna: ['#818cf8', '#4f46e5', '#1e1b4b'], accent: '#4f46e5', label: 'Kurang tidur', ikon: 'ph:moon-stars-duotone', teksGelap: false },
  kurangAsupan: { warna: ['#f472b6', '#db2777', '#831843'], accent: '#db2777', label: 'Kurang asupan', ikon: 'ph:drop-half-duotone', teksGelap: false },
  kelebihanTidur: { warna: ['#38bdf8', '#0284c7', '#0c4a6e'], accent: '#0284c7', label: 'Tidur terlalu lama', ikon: 'ph:bed-duotone', teksGelap: false },
  darurat: { warna: ['#ef4444', '#b91c1c', '#450a0a'], accent: '#dc2626', label: 'Tanda bahaya', ikon: 'ph:siren-duotone', teksGelap: false },
}

export const JENIS_INFO = {
  minum: { ikon: 'tabler:baby-bottle', nama: 'Menyusu', grad: 'from-amber-400 to-orange-500', soft: 'bg-amber-100 text-amber-700', warna: '#f59e0b' },
  tidur: { ikon: 'ph:moon-stars-duotone', nama: 'Tidur', grad: 'from-indigo-400 to-violet-500', soft: 'bg-indigo-100 text-indigo-700', warna: '#6366f1' },
  nangis: { ikon: 'tabler:mood-cry', nama: 'Menangis', grad: 'from-rose-400 to-red-500', soft: 'bg-rose-100 text-rose-700', warna: '#f43f5e' },
  popok: { ikon: 'tabler:diaper', nama: 'Popok', grad: 'from-sky-400 to-cyan-500', soft: 'bg-sky-100 text-sky-700', warna: '#0ea5e9' },
  gejala: { ikon: 'ph:stethoscope-duotone', nama: 'Gejala', grad: 'from-violet-500 to-fuchsia-500', soft: 'bg-violet-100 text-violet-700', warna: '#8b5cf6' },
  makan: { ikon: 'ph:bowl-food-duotone', nama: 'Makan', grad: 'from-lime-400 to-emerald-500', soft: 'bg-emerald-100 text-emerald-700', warna: '#22c55e' },
  air: { ikon: 'tabler:glass-full', nama: 'Air putih', grad: 'from-cyan-400 to-teal-500', soft: 'bg-teal-100 text-teal-700', warna: '#14b8a6' },
} as const

export const POPOK = [
  { id: 'basah', nama: 'Basah', ikon: 'ph:drop-duotone' },
  { id: 'bab', nama: 'BAB', ikon: 'ph:circles-three-duotone' },
  { id: 'keduanya', nama: 'Keduanya', ikon: 'ph:drop-half-bottom-duotone' },
] as const

export const RED_FLAGS = [
  { id: 'demam', label: 'Demam ≥38°C (usia < 3 bulan) atau ≥39°C', ikon: 'ph:thermometer-hot-duotone' },
  { id: 'muntahHijau', label: 'Muntah hijau atau muntah menyembur', ikon: 'ph:warning-octagon-duotone' },
  { id: 'darahBab', label: 'Darah di BAB / BAB hitam atau putih pucat', ikon: 'ph:drop-duotone' },
  { id: 'lemas', label: 'Lemas, susah dibangunkan, tidak responsif', ikon: 'ph:battery-empty-duotone' },
  { id: 'sesak', label: 'Sesak napas, bibir/kulit kebiruan', ikon: 'ph:wind-duotone' },
  { id: 'tidakMinum', label: 'Tidak mau menyusu sama sekali', ikon: 'ph:prohibit-duotone' },
  { id: 'kering', label: 'Popok kering lebih dari 6 jam', ikon: 'tabler:diaper' },
  { id: 'kejang', label: 'Kejang', ikon: 'ph:lightning-duotone' },
  { id: 'ubunCekung', label: 'Ubun-ubun cekung atau menonjol', ikon: 'ph:baby-duotone' },
]

export const GEJALA = [
  { id: 'perutKeras', label: 'Perut keras / kembung', ikon: 'ph:circle-half-tilt-duotone' },
  { id: 'kakiTekuk', label: 'Kaki ditekuk ke perut', ikon: 'ph:footprints-duotone' },
  { id: 'kentut', label: 'Sering kentut / mengejan', ikon: 'ph:wind-duotone' },
  { id: 'rewelSetelahMinum', label: 'Rewel setelah menyusu', ikon: 'tabler:baby-bottle' },
  { id: 'palingMuka', label: 'Memalingkan muka', ikon: 'ph:eye-slash-duotone' },
  { id: 'tanganKepal', label: 'Tangan mengepal / punggung melengkung', ikon: 'ph:hand-fist-duotone' },
  { id: 'ramai', label: 'Habis suasana ramai / layar', ikon: 'ph:confetti-duotone' },
  { id: 'nangisTanpaSebab', label: 'Menangis lama tanpa sebab', ikon: 'tabler:mood-cry' },
  { id: 'gumoh', label: 'Gumoh setelah minum', ikon: 'ph:drop-simple-duotone' },
]

// Checklist "Cek kenyamanan": saat bayi menangis tapi tidak ada pola yang menonjol
export type CekNyaman = { id: string; judul: string; ikon: string; cara: string; solusi: string; ukurBising?: boolean; bahaya?: boolean; minUsiaMinggu?: number }
export const CEK_NYAMAN: CekNyaman[] = [
  { id: 'lapar', judul: 'Lapar?', ikon: 'tabler:baby-bottle', cara: 'Lihat tanda lapar: mengecap, menoleh mencari puting, tangan ke mulut.', solusi: 'Tawarkan menyusu. Menangis adalah tanda lapar yang sudah terlambat, jadi tawarkan lebih awal lain kali.' },
  { id: 'popok', judul: 'Popok basah / kotor?', ikon: 'tabler:diaper', cara: 'Cek popok basah, BAB, atau kulit kemerahan (ruam).', solusi: 'Ganti popok, bersihkan dan keringkan kulit, oles krim ruam bila kemerahan.' },
  { id: 'gerah', judul: 'Kepanasan / gerah?', ikon: 'ph:thermometer-hot-duotone', cara: 'Raba tengkuk atau dada, BUKAN tangan/kaki. Berkeringat, kulit merah, atau napas cepat berarti kepanasan.', solusi: 'Lepas satu lapis baju, longgarkan bedong, sejukkan ruangan. Bayi cukup memakai satu lapis lebih banyak dari orang dewasa. Kepanasan meningkatkan risiko SIDS.' },
  { id: 'dingin', judul: 'Kedinginan?', ikon: 'ph:snowflake-duotone', cara: 'Raba tengkuk atau dada: terasa dingin? (Tangan & kaki dingin itu normal pada bayi.)', solusi: 'Tambah satu lapis tipis atau bedong, jauhkan dari kipas/AC yang mengarah langsung ke bayi.' },
  { id: 'bising', judul: 'Terlalu bising / terang?', ikon: 'ph:speaker-high-duotone', cara: 'Ada TV, musik keras, banyak orang, atau lampu terang di sekitar bayi?', solusi: 'Pindah ke ruangan tenang dan redup. White noise lembut boleh, suara keras jangan.', ukurBising: true },
  { id: 'sendawa', judul: 'Belum sendawa?', ikon: 'ph:wind-duotone', cara: 'Rewel setelah menyusu, perut tampak penuh atau keras?', solusi: 'Gendong tegak di bahu, tepuk atau usap punggung pelan beberapa menit.' },
  { id: 'pakaian', judul: 'Pakaian tidak nyaman?', ikon: 'ph:t-shirt-duotone', cara: 'Baju terlalu ketat, label menggores, kancing menekan, atau karet terlalu kencang?', solusi: 'Ganti baju longgar berbahan lembut dan gunting labelnya.' },
  { id: 'rambut', judul: 'Rambut melilit jari?', ikon: 'ph:hand-duotone', cara: 'Periksa jari tangan, jari kaki, dan kelamin. Cari garis merah atau bengkak karena lilitan rambut/benang.', solusi: 'Bila ada lilitan yang membuat bengkak atau kebiruan, SEGERA ke dokter/IGD. Jangan menarik paksa.', bahaya: true },
  { id: 'ngantuk', judul: 'Ngantuk / terlalu lelah?', ikon: 'ph:moon-stars-duotone', cara: 'Menguap, mengucek mata, menatap kosong, atau sudah lama bangun?', solusi: 'Redupkan lampu, bedong, ayun pelan. Tidurkan sebelum terlalu lelah.' },
  { id: 'peluk', judul: 'Ingin dipeluk?', ikon: 'ph:hand-heart-duotone', cara: 'Tenang saat digendong, menangis lagi saat diletakkan?', solusi: 'Gendong dan peluk. Ini kebutuhan normal, bukan manja. Gendongan kain bisa membantu.' },
  { id: 'gigi', judul: 'Tumbuh gigi?', ikon: 'ph:tooth-duotone', cara: 'Banyak ngiler, suka menggigit benda, gusi tampak bengkak?', solusi: 'Beri teether dingin (bukan beku) atau pijat gusi dengan jari bersih.', minUsiaMinggu: 16 },
]

// teknik menenangkan saat semua sudah dicek (5S, Karp)
export const TENANGKAN = [
  { ikon: 'ph:baby-duotone', t: 'Bedong', d: 'Bedong rapat di lengan, longgar di pinggul.' },
  { ikon: 'ph:hand-pointing-duotone', t: 'Miring', d: 'Gendong miring/tengkurap di lengan (saat bangun & diawasi). Tidur tetap telentang.' },
  { ikon: 'ph:music-notes-duotone', t: 'Shh', d: 'Suara "shhh" di dekat telinga atau white noise lembut.' },
  { ikon: 'ph:baby-carriage-duotone', t: 'Ayun', d: 'Ayunan kecil dan pelan, jangan pernah mengguncang.' },
  { ikon: 'ph:smiley-duotone', t: 'Isap', d: 'Menyusu, dot, atau jari bersih untuk diisap.' },
]

// ringkasan teks catatan gejala (tanda bahaya, gejala, dan hasil cek kenyamanan)
export function ringkasGejala(data?: Record<string, any>) {
  const label: Record<string, string> = Object.fromEntries([...GEJALA, ...RED_FLAGS].map((g) => [g.id, g.label]))
  const cek: Record<string, string> = Object.fromEntries(CEK_NYAMAN.map((c) => [c.id, c.judul.replace('?', '').toLowerCase()]))
  const bagian = [...(data?.flags ?? []), ...(data?.gejala ?? [])].map((x: string) => label[x])
  if (data?.cek) {
    const d: string[] = data.cek.ditemukan ?? []
    bagian.push(d.length ? `Ditemukan: ${d.map((x) => cek[x]).join(', ')}` : `Cek nyaman ${data.cek.aman?.length ?? 0} hal: semua aman`)
  }
  return bagian.filter(Boolean).join(', ')
}

export const SARAN: Record<KondisiPola, { judul: string; langkah: string[]; keDokter: string; sumber: string[] }> = {
  kolik: {
    judul: 'Menenangkan bayi dengan pola kolik',
    langkah: [
      'Pastikan kebutuhan dasar: lapar, popok, suhu ruangan, pakaian tidak sesak.',
      'Bedong longgar di pinggul, gendong posisi miring di lengan (saat bangun & diawasi).',
      'Suara "shhh" / white noise, ayunan pelan, ruangan redup.',
      'Kalau mulai kewalahan: letakkan bayi aman di boks, tarik napas, minta bantuan. JANGAN mengguncang bayi.',
      'Ibu menyusui: tanyakan ke dokter soal probiotik L. reuteri.',
    ],
    keDokter: 'Bila disertai demam, muntah, berat badan seret, atau tangisan melengking tidak biasa.',
    sumber: ['Benninga MA dkk. Rome IV, Gastroenterology 2016', 'Ong TG dkk. Cochrane Review probiotik untuk kolik, 2019', 'Barr RG. Program PURPLE Crying'],
  },
  kembung: {
    judul: 'Meredakan perut kembung',
    langkah: [
      'Sendawakan di tengah dan setelah menyusu (posisi tegak di bahu).',
      'Gerakan "sepeda" kaki pelan dan pijat perut searah jarum jam (I-L-U).',
      'Cek perlekatan menyusu / ukuran dot agar tidak banyak udara tertelan.',
      'Tummy time saat bayi bangun dan diawasi.',
    ],
    keDokter: 'Bila perut keras disertai muntah, tidak BAB/kentut, atau bayi tampak kesakitan terus.',
    sumber: ['IDAI — Kolik & kembung pada bayi', 'Biagioli E dkk. Pediatrics 2016 (bukti simethicone lemah)'],
  },
  overstimulasi: {
    judul: 'Bayi terlalu banyak rangsangan',
    langkah: [
      'Pindah ke ruangan tenang dan redup, matikan TV/layar.',
      'Kurangi sentuhan & suara, cukup peluk tenang atau bedong.',
      'Perhatikan jendela bangun: tidurkan sebelum terlalu lelah.',
      'Batasi tamu / gendong bergantian orang.',
    ],
    keDokter: 'Bila bayi tetap tidak bisa ditenangkan berjam-jam atau ada tanda bahaya.',
    sumber: ['Brazelton TB. Neonatal Behavioral Assessment Scale', "AAP — Responding to your baby's cues"],
  },
  kurangTidur: {
    judul: 'Bayi kurang tidur',
    langkah: [
      'Mulai rutinitas tidur saat muncul tanda ngantuk (menguap, mengucek mata).',
      'Ruangan gelap, sejuk, white noise.',
      'Tidur aman: telentang, permukaan datar, tanpa bantal/selimut tebal.',
    ],
    keDokter: 'Bila bayi sangat sulit tidur disertai rewel berat, demam, atau sesak saat tidur.',
    sumber: ['Galland BC dkk. Sleep Med Rev 2012', 'AAP Safe Sleep 2022'],
  },
  kurangAsupan: {
    judul: 'Kemungkinan kurang asupan',
    langkah: [
      'Tawarkan menyusu lebih sering (bayi baru lahir 8–12× sehari).',
      'Bangunkan bayi < 1 bulan bila tidur > 3–4 jam tanpa menyusu.',
      'Hitung popok basah: normalnya ≥ 6 per hari setelah minggu pertama.',
    ],
    keDokter: 'SEGERA konsultasi bila popok basah sedikit, bayi lemas, atau berat badan turun.',
    sumber: ['WHO/UNICEF — Breastfeeding counselling', 'IDAI — ASI eksklusif'],
  },
  kelebihanTidur: {
    judul: 'Bayi baru lahir tidur terlalu lama',
    langkah: [
      'Bangunkan perlahan untuk menyusu: buka bedong, usap kaki/punggung, ganti popok.',
      'Bayi < 1 bulan sebaiknya menyusu tiap 2–3 jam, termasuk malam.',
      'Perhatikan warna kulit: bayi kuning yang sangat mengantuk perlu diperiksa.',
    ],
    keDokter: 'SEGERA bila bayi susah dibangunkan, lemas, kuning, atau tidak mau menyusu.',
    sumber: ['AAP — Newborn feeding & sleep', 'IDAI — Bayi kuning (ikterus neonatorum)'],
  },
}

export const EDUKASI = [
  {
    fase: '0–3 bulan', ikon: 'ph:baby-duotone', warna: 'from-rose-100 to-orange-100', aksen: 'text-rose-600',
    poin: [
      'Menangis memuncak sekitar usia 6–8 minggu, lalu berkurang di 3–4 bulan.',
      'Menyusu sesuai tanda lapar, sekitar 8–12× sehari.',
      'Jendela bangun pendek (± 45–90 menit), mudah overstimulasi.',
      'Tidur aman: telentang, boks sendiri, kamar yang sama dengan orang tua.',
    ],
    tips: [
      'Tanda lapar awal: mengecap, menoleh mencari puting, tangan ke mulut. Menangis adalah tanda lapar yang terlambat.',
      'Coba teknik 5S untuk menenangkan: bedong, miring, shh, ayun, isap.',
      'Kontak kulit ke kulit membantu bayi lebih tenang dan menyusu lebih baik.',
      'Sendawakan bayi di tengah dan akhir menyusu untuk mengurangi kembung.',
    ],
  },
  {
    fase: '3–6 bulan', ikon: 'ph:baby-carriage-duotone', warna: 'from-amber-100 to-lime-100', aksen: 'text-amber-600',
    poin: [
      'Pola kolik biasanya mereda.',
      'Tummy time makin lama untuk kekuatan leher & mengurangi kembung.',
      'Tetap ASI/sufor saja, belum MPASI.',
    ],
    tips: [
      'Tummy time 3–5 menit beberapa kali sehari, tambah perlahan.',
      'Bayi mulai bisa diajak rutinitas tidur yang konsisten.',
      'Ajak bicara & bernyanyi, bayi mulai merespons suara dengan ocehan.',
    ],
  },
  {
    fase: '6–12 bulan', ikon: 'ph:bowl-food-duotone', warna: 'from-sky-100 to-violet-100', aksen: 'text-sky-600',
    poin: [
      'Mulai MPASI di usia 6 bulan, kaya zat besi, tekstur bertahap.',
      'Perkenalkan makanan baru satu per satu, amati reaksi.',
      'Tidur siang 2–3× sehari, jendela bangun 2–4 jam.',
    ],
    tips: [
      'Tawarkan makanan baru 8–15 kali sebelum menyimpulkan bayi tidak suka.',
      'Hindari madu sebelum usia 1 tahun.',
      'Rumah aman: tutup stopkontak, amankan benda kecil, bayi mulai merangkak.',
    ],
  },
]

// ambang per usia (minggu) — sementara
export function ambang(usiaMinggu: number) {
  return {
    maksJedaMinumJam: usiaMinggu < 4 ? 3 : usiaMinggu < 12 ? 3.5 : usiaMinggu < 26 ? 4 : 5,
    jendelaBangunMenit: usiaMinggu < 4 ? 60 : usiaMinggu < 12 ? 90 : usiaMinggu < 26 ? 120 : usiaMinggu < 39 ? 180 : 240,
    minTidurJam: usiaMinggu < 12 ? 14 : 12,
    minPopokBasah: 6,
    minMinum: usiaMinggu < 4 ? 8 : usiaMinggu < 12 ? 7 : 5,
    maksTidurJam: 4, // khusus bayi < 4 minggu: bangunkan untuk menyusu
  }
}

// ===== Asupan: susu botol (ml), MPASI, air putih — angka SEMENTARA, wajib direview dokter anak =====
export const USIA_MPASI = 26 // minggu (~6 bulan): MPASI & air putih mulai boleh
export const USIA_UHT = 52 // minggu (~12 bulan): susu UHT/sapi boleh, maks ~500 ml/hari
export const MAKS_SUSU_SETAHUN = 500

export const CARA_MINUM = [
  { id: 'langsung', nama: 'Menyusu langsung', ikon: 'ph:baby-duotone' },
  { id: 'botol', nama: 'Botol', ikon: 'tabler:bottle' },
] as const
export const SISI = [
  { id: 'kiri', nama: 'Kiri' },
  { id: 'kanan', nama: 'Kanan' },
  { id: 'keduanya', nama: 'Keduanya' },
] as const
export const ISI_SUSU = [
  { id: 'asip', nama: 'ASI perah', minMinggu: 0 },
  { id: 'sufor', nama: 'Susu formula', minMinggu: 0 },
  { id: 'uht', nama: 'Susu UHT', minMinggu: USIA_UHT },
] as const

// takaran susu botol sekali minum per usia (minggu)
export function targetMinum(m: number) {
  if (m < 1) return { min: 30, max: 60, frek: '8–12×', pilihan: [20, 30, 45, 60, 75] }
  if (m < 4) return { min: 60, max: 90, frek: '8–12×', pilihan: [45, 60, 75, 90, 120] }
  if (m < 9) return { min: 90, max: 120, frek: '7–8×', pilihan: [60, 90, 100, 120, 150] }
  if (m < 17) return { min: 120, max: 150, frek: '6–7×', pilihan: [90, 120, 135, 150, 180] }
  if (m < USIA_MPASI) return { min: 150, max: 180, frek: '5–6×', pilihan: [120, 150, 165, 180, 210] }
  return { min: 180, max: 240, frek: '3–5×', pilihan: [120, 150, 180, 210, 240] }
}

export const TEKSTUR = [
  { id: 'lumat', nama: 'Lumat halus' },
  { id: 'cincang', nama: 'Cincang / kasar' },
  { id: 'finger', nama: 'Finger food' },
  { id: 'keluarga', nama: 'Makanan keluarga' },
] as const
export const REAKSI = [
  { id: 'lahap', nama: 'Lahap', ikon: 'ph:smiley-duotone' },
  { id: 'sedikit', nama: 'Sedikit', ikon: 'ph:smiley-meh-duotone' },
  { id: 'menolak', nama: 'Menolak', ikon: 'ph:smiley-sad-duotone' },
  { id: 'alergi', nama: 'Reaksi alergi', ikon: 'ph:warning-duotone' },
] as const
export const PORSI_SDM = [1, 2, 3, 5, 8, 12, 16] // 1 mangkuk 250 ml ≈ 16 sdm

// panduan MPASI per usia (WHO complementary feeding, IDAI)
export function targetMakan(m: number) {
  if (m < 39) return { tekstur: 'lumat', porsi: '2–3 sdm, naik bertahap hingga ½ mangkuk (125 ml)', kali: '2–3× makan + 1–2× selingan' }
  if (m < USIA_UHT) return { tekstur: 'cincang', porsi: '½ mangkuk (125 ml)', kali: '3–4× makan + 1–2× selingan' }
  return { tekstur: 'keluarga', porsi: '¾–1 mangkuk (175–250 ml)', kali: '3–4× makan + 1–2× selingan' }
}
export const targetAir = (m: number) =>
  m < USIA_UHT
    ? { teks: '±60–120 ml/hari, sedikit-sedikit dari gelas/cangkir', pilihan: [10, 20, 30, 60, 90] }
    : { teks: 'Sesuai haus, ±1–4 gelas kecil per hari', pilihan: [30, 60, 90, 120, 180] }

// kartu sekali tampil saat fitur baru terbuka
export const FITUR_USIA = [
  { id: 'mpasi', minggu: USIA_MPASI, ikon: 'ph:bowl-food-duotone', judul: 'Si kecil sudah 6 bulan!', isi: 'Fitur Makan (MPASI) dan Air putih sudah aktif. Mulai dengan tekstur lumat, kenalkan makanan baru satu per satu dan tunggu ±3 hari untuk melihat reaksi alergi.' },
  { id: 'uht', minggu: USIA_UHT, ikon: 'ph:cake-duotone', judul: 'Selamat ulang tahun pertama!', isi: 'Susu UHT/sapi boleh mulai diberikan. Batasi total susu ±500 ml/hari supaya nafsu makan tetap baik.' },
]

const nama = <T extends { id: string; nama: string }>(daftar: readonly T[], id?: string) => daftar.find((x) => x.id === id)?.nama
// ringkasan teks catatan menyusu/makan/air (tanpa durasi)
export function ringkasAsupan(jenis: string, d?: Record<string, any>) {
  if (jenis === 'minum') {
    if (d?.cara === 'botol') return [d.ml ? `${d.ml} ml` : '', nama(ISI_SUSU, d.isi)].filter(Boolean).join(' · ')
    return d?.sisi ? `payudara ${nama(SISI, d.sisi)!.toLowerCase()}` : ''
  }
  if (jenis === 'makan') return [d?.menu, d?.porsi ? `${d.porsi} sdm` : '', nama(REAKSI, d?.reaksi), d?.baru ? 'makanan baru' : ''].filter(Boolean).join(' · ')
  if (jenis === 'air') return d?.ml ? `${d.ml} ml` : ''
  return ''
}
