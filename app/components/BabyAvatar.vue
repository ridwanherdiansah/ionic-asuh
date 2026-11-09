<script setup lang="ts">
// Maskot orisinal "Asuh": bayi kartun berbaju kodok biru muda. Setiap kondisi punya pose sendiri.
const props = withDefaults(defineProps<{ ekspresi: string; sapa?: number; ukuran?: string }>(), { sapa: 0, ukuran: 'w-40' })
const e = computed(() => props.ekspresi)
const duduk = computed(() => e.value !== 'tidur')
const mataBuka = computed(() => ['senang', 'sedih', 'darurat', 'pusing'].includes(e.value))

// hati beterbangan saat avatar diketuk
const hati = ref<{ id: number; dx: number; s: number }[]>([])
watch(() => props.sapa, () => {
  const baru = Array.from({ length: 5 }, (_, i) => ({ id: Date.now() + i, dx: (Math.random() - 0.5) * 120, s: 0.7 + Math.random() * 0.6 }))
  hati.value.push(...baru)
  setTimeout(() => (hati.value = hati.value.filter((h) => !baru.includes(h))), 1400)
})

const BAJU = '#a9d6f2'
const BAJU_GELAP = '#86c1e8'
const RAMBUT = '#8a5a3b'
</script>

<template>
  <div class="relative aspect-[10/11] select-none" :class="ukuran">
    <svg viewBox="0 0 200 220" class="size-full overflow-visible drop-shadow-[0_16px_20px_rgba(15,23,42,0.28)]" role="img" :aria-label="`Avatar bayi: ${e}`">
      <defs>
        <radialGradient id="av-kulit" cx="42%" cy="38%" r="70%">
          <stop offset="0%" stop-color="#ffe6d2" />
          <stop offset="100%" stop-color="#f6c39f" />
        </radialGradient>
        <linearGradient id="av-baju" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#c6e6fa" />
          <stop offset="100%" :stop-color="BAJU" />
        </linearGradient>
      </defs>

      <ellipse cx="100" cy="212" rx="72" ry="7" fill="#0f172a" opacity=".18" class="bayang" />

      <!-- ================= POSE DUDUK ================= -->
      <g v-if="duduk" class="napas">
        <!-- kaki (baju kodok berkaki) -->
        <path d="M38 200 Q32 176 66 174 L94 182 Q98 206 70 209 Q46 211 38 200Z" fill="url(#av-baju)" />
        <path d="M162 200 Q168 176 134 174 L106 182 Q102 206 130 209 Q154 211 162 200Z" fill="url(#av-baju)" />
        <path d="M44 198 Q52 192 62 196" fill="none" :stroke="BAJU_GELAP" stroke-width="2.5" stroke-linecap="round" />
        <path d="M156 198 Q148 192 138 196" fill="none" :stroke="BAJU_GELAP" stroke-width="2.5" stroke-linecap="round" />
        <!-- badan -->
        <path d="M62 188 Q56 134 100 126 Q144 134 138 188 Q100 200 62 188Z" fill="url(#av-baju)" />
        <path d="M100 152 l3.5 7 7.7 1.1 -5.6 5.4 1.3 7.6 -6.9 -3.6 -6.9 3.6 1.3 -7.6 -5.6 -5.4 7.7 -1.1z" :fill="BAJU_GELAP" />
        <!-- kerah -->
        <path d="M100 127 Q84 122 78 134 Q90 143 100 133 Q110 143 122 134 Q116 122 100 127Z" fill="#e6f4fd" />

        <!-- boneka beruang (ngantuk) -->
        <g v-if="e === 'ngantuk'">
          <circle cx="86" cy="140" r="7" fill="#9b6a47" /><circle cx="114" cy="140" r="7" fill="#9b6a47" />
          <ellipse cx="100" cy="180" rx="22" ry="18" fill="#9b6a47" />
          <circle cx="100" cy="152" r="17" fill="#a87652" />
          <ellipse cx="100" cy="158" rx="8" ry="6" fill="#d9b08c" />
          <circle cx="94" cy="149" r="2" fill="#3b2314" /><circle cx="106" cy="149" r="2" fill="#3b2314" />
          <circle cx="100" cy="156" r="2" fill="#3b2314" />
        </g>

        <!-- kepala -->
        <g class="kepala">
          <circle cx="57" cy="82" r="9" fill="url(#av-kulit)" /><circle cx="143" cy="82" r="9" fill="url(#av-kulit)" />
          <circle cx="100" cy="78" r="45" fill="url(#av-kulit)" />
          <!-- jambul -->
          <path d="M90 37 C82 20 106 10 120 22 C111 21 105 27 107 38 C101 34 96 34 90 37Z" :fill="RAMBUT" />
          <path d="M104 30 C106 24 112 22 116 24" fill="none" stroke="#a87250" stroke-width="2" stroke-linecap="round" />
          <!-- alis -->
          <g :stroke="RAMBUT" stroke-width="2.5" stroke-linecap="round" fill="none" opacity=".7">
            <template v-if="e === 'sedih' || e === 'darurat'"><path d="M77 68 L91 63" /><path d="M123 68 L109 63" /></template>
            <template v-else-if="e === 'kembung'"><path d="M77 63 L91 67" /><path d="M123 63 L109 67" /></template>
            <template v-else-if="e === 'pusing'"><path d="M77 62 Q84 57 91 61" /><path d="M109 61 Q116 57 123 62" /></template>
            <template v-else><path d="M77 66 Q84 62 91 65" /><path d="M109 65 Q116 62 123 66" /></template>
          </g>
          <!-- mata -->
          <g v-if="mataBuka" class="kedip">
            <ellipse cx="84" cy="82" rx="8.5" ry="9.5" fill="#7a4a2a" /><ellipse cx="116" cy="82" rx="8.5" ry="9.5" fill="#7a4a2a" />
            <circle :cx="e === 'pusing' ? 85 : 84" :cy="e === 'pusing' ? 79 : 83" r="4.6" fill="#3b2314" />
            <circle :cx="e === 'pusing' ? 117 : 116" :cy="e === 'pusing' ? 79 : 83" r="4.6" fill="#3b2314" />
            <circle cx="87" cy="78" r="3" fill="#fff" /><circle cx="119" cy="78" r="3" fill="#fff" />
            <circle cx="81" cy="86" r="1.3" fill="#fff" opacity=".8" /><circle cx="113" cy="86" r="1.3" fill="#fff" opacity=".8" />
          </g>
          <g v-else stroke="#5a3520" stroke-width="3" stroke-linecap="round" fill="none">
            <template v-if="e === 'kembung' || e === 'nangis'"><path d="M76 80 L91 84" /><path d="M124 80 L109 84" /></template>
            <template v-else><path d="M76 82 Q84 89 92 82" /><path d="M108 82 Q116 89 124 82" /></template>
          </g>
          <!-- hidung & pipi -->
          <path d="M97 92 Q100 95 103 92" fill="none" stroke="#e3a27c" stroke-width="2" stroke-linecap="round" />
          <ellipse cx="72" cy="96" :rx="e === 'kembung' ? 11 : 8" :ry="e === 'kembung' ? 7 : 5" fill="#f59b95" opacity=".55" />
          <ellipse cx="128" cy="96" :rx="e === 'kembung' ? 11 : 8" :ry="e === 'kembung' ? 7 : 5" fill="#f59b95" opacity=".55" />
          <!-- mulut -->
          <g stroke="#9c3a35" stroke-width="2.5" stroke-linecap="round" fill="none">
            <template v-if="e === 'senang'">
              <path d="M88 100 Q100 117 112 100 Z" fill="#b8423c" stroke="none" />
              <ellipse cx="100" cy="109" rx="6" ry="3" fill="#f28b82" />
            </template>
            <template v-else-if="e === 'nangis'">
              <ellipse cx="100" cy="106" rx="12" ry="10" fill="#b8423c" stroke="none" />
              <ellipse cx="100" cy="112" rx="7" ry="3.5" fill="#f28b82" />
            </template>
            <circle v-else-if="e === 'pusing'" cx="100" cy="105" r="4" fill="#b8423c" stroke="none" />
            <path v-else-if="e === 'kembung'" d="M90 105 q5 -4 10 0 q5 4 10 0" />
            <path v-else-if="e === 'ngantuk'" d="M93 102 Q100 107 107 102" />
            <path v-else-if="e === 'sedih' || e === 'darurat'" d="M92 107 Q100 101 108 107" />
          </g>
          <!-- keringat -->
          <path v-if="e === 'darurat' || e === 'pusing'" class="keringat" d="M138 54 q-6 9 0 12 q6 -3 0 -12z" fill="#7dd3fc" />
        </g>

        <!-- botol (menyusu) -->
        <g v-if="e === 'minum'">
          <rect x="91" y="96" width="18" height="44" rx="7" fill="#fff4c2" stroke="#f2d77a" stroke-width="2" />
          <rect x="91" y="118" width="18" height="22" rx="6" fill="#fde68a" />
          <rect x="89" y="92" width="22" height="8" rx="3" fill="#f6c453" />
        </g>

        <!-- lengan (di depan tubuh) -->
        <g :stroke="BAJU" stroke-width="17" stroke-linecap="round" fill="none">
          <template v-if="e === 'senang'">
            <path class="lengan-kiri" d="M72 142 Q54 134 42 118" /><path class="lengan-kanan" d="M128 142 Q146 134 158 118" />
          </template>
          <template v-else-if="e === 'nangis'"><path d="M72 142 Q62 118 80 98" /><path d="M128 142 Q138 118 120 98" /></template>
          <template v-else-if="e === 'minum'"><path d="M70 144 Q72 128 88 122" /><path d="M130 144 Q128 128 112 122" /></template>
          <template v-else-if="e === 'pusing'"><path d="M70 144 Q62 164 76 176" /><path d="M128 142 Q142 124 128 106" /></template>
          <template v-else-if="e === 'kembung'"><path d="M70 144 Q64 162 84 166" /><path d="M130 144 Q136 162 116 164" /></template>
          <template v-else-if="e === 'ngantuk'"><path d="M70 144 Q66 170 88 172" /><path d="M130 144 Q134 170 112 172" /></template>
          <template v-else><path d="M70 144 Q62 164 76 176" /><path d="M130 144 Q138 164 124 176" /></template>
        </g>
        <!-- tangan -->
        <g fill="url(#av-kulit)">
          <template v-if="e === 'senang'">
            <circle class="lengan-kiri" cx="39" cy="114" r="9" /><circle class="lengan-kanan" cx="161" cy="114" r="9" />
          </template>
          <template v-else-if="e === 'nangis'"><circle cx="83" cy="88" r="11" /><circle cx="117" cy="88" r="11" /></template>
          <template v-else-if="e === 'minum'"><circle cx="91" cy="122" r="8" /><circle cx="109" cy="122" r="8" /></template>
          <template v-else-if="e === 'pusing'"><circle cx="78" cy="178" r="8" /><circle cx="126" cy="103" r="8" /></template>
          <template v-else-if="e === 'kembung'"><circle cx="88" cy="166" r="8" /><circle cx="112" cy="164" r="8" /></template>
          <template v-else-if="e === 'ngantuk'"><circle cx="91" cy="172" r="8" /><circle cx="109" cy="172" r="8" /></template>
          <template v-else><circle cx="78" cy="178" r="8" /><circle cx="122" cy="178" r="8" /></template>
        </g>

        <!-- air mata memercik -->
        <g v-if="e === 'nangis'" fill="#7cc4f2">
          <circle class="percik-kiri" cx="66" cy="92" r="4" /><circle class="percik-kiri" style="animation-delay: .5s" cx="64" cy="98" r="3" />
          <circle class="percik-kanan" cx="134" cy="92" r="4" /><circle class="percik-kanan" style="animation-delay: .5s" cx="136" cy="98" r="3" />
        </g>
      </g>

      <!-- ================= POSE TIDUR ================= -->
      <g v-else class="napas">
        <ellipse cx="66" cy="182" rx="60" ry="22" fill="#f7e7a6" />
        <path d="M14 184 Q66 196 122 182" fill="none" stroke="#ead27a" stroke-width="3" stroke-linecap="round" />
        <ellipse cx="132" cy="178" rx="54" ry="24" fill="url(#av-baju)" />
        <path d="M98 196 Q102 150 142 152 Q190 156 190 196 Q144 206 98 196Z" fill="#f3dd8c" />
        <path d="M120 170 Q150 162 182 172" fill="none" stroke="#e6c766" stroke-width="3" stroke-linecap="round" />
        <g class="kepala-tidur">
          <circle cx="104" cy="152" r="8" fill="url(#av-kulit)" />
          <circle cx="72" cy="146" r="40" fill="url(#av-kulit)" />
          <path d="M44 120 C34 106 54 94 68 104 C60 105 56 111 58 120 C52 116 48 116 44 120Z" :fill="RAMBUT" />
          <g stroke="#5a3520" stroke-width="3" stroke-linecap="round" fill="none">
            <path d="M54 146 Q61 152 68 146" /><path d="M80 146 Q87 152 94 146" />
          </g>
          <ellipse cx="50" cy="160" rx="7" ry="4.5" fill="#f59b95" opacity=".55" />
          <ellipse cx="96" cy="160" rx="7" ry="4.5" fill="#f59b95" opacity=".55" />
          <!-- dot -->
          <ellipse cx="74" cy="167" rx="11" ry="6.5" :fill="BAJU_GELAP" />
          <circle cx="74" cy="167" r="3.5" fill="#fff" opacity=".85" />
          <circle cx="74" cy="176" r="5" fill="none" :stroke="BAJU_GELAP" stroke-width="3" />
        </g>
      </g>

      <!-- ================= EFEK ================= -->
      <g v-if="e === 'tidur' || e === 'ngantuk'" fill="#fff" font-weight="800" font-family="Plus Jakarta Sans, sans-serif">
        <text class="zzz" :x="e === 'tidur' ? 112 : 142" :y="e === 'tidur' ? 112 : 46" font-size="18">z</text>
        <text class="zzz" style="animation-delay: .9s" :x="e === 'tidur' ? 122 : 152" :y="e === 'tidur' ? 98 : 34" font-size="23">z</text>
        <text class="zzz" style="animation-delay: 1.8s" :x="e === 'tidur' ? 134 : 164" :y="e === 'tidur' ? 82 : 20" font-size="28">Z</text>
      </g>
      <g v-if="e === 'kembung'" fill="#fff" opacity=".85">
        <circle class="kentut" cx="150" cy="196" r="7" /><circle class="kentut" style="animation-delay: .7s" cx="158" cy="188" r="5.5" />
        <circle class="kentut" style="animation-delay: 1.4s" cx="154" cy="202" r="4.5" />
      </g>
      <g v-if="e === 'pusing'" class="orbit" fill="#fde047">
        <path d="M100 6 l3 6 7 1 -5 4 1.5 7 -6.5 -3.5 -6.5 3.5 1.5 -7 -5 -4 7 -1z" />
        <path d="M58 22 l2.5 5 5.5 .8 -4 3.8 1 5.4 -5 -2.6 -5 2.6 1 -5.4 -4 -3.8 5.5 -.8z" />
        <path d="M142 22 l2.5 5 5.5 .8 -4 3.8 1 5.4 -5 -2.6 -5 2.6 1 -5.4 -4 -3.8 5.5 -.8z" />
      </g>
      <g v-if="e === 'senang'" fill="#fde047">
        <path class="kilau" d="M22 70 l3.5 8 8 3.5 -8 3.5 -3.5 8 -3.5 -8 -8 -3.5 8 -3.5z" />
        <path class="kilau" style="animation-delay: .7s" d="M178 62 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3z" />
        <path class="kilau" style="animation-delay: 1.3s" d="M170 150 l2.5 6 6 2.5 -6 2.5 -2.5 6 -2.5 -6 -6 -2.5 6 -2.5z" />
      </g>
    </svg>

    <Icon v-for="h in hati" :key="h.id" name="ph:heart-fill" class="hati pointer-events-none absolute left-1/2 top-1/4 text-3xl text-rose-400" :style="{ '--dx': `${h.dx}px`, scale: h.s }" />
  </div>
