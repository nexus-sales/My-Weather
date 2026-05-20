export const GOOGLE_FONTS = `@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Exo+2:ital,wght@0,300;0,400;0,600;0,700;1,300&display=swap');`;

export const CSS = `
* { box-sizing: border-box; margin: 0; padding: 0; }
body { overflow-x: hidden; }
::-webkit-scrollbar { width: 4px; height: 4px; }
::-webkit-scrollbar-track { background: #060f22; }
::-webkit-scrollbar-thumb { background: #0a3a6a; border-radius: 2px; }
::-webkit-scrollbar-thumb:hover { background: #0066bb; }

@keyframes pulse-glow {
  0%,100% { text-shadow: 0 0 12px rgba(0,200,255,0.6); }
  50%      { text-shadow: 0 0 35px rgba(0,212,255,1), 0 0 70px rgba(0,212,255,0.4); }
}
@keyframes blink   { 0%,100%{opacity:1}  50%{opacity:0.2} }
@keyframes fadein  { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
@keyframes slideR  { from{opacity:0;transform:translateX(-16px)} to{opacity:1;transform:translateX(0)} }
@keyframes scan    { 0%{background-position:0 0} 100%{background-position:0 120px} }
@keyframes spinY   { from{transform:rotateY(0deg)} to{transform:rotateY(360deg)} }
@keyframes bounce  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }

.glow-temp   { animation: pulse-glow 3s infinite; }
.dot-blink   { animation: blink 1s infinite; }
.dot-blink:nth-child(2) { animation-delay:.2s; }
.dot-blink:nth-child(3) { animation-delay:.4s; }
.fadein      { animation: fadein .5s ease-out both; }
.fadein-d1   { animation: fadein .5s .1s ease-out both; }
.fadein-d2   { animation: fadein .5s .2s ease-out both; }
.fadein-d3   { animation: fadein .5s .3s ease-out both; }
.slider      { animation: slideR .4s ease-out both; }

.tab-btn { transition: all .25s; }
.tab-btn:hover { background: rgba(0,180,255,.15) !important; color: #88d8f0 !important; }
.tab-btn.on    { background: rgba(0,180,255,.22) !important; border-color: rgba(0,200,255,.7) !important; color: #00e4ff !important; box-shadow: 0 0 12px rgba(0,200,255,.2) inset; }

.fcard { transition: all .28s; cursor:pointer; }
.fcard:hover { transform: translateY(-5px); border-color: rgba(0,180,255,.5) !important; background: rgba(0,35,80,.65) !important; box-shadow: 0 8px 24px rgba(0,80,180,.3); }

.scard { transition: border-color .25s, background .25s; }
.scard:hover { border-color: rgba(0,200,255,.4) !important; background: rgba(0,25,65,.75) !important; }

.qbtn { transition: all .2s; }
.qbtn:hover { background: rgba(0,60,120,.6) !important; border-color: rgba(0,160,255,.4) !important; color: #88d8f0 !important; }

.send-btn { transition: all .18s; }
.send-btn:hover:not(:disabled) { background: rgba(0,140,255,.5) !important; transform: scale(1.06); }
.send-btn:active:not(:disabled) { transform: scale(.95); }
.send-btn:disabled { opacity:.4; cursor:not-allowed; }

.rmode-btn { transition: all .2s; }
.rmode-btn:hover { background: rgba(0,120,220,.25) !important; }
.rmode-btn.on { background: rgba(0,180,255,.25) !important; border-color: rgba(0,200,255,.7) !important; color: #00e4ff !important; }

.pws-card { transition: all .28s; cursor:pointer; position:relative; overflow:hidden; }
.pws-card::before { content:''; position:absolute; inset:0; background:linear-gradient(135deg,rgba(0,200,255,.04),transparent); opacity:0; transition:opacity .25s; }
.pws-card:hover::before { opacity:1; }
.pws-card:hover { border-color:rgba(0,210,255,.45) !important; transform:translateY(-4px); box-shadow:0 10px 28px rgba(0,90,200,.3) !important; }
.pws-card.sel { border-color:rgba(0,230,255,.65) !important; background:rgba(0,35,90,.75) !important; box-shadow:0 0 24px rgba(0,180,255,.2),0 8px 28px rgba(0,80,200,.35) !important; }
.src-btn { transition:all .22s; }
.src-btn:hover { border-color:rgba(0,180,255,.4) !important; background:rgba(0,30,80,.6) !important; }
.src-btn.on { background:rgba(0,60,140,.55) !important; border-color:rgba(0,200,255,.7) !important; color:#00e4ff !important; box-shadow:0 0 14px rgba(0,200,255,.15) inset; }
.pws-metric { transition:background .2s; }
.pws-metric:hover { background:rgba(0,40,100,.5) !important; }
@keyframes ping { 0%{transform:scale(1);opacity:.8} 100%{transform:scale(2.2);opacity:0} }
.ping { animation:ping 1.4s infinite; }

input:focus, textarea:focus { outline:none !important; }

.scan-overlay {
  background-image: repeating-linear-gradient(transparent, transparent 3px, rgba(0,180,255,.012) 3px, rgba(0,180,255,.012) 4px);
  pointer-events: none;
}
`;

