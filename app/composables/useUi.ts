import { JENIS_INFO, POPOK } from '~/data/konten'
import type { Jenis, Log, Timer } from './useAsuh'

type Toast = { pesan: string; ikon?: string; batal?: () => void }

// modal & notifikasi dipasang sekali di pages/tabs.vue, dibuka dari halaman mana pun
export function useUi() {
  const sheet = useState<{ jenis?: Jenis; log?: Log; botol?: boolean } | null>('ui-sheet', () => null)
  const rewel = useState('ui-rewel', () => false)
  const tambah = useState('ui-tambah', () => false)
  const pengaturan = useState('ui-pengaturan', () => false)
  const cekNyaman = useState('ui-cek-nyaman', () => false)
  const toast = useState<Toast | null>('ui-toast', () => null)

  const a = useAsuh()
  const getar = (ms = 12) => { try { navigator.vibrate?.(ms) } catch {} }
  const umpan = (t: Toast) => {
    getar()
    toast.value = null
    nextTick(() => (toast.value = t))
  }

  const aksi = {
    mulai(j: Timer) {
      a.mulai(j)
      umpan({ pesan: `${JENIS_INFO[j].nama} dimulai`, ikon: JENIS_INFO[j].ikon, batal: () => a.batalTimer(j) })
    },
    selesai(j: Timer, data?: Record<string, any>) {
      const log = a.selesai(j, data)
      if (!log) return
      umpan({
        pesan: `${JENIS_INFO[j].nama} ${formatDurasi((log.selesai! - log.mulai) / 60_000)} dicatat`,
        ikon: 'ph:check-circle-duotone',
        batal: () => { a.hapus(log.id); a.mulai(j, log.mulai) },
      })
    },
    popok(tipe: (typeof POPOK)[number]['id']) {
      const log = a.catat('popok', { tipe })
      const p = POPOK.find((x) => x.id === tipe)!
      umpan({ pesan: `Popok ${p.nama.toLowerCase()} dicatat`, ikon: p.ikon, batal: () => a.hapus(log.id) })
    },
    hapus(id: string) {
      const log = a.hapus(id)
      if (log) umpan({ pesan: 'Catatan dihapus', ikon: 'ph:trash-duotone', batal: () => a.pulihkan(log) })
    },
  }

  return { sheet, rewel, tambah, pengaturan, cekNyaman, toast, umpan, getar, aksi }
}