</template>

<style scoped>
.napas { transform-origin: 100px 210px; animation: napas 3.4s ease-in-out infinite; }
.bayang { transform-origin: 100px 212px; animation: bayang 3.4s ease-in-out infinite; }
.kepala { transform-origin: 100px 124px; animation: miring 7s ease-in-out infinite; }
.kepala-tidur { transform-origin: 72px 186px; animation: miring 9s ease-in-out infinite; }
.kedip { transform-box: fill-box; transform-origin: center; animation: kedip 4.8s infinite; }
.lengan-kiri { transform-origin: 72px 142px; animation: lambai 1.6s ease-in-out infinite; }
.lengan-kanan { transform-origin: 128px 142px; animation: lambai-kanan 1.6s ease-in-out infinite; }
.percik-kiri { animation: percik-kiri 0.9s ease-out infinite; }
.percik-kanan { animation: percik-kanan 0.9s ease-out infinite; }
.keringat { animation: jatuh 2.2s ease-in infinite; }
.zzz { opacity: 0; animation: zzz 2.7s ease-in-out infinite; }
.orbit { transform-origin: 100px 26px; animation: putar 3.2s linear infinite; }
.kentut { transform-box: fill-box; animation: kentut 2.1s ease-out infinite; opacity: 0; }
.kilau { transform-box: fill-box; transform-origin: center; animation: kilau 2.2s ease-in-out infinite; }
.hati { animation: hati 1.35s ease-out forwards; }