export const WMO_DATA: Record<number, { l: string; e: string }> = {
    0: { l: "Despejado", e: "☀️" }, 1: { l: "Casi despejado", e: "🌤️" }, 2: { l: "Parcialmente nublado", e: "⛅" },
    3: { l: "Cubierto", e: "☁️" }, 45: { l: "Niebla", e: "🌫️" }, 48: { l: "Niebla escarchada", e: "🌫️" },
    51: { l: "Llovizna débil", e: "🌦️" }, 53: { l: "Llovizna moderada", e: "🌦️" }, 55: { l: "Llovizna densa", e: "🌧️" },
    61: { l: "Lluvia débil", e: "🌧️" }, 63: { l: "Lluvia moderada", e: "🌧️" }, 65: { l: "Lluvia intensa", e: "🌧️" },
    71: { l: "Nevada débil", e: "🌨️" }, 73: { l: "Nevada moderada", e: "❄️" }, 75: { l: "Nevada intensa", e: "❄️" },
    77: { l: "Granizo", e: "🌨️" }, 80: { l: "Chubascos débiles", e: "🌦️" }, 81: { l: "Chubascos moderados", e: "🌧️" },
    82: { l: "Chubascos violentos", e: "⛈️" }, 85: { l: "Nieve en chubascos", e: "🌨️" }, 86: { l: "Nieve intensa", e: "❄️" },
    95: { l: "Tormenta", e: "⛈️" }, 96: { l: "Tormenta c/ granizo", e: "⛈️" }, 99: { l: "Tormenta severa", e: "🌪️" }
};

export const wmo = (c: number) => WMO_DATA[c] || { l: "Variable", e: "🌡️" };

export const WDS = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSO", "SO", "OSO", "O", "ONO", "NO", "NNO"];
export const wdir = (d: number) => WDS[Math.round(d / 22.5) % 16];

export const TABS = [
    { id: "dashboard", icon: "🌍", label: "PANEL" },
    { id: "radar", icon: "🛰️", label: "RADAR & SAT" },
    { id: "ai", icon: "🤖", label: "IA AETHER" },
    { id: "charts", icon: "📊", label: "ANÁLISIS" },
    { id: "history", icon: "📅", label: "HISTÓRICO" },
    { id: "stations", icon: "📡", label: "ESTACIONES" },
];

export const RADAR_MODES = [
    { id: "rain", label: "🌧️ Precipitación" },
    { id: "wind", label: "💨 Viento" },
    { id: "temp", label: "🌡️ Temperatura" },
    { id: "clouds", label: "☁️ Nubes" },
    { id: "satellite", label: "🛰️ Satélite" },
];
