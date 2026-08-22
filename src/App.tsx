import { useEffect, useRef, useState } from 'react'
import bannerImg from '@/imports/banner.jpg'
import featureGridImg from '@/imports/功能圖.jpg'
import logoImg from '@/imports/logo.png'
import appIconImg from '@/imports/MetroPoint AI.jpg'
import changeIcon from '@/imports/Change.jpg'
import kosmedCouponImg from '@/imports/康是美票卷.jpg'
import {
  createEntryEvent,
  createRedemption,
  DEMO_USER_ID_HASH,
  getLatestRecommendation,
  getRedemption,
  getUserProfile,
  registerBrowserPushSubscription,
  recordRecommendationEvent,
  registerNotificationSubscription,
  revokeNotificationSubscription,
  unregisterBrowserPushSubscription,
  type Recommendation,
  type Redemption,
  updateUserPreferences,
} from './api'

// ── Icons ──
function IconGlobe() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  )
}
function IconBell() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  )
}
function IconTag() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
  )
}
function IconSearch() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}
function IconRoute() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00a05a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="19" r="3" />
      <path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" />
      <circle cx="18" cy="5" r="3" />
    </svg>
  )
}
function IconChevronDown() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}
function IconChevronUp() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="18 15 12 9 6 15" />
      <polyline points="18 10 12 4 6 10" />
    </svg>
  )
}

// --- Feature grid icons ---
function FeatureIcon({ label, bold, children }: { label: string; bold?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="w-[70px] h-[70px] rounded-2xl flex items-center justify-center" style={{ backgroundColor: '#dce9f5' }}>
        {children}
      </div>
      <span className={`text-[11px] text-gray-700 text-center leading-tight ${bold ? 'font-bold' : ''}`}>{label}</span>
    </div>
  )
}

// MRT line badge
function LineBadge({ line, number, bg }: { line?: string; number: string; bg: string }) {
  return (
    <div className="w-10 h-10 rounded-lg flex flex-col items-center justify-center text-white font-bold" style={{ backgroundColor: bg }}>
      {line && <span className="text-xs leading-none">{line}</span>}
      <span className="text-sm leading-none">{number}</span>
    </div>
  )
}

// ─── Onboarding ──────────────────────────────────────────────────────────────

// id, line code label, station name, line color
const ALL_STATIONS: { code: string; name: string; color: string }[] = [
  { code: 'BL01', name: '頂埔', color: '#0070bd' },
  { code: 'BL02', name: '永寧', color: '#0070bd' },
  { code: 'BL03', name: '土城', color: '#0070bd' },
  { code: 'BL04', name: '海山', color: '#0070bd' },
  { code: 'BL05', name: '亞東醫院', color: '#0070bd' },
  { code: 'BL06', name: '府中', color: '#0070bd' },
  { code: 'BL07', name: '板橋', color: '#0070bd' },
  { code: 'BL08', name: '新埔', color: '#0070bd' },
  { code: 'BL09', name: '江子翠', color: '#0070bd' },
  { code: 'BL10', name: '龍山寺', color: '#0070bd' },
  { code: 'BL11', name: '西門', color: '#0070bd' },
  { code: 'BL12', name: '台北車站', color: '#0070bd' },
  { code: 'BL13', name: '善導寺', color: '#0070bd' },
  { code: 'BL14', name: '忠孝新生', color: '#0070bd' },
  { code: 'BL15', name: '忠孝復興', color: '#0070bd' },
  { code: 'BL16', name: '忠孝敦化', color: '#0070bd' },
  { code: 'BL17', name: '國父紀念館', color: '#0070bd' },
  { code: 'BL18', name: '市政府', color: '#0070bd' },
  { code: 'BL19', name: '永春', color: '#0070bd' },
  { code: 'BL20', name: '後山埤', color: '#0070bd' },
  { code: 'BL21', name: '昆陽', color: '#0070bd' },
  { code: 'BL22', name: '南港', color: '#0070bd' },
  { code: 'BL23', name: '南港展覽館', color: '#0070bd' },
  { code: 'BR01', name: '動物園', color: '#c48c31' },
  { code: 'BR02', name: '木柵', color: '#c48c31' },
  { code: 'BR03', name: '萬芳社區', color: '#c48c31' },
  { code: 'BR04', name: '萬芳醫院', color: '#c48c31' },
  { code: 'BR05', name: '辛亥', color: '#c48c31' },
  { code: 'BR06', name: '麟光', color: '#c48c31' },
  { code: 'BR07', name: '六張犁', color: '#c48c31' },
  { code: 'BR08', name: '科技大樓', color: '#c48c31' },
  { code: 'BR09', name: '大安', color: '#c48c31' },
  { code: 'BR10', name: '忠孝復興', color: '#c48c31' },
  { code: 'BR11', name: '南京復興', color: '#c48c31' },
  { code: 'BR12', name: '中山國中', color: '#c48c31' },
  { code: 'BR13', name: '松山機場', color: '#c48c31' },
  { code: 'BR14', name: '大直', color: '#c48c31' },
  { code: 'BR15', name: '劍南路', color: '#c48c31' },
  { code: 'BR16', name: '西湖', color: '#c48c31' },
  { code: 'BR17', name: '港墘', color: '#c48c31' },
  { code: 'BR18', name: '文德', color: '#c48c31' },
  { code: 'BR19', name: '內湖', color: '#c48c31' },
  { code: 'BR20', name: '大湖公園', color: '#c48c31' },
  { code: 'BR21', name: '葫洲', color: '#c48c31' },
  { code: 'BR22', name: '東湖', color: '#c48c31' },
  { code: 'BR23', name: '南港軟體園區', color: '#c48c31' },
  { code: 'BR24', name: '南港展覽館', color: '#c48c31' },
  { code: 'G01', name: '新店', color: '#008659' },
  { code: 'G02', name: '新店區公所', color: '#008659' },
  { code: 'G03', name: '七張', color: '#008659' },
  { code: 'G03A', name: '小碧潭', color: '#008659' },
  { code: 'G04', name: '大坪林', color: '#008659' },
  { code: 'G05', name: '景美', color: '#008659' },
  { code: 'G06', name: '萬隆', color: '#008659' },
  { code: 'G07', name: '公館', color: '#008659' },
  { code: 'G08', name: '台電大樓', color: '#008659' },
  { code: 'G09', name: '古亭', color: '#008659' },
  { code: 'G10', name: '中正紀念堂', color: '#008659' },
  { code: 'G11', name: '小南門', color: '#008659' },
  { code: 'G12', name: '西門', color: '#008659' },
  { code: 'G13', name: '北門', color: '#008659' },
  { code: 'G14', name: '中山', color: '#008659' },
  { code: 'G15', name: '松江南京', color: '#008659' },
  { code: 'G16', name: '南京復興', color: '#008659' },
  { code: 'G17', name: '台北小巨蛋', color: '#008659' },
  { code: 'G18', name: '南京三民', color: '#008659' },
  { code: 'G19', name: '松山', color: '#008659' },
  { code: 'O01', name: '南勢角', color: '#f59100' },
  { code: 'O02', name: '景安', color: '#f59100' },
  { code: 'O03', name: '永安市場', color: '#f59100' },
  { code: 'O04', name: '頂溪', color: '#f59100' },
  { code: 'O05', name: '古亭', color: '#f59100' },
  { code: 'O06', name: '東門', color: '#f59100' },
  { code: 'O07', name: '忠孝新生', color: '#f59100' },
  { code: 'O08', name: '松江南京', color: '#f59100' },
  { code: 'O09', name: '行天宮', color: '#f59100' },
  { code: 'O10', name: '中山國小', color: '#f59100' },
  { code: 'O11', name: '民權西路', color: '#f59100' },
  { code: 'O12', name: '大橋頭', color: '#f59100' },
  { code: 'O13', name: '台北橋', color: '#f59100' },
  { code: 'O14', name: '菜寮', color: '#f59100' },
  { code: 'O15', name: '三重', color: '#f59100' },
  { code: 'O16', name: '先嗇宮', color: '#f59100' },
  { code: 'O17', name: '頭前庄', color: '#f59100' },
  { code: 'O18', name: '新莊', color: '#f59100' },
  { code: 'O19', name: '輔大', color: '#f59100' },
  { code: 'O20', name: '丹鳳', color: '#f59100' },
  { code: 'O21', name: '迴龍', color: '#f59100' },
  { code: 'O50', name: '三重國小', color: '#f59100' },
  { code: 'O51', name: '三和國中', color: '#f59100' },
  { code: 'O52', name: '徐匯中學', color: '#f59100' },
  { code: 'O53', name: '三民高中', color: '#f59100' },
  { code: 'O54', name: '蘆洲', color: '#f59100' },
  { code: 'R01', name: '廣慈／奉天宮', color: '#e3001b' },
  { code: 'R02', name: '象山', color: '#e3001b' },
  { code: 'R03', name: '台北101／世貿', color: '#e3001b' },
  { code: 'R04', name: '信義安和', color: '#e3001b' },
  { code: 'R05', name: '大安', color: '#e3001b' },
  { code: 'R06', name: '大安森林公園', color: '#e3001b' },
  { code: 'R07', name: '東門', color: '#e3001b' },
  { code: 'R08', name: '中正紀念堂', color: '#e3001b' },
  { code: 'R09', name: '台大醫院', color: '#e3001b' },
  { code: 'R10', name: '台北車站', color: '#e3001b' },
  { code: 'R11', name: '中山', color: '#e3001b' },
  { code: 'R12', name: '雙連', color: '#e3001b' },
  { code: 'R13', name: '民權西路', color: '#e3001b' },
  { code: 'R14', name: '圓山', color: '#e3001b' },
  { code: 'R15', name: '劍潭', color: '#e3001b' },
  { code: 'R16', name: '士林', color: '#e3001b' },
  { code: 'R17', name: '芝山', color: '#e3001b' },
  { code: 'R18', name: '明德', color: '#e3001b' },
  { code: 'R19', name: '石牌', color: '#e3001b' },
  { code: 'R20', name: '唭哩岸', color: '#e3001b' },
  { code: 'R21', name: '奇岩', color: '#e3001b' },
  { code: 'R22', name: '北投', color: '#e3001b' },
  { code: 'R22A', name: '新北投', color: '#e3001b' },
  { code: 'R23', name: '復興崗', color: '#e3001b' },
  { code: 'R24', name: '忠義', color: '#e3001b' },
  { code: 'R25', name: '關渡', color: '#e3001b' },
  { code: 'R26', name: '竹圍', color: '#e3001b' },
  { code: 'R27', name: '紅樹林', color: '#e3001b' },
  { code: 'R28', name: '淡水', color: '#e3001b' },
]