@keyframes napas { 50% { transform: scale(1.012, 1.028); } }
@keyframes bayang { 50% { transform: scaleX(0.94); } }
@keyframes miring { 0%, 100% { transform: rotate(0); } 30% { transform: rotate(-3deg); } 70% { transform: rotate(3deg); } }
@keyframes kedip { 0%, 93%, 100% { transform: scaleY(1); } 96% { transform: scaleY(0.1); } }
@keyframes lambai { 0%, 100% { transform: rotate(0); } 50% { transform: rotate(14deg); } }
@keyframes lambai-kanan { 0%, 100% { transform: rotate(0); } 50% { transform: rotate(-14deg); } }
@keyframes percik-kiri { 0% { transform: translate(0, 0); opacity: 1; } 100% { transform: translate(-16px, 10px); opacity: 0; } }
@keyframes percik-kanan { 0% { transform: translate(0, 0); opacity: 1; } 100% { transform: translate(16px, 10px); opacity: 0; } }
@keyframes jatuh { 0% { transform: translateY(0); opacity: 1; } 100% { transform: translateY(30px); opacity: 0; } }
@keyframes zzz { 0% { opacity: 0; transform: translate(0, 0) scale(0.6); } 30% { opacity: 1; } 100% { opacity: 0; transform: translate(14px, -30px) scale(1.15); } }
@keyframes putar { to { transform: rotate(360deg); } }
@keyframes kentut { 0% { opacity: 0; transform: translate(0, 0) scale(0.5); } 25% { opacity: 0.9; } 100% { opacity: 0; transform: translate(24px, -12px) scale(1.5); } }
@keyframes kilau { 0%, 100% { transform: scale(0); opacity: 0; } 50% { transform: scale(1); opacity: 1; } }
@keyframes hati {
  0% { opacity: 0; transform: translate(-50%, 0) scale(0.4); }
  20% { opacity: 1; }
  100% { opacity: 0; transform: translate(calc(-50% + var(--dx)), -130px) scale(1.2); }
}
</style>