const STATIONS = ALL_STATIONS

const FOOD_CATS = [
  { id: 'fast', label: '連鎖速食', emoji: '🍔' },
  { id: 'bakery', label: '烘焙甜點', emoji: '🥐' },
  { id: 'coffee', label: '咖啡飲品', emoji: '☕' },
  { id: 'lunch', label: '午餐便當', emoji: '🍱' },
  { id: 'cvs', label: '便利商店', emoji: '🏪' },
  { id: 'boba', label: '手搖飲', emoji: '🧋' },
  { id: 'local', label: '自營商品', emoji: '🛍️' },
  { id: 'travel', label: '觀光旅宿', emoji: '🏨' },
  { id: 'beauty', label: '美妝保養', emoji: '💄' },
  { id: 'other', label: '其他', emoji: '✨' },
]

function StepDots({ total, current }: { total: number; current: number }) {
  return (
    <div className="flex gap-1.5 justify-center mt-1">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className={`rounded-full transition-all duration-300 ${i === current ? 'w-5 h-2 bg-[#00a05a]' : 'w-2 h-2 bg-gray-200'}`} />
      ))}
    </div>
  )
}

interface OnboardingResult {
  stations: string[]
  cats: string[]
  pushTiming: 'peak' | 'allday' | null
}

function Onboarding({ onDone }: { onDone: (result: OnboardingResult) => void }) {
  const [step, setStep] = useState(0)

  // Step 1 — stations
  const [selectedStations, setSelectedStations] = useState<string[]>([])
  const [stationQuery, setStationQuery] = useState('')

  // Step 2 — food categories
  const [selectedCats, setSelectedCats] = useState<string[]>([])

  // Step 3 — push timing
  const [pushTiming, setPushTiming] = useState<'peak' | 'allday' | null>(null)

  function toggleStation(code: string) {
    setSelectedStations(prev => prev.includes(code) ? prev.filter(x => x !== code) : [...prev, code])
  }
  function toggleCat(id: string) {
    setSelectedCats(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const filteredStations = stationQuery.trim()
    ? STATIONS.filter(s => s.name.includes(stationQuery.trim()) || s.code.toLowerCase().includes(stationQuery.trim().toLowerCase()))
    : STATIONS

  const canNext = [
    selectedStations.length > 0,
    selectedCats.length > 0,
    pushTiming !== null,
  ][step]

  return (
    <div className="absolute inset-0 z-50 bg-white flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 pt-10 pb-4">
        <div className="flex items-center gap-1.5">
          <img src={logoImg} alt="台北捷運" className="h-[18px] w-auto object-contain" />
          <span className="font-bold text-gray-800 text-sm">台北捷運</span>
        </div>
        <button onClick={() => step < 2 ? setStep(s => s + 1) : onDone({ stations: selectedStations, cats: selectedCats, pushTiming })} className="text-xs text-gray-400 underline">略過此題</button>
      </div>

      {/* Progress */}
      <div className="px-5 mb-5">
        <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#00a05a] rounded-full transition-all duration-500"
            style={{ width: `${((step + 1) / 3) * 100}%` }}
          />
        </div>
        <div className="mt-1.5 text-right text-xs text-gray-400">{step + 1} / 3</div>
      </div>

      {/* Step content — no padding for step 1 list */}
      <div className={`flex-1 overflow-y-auto ${step === 0 ? '' : 'px-5'}`}>

        {/* ── Step 1 ── */}
        {step === 0 && (
          <div className="flex flex-col h-full">
            <div className="px-5 pb-3">
              <h1 className="text-xl font-bold text-gray-900 mb-1">您的常用站點</h1>
              <p className="text-sm text-gray-500 mb-3">選擇您最常搭乘的站點，出站時就能收到適合您的推薦。</p>

              {/* Search bar */}
              <div className="flex items-center border border-gray-200 rounded-2xl bg-gray-50 px-3 py-2.5 gap-2 focus-within:border-[#00a05a] focus-within:ring-1 focus-within:ring-[#00a05a] transition-all">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input
                  type="text"
                  value={stationQuery}
                  onChange={e => setStationQuery(e.target.value)}
                  placeholder="搜尋車站站名/代碼"
                  className="flex-1 bg-transparent text-sm text-gray-800 outline-none placeholder-gray-400"
                />
                {stationQuery && (
                  <button onClick={() => setStationQuery('')}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                )}
              </div>

              {/* Selected count hint */}
              {selectedStations.length > 0 && (
                <p className="text-xs text-[#00a05a] mt-2">已選 {selectedStations.length} 個站點</p>
              )}
            </div>

            {/* Station list */}
            <div className="flex-1 overflow-y-auto">
              <div className="px-5 py-1.5 bg-gray-50 border-y border-gray-100">
                <span className="text-xs font-semibold text-gray-700">車站總覽</span>
              </div>
              {filteredStations.map((s, i) => {
                const selected = selectedStations.includes(s.code)
                return (
                  <button
                    key={s.code}
                    onClick={() => toggleStation(s.code)}
                    className="w-full flex items-center px-5 py-3 gap-3 active:bg-gray-50 transition-colors"
                    style={{ borderBottom: i < filteredStations.length - 1 ? '1px solid #f3f4f6' : 'none' }}
                  >
                    {/* Line badge */}
                    <span
                      className="text-white text-[10px] font-bold px-1.5 py-0.5 rounded min-w-[44px] text-center"
                      style={{ backgroundColor: s.color }}
                    >{s.code}</span>
                    {/* Name */}
                    <span className="flex-1 text-left text-sm text-gray-800">{s.name}</span>
                    {/* Heart */}
                    <svg width="24" height="24" viewBox="0 0 24 24" fill={selected ? '#00a05a' : 'none'} stroke={selected ? '#00a05a' : '#d1d5db'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                  </button>
                )
              })}
              {filteredStations.length === 0 && (
                <div className="text-center text-gray-400 text-sm py-10">找不到符合的站點</div>
              )}
            </div>
          </div>
        )}

        {/* ── Step 2 ── */}
        {step === 1 && (
          <div>
            <h1 className="text-xl font-bold text-gray-900 mb-1">消費偏好</h1>
            <p className="text-sm text-gray-500 mb-5">選擇您感興趣的消費類型，我們將推薦最適合的捷運周邊優惠。</p>
            <div className="grid grid-cols-2 gap-3">
              {FOOD_CATS.map(cat => {
                const on = selectedCats.includes(cat.id)
                return (
                  <button
                    key={cat.id}
                    onClick={() => toggleCat(cat.id)}
                    className={`relative flex flex-col items-center gap-2 py-5 rounded-2xl border-2 transition-all ${on ? 'border-[#00a05a] bg-[#f0faf5]' : 'border-gray-100 bg-gray-50'}`}
                  >
                    {on && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-[#00a05a] rounded-full flex items-center justify-center">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      </div>
                    )}
                    <span className="text-3xl">{cat.emoji}</span>
                    <span className={`text-xs font-medium ${on ? 'text-[#00a05a]' : 'text-gray-600'}`}>{cat.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* ── Step 3 ── */}
        {step === 2 && (
          <div>
            <h1 className="text-xl font-bold text-gray-900 mb-1">推播時段偏好</h1>
            <p className="text-sm text-gray-500 mb-6">選擇您希望接收優惠推播的時段。</p>
            <div className="space-y-3">
              {([
                {
                  id: 'peak',
                  title: '尖峰通勤',
                  subtitle: '平日 07:00–09:00 及 17:30–19:30',
                  emoji: '🚇',
                  desc: '只在通勤時段推播，不打擾您的其他時間。',
                },
                {
                  id: 'allday',
                  title: '全天推播',
                  subtitle: '每天 08:00–22:00',
                  emoji: '📲',
                  desc: '隨時掌握周邊優惠，不錯過任何好康。',
                },
              ] as const).map(opt => {
                const on = pushTiming === opt.id
                return (
                  <button
                    key={opt.id}
                    onClick={() => setPushTiming(opt.id)}
                    className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${on ? 'border-[#00a05a] bg-[#f0faf5]' : 'border-gray-100 bg-gray-50'}`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl mt-0.5">{opt.emoji}</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className={`font-semibold text-sm ${on ? 'text-[#00a05a]' : 'text-gray-800'}`}>{opt.title}</span>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${on ? 'border-[#00a05a] bg-[#00a05a]' : 'border-gray-300'}`}>
                            {on && <div className="w-2 h-2 bg-white rounded-full" />}
                          </div>
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">{opt.subtitle}</div>
                        <div className="text-xs text-gray-500 mt-1.5">{opt.desc}</div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Summary */}
            {pushTiming && (
              <div className="mt-6 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">您的個人化設定摘要</p>
                <div className="space-y-1.5 text-sm text-gray-700">
                  <div className="flex gap-2"><span className="text-gray-400">站點</span><span className="font-medium">{selectedStations.map(c => STATIONS.find(s => s.code === c)?.name).join('、') || '—'}</span></div>
                  <div className="flex gap-2"><span className="text-gray-400">偏好類型</span><span className="font-medium">{selectedCats.map(id => FOOD_CATS.find(c => c.id === id)?.label).join('、') || '—'}</span></div>
                  <div className="flex gap-2"><span className="text-gray-400">推播時段</span><span className="font-medium">{pushTiming === 'peak' ? '尖峰通勤' : '全天推播'}</span></div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="h-6" />
      </div>

      {/* Bottom CTA */}
      <div className="px-5 pb-8 pt-4 border-t border-gray-50">
        <StepDots total={3} current={step} />
        <button
          disabled={!canNext}
          onClick={() => step < 2 ? setStep(s => s + 1) : onDone({ stations: selectedStations, cats: selectedCats, pushTiming })}
          className={`mt-4 w-full py-3.5 rounded-2xl font-semibold text-base transition-all ${canNext ? 'bg-[#00a05a] text-white shadow-md shadow-[#00a05a]/20 active:scale-95' : 'bg-gray-100 text-gray-300 cursor-not-allowed'}`}
        >
          {step < 2 ? '下一步' : '開始使用'}
        </button>
        {step > 0 && (
          <button onClick={() => setStep(s => s - 1)} className="mt-2 w-full py-2.5 text-sm text-gray-400 font-medium">
            ← 上一步
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Offer data ──────────────────────────────────────────────────────────────

interface Offer {
  id: string
  cat: string
  brand: string
  title: string
  points: number
  expiry: string
  desc: string
  bg: string
  accent: string
  logo: string
  amount: string
  unit: string
  image?: string        // 實際優惠券設計圖片（若未提供則用自動生成的抽象圖樣）
  content: string       // 優惠內容（全文）
  notes: string[]       // 使用方式 ★ 紅字注意事項
  steps: string[]       // 使用方式編號步驟
}

const DEFAULT_NOTES = [
  '捷運點一經兌換恕不退還。',
  '優惠券具使用期限，逾期即無法使用且不得要求返還捷運點。',
  '本券使用期限：捷運點兌換優惠券起至次月底止。',
]
const DEFAULT_STEPS: string[] = []

const ALL_OFFERS: Offer[] = [
  {
    id: 'o2', cat: 'beauty', brand: '康是美', title: '消費滿$499折$50購物抵用券（須扣捷運點3點）', points: 3,
    expiry: '2026/08/31', desc: '扣點領券後，憑本券至康是美門市消費滿499元，可折抵50元（部分商品不適用，單筆發票限用1張）。',
    bg: '#e8392a', accent: '#fff', logo: '💊', amount: '$50', unit: '抵用', image: kosmedCouponImg,
    content: '扣點領券後，憑券至康是美門市消費滿499元，可折抵50元（部分商品不適用，單筆發票限用1張）。',
    notes: DEFAULT_NOTES,
    steps: DEFAULT_STEPS,
  },
  {
    id: 'offer-coffee-xinyi', cat: 'coffee', brand: 'Metro Cafe', title: '通勤咖啡折抵 50 元', points: 80,
    expiry: '近期有效', desc: '信義安和站附近咖啡折抵優惠。', bg: '#7b4b2a', accent: '#fff', logo: '☕', amount: '$50', unit: '抵用',
    content: '使用 80 點可兌換信義安和站附近咖啡折抵券。', notes: DEFAULT_NOTES, steps: DEFAULT_STEPS,
  },
  {
    id: 'offer-lunch-xinyi', cat: 'lunch', brand: 'Metro Kitchen', title: '午間套餐折抵 80 元', points: 120,
    expiry: '近期有效', desc: '信義安和站附近午餐套餐折抵優惠。', bg: '#d97706', accent: '#fff', logo: '🍱', amount: '$80', unit: '抵用',
    content: '使用 120 點可兌換信義安和站附近午餐套餐折抵券。', notes: DEFAULT_NOTES, steps: DEFAULT_STEPS,
  },
  {
    id: 'offer-dessert-101', cat: 'bakery', brand: 'Sweet Spot', title: '甜點兌換券', points: 150,
    expiry: '近期有效', desc: '台北101／世貿站附近甜點兌換。', bg: '#d94672', accent: '#fff', logo: '🍰', amount: '1', unit: '份',
    content: '使用 150 點可兌換台北101／世貿站附近甜點。', notes: DEFAULT_NOTES, steps: DEFAULT_STEPS,
  },
  {
    id: 'offer-drink-101', cat: 'boba', brand: 'Daily Tea', title: '台北101 手搖飲折抵 30 元', points: 70,
    expiry: '近期有效', desc: '台北101／世貿站附近飲品折抵優惠。', bg: '#0f766e', accent: '#fff', logo: '🧋', amount: '$30', unit: '抵用',
    content: '使用 70 點可兌換台北101／世貿站附近飲品折抵券。', notes: DEFAULT_NOTES, steps: DEFAULT_STEPS,
  },
  {
    id: 'offer-burger-ximen', cat: 'fast', brand: 'Ximen Burger', title: '西門町漢堡套餐折抵 100 元', points: 160,
    expiry: '近期有效', desc: '西門站附近漢堡套餐折抵優惠。', bg: '#b45309', accent: '#fff', logo: '🍔', amount: '$100', unit: '抵用',
    content: '使用 160 點可兌換西門站附近漢堡套餐折抵券。', notes: DEFAULT_NOTES, steps: DEFAULT_STEPS,
  },
  {
    id: 'offer-coffee-gongguan', cat: 'coffee', brand: 'Campus Coffee', title: '公館咖啡折抵 50 元', points: 90,
    expiry: '近期有效', desc: '公館站附近咖啡店折抵優惠。', bg: '#92400e', accent: '#fff', logo: '☕', amount: '$50', unit: '抵用',
    content: '使用 90 點可兌換公館站附近咖啡折抵券。', notes: DEFAULT_NOTES, steps: DEFAULT_STEPS,
  },
  {
    id: 'offer-convenience-cityhall', cat: 'cvs', brand: 'Metro Mart', title: '市政府便利商店折抵 50 元', points: 100,
    expiry: '近期有效', desc: '市政府站附近便利商店消費折抵優惠。', bg: '#2563eb', accent: '#fff', logo: '🏪', amount: '$50', unit: '抵用',
    content: '使用 100 點可兌換市政府站附近便利商店消費折抵券。', notes: DEFAULT_NOTES, steps: DEFAULT_STEPS,
  },
  {
    id: 'offer-lunch-xingtian', cat: 'lunch', brand: 'Xingtian Bento', title: '行天宮便當折抵 80 元', points: 150,
    expiry: '近期有效', desc: '行天宮站附近便當與午餐折抵優惠。', bg: '#dc2626', accent: '#fff', logo: '🍱', amount: '$80', unit: '抵用',
    content: '使用 150 點可兌換行天宮站附近便當折抵券。', notes: DEFAULT_NOTES, steps: DEFAULT_STEPS,
  },
]

function OfferDetail({
  offer,
  onBack,
  onRedeem,
  onDismiss,
  redemption,
  recommendation,
  redeeming = false,
}: {
  offer: Offer
  onBack: () => void
  onRedeem?: () => Promise<boolean>
  onDismiss?: () => void
  redemption?: Redemption | null
  recommendation?: Recommendation | null
  redeeming?: boolean
}) {
  const [claimed, setClaimed] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const selectedCandidate = recommendation?.candidates.find(candidate => candidate.offer_id === offer.id)

  useEffect(() => {
    if (redemption?.status === 'REDEMPTION_STATUS_SUCCEEDED' || redemption?.status === 'REDEMPTION_STATUS_VERIFIED') {
      setClaimed(true)
    }
  }, [redemption])

  async function confirmRedeem() {
    setShowConfirm(false)
    if (onRedeem) {
      const success = await onRedeem()
      if (!success) return
    }
    setClaimed(true)
    setShowSuccess(true)
  }

  return (
    <div className="absolute inset-0 z-40 flex flex-col" style={{ backgroundColor: '#e1e6ea' }}>

      {/* Confirmation dialog */}
      {showConfirm && (
        <div className="absolute inset-0 z-50 flex items-center justify-center px-6" style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}>
          <div className="bg-white rounded-2xl w-full py-7 px-6 flex flex-col items-center" style={{ maxWidth: 340 }}>
            {/* ! icon */}
            <div className="w-14 h-14 rounded-full border-2 flex items-center justify-center mb-4" style={{ borderColor: '#f59100' }}>
              <span className="font-black text-2xl" style={{ color: '#f59100' }}>!</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">注意</h3>
            {offer.points > 0 && (
              <p className="text-base font-bold text-gray-900 underline mb-4">
                本券需扣捷運點{offer.points}點
              </p>
            )}
            {/* Red diamond bullets */}
            <div className="w-full space-y-3 mb-6">
              <p className="text-[14px] font-semibold leading-snug flex gap-2" style={{ color: '#e53e3e' }}>
                <span className="flex-shrink-0">◆</span>
                <span>捷運點一經兌換恕不退還</span>
              </p>
              <p className="text-[14px] font-semibold leading-snug flex gap-2" style={{ color: '#e53e3e' }}>
                <span className="flex-shrink-0">◆</span>
                <span>優惠券具使用期限，逾期即無法使用，且不得要求返還捷運點</span>
              </p>
            </div>
            {/* Buttons */}
            <div className="flex gap-3 w-full">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-3 rounded-xl font-bold text-white text-base"
                style={{ backgroundColor: '#e53e3e' }}
              >取消</button>
              <button
                onClick={() => void confirmRedeem()}
                disabled={redeeming}
                className="flex-1 py-3 rounded-xl font-bold text-white text-base"
                style={{ backgroundColor: '#34ace0' }}
              >{redeeming ? '處理中…' : '確定'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Success dialog */}
      {showSuccess && (
        <div className="absolute inset-0 z-50 flex items-center justify-center px-6" style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}>
          <div className="bg-white rounded-2xl w-full py-10 px-8 flex flex-col items-center" style={{ maxWidth: 340 }}>
            {/* Green circle checkmark */}
            <div className="w-16 h-16 rounded-full border-2 flex items-center justify-center mb-5" style={{ borderColor: '#4caf50' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#4caf50" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <p className="text-lg text-gray-700 mb-6">領取成功</p>
            <button
              onClick={() => setShowSuccess(false)}
              className="w-36 py-3 rounded-xl font-bold text-white text-base"
              style={{ backgroundColor: '#34ace0' }}
            >關閉</button>
          </div>
        </div>
      )}

      {/* Status bar space */}
      <div className="h-6 bg-white" />

      {/* Header — fixed-width button + spacer on either side keeps the title truly centered */}
      <div className="flex items-center px-4 py-2 border-b border-gray-100 bg-white">
        <button onClick={onBack} className="w-8 flex-shrink-0 text-gray-600 p-1">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <span className="flex-1 text-center text-base font-semibold text-gray-800">優惠券</span>
        <div className="w-8 flex-shrink-0" />
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto scrollbar-auto">
        {/* Large banner — real image if provided, else abstract banner */}
        <div
          className={offer.image ? 'mx-auto mt-4 overflow-hidden' : 'mx-4 mt-4 rounded-2xl overflow-hidden'}
          style={offer.image ? { width: '70%', aspectRatio: '473 / 319' } : { height: 200, background: offer.bg }}
        >
          {offer.image ? (
            <img src={offer.image} alt={offer.brand} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center relative">
              <div className="absolute inset-3 rounded-xl pointer-events-none" style={{ border: `2px dashed ${offer.accent}40` }} />
              <span className="font-black text-2xl text-center px-4 z-10 leading-tight" style={{ color: offer.accent }}>{offer.brand}</span>
              <span className="font-black z-10 mt-1 leading-none" style={{ color: offer.accent, fontSize: 52 }}>{offer.amount}</span>
              {offer.unit && <span className="text-sm font-semibold z-10 mt-1" style={{ color: offer.accent, opacity: 0.9 }}>{offer.unit}</span>}
            </div>
          )}
        </div>

        <div className="px-4 py-4">
          {/* Title + expiry */}
          <h2 className="text-[18px] font-bold leading-snug mb-1 text-center" style={{ color: '#32607c' }}>
            {offer.brand}｜{offer.title}
          </h2>
          <p className="text-[14px] font-medium mb-4 text-center" style={{ color: '#d0272a' }}>使用期限：{offer.expiry.replace(/\//g, '-')}</p>

          {recommendation && recommendation.offer_id === offer.id && (
            <section className="mb-5 rounded-xl border border-[#b8dfcf] bg-[#effaf4] px-3 py-3">
              <h3 className="text-[14px] font-bold mb-2" style={{ color: '#16794c' }}>推薦依據</h3>
              <div className="space-y-1.5">
                {recommendation.reasons.map(reason => (
                  <p key={reason} className="text-[12px] text-gray-700 leading-relaxed flex gap-1.5">
                    <span style={{ color: '#00a05a' }}>✓</span>
                    <span>{reason}</span>
                  </p>
                ))}
              </div>
              {selectedCandidate && (
                <p className="text-[11px] text-gray-500 mt-2">
                  已評估 {recommendation.candidates.length} 個候選，規則分數 {selectedCandidate.rule_score.toFixed(2)}。
                </p>
              )}
              {onDismiss && (
                <button
                  onClick={onDismiss}
                  className="mt-3 text-[12px] text-gray-500 underline"
                >
                  對這類優惠沒興趣
                </button>
              )}
            </section>
          )}

          {/* 領券 button */}
          <button
            onClick={() => !claimed && setShowConfirm(true)}
            disabled={claimed || redeeming}
            className={`w-full py-3 rounded-xl text-base font-bold mb-6 transition-all ${
              claimed ? 'bg-gray-200 text-gray-400 cursor-default' : 'text-white active:scale-95'
            }`}
            style={claimed ? {} : { backgroundColor: '#34ace0' }}
          >
            {claimed ? '已領取 ✓' : redeeming ? '處理中…' : '領券'}
          </button>

          {redemption && (
            <p className="text-center text-xs text-gray-500 -mt-3 mb-5">
              兌換狀態：{redemption.status.replace('REDEMPTION_STATUS_', '').toLowerCase()}
            </p>
          )}

          {/* 優惠內容 */}
          <section className="mb-5">
            <h3 className="text-[14px] font-bold mb-2" style={{ color: '#32607c' }}>優惠內容</h3>
            <p className="text-[13px] text-gray-600 leading-relaxed">{offer.content}</p>
          </section>

          {/* 使用方式 */}
          <section className="mb-6">
            <h3 className="text-[14px] font-bold mb-2" style={{ color: '#32607c' }}>使用方式</h3>
            {/* Red starred notes */}
            <div className="mb-3 space-y-1.5">
              {offer.notes.map((n, i) => (
                <p key={i} className="text-[12px] leading-relaxed flex gap-1.5" style={{ color: '#e53e3e' }}>
                  <span className="flex-shrink-0">★</span>
                  <span>{n}</span>
                </p>
              ))}
            </div>
            {/* Numbered steps */}
            <div className="space-y-2">
              {offer.steps.map((s, i) => (
                <p key={i} className="text-[12px] text-gray-600 leading-relaxed flex gap-2">
                  <span className="flex-shrink-0 font-semibold" style={{ color: '#32607c' }}>{i + 1}.</span>
                  <span>{s}</span>
                </p>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* Bottom 我的優惠券 — sits flush at the very bottom. Full-width with no rounded corners
          of its own (and tall enough to clear the phone frame's 48px radius) so the frame's
          own corner-clip does all the rounding, instead of two mismatched curves fighting. */}
      <div className="px-4 flex items-center justify-center" style={{ backgroundColor: '#16324f', minHeight: 56 }}>
        <button className="flex items-center justify-center gap-1.5 text-[13px] font-bold text-white">
          <span className="text-[10px]">▼</span>
          我的優惠券
        </button>
      </div>
    </div>
  )
}

function OfferBanner({ offer }: { offer: Offer }) {
  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center relative"
      style={{ background: offer.bg, borderRadius: 12 }}
    >
      {/* dashed inner border */}
      <div
        className="absolute inset-2 rounded-lg pointer-events-none"
        style={{ border: `2px dashed ${offer.accent}33` }}
      />
      {/* brand name */}
      <span
        className="font-black text-base leading-tight text-center px-2 z-10"
        style={{ color: offer.accent }}
      >{offer.brand}</span>
      {/* big amount */}
      <span
        className="font-black leading-none z-10 mt-1"
        style={{ color: offer.accent, fontSize: 32 }}
      >{offer.amount}</span>
      {offer.unit && (
        <span
          className="text-xs font-semibold z-10 mt-0.5"
          style={{ color: offer.accent, opacity: 0.85 }}
        >{offer.unit}</span>
      )}
      {/* small print */}
      <span
        className="text-[9px] text-center px-3 z-10 mt-2 leading-tight"
        style={{ color: offer.accent, opacity: 0.6 }}
      >{offer.desc.slice(0, 28)}…</span>
    </div>
  )
}

// Builds a static clip-path polygon that cuts two semicircular notches (radius r) out of the
// top and bottom edges, centered at 50% horizontally. Uses calc(% ± px) coordinates so the
// browser resolves the exact shape at paint time — no JS size measurement (e.g. ResizeObserver)
// required at all, which is what made the earlier pixel-measured version fail to render here.
const OFFER_CARD_NOTCH_R = 11
function buildNotchClipPath(r: number) {
  const segments = 16
  const top: string[] = []
  const bottom: string[] = []
  for (let i = 0; i <= segments; i++) {
    const thetaTop = Math.PI * (1 - i / segments) // sweeps PI -> 0
    const dxTop = r * Math.cos(thetaTop)
    const dyTop = r * Math.sin(thetaTop)
    top.push(`calc(50% + ${dxTop.toFixed(2)}px) ${dyTop.toFixed(2)}px`)

    const thetaBottom = Math.PI * (i / segments) // sweeps 0 -> PI
    const dxBottom = r * Math.cos(thetaBottom)
    const dyBottom = r * Math.sin(thetaBottom)
    bottom.push(`calc(50% + ${dxBottom.toFixed(2)}px) calc(100% - ${dyBottom.toFixed(2)}px)`)
  }
  return `polygon(0 0, ${top.join(', ')}, 100% 0, 100% 100%, ${bottom.join(', ')}, 0 100%)`
}
const OFFER_CARD_CLIP_PATH = buildNotchClipPath(OFFER_CARD_NOTCH_R)

function OfferCard({ offer, arriving, onOpen }: { offer: Offer; arriving: string; onOpen: () => void }) {
  return (
    // drop-shadow follows the clip shape; no box-shadow needed
    <div className="mb-5" style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.11))' }}>
      {/* Outer wrapper handles the rounded corners via overflow-hidden — independent of the
          notch clip-path below, so the corners stay reliable even if clip-path support varies. */}
      <div style={{ borderRadius: 16, overflow: 'hidden' }}>
        <div
          style={{
            // cut two semicircles from top & bottom edges where the dashed divider meets them
            clipPath: OFFER_CARD_CLIP_PATH,
            backgroundColor: 'white',
          }}
        >
          <div className="flex" style={{ padding: 12 }}>
            {/* Left banner — real image if provided, else abstract banner. Roughly half the card width, like a real ticket stub. */}
            <div
              className={`flex-1 overflow-hidden bg-white ${offer.image ? '' : 'rounded-xl'}`}
              style={{ aspectRatio: offer.image ? '473 / 319' : '1 / 1', alignSelf: 'center' }}
            >
              {offer.image ? (
                <img src={offer.image} alt={offer.brand} className="w-full h-full object-contain" />
              ) : (
                <OfferBanner offer={offer} />
              )}
            </div>

            {/* Dashed divider at mid-card */}
            <div style={{ width: 0, margin: '0 12px', borderLeft: '2px dashed #d1d5db', alignSelf: 'stretch' }} />

            {/* Right content */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <p className="text-[13px] font-bold text-gray-900 leading-snug mb-1.5">
                {offer.brand}｜{offer.title}
              </p>
              <p className="text-[12px] font-semibold mb-1.5" style={{ color: '#d0272a' }}>
                使用期限：{offer.expiry}
              </p>
              {arriving && (
                <p className="text-[11px] text-gray-400 mt-1.5">
                  📍 <span className="font-medium text-gray-600">{arriving}</span> 推薦
                </p>
              )}
              {/* 領券 button — matches right column width only */}
              <button
                onClick={onOpen}
                className="mt-3 py-2 rounded-xl text-sm font-bold tracking-wide text-white active:scale-95 transition-all"
                style={{ backgroundColor: '#34ace0' }}
              >
                領券
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Home Screen with Push Notification ─────────────────────────────────────

function HomeScreen({ showNotif, onNotifTap, onNotifDismiss, onReturnToApp }: { showNotif: boolean; onNotifTap: () => void; onNotifDismiss: () => void; onReturnToApp: () => void }) {
  const [expanded, setExpanded] = useState(false)
  const touchStartY = useRef<number | null>(null)
  const now = new Date()
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  const dateStr = `${now.getMonth() + 1}月${now.getDate()}日 週${'日一二三四五六'[now.getDay()]}`

  return (
    <div
      className="absolute inset-0 flex flex-col"
      onTouchStart={event => { touchStartY.current = event.touches[0]?.clientY ?? null }}
      onTouchEnd={event => {
        const startY = touchStartY.current
        touchStartY.current = null
        if (startY !== null && startY - (event.changedTouches[0]?.clientY ?? startY) > 48) onReturnToApp()
      }}
      style={{
      zIndex: 100,
      background: 'linear-gradient(160deg, #1a3a2a 0%, #0d2318 40%, #0a1a10 100%)',
      }}
    >
      {/* Subtle bokeh blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute rounded-full opacity-20" style={{ width: 260, height: 260, top: 80, left: -60, background: 'radial-gradient(circle, #00c070, transparent 70%)' }} />
        <div className="absolute rounded-full opacity-15" style={{ width: 200, height: 200, top: 300, right: -40, background: 'radial-gradient(circle, #34ace0, transparent 70%)' }} />
        <div className="absolute rounded-full opacity-10" style={{ width: 180, height: 180, bottom: 160, left: 40, background: 'radial-gradient(circle, #00a05a, transparent 70%)' }} />
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between px-6 pt-3 pb-1">
        <span className="text-white text-[12px] font-semibold">中華電信</span>
        <div className="flex items-center gap-1.5">
          <svg width="15" height="11" viewBox="0 0 24 18" fill="white"><rect x="0" y="6" width="4" height="12" rx="1"/><rect x="6" y="4" width="4" height="14" rx="1"/><rect x="12" y="1" width="4" height="17" rx="1"/><rect x="18" y="0" width="4" height="18" rx="1" opacity="0.4"/></svg>
          <svg width="14" height="11" viewBox="0 0 24 18" fill="white"><path d="M12 3C7.5 3 3.5 5 0.7 8.2l2.1 2.1C5 8.1 8.3 6.5 12 6.5s7 1.6 9.2 3.8l2.1-2.1C20.5 5 16.5 3 12 3z"/><path d="M12 9c-2.8 0-5.3 1.1-7.1 2.9l2.1 2.1c1.3-1.3 3-2 5-2s3.7.7 5 2l2.1-2.1C17.3 10.1 14.8 9 12 9z"/><circle cx="12" cy="16" r="2"/></svg>
          <span className="text-white text-[12px] font-semibold">63</span>
        </div>
      </div>

      {/* Clock */}
      <div className="flex flex-col items-center mt-10 mb-8">
        <span className="text-white font-light" style={{ fontSize: 72, letterSpacing: -2, lineHeight: 1 }}>{timeStr}</span>
        <span className="text-white/70 text-[15px] mt-2">{dateStr}</span>
      </div>

      {/* Notification card */}
      <div className="mx-3" style={{ transition: 'opacity 0.4s, transform 0.4s', opacity: showNotif ? 1 : 0, transform: showNotif ? 'translateY(0)' : 'translateY(-12px)', pointerEvents: showNotif ? 'auto' : 'none' }}>
        <div
          className="rounded-2xl overflow-hidden shadow-2xl"
          style={{ backgroundColor: 'rgba(230,230,230,0.22)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.18)' }}
        >
          <div className="flex items-start gap-3 px-4 pt-3.5 pb-3">
            {/* App icon */}
            <div className="flex-shrink-0 w-10 h-10 rounded-xl overflow-hidden shadow-sm">
              <img src={appIconImg} alt="台北捷運Go" className="w-full h-full object-cover" />
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0 cursor-pointer" onClick={onNotifTap}>
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-white/80 text-[11px] font-semibold">台北捷運Go</span>
                <span className="text-white/50 text-[11px] ml-2 flex-shrink-0">剛剛</span>
              </div>
              <p className="text-white text-[13px] font-bold leading-snug">
                台北車站到了！「康是美」購物抵用券等你領💊
              </p>
              {!expanded ? (
                <p className="text-white/75 text-[12px] leading-snug mt-0.5 line-clamp-2">
                  消費滿 499 元折 50 元，出站即到門市
                </p>
              ) : (
                <div className="text-white/75 text-[12px] leading-relaxed mt-1 space-y-0.5">
                  <p>消費滿 499 元折 50 元，出站即到門市</p>
                  <p>🪙 扣 3 點捷運點即可兌換，使用期限至 08/31</p>
                  <p>➡️ 點擊查看詳情，一鍵兌換</p>
                </div>
              )}
            </div>

            {/* Expand chevron */}
            <button onClick={() => setExpanded(e => !e)} className="flex-shrink-0 pt-0.5 text-white/50">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                {expanded ? <polyline points="18 15 12 9 6 15"/> : <polyline points="6 9 12 15 18 9"/>}
              </svg>
            </button>
          </div>

          {/* Expanded actions */}
          {expanded && (
            <div className="flex" style={{ borderTop: '1px solid rgba(255,255,255,0.15)' }}>
              <button
                onClick={onNotifDismiss}
                className="flex-1 py-2.5 text-[13px] font-medium text-white/60"
                style={{ borderRight: '1px solid rgba(255,255,255,0.15)' }}
              >關閉</button>
              <button
                onClick={onNotifTap}
                className="flex-1 py-2.5 text-[13px] font-bold text-white"
              >查看詳情</button>
            </div>
          )}
        </div>
      </div>

      {/* Home indicator hint */}
      <div className="absolute bottom-6 left-0 right-0 flex flex-col items-center gap-2">
        <button onClick={onReturnToApp} className="rounded-full border border-white/25 bg-black/20 px-4 py-1.5 text-[12px] font-medium text-white/80">
          返回 App
        </button>
        <span className="text-white/40 text-[11px]">向上滑動或點擊返回 App</span>
        <div className="w-24 h-1 rounded-full bg-white/30" />
      </div>
    </div>
  )
}

const CATEGORY_TO_API: Record<string, string> = {
  fast: 'fast food',
  bakery: 'dessert',
  coffee: 'coffee',
  lunch: 'lunch',
  cvs: 'convenience store',
  boba: 'drink',
  local: 'local',
  travel: 'travel',
  beauty: 'beauty',
  other: 'general',
}

const DEMO_OFFER_POINTS: Record<string, number> = {
  'offer-coffee-xinyi': 80,
  'offer-lunch-xinyi': 120,
  'offer-dessert-101': 150,
  'offer-dessert-xinyi': 100,
  'offer-coffee-101': 90,
  'offer-drink-101': 70,
  'offer-breakfast-taipei': 110,
  'offer-fastfood-taipei': 180,
  'offer-burger-ximen': 160,
  'offer-drink-ximen': 75,
  'offer-coffee-gongguan': 90,
  'offer-lunch-gongguan': 140,
  'offer-convenience-cityhall': 100,
  'offer-life-cityhall': 130,
  'offer-convenience-taipei': 100,
  'offer-lunch-xingtian': 150,
  'offer-dessert-xingtian': 90,
}

function recommendationToOffer(recommendation: Recommendation): Offer {
  const points = DEMO_OFFER_POINTS[recommendation.offer_id] || 80
  return {
    id: recommendation.offer_id,
    cat: 'recommendation',
    brand: 'MetroPoint AI',
    title: recommendation.title || '專屬捷運點優惠',
    points,
    expiry: '近期有效',
    desc: recommendation.body,
    bg: '#0b8f5a',
    accent: '#fff',
    logo: 'M',
    amount: `${points}`,
    unit: '捷運點',
    content: recommendation.body,
    notes: DEFAULT_NOTES,
    steps: [],
  }
}

export default function App() {
  const [onboardingDone, setOnboardingDone] = useState(false)
  const [userPrefs, setUserPrefs] = useState<{ stations: string[]; cats: string[] }>({ stations: [], cats: [] })
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null)
  const [journeyId, setJourneyId] = useState('')
  const [journeyTraceId, setJourneyTraceId] = useState('')
  const [redemption, setRedemption] = useState<Redemption | null>(null)
  const [redeeming, setRedeeming] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [apiMessage, setApiMessage] = useState('')
  const [notificationSubscriptionId, setNotificationSubscriptionId] = useState('')
  const [activeTab, setActiveTab] = useState<'frequent' | 'nearby' | 'offers'>('frequent')
  const [detailOffer, setDetailOffer] = useState<Offer | null>(null)
  const [bannerIndex, setBannerIndex] = useState(3)
  const [showHomeScreen, setShowHomeScreen] = useState(false)
  const [showNotif, setShowNotif] = useState(false)
  const impressedRecommendationId = useRef('')
  const totalBanners = 9

  const kosmedOffer = ALL_OFFERS.find(o => o.id === 'o2')!

  useEffect(() => {
    void getUserProfile().then(({ profile }) => {
      if (profile.favorite_station_ids.length > 0 || profile.preferred_categories.length > 0) {
        const uiCategories = profile.preferred_categories.filter(category => Object.prototype.hasOwnProperty.call(CATEGORY_TO_API, category))
        setUserPrefs({ stations: profile.favorite_station_ids, cats: uiCategories })
      }
    }).catch(() => {
      // The visual demo remains usable when the backend is not running yet.
    })
  }, [])

  useEffect(() => {
    if (!recommendation || !journeyId || !journeyTraceId || impressedRecommendationId.current === recommendation.recommendation_id) return
    impressedRecommendationId.current = recommendation.recommendation_id
    void recordRecommendationEvent({
      eventType: 'recommendation.impressed.v1',
      recommendationId: recommendation.recommendation_id,
      journeyId,
      offerId: recommendation.offer_id,
      traceId: journeyTraceId,
    }).catch(() => {
      // Engagement telemetry is best-effort and must not block the demo flow.
    })
  }, [journeyId, journeyTraceId, recommendation])

  async function loadRecommendation(stationId: string) {
    const traceId = crypto.randomUUID()
    setJourneyTraceId(traceId)
    const entry = await createEntryEvent(stationId, DEMO_USER_ID_HASH, traceId)
    setJourneyId(entry.journey_id)
    let lastError: unknown
    for (let attempt = 0; attempt < 30; attempt += 1) {
      try {
        const latest = await getLatestRecommendation(entry.journey_id)
        setRecommendation(latest)
        return
      } catch (error) {
        lastError = error
        await new Promise(resolve => window.setTimeout(resolve, 500))
      }
    }
    throw lastError instanceof Error ? lastError : new Error('推薦尚未準備完成')
  }

  function openOffer(offer: Offer) {
    setDetailOffer(offer)
    if (!recommendation || offer.id !== recommendation.offer_id || !journeyId || !journeyTraceId) return
    void recordRecommendationEvent({
      eventType: 'recommendation.clicked.v1',
      recommendationId: recommendation.recommendation_id,
      journeyId,
      offerId: offer.id,
      traceId: journeyTraceId,
    }).catch(() => {
      // Engagement telemetry is best-effort and must not block opening the offer.
    })
  }

  function dismissRecommendation() {
    if (!recommendation || !journeyId || !journeyTraceId) return
    void recordRecommendationEvent({
      eventType: 'recommendation.dismissed.v1',
      recommendationId: recommendation.recommendation_id,
      journeyId,
      offerId: recommendation.offer_id,
      traceId: journeyTraceId,
    }).catch(() => {
      // Feedback telemetry is best-effort and must not block the demo flow.
    })
    setDetailOffer(null)
    setApiMessage('已記錄您的偏好，下一次推薦會降低這類優惠的權重。')
  }

  async function completeOnboarding(result: OnboardingResult) {
    setSyncing(true)
    setApiMessage('正在同步您的個人化設定…')
    setUserPrefs({ stations: result.stations, cats: result.cats })
    const notificationWindow = result.pushTiming === 'peak'
      ? { start: '07:00', end: '10:00' }
      : { start: '08:00', end: '22:00' }
    try {
      await updateUserPreferences({
        favorite_station_ids: result.stations,
        preferred_categories: result.cats.map(category => CATEGORY_TO_API[category] || category),
        budget_min_points: 80,
        budget_max_points: 300,
        timezone: 'Asia/Taipei',
        notifications_enabled: Boolean(result.pushTiming),
        notification_start_local: notificationWindow.start,
        notification_end_local: notificationWindow.end,
      })
      if (result.pushTiming) {
        let browserPushAvailable = true
        let browserSubscription = null
        try {
          browserSubscription = await registerBrowserPushSubscription()
        } catch (error) {
          browserPushAvailable = false
          console.warn('[push] Browser notification permission is unavailable:', error)
        }
        if (browserSubscription) {
          const subscription = await registerNotificationSubscription(browserSubscription)
          setNotificationSubscriptionId(subscription.subscription_id)
        } else if (browserPushAvailable) {
          const subscription = await registerNotificationSubscription({
            // Keep the deterministic mock when VAPID is not configured for the demo.
            endpoint: `https://demo.invalid/spacetime-node/${crypto.randomUUID()}`,
            p256dh: 'demo-p256dh',
            auth: 'demo-auth',
            user_agent: navigator.userAgent,
          })
          setNotificationSubscriptionId(subscription.subscription_id)
        }
      }
      // Use the station selected during onboarding; R04 remains the fallback for skip/demo mode.
      await loadRecommendation(result.stations[0] || 'R04')
      setApiMessage('已同步設定並啟用展示推播，這是依照您的偏好產生的推薦。')
    } catch (error) {
      setApiMessage(error instanceof Error ? `後端尚未連線：${error.message}` : '後端尚未連線，先顯示展示資料。')
    } finally {
      setOnboardingDone(true)
      setSyncing(false)
    }
  }

  async function disableNotifications() {
    if (!notificationSubscriptionId) return
    try {
      await revokeNotificationSubscription(notificationSubscriptionId)
      await unregisterBrowserPushSubscription()
      setNotificationSubscriptionId('')
      setApiMessage('展示推播已停用。')
    } catch (error) {
      setApiMessage(error instanceof Error ? `停用推播失敗：${error.message}` : '停用推播失敗。')
    }
  }

  async function redeemRecommendation(): Promise<boolean> {
    if (!recommendation || !journeyId) {
      setApiMessage('請先完成進站推薦，再兌換優惠。')
      return false
    }
    setRedeeming(true)
    setApiMessage('正在建立兌換…')
    const idempotencyKey = `web-${recommendation.recommendation_id}`
    try {
      const result = await createRedemption(recommendation.offer_id, journeyId, idempotencyKey, DEMO_USER_ID_HASH, journeyTraceId)
      setRedemption(result.redemption)
      try {
        const persisted = await getRedemption(result.redemption.redemption_id)
        setRedemption(persisted.redemption)
      } catch {
        // The creation response is still a valid status snapshot if the follow-up read is unavailable.
      }
      setApiMessage('兌換成功，點數與庫存已由後端交易確認。')
      return true
    } catch (error) {
      setApiMessage(error instanceof Error ? `兌換失敗：${error.message}` : '兌換失敗，請稍後再試。')
      return false
    } finally {
      setRedeeming(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-200 flex justify-center items-center py-8">
      {/* Phone frame — iPhone 14 Pro 390×844 */}
      <div className="relative bg-white flex flex-col overflow-hidden shadow-2xl" style={{ width: 390, height: 844, borderRadius: 48 }}>

        {/* Home screen with push notification — shown first, before onboarding */}
        {showHomeScreen && (
          <HomeScreen
            showNotif={showNotif}
            onNotifTap={() => { setShowHomeScreen(false); setDetailOffer(kosmedOffer) }}
            onNotifDismiss={() => setShowHomeScreen(false)}
            onReturnToApp={() => setShowHomeScreen(false)}
          />
        )}

        {/* Offer detail overlay */}
        {detailOffer && (
          <OfferDetail
            offer={detailOffer}
            onBack={() => setDetailOffer(null)}
            onRedeem={recommendation && detailOffer.id === recommendation.offer_id ? redeemRecommendation : undefined}
            onDismiss={recommendation && detailOffer.id === recommendation.offer_id ? dismissRecommendation : undefined}
            redemption={recommendation && detailOffer.id === recommendation.offer_id ? redemption : null}
            recommendation={recommendation && detailOffer.id === recommendation.offer_id ? recommendation : null}
            redeeming={redeeming}
          />
        )}

        {/* Onboarding overlay */}
        {!onboardingDone && (
          <Onboarding onDone={result => { void completeOnboarding(result) }} />
        )}

        {syncing && (
          <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/20">
            <div className="rounded-2xl bg-white px-6 py-5 text-center shadow-xl">
              <div className="mx-auto mb-2 h-7 w-7 animate-spin rounded-full border-2 border-gray-200 border-t-[#00a05a]" />
              <p className="text-sm font-medium text-gray-700">正在準備個人化推薦…</p>
            </div>
          </div>
        )}

        {/* Status bar space */}
        <div className="h-6 bg-white" />

        {/* Header */}
        <header className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-100">
          <button className="flex items-center gap-1 text-gray-700 text-sm font-medium">
            <IconGlobe />
            <span>中文</span>
          </button>
          {/* Logo */}
          <div className="flex items-center gap-1.5">
            <img src={logoImg} alt="台北捷運" className="h-5 w-auto object-contain" />
            <span className="text-base font-bold text-gray-800">台北捷運</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="text-[#00a05a]"><IconTag /></button>
            <button className="text-[#00a05a] relative">
              <IconBell />
              <span className="absolute -top-1 -right-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">5</span>
            </button>
          </div>
        </header>

        {/* Announcement ticker */}
        <div className="bg-gray-50 px-3 py-2 flex items-center gap-2 overflow-hidden border-b border-gray-100">
          <span className="text-base">📢</span>
          <div className="overflow-hidden flex-1">
            <p className="text-sm text-gray-600 truncate">立即設定消費偏好，解鎖出站專屬優惠</p>
          </div>
        </div>

        {apiMessage && (
          <div className="mx-3 mt-2 rounded-xl border border-[#c9e3ee] bg-[#eef8fb] px-3 py-2 text-xs leading-relaxed text-[#3179af]">
            <div className="flex items-center justify-between gap-2">
              <span>{apiMessage}</span>
              {notificationSubscriptionId && (
                <button onClick={() => { void disableNotifications() }} className="flex-shrink-0 font-semibold underline">停用推播</button>
              )}
            </div>
          </div>
        )}

        {/* Main content — scrollable */}
        <div className="flex-1 overflow-y-auto scrollbar-auto px-3 pb-4 space-y-4">

          {/* Banner carousel */}
          <div className="mt-2">
            <div className="relative overflow-hidden rounded-2xl" style={{ height: '130px' }}>
              {bannerIndex === 3 ? (
                <img src={bannerImg} alt="捷運點月月領活動" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #00a05a 0%, #007a44 100%)' }}>
                  <span className="text-white font-bold text-lg">台北捷運公告</span>
                </div>
              )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, paddingTop: 8, paddingBottom: 8 }}>
              {Array.from({ length: totalBanners }).map((_, i) => (
                <div
                  key={i}
                  onClick={() => setBannerIndex(i)}
                  style={{ display: 'block', width: 8, height: 8, borderRadius: '50%', flexShrink: 0, cursor: 'pointer', backgroundColor: i === bannerIndex ? '#1f2937' : '#9ca3af' }}
                />
              ))}
            </div>
          </div>

          {/* Search bar */}
          <div className="mt-3 flex justify-center">
            <div className="inline-flex p-[3px] rounded-xl" style={{ background: 'linear-gradient(90deg, #1a73e8 0%, #00a05a 100%)' }}>
              <div className="rounded-[10px] pl-4 pr-12 py-1.5 flex items-center gap-2 bg-white">
                <IconRoute />
                <span className="text-sm font-medium text-gray-700">旅程規劃</span>
                <span className="w-px h-4 bg-gray-200 font-bold" />
                <IconSearch />
                <span className="text-gray-400 text-sm">搜尋您要規劃的車站</span>
              </div>
            </div>
          </div>

          {/* 常用功能 */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-gray-800 ml-2">常用功能</h2>
              <button className="text-sm text-[#00a05a] font-medium">更多</button>
            </div>
            <img src={featureGridImg} alt="常用功能" className="w-full rounded-xl object-contain" />
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, paddingTop: 8, paddingBottom: 4 }}>
              {[0,1,2,3,4].map(i => (
                <div key={i} style={{ display: 'block', width: 8, height: 8, borderRadius: '50%', flexShrink: 0, backgroundColor: i === 0 ? '#1f2937' : '#9ca3af' }} />
              ))}
            </div>
            <div className="grid grid-cols-4 gap-3" style={{ display: 'none' }}>
              <FeatureIcon label="旅程時間/票價">
                <svg width="34" height="34" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="#2eaab0" strokeWidth="1.6" fill="#e0f4f5"/>
                  <circle cx="12" cy="9" r="2.5" stroke="#2eaab0" strokeWidth="1.5" fill="white"/>
                  <polyline points="12 7.5 12 9 13.2 9.8" stroke="#2eaab0" strokeWidth="1.2"/>
                </svg>
              </FeatureIcon>
              <FeatureIcon label="動態資訊">
                <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#2eaab0" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="13" rx="2" fill="#e0f4f5" stroke="#2eaab0" strokeWidth="1.6"/>
                  <path d="M8 17v2M16 17v2M7 20h10" stroke="#2eaab0" strokeWidth="1.6"/>
                  <circle cx="12" cy="10.5" r="2" fill="#2eaab0"/>
                  <path d="M9 14.5c0-1.66 1.34-3 3-3s3 1.34 3 3" stroke="#2eaab0" strokeWidth="1.4"/>
                </svg>
              </FeatureIcon>
              <FeatureIcon label="捷運購票">
                <svg width="34" height="34" viewBox="0 0 32 32" fill="none">
                  <circle cx="16" cy="16" r="14" fill="#f59100"/>
                  <rect x="8" y="11" width="16" height="11" rx="2" fill="#2eaab0" stroke="white" strokeWidth="1"/>
                  <line x1="8" y1="15" x2="24" y2="15" stroke="white" strokeWidth="1.2"/>
                  <rect x="19" y="17" width="5" height="5" rx="0.5" fill="white" opacity="0.9"/>
                  <rect x="20" y="18" width="1.5" height="1.5" fill="#f59100"/>
                  <rect x="22" y="18" width="1.5" height="1.5" fill="#f59100"/>
                  <rect x="20" y="20" width="1.5" height="1.5" fill="#f59100"/>
                  <rect x="22" y="20" width="1.5" height="1.5" fill="#f59100"/>
                </svg>
              </FeatureIcon>
              <FeatureIcon label="Go! Map" bold>
                <svg width="34" height="34" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" fill="#e0f4f5" stroke="#2eaab0" strokeWidth="1.6"/>
                  <line x1="9" y1="3" x2="9" y2="18" stroke="#2eaab0" strokeWidth="1.4"/>
                  <line x1="15" y1="6" x2="15" y2="21" stroke="#2eaab0" strokeWidth="1.4"/>
                  <circle cx="15" cy="10" r="2" fill="#4caf50"/>
                </svg>
              </FeatureIcon>
              <FeatureIcon label="優惠券">
                <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#2eaab0" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="7" width="20" height="13" rx="2" fill="#e0f4f5" stroke="#2eaab0" strokeWidth="1.6"/>
                  <path d="M8 7V5a2 2 0 0 1 4 0v2M12 7v2a2 2 0 0 0 4 0V7" stroke="#2eaab0" strokeWidth="1.4"/>
                  <rect x="6" y="12" width="5" height="4" rx="0.5" fill="#2eaab0" opacity="0.3"/>
                  <path d="M14 13h3M14 16h2" stroke="#2eaab0" strokeWidth="1.2"/>
                </svg>
              </FeatureIcon>
              <FeatureIcon label="2026集章活動">
                <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#2eaab0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="9" fill="#e0f4f5" stroke="#2eaab0" strokeWidth="1.5"/>
                  <circle cx="12" cy="12" r="6" stroke="#2eaab0" strokeWidth="1.2" strokeDasharray="2 1.5"/>
                  <path d="M12 8v2M12 14v2M8 12h2M14 12h2" stroke="#2eaab0" strokeWidth="1.4"/>
                  <circle cx="12" cy="12" r="1.5" fill="#2eaab0"/>
                </svg>
              </FeatureIcon>
              <FeatureIcon label="AI智慧客服">
                <svg width="34" height="34" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 14v-2a9 9 0 0 1 18 0v2" stroke="#4caf50" strokeWidth="1.6" fill="none"/>
                  <rect x="1" y="14" width="4" height="5" rx="2" fill="#4caf50"/>
                  <rect x="19" y="14" width="4" height="5" rx="2" fill="#4caf50"/>
                  <path d="M12 22c2 0 3-1 3-2v-1H9v1c0 1 1 2 3 2z" fill="#4caf50"/>
                </svg>
              </FeatureIcon>
              <FeatureIcon label="捷運點">
                <div className="relative w-9 h-9 flex items-center justify-center">
                  <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                    <path d="M18 2C10 2 4 8 4 16c0 5 3 10 8 13l6 5 6-5c5-3 8-8 8-13C32 8 26 2 18 2z" fill="#f59100"/>
                    <text x="18" y="22" textAnchor="middle" fill="white" fontSize="14" fontWeight="900" fontFamily="Arial">M</text>
                  </svg>
                </div>
              </FeatureIcon>
            </div>
          </section>

          {/* Station section */}
          <section>
            <div className="flex justify-end items-center gap-2 mb-2">
              <span className="text-xs text-gray-500">8秒後更新</span>
              <button className="rounded-lg overflow-hidden w-7 h-7"><img src={changeIcon} alt="更新" className="w-full h-full object-cover" /></button>
            </div>

            {/* Tabs + station card share one rounded box for frequent/nearby */}
            {(() => {
              const tabsBar = (
                <div className="flex">
                  {([
                    { id: 'frequent', label: '常用站點' },
                    { id: 'nearby',   label: '鄰近站點' },
                    { id: 'offers',   label: '專屬點數優惠' },
                  ] as const).map(t => (
                    <button
                      key={t.id}
                      onClick={() => setActiveTab(t.id)}
                      className={`flex-1 flex justify-center pt-2 text-sm font-medium transition-colors ${activeTab === t.id ? 'text-[#00a05a]' : 'text-gray-400'}`}
                    >
                      <span className={`px-4 pb-2 text-center ${activeTab === t.id ? 'border-b-2 border-[#00a05a]' : ''}`}>{t.label}</span>
                    </button>
                  ))}
                </div>
              )

              // arriving station name (first selected, fallback to 信義安和)
              const arrivingCode = userPrefs.stations[0] ?? 'R04'
              const arriving = STATIONS.find(s => s.code === arrivingCode)?.name ?? '信義安和'
              const arrivingStation = STATIONS.find(s => s.code === arrivingCode) ?? STATIONS[0]
              const arrivingLine = arrivingStation.code.match(/^[A-Z]+/)?.[0] ?? 'R'
              const arrivingNumber = arrivingStation.code.match(/\d+/)?.[0] ?? '04'
              // filter by user's cats; if none chosen show all
              const cats = userPrefs.cats.length > 0 ? userPrefs.cats : ALL_OFFERS.map(o => o.cat)
              const filtered = ALL_OFFERS.filter(o => cats.includes(o.cat))
              const apiOffer = recommendation ? recommendationToOffer(recommendation) : null
              const visibleOffers = apiOffer
                ? [apiOffer, ...filtered.filter(offer => offer.id !== apiOffer.id)]
                : filtered

              return (
                <div className="rounded-2xl border border-[#c9e3ee] shadow-sm overflow-hidden mb-3" style={{ backgroundColor: '#e5f2f8' }}>
                  <div className="border-b border-white">{tabsBar}</div>

                  {activeTab === 'frequent' && (
                    <>
                      <div className="flex items-center justify-between px-4 py-3">
                        <div className="flex items-center gap-2">
                          <LineBadge line={arrivingLine} number={arrivingNumber} bg={arrivingStation.color} />
                          <span className="text-base font-semibold text-gray-800">{arriving}</span>
                        </div>
                        <IconChevronUp />
                      </div>
                      <div className="flex items-center justify-between px-4 py-3">
                        <div className="border-2 border-gray-300 rounded-full px-4 py-1.5">
                          <span className="text-sm font-medium text-gray-700">03分00秒</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">往</span>
                          <LineBadge line="R" number="02" bg="#e3001b" />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-700">象山</span>
                          <IconChevronDown />
                        </div>
                      </div>
                    </>
                  )}
                  {activeTab === 'nearby' && (
                    <div className="text-center text-gray-400 text-sm py-8">開啟定位以顯示鄰近站點</div>
                  )}
                  {activeTab === 'offers' && (
                    <div className="px-4 pt-3 pb-4">
                      <p className="text-sm mb-3" style={{ color: '#3179af' }}>
                        依您抵達的站點 <span className="text-sm font-bold" style={{ color: '#3179af' }}>{arriving}</span> 及 <span className="text-sm font-bold" style={{ color: '#3179af' }}>消費偏好</span> 為您推薦
                      </p>
                      {visibleOffers.map(offer => (
                        <OfferCard key={offer.id} offer={offer} arriving={arriving} onOpen={() => openOffer(offer)} />
                      ))}
                      {visibleOffers.length === 0 && (
                        <div className="text-center text-gray-400 text-sm py-8">目前無符合的優惠</div>
                      )}
                    </div>
                  )}
                </div>
              )
            })()}
          </section>
        </div>

        {/* Bottom nav */}
        <nav className="border-t border-gray-100 bg-white flex">
          {[
            {
              label: '捷運路線',
              active: false,
              icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="6" cy="6" r="3"/><circle cx="18" cy="18" r="3"/><path d="M6 9v4a3 3 0 0 0 3 3h6"/>
                </svg>
              ),
            },
            {
              label: 'Go優惠',
              active: false,
              icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 12v10H4V12"/><path d="M22 7H2v5h20V7z"/><path d="M12 22V7"/>
                </svg>
              ),
            },
            {
              label: '首頁',
              active: true,
              icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
              ),
            },
            {
              label: '更多功能',
              active: false,
              icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
                </svg>
              ),
            },
            {
              label: '我的帳戶',
              active: false,
              icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
              ),
            },
          ].map(({ label, active, icon }) => (
            <button
              key={label}
              className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 ${active ? 'text-[#00a05a]' : 'text-gray-400'}`}
            >
              {icon}
              <span className="text-[10px] font-medium">{label}</span>
            </button>
          ))}
        </nav>

        {/* Phone home bar — tap to go back to home screen */}
        {onboardingDone && (
          <button
            onClick={() => {
              setShowNotif(false)
              setShowHomeScreen(true)
              setTimeout(() => setShowNotif(true), 3000)
            }}
            className="w-full flex items-center justify-center bg-white"
            style={{ height: 28, flexShrink: 0 }}
          >
            <div className="w-28 h-1 rounded-full bg-gray-300" />
          </button>
        )}
      </div>
    </div>
  )
}
