import { useState, useEffect, useRef, useMemo } from "react";
import {
    AreaChart, Area, BarChart, Bar, LineChart, Line,
    ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Legend, ReferenceLine
} from "recharts";

// ─── CONSTANTS ──────────────────────────────────────────────────────────────

const GOOGLE_FONTS = `@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Exo+2:ital,wght@0,300;0,400;0,600;0,700;1,300&display=swap');`;

const CSS = `
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

const WMO = {
    0: { l: "Despejado", e: "☀️" }, 1: { l: "Casi despejado", e: "🌤️" }, 2: { l: "Parcialmente nublado", e: "⛅" },
    3: { l: "Cubierto", e: "☁️" }, 45: { l: "Niebla", e: "🌫️" }, 48: { l: "Niebla escarchada", e: "🌫️" },
    51: { l: "Llovizna débil", e: "🌦️" }, 53: { l: "Llovizna moderada", e: "🌦️" }, 55: { l: "Llovizna densa", e: "🌧️" },
    61: { l: "Lluvia débil", e: "🌧️" }, 63: { l: "Lluvia moderada", e: "🌧️" }, 65: { l: "Lluvia intensa", e: "🌧️" },
    71: { l: "Nevada débil", e: "🌨️" }, 73: { l: "Nevada moderada", e: "❄️" }, 75: { l: "Nevada intensa", e: "❄️" },
    77: { l: "Granizo", e: "🌨️" }, 80: { l: "Chubascos débiles", e: "🌦️" }, 81: { l: "Chubascos moderados", e: "🌧️" },
    82: { l: "Chubascos violentos", e: "⛈️" }, 85: { l: "Nieve en chubascos", e: "🌨️" }, 86: { l: "Nieve intensa", e: "❄️" },
    95: { l: "Tormenta", e: "⛈️" }, 96: { l: "Tormenta c/ granizo", e: "⛈️" }, 99: { l: "Tormenta severa", e: "🌪️" }
};
const wmo = c => WMO[c] || { l: "Variable", e: "🌡️" };
const WDS = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSO", "SO", "OSO", "O", "ONO", "NO", "NNO"];
const wdir = d => WDS[Math.round(d / 22.5) % 16];

const TABS = [
    { id: "dashboard", icon: "🌍", label: "PANEL" },
    { id: "radar", icon: "🛰️", label: "RADAR & SAT" },
    { id: "ai", icon: "🤖", label: "IA AETHER" },
    { id: "charts", icon: "📊", label: "ANÁLISIS" },
    { id: "history", icon: "📅", label: "HISTÓRICO" },
    { id: "stations", icon: "📡", label: "ESTACIONES" },
];

const RADAR_MODES = [
    { id: "rain", label: "🌧️ Precipitación" },
    { id: "wind", label: "💨 Viento" },
    { id: "temp", label: "🌡️ Temperatura" },
    { id: "clouds", label: "☁️ Nubes" },
    { id: "satellite", label: "🛰️ Satélite" },
];

// ─── TOOLTIP ────────────────────────────────────────────────────────────────

const CTip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{ background: "rgba(4,12,32,.97)", border: "1px solid rgba(0,180,255,.3)", borderRadius: 9, padding: "8px 13px", fontSize: 11, fontFamily: "'Exo 2',sans-serif" }}>
            <p style={{ color: "#00d4ff", marginBottom: 4, fontWeight: 600 }}>{label}</p>
            {payload.map((p, i) => (
                <p key={i} style={{ color: p.color || "#c8e0f0", lineHeight: 1.6 }}>
                    {p.name}: <strong style={{ color: "#fff" }}>{typeof p.value === "number" ? p.value.toFixed(1) : p.value}{p.unit || ""}</strong>
                </p>
            ))}
        </div>
    );
};

// ─── CARD wrapper ────────────────────────────────────────────────────────────

const Card = ({ children, style = {}, className = "" }) => (
    <div className={className} style={{
        background: "rgba(4,13,34,.82)",
        border: "1px solid rgba(0,150,255,.16)",
        borderRadius: 16,
        padding: 16,
        backdropFilter: "blur(12px)",
        ...style
    }}>
        {children}
    </div>
);

const SectionTitle = ({ icon, children }) => (
    <h3 style={{ fontSize: 10, letterSpacing: 3, color: "rgba(0,190,255,.65)", marginBottom: 12, fontWeight: 700, fontFamily: "'Exo 2',sans-serif" }}>
        {icon} {children}
    </h3>
);

// ─── LOADING SCREEN ──────────────────────────────────────────────────────────

const LoadingScreen = () => (
    <div style={{ background: "#030b1a", height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 20 }}>
        <style>{GOOGLE_FONTS + CSS}</style>
        <div style={{ fontSize: 68, animation: "bounce 1.5s infinite" }}>🌍</div>
        <div style={{ fontFamily: "'Orbitron',monospace", color: "#00d4ff", fontSize: 20, letterSpacing: 4, fontWeight: 900 }}>METEORIX PRO</div>
        <div style={{ color: "rgba(100,160,200,.55)", fontSize: 11, letterSpacing: 3 }}>INICIALIZANDO SISTEMA METEOROLÓGICO...</div>
        <div style={{ display: "flex", gap: 8 }}>
            {[0, 1, 2].map(i => (
                <div key={i} className="dot-blink" style={{ width: 8, height: 8, borderRadius: "50%", background: "#00d4ff", animationDelay: `${i * .2}s` }} />
            ))}
        </div>
        <div style={{ fontSize: 10, color: "rgba(0,150,255,.3)", letterSpacing: 2, marginTop: 8 }}>
            Conectando con Open-Meteo · ECMWF · NOAA
        </div>
    </div>
);

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

export default function MeteorixPro() {
    const [coords, setCoords] = useState({ lat: 40.4165, lon: -3.7026 });
    const [city, setCity] = useState("Madrid, ES");
    const [wx, setWx] = useState(null);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState("dashboard");
    const [aiMsgs, setAiMsgs] = useState([]);
    const [aiInput, setAiInput] = useState("");
    const [aiLoading, setAiLoading] = useState(false);
    const [now, setNow] = useState(new Date());
    const [radarMode, setRadarMode] = useState("rain");
    const [searchInput, setSearchInput] = useState("");
    const chatEnd = useRef(null);

    // ── PWS state
    const [pwsSrc, setPwsSrc] = useState("netatmo"); // "wu"|"netatmo"|"demo"
    const [wuKey, setWuKey] = useState("");
    const [pwsStations, setPwsStations] = useState([]);
    const [pwsSelected, setPwsSelected] = useState(null);
    const [pwsLoading, setPwsLoading] = useState(false);
    const [pwsError, setPwsError] = useState(null);
    const [pwsIdInput, setPwsIdInput] = useState("");
    const [pwsAutoRef, setPwsAutoRef] = useState(false);

    // ── clock
    useEffect(() => {
        const t = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(t);
    }, []);

    // ── geolocation
    useEffect(() => {
        navigator.geolocation?.getCurrentPosition(
            p => setCoords({ lat: p.coords.latitude, lon: p.coords.longitude }),
            () => { }
        );
    }, []);

    // ── fetch weather
    useEffect(() => { fetchWx(); }, [coords]);

    // ── auto AI when data loads
    useEffect(() => {
        if (wx && aiMsgs.length === 0) runAI(null);
    }, [wx]);

    // ── scroll chat
    useEffect(() => {
        chatEnd.current?.scrollIntoView({ behavior: "smooth" });
    }, [aiMsgs]);

    // ── FETCH ──────────────────────────────────────────────────────────────────

    const fetchWx = async () => {
        setLoading(true);
        try {
            const [gr, wr] = await Promise.all([
                fetch(`https://nominatim.openstreetmap.org/reverse?lat=${coords.lat}&lon=${coords.lon}&format=json`),
                fetch(
                    `https://api.open-meteo.com/v1/forecast` +
                    `?latitude=${coords.lat}&longitude=${coords.lon}` +
                    `&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,pressure_msl,wind_speed_10m,wind_direction_10m,wind_gusts_10m,uv_index` +
                    `&hourly=temperature_2m,apparent_temperature,precipitation_probability,precipitation,weather_code,wind_speed_10m,wind_direction_10m,pressure_msl,relative_humidity_2m` +
                    `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,wind_direction_10m_dominant,sunrise,sunset,uv_index_max` +
                    `&past_days=7&forecast_days=7&timezone=auto`
                )
            ]);
            const gd = await gr.json();
            const wd = await wr.json();
            const c = gd.address?.city || gd.address?.town || gd.address?.village || gd.address?.county || "Ubicación";
            const cc = gd.address?.country_code?.toUpperCase() || "";
            setCity(`${c}, ${cc}`);
            setWx(wd);
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    const searchCity = async () => {
        if (!searchInput.trim()) return;
        try {
            const r = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchInput)}&format=json&limit=1`);
            const d = await r.json();
            if (d?.[0]) { setCoords({ lat: parseFloat(d[0].lat), lon: parseFloat(d[0].lon) }); setSearchInput(""); }
        } catch (e) { console.error(e); }
    };

    // ── Haversine distance in km
    const hdist = (la1, lo1, la2, lo2) => {
        const R = 6371, dLa = (la2 - la1) * Math.PI / 180, dLo = (lo2 - lo1) * Math.PI / 180;
        const a = Math.sin(dLa / 2) ** 2 + Math.cos(la1 * Math.PI / 180) * Math.cos(la2 * Math.PI / 180) * Math.sin(dLo / 2) ** 2;
        return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1);
    };

    // ── Fetch WU nearby stations (with CORS proxy fallback)
    const fetchWuNearby = async () => {
        if (!wuKey.trim()) { setPwsError("⚠️ Introduce tu API key de Weather Underground"); return; }
        setPwsLoading(true); setPwsError(null);
        const base = `https://api.weather.com/v2/pws/observations/nearby?geocode=${coords.lat},${coords.lon}&limit=20&format=json&units=m&apiKey=${wuKey.trim()}`;
        try {
            let d;
            try { const r = await fetch(base); if (!r.ok) throw new Error(r.status); d = await r.json(); }
            catch { const r = await fetch(`https://corsproxy.io/?${encodeURIComponent(base)}`); d = await r.json(); }
            const obs = (d.observations || []).map(o => ({ ...o, _dist: hdist(coords.lat, coords.lon, o.lat || 0, o.lon || 0) }));
            obs.sort((a, b) => parseFloat(a._dist) - parseFloat(b._dist));
            setPwsStations(obs);
            if (obs.length === 0) setPwsError("No se encontraron estaciones cercanas. Prueba otra ubicación.");
        } catch (e) { setPwsError("Error de conexión. Verifica tu API key en wunderground.com/member/api-keys"); }
        setPwsLoading(false);
    };

    // ── Fetch WU station by ID
    const fetchWuById = async (sid) => {
        const id = (sid || pwsIdInput).trim().toUpperCase();
        if (!id) return;
        if (!wuKey.trim()) { setPwsError("⚠️ Introduce tu API key de Weather Underground"); return; }
        setPwsLoading(true); setPwsError(null);
        const base = `https://api.weather.com/v2/pws/observations/current?stationId=${id}&format=json&units=m&apiKey=${wuKey.trim()}`;
        try {
            let d;
            try { const r = await fetch(base); if (!r.ok) throw new Error(r.status); d = await r.json(); }
            catch { const r = await fetch(`https://corsproxy.io/?${encodeURIComponent(base)}`); d = await r.json(); }
            const obs = d.observations?.[0];
            if (obs) {
                const o = { ...obs, _dist: hdist(coords.lat, coords.lon, obs.lat || 0, obs.lon || 0) };
                setPwsSelected(o);
                setPwsStations(prev => prev.some(s => s.stationID === id) ? prev.map(s => s.stationID === id ? o : s) : [o, ...prev]);
            } else setPwsError(`Estación ${id} no encontrada.`);
        } catch (e) { setPwsError(`No se pudo obtener la estación ${id}.`); }
        setPwsLoading(false);
    };

    // ── Auto-refresh WU stations
    useEffect(() => {
        if (!pwsAutoRef || pwsSrc !== "wu") return;
        const t = setInterval(fetchWuNearby, 5 * 60 * 1000);
        return () => clearInterval(t);
    }, [pwsAutoRef, pwsSrc, coords, wuKey]);

    // ── Demo stations
    const demoStations = useMemo(() => {
        if (!wx) return [];
        const c = wx.current;
        const b = { t: c.temperature_2m, h: c.relative_humidity_2m, ws: c.wind_speed_10m, wd: c.wind_direction_10m, pr: c.pressure_msl, pp: c.precipitation, uv: c.uv_index };
        const mk = (id, name, dlat, dlon, dt, dh, dws, dpr, elev, sw, sr) => ({
            stationID: id, neighborhood: name, lat: coords.lat + dlat, lon: coords.lon + dlon,
            softwareType: sw, obsTimeLocal: new Date(Date.now() - Math.random() * 8 * 60000).toISOString(),
            _dist: hdist(coords.lat, coords.lon, coords.lat + dlat, coords.lon + dlon),
            humidity: Math.round(b.h + dh), winddir: Math.round((b.wd + dwd) % 360),
            solarRadiation: sr, uv: +(b.uv + 0.2 * (Math.random() - .5) * 2).toFixed(1), qcStatus: 1,
            metric: {
                temp: +(b.t + dt).toFixed(1), dewpt: +(b.t + dt - ((100 - (b.h + dh)) / 5)).toFixed(1),
                windSpeed: +(b.ws / 3.6 * (1 + dws)).toFixed(1), windGust: +(b.ws / 3.6 * (1.4 + dws)).toFixed(1),
                pressure: +(b.pr + dpr).toFixed(1), precipRate: +(b.pp * (Math.random() * .3)).toFixed(2),
                precipTotal: +(b.pp * 24 * (0.8 + Math.random() * .5)).toFixed(1), elev
            }
        });
        const dwd = 0;
        return [
            mk("DEMO001", "Centro Urbano", 0.012, 0.008, 0.6, -2, 0, -0.8, 650, "Davis Vantage Pro2", 280),
            mk("DEMO002", "Parque Norte", 0.025, -0.018, -0.4, 3, 0.1, 0.3, 620, "WS-2315", 310),
            mk("DEMO003", "Aeropuerto", -0.031, 0.028, 1.2, -5, 0.2, -1.5, 610, "Vaisala AWS310", 265),
            mk("DEMO004", "Zona Rural", -0.045, -0.035, -1.8, 7, -0.1, 0.5, 580, "Oregon Scientific", 340),
            mk("DEMO005", "Sierra Alta", 0.055, 0.045, -3.5, 4, 0.4, -12.0, 1200, "Campbell Sci. CR300", 380),
            mk("DEMO006", "Litoral Sur", -0.062, 0.055, 2.1, 12, 0.3, 2.1, 5, "Netatmo Smart", 220),
        ];
    }, [coords, wx]);

    // ── AI ─────────────────────────────────────────────────────────────────────

    const runAI = async (userMsg) => {
        if (aiLoading || !wx) return;
        setAiLoading(true);
        const c = wx.current;
        const sys = `Eres el Dr. AETHER (Artificial Engine for Thermodynamic, Hydrological & Environmental Research), el sistema de IA meteorológica más avanzado del mundo, al nivel de un ingeniero meteorólogo senior del ECMWF (Centro Europeo de Previsión Meteorológica a Medio Plazo). Estás analizando las condiciones en ${city}.

Datos en tiempo real:
• Temperatura: ${c.temperature_2m}°C | Sensación: ${c.apparent_temperature}°C
• Condición: ${wmo(c.weather_code).l} | Precipitación: ${c.precipitation}mm
• Humedad: ${c.relative_humidity_2m}% | Presión: ${c.pressure_msl} hPa
• Viento: ${c.wind_speed_10m} km/h del ${wdir(c.wind_direction_10m)} (${c.wind_direction_10m}°), ráfagas ${c.wind_gusts_10m} km/h
• Índice UV: ${c.uv_index}

Previsión 7 días: ${wx.daily.time.slice(7).map((t, i) => `${t}: ${wx.daily.temperature_2m_min[7 + i]}-${wx.daily.temperature_2m_max[7 + i]}°C, ${wmo(wx.daily.weather_code[7 + i]).l}, ${wx.daily.precipitation_sum[7 + i]}mm (${wx.daily.precipitation_probability_max[7 + i]}%)`).join(' | ')}

Responde SIEMPRE en español. Usa terminología técnica meteorológica rigurosa pero también asequible para el público general. Usa emojis para separar secciones. Formato markdown básico con **negrita** y secciones claras.`;

        if (userMsg) setAiMsgs(prev => [...prev, { role: "user", content: userMsg, ts: new Date() }]);

        const historyForAPI = userMsg
            ? [...aiMsgs.map(m => ({ role: m.role, content: m.content })), { role: "user", content: userMsg }]
            : [{ role: "user", content: `Realiza un análisis meteorológico completo de la situación actual en ${city}. Incluye: 1) Situación sinóptica y patron de circulación, 2) Análisis de masas de aire y frentes, 3) Índices de inestabilidad (CAPE estimado, LI, Índice K), 4) Previsión horaria próximas 24h y tendencia 7 días, 5) Avisos activos y niveles de alerta, 6) Recomendaciones específicas por sectores (agricultura, transporte, actividades al aire libre, salud). Sé técnico, preciso y detallado.` }];

        try {
            const res = await fetch("https://api.anthropic.com/v1/messages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, system: sys, messages: historyForAPI })
            });
            const data = await res.json();
            const text = data.content?.[0]?.text || "No se recibió respuesta de AETHER.";
            setAiMsgs(prev => [...prev, { role: "assistant", content: text, ts: new Date() }]);
        } catch (e) {
            setAiMsgs(prev => [...prev, { role: "assistant", content: "⚠️ Error de conexión con los servidores AETHER. Verificando enlace de datos...", ts: new Date() }]);
        }
        setAiLoading(false);
    };

    const sendChat = () => {
        if (!aiInput.trim() || aiLoading) return;
        const msg = aiInput;
        setAiInput("");
        runAI(msg);
    };

    // ── DERIVED DATA ───────────────────────────────────────────────────────────

    const hourlyData = useMemo(() => {
        if (!wx) return [];
        const nowIso = now.toISOString().slice(0, 13);
        let idx = wx.hourly.time.findIndex(t => t.slice(0, 13) >= nowIso);
        if (idx < 0) idx = 0;
        return wx.hourly.time.slice(idx, idx + 24).map((t, i) => ({
            h: t.slice(11, 16),
            temp: wx.hourly.temperature_2m[idx + i],
            feels: wx.hourly.apparent_temperature[idx + i],
            prob: wx.hourly.precipitation_probability[idx + i],
            precip: wx.hourly.precipitation[idx + i],
            wind: wx.hourly.wind_speed_10m[idx + i],
            humidity: wx.hourly.relative_humidity_2m[idx + i],
            pressure: wx.hourly.pressure_msl[idx + i],
        }));
    }, [wx, now]);

    const forecastData = useMemo(() => {
        if (!wx) return [];
        const D = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
        return wx.daily.time.slice(7).map((t, i) => {
            const d = new Date(t + "T12:00:00");
            return {
                day: i === 0 ? "Hoy" : D[d.getDay()],
                date: `${d.getDate()}/${d.getMonth() + 1}`,
                max: wx.daily.temperature_2m_max[7 + i],
                min: wx.daily.temperature_2m_min[7 + i],
                precip: wx.daily.precipitation_sum[7 + i],
                prob: wx.daily.precipitation_probability_max[7 + i],
                code: wx.daily.weather_code[7 + i],
                windMax: wx.daily.wind_speed_10m_max[7 + i],
                windDir: wx.daily.wind_direction_10m_dominant[7 + i],
                sunrise: wx.daily.sunrise[7 + i]?.slice(11, 16),
                sunset: wx.daily.sunset[7 + i]?.slice(11, 16),
                uv: wx.daily.uv_index_max[7 + i],
            };
        });
    }, [wx]);

    const historyData = useMemo(() => {
        if (!wx) return [];
        const D = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
        return wx.daily.time.slice(0, 7).map((t, i) => {
            const d = new Date(t + "T12:00:00");
            return {
                day: D[d.getDay()],
                date: `${d.getDate()}/${d.getMonth() + 1}`,
                max: wx.daily.temperature_2m_max[i],
                min: wx.daily.temperature_2m_min[i],
                precip: wx.daily.precipitation_sum[i],
                prob: wx.daily.precipitation_probability_max[i],
                code: wx.daily.weather_code[i],
            };
        });
    }, [wx]);

    // ── LOADING ────────────────────────────────────────────────────────────────
    if (loading) return <LoadingScreen />;

    const cur = wx.current;
    const curWmo = wmo(cur.weather_code);
    const today = forecastData[0] || {};

    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    const ss = String(now.getSeconds()).padStart(2, "0");

    // ── RENDER ─────────────────────────────────────────────────────────────────
    return (
        <div style={{ fontFamily: "'Exo 2',sans-serif", background: "#030b1a", minHeight: "100vh", color: "#c8e0f0", overflowX: "hidden" }}>
            <style>{GOOGLE_FONTS + CSS}</style>

            {/* BG effects */}
            <div style={{
                position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
                background: "radial-gradient(ellipse 80% 60% at 20% 10%, rgba(0,60,140,.12), transparent), radial-gradient(ellipse 60% 50% at 85% 90%, rgba(0,80,160,.1), transparent)"
            }} />
            <div style={{
                position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
                backgroundImage: "linear-gradient(rgba(0,120,255,.025) 1px, transparent 1px), linear-gradient(90deg, rgba(0,120,255,.025) 1px, transparent 1px)",
                backgroundSize: "48px 48px"
            }} />
            <div className="scan-overlay" style={{ position: "fixed", inset: 0, zIndex: 1, pointerEvents: "none" }} />

            {/* ── HEADER ─────────────────────────────────────────────────────────── */}
            <header style={{
                position: "relative", zIndex: 20, borderBottom: "1px solid rgba(0,150,255,.14)", padding: "10px 20px",
                display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10,
                background: "rgba(3,11,26,.93)", backdropFilter: "blur(24px)"
            }}>

                {/* Logo */}
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                        fontFamily: "'Orbitron',monospace", fontSize: 22, fontWeight: 900, color: "#00d4ff", letterSpacing: 4,
                        textShadow: "0 0 24px rgba(0,212,255,.55)"
                    }}>⚡ METEORIX</div>
                    <div style={{
                        fontSize: 9, color: "rgba(0,190,255,.45)", letterSpacing: 2, borderLeft: "1px solid rgba(0,180,255,.2)",
                        paddingLeft: 12, fontFamily: "'Orbitron',monospace"
                    }}>PRO v5.0</div>
                </div>

                {/* Location */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, justifyContent: "center" }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#00ff88", boxShadow: "0 0 8px #00ff88" }} />
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#e8f4ff" }}>{city}</div>
                    <div style={{ fontSize: 10, color: "rgba(100,160,200,.45)", letterSpacing: 1 }}>
                        {coords.lat.toFixed(4)}°N / {coords.lon.toFixed(4)}°E
                    </div>
                </div>

                {/* Right: search + clock */}
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ display: "flex", gap: 4 }}>
                        <input value={searchInput} onChange={e => setSearchInput(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && searchCity()}
                            placeholder="Buscar ciudad..."
                            style={{
                                background: "rgba(0,25,65,.6)", border: "1px solid rgba(0,140,255,.22)", borderRadius: 7,
                                color: "#c8e0f0", padding: "5px 10px", fontSize: 12, width: 140, fontFamily: "'Exo 2',sans-serif",
                                transition: "border-color .2s"
                            }} />
                        <button onClick={searchCity}
                            style={{
                                background: "rgba(0,90,200,.35)", border: "1px solid rgba(0,150,255,.3)", borderRadius: 7,
                                color: "#00d4ff", padding: "5px 10px", cursor: "pointer", fontSize: 12
                            }}>🔍</button>
                    </div>
                    <div style={{
                        fontFamily: "'Orbitron',monospace", fontSize: 15, color: "#00d4ff", letterSpacing: 3,
                        minWidth: 90, textAlign: "right", textShadow: "0 0 10px rgba(0,212,255,.4)"
                    }}>
                        {hh}:{mm}:{ss}
                    </div>
                </div>
            </header>

            {/* ── NAV ────────────────────────────────────────────────────────────── */}
            <nav style={{
                display: "flex", gap: 4, padding: "8px 20px", borderBottom: "1px solid rgba(0,130,255,.1)",
                background: "rgba(3,11,26,.88)", overflowX: "auto", position: "relative", zIndex: 10
            }}>
                {TABS.map(t => (
                    <button key={t.id} onClick={() => setTab(t.id)}
                        className={`tab-btn${tab === t.id ? " on" : ""}`}
                        style={{
                            background: "rgba(0,18,48,.55)", border: `1px solid rgba(0,120,200,${tab === t.id ? .5 : .1})`,
                            borderRadius: 9, color: tab === t.id ? "#00e4ff" : "rgba(140,180,215,.65)",
                            padding: "7px 15px", cursor: "pointer", fontSize: 11, letterSpacing: 1,
                            fontFamily: "'Exo 2',sans-serif", fontWeight: 700,
                            display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap"
                        }}>
                        <span>{t.icon}</span><span>{t.label}</span>
                    </button>
                ))}

                {/* Live data indicator */}
                <div style={{
                    marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, fontSize: 10,
                    color: "rgba(0,200,100,.5)", paddingRight: 4
                }}>
                    <div className="dot-blink" style={{ width: 5, height: 5, borderRadius: "50%", background: "#00ff88" }} />
                    <span style={{ letterSpacing: 1 }}>DATOS EN VIVO · Open-Meteo</span>
                </div>
            </nav>

            {/* ── CONTENT ────────────────────────────────────────────────────────── */}
            <div style={{ position: "relative", zIndex: 5, padding: "16px 20px 40px", maxWidth: 1300, margin: "0 auto" }}>

                {/* ══════════════════════════ DASHBOARD ══════════════════════════ */}
                {tab === "dashboard" && (
                    <div className="fadein">

                        {/* Hero row */}
                        <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 14, marginBottom: 14, alignItems: "stretch" }}>

                            {/* Current Weather Hero */}
                            <Card style={{
                                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                                padding: "24px 20px", background: "linear-gradient(160deg, rgba(0,30,80,.9), rgba(4,13,34,.9))",
                                border: "1px solid rgba(0,180,255,.22)", boxShadow: "0 8px 32px rgba(0,50,120,.3)"
                            }}>
                                <div style={{ fontSize: 66, marginBottom: 6, filter: "drop-shadow(0 0 18px rgba(255,200,60,.4))" }}>
                                    {curWmo.e}
                                </div>
                                <div className="glow-temp" style={{
                                    fontFamily: "'Orbitron',monospace", fontSize: 60, fontWeight: 900,
                                    color: "#00d4ff", lineHeight: 1, marginBottom: 4
                                }}>
                                    {Math.round(cur.temperature_2m)}°
                                </div>
                                <div style={{ fontSize: 11, color: "rgba(120,170,210,.7)", letterSpacing: 2, marginBottom: 8, textAlign: "center" }}>
                                    {curWmo.l.toUpperCase()}
                                </div>
                                <div style={{ fontSize: 12, color: "rgba(100,150,200,.55)" }}>
                                    Sensación <span style={{ color: "#ff8c35", fontWeight: 700 }}>{Math.round(cur.apparent_temperature)}°C</span>
                                </div>
                                <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid rgba(0,150,255,.12)", width: "100%", textAlign: "center" }}>
                                    <div style={{ fontSize: 10, color: "rgba(100,150,200,.45)", letterSpacing: 1 }}>
                                        {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"][now.getDay()]} {now.getDate()}/{now.getMonth() + 1}/{now.getFullYear()}
                                    </div>
                                    {today.sunrise && (
                                        <div style={{ display: "flex", justifyContent: "center", gap: 14, marginTop: 8, fontSize: 11 }}>
                                            <span>🌅 {today.sunrise}</span>
                                            <span>🌇 {today.sunset}</span>
                                        </div>
                                    )}
                                </div>
                            </Card>

                            {/* Stats grid 3×2 */}
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
                                {[
                                    { icon: "💧", label: "HUMEDAD", value: `${cur.relative_humidity_2m}%`, color: "#00aaff" },
                                    {
                                        icon: "🌡️", label: "PRESIÓN", value: `${Math.round(cur.pressure_msl)} hPa`, color: "#ff7b35",
                                        sub: cur.pressure_msl > 1013 ? "Alta presión ↑" : "Baja presión ↓"
                                    },
                                    {
                                        icon: "🌬️", label: "VIENTO", value: `${Math.round(cur.wind_speed_10m)} km/h`, color: "#00ff88",
                                        sub: wdir(cur.wind_direction_10m) + " · " + cur.wind_direction_10m + "°"
                                    },
                                    { icon: "💨", label: "RÁFAGAS", value: `${Math.round(cur.wind_gusts_10m)} km/h`, color: "#ff4455" },
                                    {
                                        icon: "☀️", label: "ÍNDICE UV", value: `${cur.uv_index}`, color: "#ffcc00",
                                        sub: cur.uv_index < 3 ? "Bajo" : cur.uv_index < 6 ? "Moderado" : cur.uv_index < 8 ? "Alto" : "Muy alto"
                                    },
                                    { icon: "🌧️", label: "PRECIPITACIÓN", value: `${cur.precipitation} mm`, color: "#4488ff" },
                                ].map((s, i) => (
                                    <div key={i} className="scard" style={{
                                        background: "rgba(4,13,34,.75)", border: "1px solid rgba(0,140,255,.14)",
                                        borderRadius: 12, padding: "13px 16px"
                                    }}>
                                        <div style={{ fontSize: 9, letterSpacing: 2, color: "rgba(100,145,195,.5)", marginBottom: 6, fontWeight: 700 }}>
                                            {s.icon} {s.label}
                                        </div>
                                        <div style={{
                                            fontFamily: "'Orbitron',monospace", fontSize: 22, fontWeight: 700, color: s.color,
                                            textShadow: `0 0 12px ${s.color}55`
                                        }}>
                                            {s.value}
                                        </div>
                                        {s.sub && <div style={{ fontSize: 10, color: "rgba(100,145,195,.45)", marginTop: 3 }}>{s.sub}</div>}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 7-Day Forecast */}
                        <div style={{ marginBottom: 14 }}>
                            <SectionTitle icon="📅">PREVISIÓN 7 DÍAS</SectionTitle>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 8 }}>
                                {forecastData.map((d, i) => (
                                    <div key={i} className="fcard" style={{
                                        background: "rgba(4,13,34,.75)",
                                        border: `1px solid rgba(0,140,255,${i === 0 ? .28 : .13})`,
                                        borderRadius: 12, padding: "13px 8px", textAlign: "center",
                                        boxShadow: i === 0 ? "0 0 16px rgba(0,160,255,.1)" : "none"
                                    }}>
                                        <div style={{
                                            fontSize: 10, fontWeight: 700, letterSpacing: 1, marginBottom: 3,
                                            color: i === 0 ? "#00d4ff" : "rgba(140,185,215,.65)"
                                        }}>
                                            {d.day.toUpperCase()}
                                        </div>
                                        <div style={{ fontSize: 9, color: "rgba(100,145,195,.45)", marginBottom: 7 }}>{d.date}</div>
                                        <div style={{ fontSize: 30, marginBottom: 7 }}>{wmo(d.code).e}</div>
                                        <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 15, fontWeight: 700, color: "#ff7b35" }}>
                                            {Math.round(d.max)}°
                                        </div>
                                        <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 12, color: "rgba(100,145,195,.55)" }}>
                                            {Math.round(d.min)}°
                                        </div>
                                        <div style={{ marginTop: 7, fontSize: 9, color: "#4488ff" }}>💧 {d.prob}%</div>
                                        {d.precip > 0.1 && (
                                            <div style={{ fontSize: 9, color: "rgba(70,140,255,.7)" }}>{d.precip.toFixed(1)} mm</div>
                                        )}
                                        <div style={{ fontSize: 9, color: "rgba(100,145,195,.35)", marginTop: 3 }}>
                                            💨 {Math.round(d.windMax)} km/h
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Hourly temp chart */}
                        <Card style={{ marginBottom: 14 }}>
                            <SectionTitle icon="🌡️">TEMPERATURA HORARIA — PRÓXIMAS 24H</SectionTitle>
                            <ResponsiveContainer width="100%" height={185}>
                                <AreaChart data={hourlyData}>
                                    <defs>
                                        <linearGradient id="gTempH" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#00d4ff" stopOpacity={.32} />
                                            <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="gFeelH" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#ff8c35" stopOpacity={.2} />
                                            <stop offset="95%" stopColor="#ff8c35" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,100,200,.09)" />
                                    <XAxis dataKey="h" tick={{ fill: "rgba(100,145,195,.45)", fontSize: 10 }} axisLine={false} tickLine={false} interval={3} />
                                    <YAxis tick={{ fill: "rgba(100,145,195,.45)", fontSize: 10 }} axisLine={false} tickLine={false} unit="°" />
                                    <Tooltip content={<CTip />} />
                                    <Legend wrapperStyle={{ color: "rgba(140,185,215,.55)", fontSize: 11 }} />
                                    <Area type="monotone" dataKey="temp" stroke="#00d4ff" fill="url(#gTempH)" strokeWidth={2} name="Temperatura" unit="°C" />
                                    <Area type="monotone" dataKey="feels" stroke="#ff8c35" fill="url(#gFeelH)" strokeWidth={1.5} strokeDasharray="5 5" name="Sensación térmica" unit="°C" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </Card>

                        {/* Bottom row: precip + wind */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                            <Card>
                                <SectionTitle icon="🌧️">PROBABILIDAD PRECIPITACIÓN (24H)</SectionTitle>
                                <ResponsiveContainer width="100%" height={155}>
                                    <BarChart data={hourlyData.filter((_, i) => i % 2 === 0)}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,100,200,.09)" />
                                        <XAxis dataKey="h" tick={{ fill: "rgba(100,145,195,.4)", fontSize: 9 }} axisLine={false} tickLine={false} interval={2} />
                                        <YAxis tick={{ fill: "rgba(100,145,195,.4)", fontSize: 9 }} axisLine={false} tickLine={false} unit="%" domain={[0, 100]} />
                                        <Tooltip content={<CTip />} />
                                        <Bar dataKey="prob" fill="#1a5aff" radius={[3, 3, 0, 0]} name="Probabilidad" unit="%" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </Card>

                            <Card>
                                <SectionTitle icon="💨">VIENTO HORARIO (24H)</SectionTitle>
                                <ResponsiveContainer width="100%" height={155}>
                                    <AreaChart data={hourlyData}>
                                        <defs>
                                            <linearGradient id="gWindH" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#00ff88" stopOpacity={.28} />
                                                <stop offset="95%" stopColor="#00ff88" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,100,200,.09)" />
                                        <XAxis dataKey="h" tick={{ fill: "rgba(100,145,195,.4)", fontSize: 9 }} axisLine={false} tickLine={false} interval={3} />
                                        <YAxis tick={{ fill: "rgba(100,145,195,.4)", fontSize: 9 }} axisLine={false} tickLine={false} unit=" km/h" />
                                        <Tooltip content={<CTip />} />
                                        <Area type="monotone" dataKey="wind" stroke="#00ff88" fill="url(#gWindH)" strokeWidth={2} name="Velocidad" unit=" km/h" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </Card>
                        </div>
                    </div>
                )}

                {/* ══════════════════════════ RADAR & SAT ════════════════════════ */}
                {tab === "radar" && (
                    <div className="fadein">
                        {/* Mode buttons */}
                        <div style={{ marginBottom: 12, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                            <span style={{ fontSize: 10, letterSpacing: 3, color: "rgba(0,190,255,.6)", fontWeight: 700 }}>CAPA:</span>
                            {RADAR_MODES.map(m => (
                                <button key={m.id} onClick={() => setRadarMode(m.id)}
                                    className={`rmode-btn${radarMode === m.id ? " on" : ""}`}
                                    style={{
                                        background: "rgba(0,18,48,.6)", border: `1px solid rgba(0,130,200,${radarMode === m.id ? .5 : .15})`,
                                        borderRadius: 8, color: radarMode === m.id ? "#00e4ff" : "rgba(140,185,215,.6)",
                                        padding: "7px 14px", cursor: "pointer", fontSize: 12, fontFamily: "'Exo 2',sans-serif", fontWeight: 600
                                    }}>
                                    {m.label}
                                </button>
                            ))}
                            <div style={{ marginLeft: "auto", fontSize: 10, color: "rgba(100,145,195,.4)", letterSpacing: 1 }}>
                                Modelo ECMWF · 15 días pronóstico · Actualización cada 6h
                            </div>
                        </div>

                        {/* Windy iframe */}
                        <div style={{
                            borderRadius: 16, overflow: "hidden", border: "1px solid rgba(0,150,255,.2)",
                            boxShadow: "0 8px 32px rgba(0,50,120,.4)", height: 520
                        }}>
                            <iframe
                                key={`${radarMode}-${coords.lat}-${coords.lon}`}
                                src={`https://embed.windy.com/embed2.html?lat=${coords.lat}&lon=${coords.lon}&detailLat=${coords.lat}&detailLon=${coords.lon}&width=800&height=520&zoom=6&level=surface&overlay=${radarMode}&product=ecmwf&menu=&message=true&marker=true&calendar=now&pressure=true&type=map&location=coordinates&detail=&metricWind=default&metricTemp=default&radarRange=-1`}
                                width="100%" height="100%" frameBorder="0"
                                allow="geolocation" title="Mapa meteorológico Windy"
                                style={{ display: "block" }}
                            />
                        </div>

                        <div style={{ marginTop: 10, display: "flex", justifyContent: "space-between", fontSize: 10, color: "rgba(100,145,195,.35)" }}>
                            <span>🛰️ Mapa interactivo · Windy.com (ECMWF/GFS)</span>
                            <span>Latitud: {coords.lat.toFixed(4)} | Longitud: {coords.lon.toFixed(4)}</span>
                        </div>
                    </div>
                )}

                {/* ══════════════════════════ AI AETHER ══════════════════════════ */}
                {tab === "ai" && (
                    <div className="fadein">
                        {/* AETHER header */}
                        <Card style={{
                            marginBottom: 14, padding: "18px 20px",
                            background: "linear-gradient(120deg, rgba(0,20,60,.95), rgba(0,40,100,.85))",
                            border: "1px solid rgba(0,180,255,.28)"
                        }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                                <div style={{
                                    width: 62, height: 62, borderRadius: "50%",
                                    background: "linear-gradient(135deg,#002255,#005599)",
                                    border: "2px solid rgba(0,180,255,.45)",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontSize: 28, boxShadow: "0 0 24px rgba(0,180,255,.35), 0 0 48px rgba(0,100,255,.1)"
                                }}>🤖</div>
                                <div>
                                    <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 18, color: "#00d4ff", fontWeight: 700, letterSpacing: 3 }}>
                                        Dr. AETHER
                                    </div>
                                    <div style={{ fontSize: 11, color: "rgba(100,160,200,.6)", marginTop: 2 }}>
                                        Artificial Engine for Thermodynamic, Hydrological &amp; Environmental Research
                                    </div>
                                    <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                                        <span style={{
                                            fontSize: 9, background: "rgba(0,100,50,.3)", border: "1px solid rgba(0,200,100,.3)",
                                            borderRadius: 5, padding: "2px 9px", color: "#00ff88", letterSpacing: 1
                                        }}>● OPERATIVO</span>
                                        <span style={{
                                            fontSize: 9, background: "rgba(0,50,100,.3)", border: "1px solid rgba(0,130,230,.3)",
                                            borderRadius: 5, padding: "2px 9px", color: "#00d4ff", letterSpacing: 1
                                        }}>NIVEL ECMWF SENIOR</span>
                                        <span style={{
                                            fontSize: 9, background: "rgba(60,0,100,.3)", border: "1px solid rgba(150,50,255,.3)",
                                            borderRadius: 5, padding: "2px 9px", color: "#cc88ff", letterSpacing: 1
                                        }}>IA GENERATIVA · Claude</span>
                                    </div>
                                </div>
                                <div style={{ marginLeft: "auto", textAlign: "right" }}>
                                    <div style={{ fontSize: 10, color: "rgba(100,145,195,.4)", marginBottom: 4 }}>Analizando</div>
                                    <div style={{ fontWeight: 700, color: "#e8f4ff", fontSize: 13 }}>{city}</div>
                                    <div style={{ fontSize: 11, color: "#ff8c35", fontFamily: "'Orbitron',monospace" }}>
                                        {Math.round(cur.temperature_2m)}° · {curWmo.e}
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Chat window */}
                        <Card>
                            {/* Messages */}
                            <div style={{ height: 430, overflowY: "auto", marginBottom: 12, paddingRight: 4 }}>
                                {aiLoading && aiMsgs.length === 0 ? (
                                    <div style={{
                                        display: "flex", justifyContent: "center", alignItems: "center", height: "100%",
                                        flexDirection: "column", gap: 14
                                    }}>
                                        <div style={{ fontSize: 40, animation: "bounce 1.5s infinite" }}>🌍</div>
                                        <div style={{ color: "rgba(100,160,200,.6)", fontSize: 12, letterSpacing: 3 }}>AETHER ANALIZANDO DATOS...</div>
                                        <div style={{ display: "flex", gap: 8 }}>
                                            {[0, 1, 2].map(i => (
                                                <div key={i} className="dot-blink" style={{
                                                    width: 7, height: 7, borderRadius: "50%",
                                                    background: "#00d4ff", animationDelay: `${i * .2}s`
                                                }} />
                                            ))}
                                        </div>
                                        <div style={{ fontSize: 10, color: "rgba(0,150,255,.3)", letterSpacing: 1 }}>
                                            Procesando patrones sinópticos · Calculando índices de inestabilidad
                                        </div>
                                    </div>
                                ) : (
                                    aiMsgs.map((m, i) => (
                                        <div key={i} className="ai-message" style={{
                                            marginBottom: 16, display: "flex",
                                            gap: 10, flexDirection: m.role === "user" ? "row-reverse" : "row"
                                        }}>
                                            <div style={{
                                                width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
                                                background: m.role === "user" ? "rgba(0,50,100,.55)" : "linear-gradient(135deg,#002255,#005599)",
                                                border: "1px solid rgba(0,180,255,.3)",
                                                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15
                                            }}>
                                                {m.role === "user" ? "👤" : "🤖"}
                                            </div>
                                            <div style={{
                                                background: m.role === "user" ? "rgba(0,45,100,.45)" : "rgba(0,15,45,.65)",
                                                border: `1px solid ${m.role === "user" ? "rgba(0,100,200,.3)" : "rgba(0,180,255,.14)"}`,
                                                borderRadius: 13, padding: "11px 15px", maxWidth: "84%",
                                                fontSize: 12, lineHeight: 1.75
                                            }}>
                                                {m.content.split("\n").map((line, j) => {
                                                    if (line.startsWith("## "))
                                                        return <div key={j} style={{ fontWeight: 700, color: "#00aaff", fontSize: 14, marginBottom: 5, marginTop: 8 }}>{line.slice(3)}</div>;
                                                    if (line.match(/^\*\*(.+)\*\*$/))
                                                        return <div key={j} style={{ fontWeight: 700, color: "#00d4ff", marginBottom: 3, fontSize: 13 }}>{line.slice(2, -2)}</div>;
                                                    if (line.startsWith("• ") || line.startsWith("- "))
                                                        return <div key={j} style={{ paddingLeft: 14, color: "rgba(185,215,235,.9)", lineHeight: 1.7 }}>{line}</div>;
                                                    if (line.trim() === "")
                                                        return <div key={j} style={{ height: 4 }} />;
                                                    // inline bold
                                                    const parts = line.split(/\*\*(.+?)\*\*/g);
                                                    return <span key={j}>{parts.map((p, k) => k % 2 === 1 ? <strong key={k} style={{ color: "#e8f4ff" }}>{p}</strong> : p)}{"\n"}</span>;
                                                })}
                                                <div style={{ fontSize: 9, color: "rgba(100,145,195,.35)", marginTop: 6 }}>
                                                    {m.ts?.toLocaleTimeString?.()}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}

                                {/* Typing indicator */}
                                {aiLoading && aiMsgs.length > 0 && (
                                    <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                                        <div style={{
                                            width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg,#002255,#005599)",
                                            border: "1px solid rgba(0,180,255,.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15
                                        }}>🤖</div>
                                        <div style={{
                                            background: "rgba(0,15,45,.65)", border: "1px solid rgba(0,180,255,.14)",
                                            borderRadius: 13, padding: "12px 18px", display: "flex", gap: 5, alignItems: "center"
                                        }}>
                                            {[0, 1, 2].map(i => (
                                                <div key={i} className="dot-blink" style={{
                                                    width: 6, height: 6, borderRadius: "50%",
                                                    background: "#00d4ff", animationDelay: `${i * .2}s`
                                                }} />
                                            ))}
                                        </div>
                                    </div>
                                )}
                                <div ref={chatEnd} />
                            </div>

                            {/* Quick questions */}
                            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
                                {["¿Habrá tormentas esta semana?", "Previsión fin de semana", "¿Riesgo de heladas?", "¿Buen día para el deporte?", "Análisis agrícola", "Calidad del aire"].map((q, i) => (
                                    <button key={i} onClick={() => setAiInput(q)} className="qbtn"
                                        style={{
                                            background: "rgba(0,22,58,.5)", border: "1px solid rgba(0,110,200,.18)",
                                            borderRadius: 7, color: "rgba(140,185,215,.65)", padding: "4px 10px",
                                            cursor: "pointer", fontSize: 10, fontFamily: "'Exo 2',sans-serif"
                                        }}>
                                        {q}
                                    </button>
                                ))}
                            </div>

                            {/* Input row */}
                            <div style={{ display: "flex", gap: 8 }}>
                                <input value={aiInput}
                                    onChange={e => setAiInput(e.target.value)}
                                    onKeyDown={e => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), sendChat())}
                                    placeholder="Consulta a Dr. AETHER sobre cualquier aspecto meteorológico..."
                                    style={{
                                        flex: 1, background: "rgba(0,18,55,.65)", border: "1px solid rgba(0,140,255,.22)",
                                        borderRadius: 10, color: "#c8e0f0", padding: "11px 14px", fontSize: 12,
                                        fontFamily: "'Exo 2',sans-serif", transition: "border-color .2s"
                                    }} />
                                <button onClick={sendChat} disabled={aiLoading || !aiInput.trim()} className="send-btn"
                                    style={{
                                        background: "rgba(0,100,220,.38)", border: "1px solid rgba(0,150,255,.3)",
                                        borderRadius: 10, color: "#00d4ff", padding: "11px 18px", cursor: "pointer", fontSize: 16
                                    }}>
                                    ➤
                                </button>
                            </div>
                        </Card>
                    </div>
                )}

                {/* ══════════════════════════ CHARTS ═════════════════════════════ */}
                {tab === "charts" && (
                    <div className="fadein" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>

                        {/* Temperature 7d full width */}
                        <Card style={{ gridColumn: "1/-1" }}>
                            <SectionTitle icon="🌡️">TEMPERATURA 7 DÍAS — MÁXIMAS / MÍNIMAS / PRECIPITACIÓN</SectionTitle>
                            <ResponsiveContainer width="100%" height={210}>
                                <ComposedChart data={forecastData}>
                                    <defs>
                                        <linearGradient id="gMaxW" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#ff6b35" stopOpacity={.3} />
                                            <stop offset="95%" stopColor="#ff6b35" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,100,200,.09)" />
                                    <XAxis dataKey="day" tick={{ fill: "rgba(100,145,195,.45)", fontSize: 10 }} axisLine={false} tickLine={false} />
                                    <YAxis yAxisId="t" tick={{ fill: "rgba(100,145,195,.45)", fontSize: 10 }} axisLine={false} tickLine={false} unit="°" />
                                    <YAxis yAxisId="r" orientation="right" tick={{ fill: "rgba(70,140,255,.4)", fontSize: 10 }} axisLine={false} tickLine={false} unit="mm" />
                                    <Tooltip content={<CTip />} />
                                    <Legend wrapperStyle={{ color: "rgba(140,185,215,.55)", fontSize: 11 }} />
                                    <Area yAxisId="t" type="monotone" dataKey="max" stroke="#ff6b35" fill="url(#gMaxW)" strokeWidth={2} name="Máxima" unit="°C" />
                                    <Line yAxisId="t" type="monotone" dataKey="min" stroke="#00aaff" strokeWidth={2} dot={{ fill: "#00aaff", r: 3 }} name="Mínima" unit="°C" />
                                    <Bar yAxisId="r" dataKey="precip" fill="rgba(30,100,255,.45)" radius={[3, 3, 0, 0]} name="Precipitación" unit="mm" />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </Card>

                        {/* Pressure 24h */}
                        <Card>
                            <SectionTitle icon="📊">PRESIÓN ATMOSFÉRICA (24H)</SectionTitle>
                            <ResponsiveContainer width="100%" height={185}>
                                <LineChart data={hourlyData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,100,200,.09)" />
                                    <XAxis dataKey="h" tick={{ fill: "rgba(100,145,195,.4)", fontSize: 9 }} axisLine={false} tickLine={false} interval={3} />
                                    <YAxis tick={{ fill: "rgba(100,145,195,.4)", fontSize: 9 }} axisLine={false} tickLine={false} domain={["auto", "auto"]} unit=" hPa" />
                                    <Tooltip content={<CTip />} />
                                    <ReferenceLine y={1013.25} stroke="rgba(255,200,0,.25)" strokeDasharray="4 4"
                                        label={{ value: "1013 hPa", fill: "rgba(255,200,0,.4)", fontSize: 9, position: "right" }} />
                                    <Line type="monotone" dataKey="pressure" stroke="#ff8c35" strokeWidth={2} dot={false} name="Presión" unit=" hPa" />
                                </LineChart>
                            </ResponsiveContainer>
                        </Card>

                        {/* Humidity 24h */}
                        <Card>
                            <SectionTitle icon="💧">HUMEDAD RELATIVA (24H)</SectionTitle>
                            <ResponsiveContainer width="100%" height={185}>
                                <AreaChart data={hourlyData}>
                                    <defs>
                                        <linearGradient id="gHumH" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#4488ff" stopOpacity={.35} />
                                            <stop offset="95%" stopColor="#4488ff" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,100,200,.09)" />
                                    <XAxis dataKey="h" tick={{ fill: "rgba(100,145,195,.4)", fontSize: 9 }} axisLine={false} tickLine={false} interval={3} />
                                    <YAxis tick={{ fill: "rgba(100,145,195,.4)", fontSize: 9 }} axisLine={false} tickLine={false} unit="%" domain={[0, 100]} />
                                    <Tooltip content={<CTip />} />
                                    <ReferenceLine y={60} stroke="rgba(0,180,255,.15)" strokeDasharray="4 4" />
                                    <Area type="monotone" dataKey="humidity" stroke="#4488ff" fill="url(#gHumH)" strokeWidth={2} name="Humedad" unit="%" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </Card>

                        {/* UV 7d */}
                        <Card>
                            <SectionTitle icon="☀️">ÍNDICE UV MÁXIMO — 7 DÍAS</SectionTitle>
                            <ResponsiveContainer width="100%" height={185}>
                                <BarChart data={forecastData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,100,200,.09)" />
                                    <XAxis dataKey="day" tick={{ fill: "rgba(100,145,195,.4)", fontSize: 9 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: "rgba(100,145,195,.4)", fontSize: 9 }} axisLine={false} tickLine={false} domain={[0, "dataMax+1"]} />
                                    <Tooltip content={<CTip />} />
                                    <ReferenceLine y={6} stroke="rgba(255,80,0,.3)" strokeDasharray="4 4" label={{ value: "Alto", fill: "rgba(255,80,0,.4)", fontSize: 9 }} />
                                    <Bar dataKey="uv" radius={[5, 5, 0, 0]} name="Índice UV"
                                        fill="#ffcc00" />
                                </BarChart>
                            </ResponsiveContainer>
                        </Card>

                        {/* Precip + prob 7d */}
                        <Card>
                            <SectionTitle icon="🌧️">PRECIPITACIÓN Y PROBABILIDAD — 7 DÍAS</SectionTitle>
                            <ResponsiveContainer width="100%" height={185}>
                                <ComposedChart data={forecastData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,100,200,.09)" />
                                    <XAxis dataKey="day" tick={{ fill: "rgba(100,145,195,.4)", fontSize: 9 }} axisLine={false} tickLine={false} />
                                    <YAxis yAxisId="mm" tick={{ fill: "rgba(100,145,195,.4)", fontSize: 9 }} axisLine={false} tickLine={false} unit=" mm" />
                                    <YAxis yAxisId="pct" orientation="right" tick={{ fill: "rgba(0,180,255,.35)", fontSize: 9 }} axisLine={false} tickLine={false} unit="%" />
                                    <Tooltip content={<CTip />} />
                                    <Legend wrapperStyle={{ color: "rgba(140,185,215,.55)", fontSize: 11 }} />
                                    <Bar yAxisId="mm" dataKey="precip" fill="rgba(30,100,255,.55)" radius={[4, 4, 0, 0]} name="Precipitación" unit=" mm" />
                                    <Line yAxisId="pct" type="monotone" dataKey="prob" stroke="#00d4ff" strokeWidth={2} dot={{ fill: "#00d4ff", r: 3 }} name="Probabilidad" unit="%" />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </Card>

                        {/* Wind 7d */}
                        <Card>
                            <SectionTitle icon="💨">VIENTO MÁXIMO — 7 DÍAS</SectionTitle>
                            <ResponsiveContainer width="100%" height={185}>
                                <AreaChart data={forecastData}>
                                    <defs>
                                        <linearGradient id="gWindW" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#00ff88" stopOpacity={.28} />
                                            <stop offset="95%" stopColor="#00ff88" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,100,200,.09)" />
                                    <XAxis dataKey="day" tick={{ fill: "rgba(100,145,195,.4)", fontSize: 9 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: "rgba(100,145,195,.4)", fontSize: 9 }} axisLine={false} tickLine={false} unit=" km/h" />
                                    <Tooltip content={<CTip />} />
                                    <Area type="monotone" dataKey="windMax" stroke="#00ff88" fill="url(#gWindW)" strokeWidth={2} name="Viento máx." unit=" km/h" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </Card>

                    </div>
                )}

                {/* ══════════════════════════ HISTORY ════════════════════════════ */}
                {tab === "history" && (
                    <div className="fadein">
                        <SectionTitle icon="📅">REGISTRO METEOROLÓGICO — ÚLTIMOS 7 DÍAS</SectionTitle>

                        {/* History cards */}
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 8, marginBottom: 16 }}>
                            {historyData.map((d, i) => (
                                <div key={i} className="fcard" style={{
                                    background: "rgba(4,13,34,.72)",
                                    border: "1px solid rgba(0,130,200,.14)", borderRadius: 12, padding: "12px 8px", textAlign: "center"
                                }}>
                                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, color: "rgba(140,185,215,.65)", marginBottom: 3 }}>
                                        {d.day.toUpperCase()}
                                    </div>
                                    <div style={{ fontSize: 9, color: "rgba(100,145,195,.42)", marginBottom: 7 }}>{d.date}</div>
                                    <div style={{ fontSize: 28, marginBottom: 7 }}>{wmo(d.code).e}</div>
                                    <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 14, fontWeight: 700, color: "#ff7b35" }}>{Math.round(d.max)}°</div>
                                    <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 12, color: "rgba(100,145,195,.55)" }}>{Math.round(d.min)}°</div>
                                    <div style={{ marginTop: 6, fontSize: 9, color: "#4488ff" }}>💧 {d.prob}%</div>
                                    {d.precip > 0.1 && <div style={{ fontSize: 9, color: "rgba(70,130,255,.7)" }}>{d.precip.toFixed(1)}mm</div>}
                                </div>
                            ))}
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                            {/* Historical temp full width */}
                            <Card style={{ gridColumn: "1/-1" }}>
                                <SectionTitle icon="🌡️">EVOLUCIÓN TEMPERATURA — 7 DÍAS PASADOS</SectionTitle>
                                <ResponsiveContainer width="100%" height={200}>
                                    <ComposedChart data={historyData}>
                                        <defs>
                                            <linearGradient id="gHistMax" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#ff6b35" stopOpacity={.28} />
                                                <stop offset="95%" stopColor="#ff6b35" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,100,200,.09)" />
                                        <XAxis dataKey="day" tick={{ fill: "rgba(100,145,195,.45)", fontSize: 10 }} axisLine={false} tickLine={false} />
                                        <YAxis yAxisId="t" tick={{ fill: "rgba(100,145,195,.45)", fontSize: 10 }} axisLine={false} tickLine={false} unit="°" />
                                        <YAxis yAxisId="r" orientation="right" tick={{ fill: "rgba(70,140,255,.35)", fontSize: 10 }} axisLine={false} tickLine={false} unit="mm" />
                                        <Tooltip content={<CTip />} />
                                        <Legend wrapperStyle={{ color: "rgba(140,185,215,.55)", fontSize: 11 }} />
                                        <Area yAxisId="t" type="monotone" dataKey="max" stroke="#ff6b35" fill="url(#gHistMax)" strokeWidth={2} name="Máxima" unit="°C" />
                                        <Line yAxisId="t" type="monotone" dataKey="min" stroke="#00aaff" strokeWidth={2} dot={{ fill: "#00aaff", r: 4 }} name="Mínima" unit="°C" />
                                        <Bar yAxisId="r" dataKey="precip" fill="rgba(30,100,255,.4)" radius={[3, 3, 0, 0]} name="Precipitación" unit="mm" />
                                    </ComposedChart>
                                </ResponsiveContainer>
                            </Card>

                            {/* Stats summary */}
                            {historyData.length > 0 && (
                                <Card>
                                    <SectionTitle icon="📊">ESTADÍSTICAS DE LA SEMANA</SectionTitle>
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
                                        {[
                                            { l: "Temp. media máxima", v: `${(historyData.reduce((a, d) => a + d.max, 0) / historyData.length).toFixed(1)}°C`, c: "#ff7b35" },
                                            { l: "Temp. media mínima", v: `${(historyData.reduce((a, d) => a + d.min, 0) / historyData.length).toFixed(1)}°C`, c: "#00aaff" },
                                            { l: "Precipitación total", v: `${historyData.reduce((a, d) => a + (d.precip || 0), 0).toFixed(1)} mm`, c: "#4488ff" },
                                            { l: "Días con lluvia", v: `${historyData.filter(d => d.precip > 0.1).length} días`, c: "#00d4ff" },
                                            { l: "Temperatura máxima", v: `${Math.max(...historyData.map(d => d.max)).toFixed(1)}°C`, c: "#ffcc00" },
                                            { l: "Temperatura mínima", v: `${Math.min(...historyData.map(d => d.min)).toFixed(1)}°C`, c: "#88aaff" },
                                        ].map((s, i) => (
                                            <div key={i} style={{
                                                background: "rgba(0,15,48,.55)", border: "1px solid rgba(0,100,200,.14)",
                                                borderRadius: 9, padding: "10px 13px"
                                            }}>
                                                <div style={{ fontSize: 9, color: "rgba(100,145,195,.45)", marginBottom: 4, lineHeight: 1.3 }}>{s.l}</div>
                                                <div style={{
                                                    fontFamily: "'Orbitron',monospace", fontSize: 18, fontWeight: 700, color: s.c,
                                                    textShadow: `0 0 10px ${s.c}44`
                                                }}>{s.v}</div>
                                            </div>
                                        ))}
                                    </div>
                                </Card>
                            )}

                            {/* Precip history */}
                            <Card>
                                <SectionTitle icon="🌧️">PRECIPITACIÓN DIARIA — 7 DÍAS</SectionTitle>
                                <ResponsiveContainer width="100%" height={185}>
                                    <BarChart data={historyData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,100,200,.09)" />
                                        <XAxis dataKey="day" tick={{ fill: "rgba(100,145,195,.4)", fontSize: 9 }} axisLine={false} tickLine={false} />
                                        <YAxis tick={{ fill: "rgba(100,145,195,.4)", fontSize: 9 }} axisLine={false} tickLine={false} unit=" mm" />
                                        <Tooltip content={<CTip />} />
                                        <Bar dataKey="precip" fill="#1a5aff" radius={[4, 4, 0, 0]} name="Precipitación" unit=" mm" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </Card>
                        </div>
                    </div>
                )}

                {/* ══════════════════════════ STATIONS ══════════════════════════ */}
                {tab === "stations" && (
                    <div className="fadein">

                        {/* Source selector */}
                        <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap", alignItems: "center" }}>
                            <span style={{ fontSize: 10, letterSpacing: 3, color: "rgba(0,190,255,.6)", fontWeight: 700, fontFamily: "'Exo 2',sans-serif" }}>RED:</span>
                            {[
                                { id: "netatmo", icon: "🗺️", label: "Netatmo Map", sub: "Gratuito · Sin registro" },
                                { id: "wu", icon: "🌩️", label: "Weather Underground", sub: "Requiere API key" },
                                { id: "demo", icon: "🔬", label: "Modo Demo", sub: "Estaciones simuladas" },
                            ].map(s => (
                                <button key={s.id} onClick={() => { setPwsSrc(s.id); setPwsError(null); if (s.id === "demo") setPwsStations([]); }}
                                    className={`src-btn${pwsSrc === s.id ? " on" : ""}`}
                                    style={{
                                        background: "rgba(0,18,48,.6)", border: `1px solid rgba(0,130,200,${pwsSrc === s.id ? .5 : .15})`,
                                        borderRadius: 9, color: pwsSrc === s.id ? "#00e4ff" : "rgba(140,185,215,.6)",
                                        padding: "8px 14px", cursor: "pointer", textAlign: "left", fontFamily: "'Exo 2',sans-serif"
                                    }}>
                                    <div style={{ fontSize: 13, fontWeight: 700 }}>{s.icon} {s.label}</div>
                                    <div style={{ fontSize: 9, opacity: .55, marginTop: 1 }}>{s.sub}</div>
                                </button>
                            ))}
                        </div>

                        {/* ── NETATMO MAP ─────────────────────────────────────── */}
                        {pwsSrc === "netatmo" && (
                            <div>
                                <Card style={{
                                    marginBottom: 14, padding: "13px 18px",
                                    background: "linear-gradient(120deg,rgba(0,20,60,.95),rgba(0,40,100,.85))",
                                    border: "1px solid rgba(0,180,255,.25)"
                                }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                                        <div style={{ fontSize: 36 }}>🗺️</div>
                                        <div>
                                            <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 14, color: "#00d4ff", fontWeight: 700, letterSpacing: 2 }}>
                                                NETATMO WEATHERMAP
                                            </div>
                                            <div style={{ fontSize: 11, color: "rgba(140,185,215,.6)", marginTop: 3 }}>
                                                Red pública de +300.000 estaciones personales en todo el mundo · Sin registro · Datos en tiempo real
                                            </div>
                                        </div>
                                        <div style={{ marginLeft: "auto", display: "flex", gap: 6, flexWrap: "wrap" }}>
                                            {["🌡️ Temperatura", "💧 Humedad", "🌬️ CO₂", "🔊 Ruido"].map((l, i) => (
                                                <span key={i} style={{
                                                    fontSize: 9, background: "rgba(0,50,100,.35)", border: "1px solid rgba(0,130,200,.25)",
                                                    borderRadius: 5, padding: "3px 8px", color: "rgba(140,185,215,.65)"
                                                }}>{l}</span>
                                            ))}
                                        </div>
                                    </div>
                                </Card>
                                <div style={{
                                    borderRadius: 16, overflow: "hidden", border: "1px solid rgba(0,150,255,.2)",
                                    boxShadow: "0 8px 32px rgba(0,50,120,.4)", height: 540
                                }}>
                                    <iframe
                                        src={`https://weathermap.netatmo.com/`}
                                        width="100%" height="100%" frameBorder="0"
                                        title="Netatmo WeatherMap — Red pública de estaciones"
                                        style={{ display: "block" }}
                                        allow="geolocation"
                                    />
                                </div>
                                <div style={{ marginTop: 8, fontSize: 10, color: "rgba(100,145,195,.35)", display: "flex", justifyContent: "space-between" }}>
                                    <span>🌍 Fuente: Netatmo WeatherMap · Más de 300.000 estaciones activas en todo el mundo</span>
                                    <span>Click en cualquier estación para ver sus datos en tiempo real</span>
                                </div>
                            </div>
                        )}

                        {/* ── WEATHER UNDERGROUND ─────────────────────────────── */}
                        {(pwsSrc === "wu" || pwsSrc === "demo") && (
                            <div>
                                {/* API key panel (WU only) */}
                                {pwsSrc === "wu" && (
                                    <Card style={{ marginBottom: 14, padding: "14px 18px" }}>
                                        <SectionTitle icon="🔑">API KEY — WEATHER UNDERGROUND</SectionTitle>
                                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end" }}>
                                            <div style={{ flex: 1, minWidth: 220 }}>
                                                <div style={{ fontSize: 9, color: "rgba(100,145,195,.5)", marginBottom: 5, letterSpacing: 1 }}>
                                                    API KEY · Obtén la tuya gratis en wunderground.com/member/api-keys
                                                </div>
                                                <input value={wuKey} onChange={e => setWuKey(e.target.value)}
                                                    onKeyDown={e => e.key === "Enter" && fetchWuNearby()}
                                                    placeholder="Ej: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
                                                    type="password"
                                                    style={{
                                                        width: "100%", background: "rgba(0,18,55,.65)", border: "1px solid rgba(0,140,255,.25)",
                                                        borderRadius: 9, color: "#c8e0f0", padding: "9px 12px", fontSize: 12,
                                                        fontFamily: "'Exo 2',sans-serif"
                                                    }} />
                                            </div>
                                            <button onClick={fetchWuNearby} disabled={pwsLoading}
                                                style={{
                                                    background: "rgba(0,80,200,.4)", border: "1px solid rgba(0,150,255,.35)",
                                                    borderRadius: 9, color: "#00d4ff", padding: "9px 16px", cursor: "pointer",
                                                    fontSize: 12, fontFamily: "'Exo 2',sans-serif", fontWeight: 700, opacity: pwsLoading ? .5 : 1
                                                }}>
                                                {pwsLoading ? "⏳ Buscando..." : "📡 Buscar cercanas"}
                                            </button>
                                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                                <div style={{ fontSize: 9, color: "rgba(100,145,195,.5)" }}>ID directo:</div>
                                                <input value={pwsIdInput} onChange={e => setPwsIdInput(e.target.value.toUpperCase())}
                                                    onKeyDown={e => e.key === "Enter" && fetchWuById()}
                                                    placeholder="IMADRIDS123"
                                                    style={{
                                                        width: 130, background: "rgba(0,18,55,.65)", border: "1px solid rgba(0,140,255,.2)",
                                                        borderRadius: 8, color: "#00d4ff", padding: "9px 10px", fontSize: 11,
                                                        fontFamily: "'Orbitron',monospace", letterSpacing: 1
                                                    }} />
                                                <button onClick={() => fetchWuById()} disabled={pwsLoading || !pwsIdInput.trim()}
                                                    style={{
                                                        background: "rgba(0,60,150,.4)", border: "1px solid rgba(0,130,255,.3)",
                                                        borderRadius: 8, color: "#00d4ff", padding: "9px 12px", cursor: "pointer", fontSize: 12
                                                    }}>
                                                    🔍
                                                </button>
                                            </div>
                                            <label style={{
                                                display: "flex", alignItems: "center", gap: 6, cursor: "pointer",
                                                fontSize: 10, color: "rgba(140,185,215,.6)"
                                            }}>
                                                <input type="checkbox" checked={pwsAutoRef} onChange={e => setPwsAutoRef(e.target.checked)}
                                                    style={{ accentColor: "#00d4ff" }} />
                                                Auto-refresh 5 min
                                            </label>
                                        </div>
                                        {pwsError && (
                                            <div style={{
                                                marginTop: 10, padding: "8px 12px", background: "rgba(255,60,60,.08)",
                                                border: "1px solid rgba(255,80,80,.2)", borderRadius: 8, fontSize: 11, color: "#ff8888"
                                            }}>
                                                {pwsError}
                                            </div>
                                        )}
                                        <div style={{
                                            marginTop: 10, fontSize: 9, color: "rgba(100,145,195,.35)",
                                            borderTop: "1px solid rgba(0,100,200,.1)", paddingTop: 8, lineHeight: 1.7
                                        }}>
                                            📋 Cómo obtener tu API key gratuita: 1) Crea cuenta en wunderground.com · 2) Ve a Member → API Keys · 3) Genera una clave gratuita (plan Developer: 500 llamadas/día)
                                        </div>
                                    </Card>
                                )}

                                {/* Demo mode info */}
                                {pwsSrc === "demo" && (
                                    <Card style={{
                                        marginBottom: 14, padding: "13px 18px",
                                        background: "linear-gradient(120deg,rgba(0,30,70,.9),rgba(0,50,100,.8))",
                                        border: "1px solid rgba(0,180,100,.2)"
                                    }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                            <div style={{ fontSize: 32 }}>🔬</div>
                                            <div>
                                                <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 13, color: "#00ff88", fontWeight: 700, letterSpacing: 2 }}>
                                                    MODO DEMO ACTIVO
                                                </div>
                                                <div style={{ fontSize: 11, color: "rgba(140,185,215,.55)", marginTop: 2 }}>
                                                    6 estaciones simuladas alrededor de <strong style={{ color: "#e8f4ff" }}>{city}</strong> ·
                                                    Datos basados en condiciones reales actuales de Open-Meteo
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                )}

                                {/* Stations grid */}
                                {(() => {
                                    const stations = pwsSrc === "demo" ? demoStations : pwsStations;
                                    if (stations.length === 0 && pwsSrc === "wu") return (
                                        <Card style={{ textAlign: "center", padding: "40px 20px", color: "rgba(100,145,195,.5)" }}>
                                            <div style={{ fontSize: 40, marginBottom: 12 }}>📡</div>
                                            <div style={{ fontSize: 13, letterSpacing: 2 }}>Introduce tu API key y pulsa "Buscar cercanas"</div>
                                            <div style={{ fontSize: 10, marginTop: 8, opacity: .7 }}>O introduce directamente el ID de una estación (Ej: IMADRIDS123)</div>
                                        </Card>
                                    );
                                    return (
                                        <div>
                                            {/* Station grid */}
                                            <div style={{ marginBottom: 14 }}>
                                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                                                    <SectionTitle icon="📡">{`ESTACIONES ${pwsSrc === "demo" ? "DEMO" : "WU"} CERCANAS A ${city.toUpperCase()} — ${stations.length} ENCONTRADAS`}</SectionTitle>
                                                    {pwsSrc === "wu" && stations.length > 0 && (
                                                        <button onClick={fetchWuNearby} style={{
                                                            fontSize: 10, background: "rgba(0,40,100,.4)",
                                                            border: "1px solid rgba(0,130,200,.25)", borderRadius: 6, color: "rgba(0,200,255,.65)",
                                                            padding: "4px 10px", cursor: "pointer"
                                                        }}>↺ Actualizar</button>
                                                    )}
                                                </div>
                                                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(195px,1fr))", gap: 10 }}>
                                                    {stations.map((st, i) => {
                                                        const m = st.metric || {};
                                                        const isSel = pwsSelected?.stationID === st.stationID;
                                                        const ageMin = st.obsTimeLocal ? Math.round((Date.now() - new Date(st.obsTimeLocal)) / 60000) : null;
                                                        return (
                                                            <div key={i} onClick={() => setPwsSelected(isSel ? null : st)}
                                                                className={`pws-card${isSel ? " sel" : ""}`}
                                                                style={{
                                                                    background: "rgba(4,13,34,.78)", border: `1px solid rgba(0,140,255,${isSel ? .45 : .14})`,
                                                                    borderRadius: 14, padding: "14px 13px",
                                                                    boxShadow: isSel ? "0 0 20px rgba(0,180,255,.15)" : "none"
                                                                }}>
                                                                {/* Header */}
                                                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                                                                    <div>
                                                                        <div style={{
                                                                            fontFamily: "'Orbitron',monospace", fontSize: 10, color: "#00d4ff",
                                                                            fontWeight: 700, letterSpacing: 1
                                                                        }}>{st.stationID}</div>
                                                                        <div style={{ fontSize: 11, fontWeight: 600, color: "#e8f4ff", marginTop: 2, lineHeight: 1.3 }}>
                                                                            {st.neighborhood || st.stationID}
                                                                        </div>
                                                                        <div style={{ fontSize: 9, color: "rgba(100,145,195,.45)", marginTop: 1 }}>
                                                                            📍 {st._dist} km
                                                                        </div>
                                                                    </div>
                                                                    <div style={{ textAlign: "right" }}>
                                                                        <div style={{ position: "relative", display: "inline-block", width: 10, height: 10 }}>
                                                                            <div className="ping" style={{
                                                                                position: "absolute", inset: 0, borderRadius: "50%",
                                                                                background: ageMin > 15 ? "#ff8800" : ageMin > 5 ? "#ffcc00" : "#00ff88", opacity: .5
                                                                            }} />
                                                                            <div style={{
                                                                                position: "absolute", inset: 1, borderRadius: "50%",
                                                                                background: ageMin > 15 ? "#ff8800" : ageMin > 5 ? "#ffcc00" : "#00ff88"
                                                                            }} />
                                                                        </div>
                                                                        {ageMin !== null && (
                                                                            <div style={{ fontSize: 8, color: "rgba(100,145,195,.4)", marginTop: 3 }}>
                                                                                {ageMin < 1 ? "< 1 min" : `${ageMin} min`}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                {/* Temp big */}
                                                                <div style={{
                                                                    fontFamily: "'Orbitron',monospace", fontSize: 32, fontWeight: 900,
                                                                    color: m.temp > 35 ? "#ff4444" : m.temp > 25 ? "#ff8c35" : m.temp > 15 ? "#00d4ff" : m.temp > 5 ? "#88aaff" : "#aaccff",
                                                                    textShadow: "0 0 14px currentColor", marginBottom: 10, lineHeight: 1
                                                                }}>
                                                                    {m.temp?.toFixed(1) ?? "--"}°
                                                                    <span style={{ fontSize: 11, opacity: .5, marginLeft: 4 }}>C</span>
                                                                </div>

                                                                {/* Mini metrics */}
                                                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5 }}>
                                                                    {[
                                                                        { icon: "💧", v: `${st.humidity ?? '--'}%`, c: "#4488ff" },
                                                                        { icon: "💨", v: `${m.windSpeed?.toFixed(1) ?? '--'} m/s`, c: "#00ff88" },
                                                                        { icon: "📊", v: `${m.pressure?.toFixed(0) ?? '--'} hPa`, c: "#ff8c35" },
                                                                        { icon: "🌧️", v: `${m.precipTotal?.toFixed(1) ?? '0.0'} mm`, c: "#00aaff" },
                                                                    ].map((x, j) => (
                                                                        <div key={j} style={{
                                                                            background: "rgba(0,15,48,.5)", borderRadius: 7,
                                                                            padding: "5px 7px", fontSize: 10
                                                                        }}>
                                                                            <span style={{ opacity: .5 }}>{x.icon} </span>
                                                                            <span style={{ color: x.c, fontWeight: 700 }}>{x.v}</span>
                                                                        </div>
                                                                    ))}
                                                                </div>

                                                                {/* Footer */}
                                                                <div style={{
                                                                    marginTop: 9, fontSize: 8, color: "rgba(100,145,195,.32)",
                                                                    borderTop: "1px solid rgba(0,100,200,.1)", paddingTop: 6, lineHeight: 1.5
                                                                }}>
                                                                    <div>{st.softwareType}</div>
                                                                    <div style={{ color: isSel ? "rgba(0,210,255,.7)" : "rgba(100,145,195,.32)" }}>
                                                                        {isSel ? "▼ DETALLES ABAJO" : "Click para detalles →"}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            {/* ─── SELECTED STATION DETAIL ─── */}
                                            {pwsSelected && (() => {
                                                const st = pwsSelected;
                                                const m = st.metric || {};
                                                const ageMin = st.obsTimeLocal ? Math.round((Date.now() - new Date(st.obsTimeLocal)) / 60000) : null;
                                                return (
                                                    <Card style={{
                                                        border: "1px solid rgba(0,200,255,.28)",
                                                        boxShadow: "0 0 32px rgba(0,180,255,.1), 0 8px 32px rgba(0,60,160,.25)",
                                                        background: "linear-gradient(160deg,rgba(0,20,60,.92),rgba(4,13,34,.95))"
                                                    }}>

                                                        {/* Detail header */}
                                                        <div style={{
                                                            display: "flex", alignItems: "flex-start", justifyContent: "space-between",
                                                            borderBottom: "1px solid rgba(0,150,255,.13)", paddingBottom: 14, marginBottom: 16, flexWrap: "wrap", gap: 12
                                                        }}>
                                                            <div style={{ display: "flex", gap: 14 }}>
                                                                <div style={{
                                                                    width: 55, height: 55, borderRadius: 12, background: "rgba(0,50,120,.5)",
                                                                    border: "1px solid rgba(0,180,255,.3)", display: "flex", alignItems: "center",
                                                                    justifyContent: "center", fontSize: 24
                                                                }}>📡</div>
                                                                <div>
                                                                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                                                        <div style={{
                                                                            fontFamily: "'Orbitron',monospace", fontSize: 16, color: "#00d4ff",
                                                                            fontWeight: 700, letterSpacing: 2
                                                                        }}>{st.stationID}</div>
                                                                        <span style={{
                                                                            fontSize: 9, background: "rgba(0,100,50,.3)", border: "1px solid rgba(0,200,100,.3)",
                                                                            borderRadius: 4, padding: "2px 7px", color: "#00ff88"
                                                                        }}>● EN VIVO</span>
                                                                    </div>
                                                                    <div style={{ fontSize: 14, fontWeight: 600, color: "#e8f4ff", marginTop: 3 }}>
                                                                        {st.neighborhood}
                                                                    </div>
                                                                    <div style={{ fontSize: 10, color: "rgba(100,145,195,.5)", marginTop: 2 }}>
                                                                        📍 {st.lat?.toFixed(5)}, {st.lon?.toFixed(5)} · {st._dist} km de {city}
                                                                        {m.elev && <span> · ⛰️ {m.elev}m s.n.m.</span>}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div style={{ textAlign: "right" }}>
                                                                <div style={{ fontSize: 10, color: "rgba(100,145,195,.45)" }}>Última actualización</div>
                                                                <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 12, color: "#00d4ff", marginTop: 2 }}>
                                                                    {ageMin !== null ? (ageMin < 1 ? "< 1 min" : `${ageMin} min atrás`) : "--"}
                                                                </div>
                                                                <div style={{ fontSize: 9, color: "rgba(100,145,195,.35)", marginTop: 2 }}>{st.softwareType}</div>
                                                                {st.qcStatus === 1 && (
                                                                    <div style={{ fontSize: 8, marginTop: 3, color: "#00ff88" }}>✓ Control de calidad OK</div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Big temp + metrics */}
                                                        <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 20, marginBottom: 18 }}>
                                                            {/* Big temp block */}
                                                            <div style={{
                                                                textAlign: "center", padding: "10px 20px", background: "rgba(0,15,50,.5)",
                                                                borderRadius: 14, border: "1px solid rgba(0,130,255,.15)", minWidth: 130
                                                            }}>
                                                                <div style={{
                                                                    fontFamily: "'Orbitron',monospace", fontSize: 64, fontWeight: 900, lineHeight: 1,
                                                                    color: m.temp > 35 ? "#ff4444" : m.temp > 25 ? "#ff8c35" : m.temp > 15 ? "#00d4ff" : m.temp > 5 ? "#88aaff" : "#aaccff",
                                                                    textShadow: "0 0 24px currentColor"
                                                                }}>
                                                                    {m.temp?.toFixed(1) ?? '--'}°
                                                                </div>
                                                                <div style={{ fontSize: 10, color: "rgba(100,145,195,.5)", marginTop: 4 }}>TEMPERATURA</div>
                                                                {m.dewpt != null && (
                                                                    <div style={{ fontSize: 11, marginTop: 8, color: "rgba(140,185,215,.7)" }}>
                                                                        Pto. rocío: <strong style={{ color: "#88aaff" }}>{m.dewpt.toFixed(1)}°C</strong>
                                                                    </div>
                                                                )}
                                                                {m.heatIndex != null && (
                                                                    <div style={{ fontSize: 11, marginTop: 4, color: "rgba(140,185,215,.7)" }}>
                                                                        Índice calor: <strong style={{ color: "#ff8c35" }}>{m.heatIndex.toFixed(1)}°C</strong>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* Full metrics grid */}
                                                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(130px,1fr))", gap: 8 }}>
                                                                {[
                                                                    { icon: "💧", label: "HUMEDAD", v: `${st.humidity ?? '--'}%`, c: "#4488ff" },
                                                                    {
                                                                        icon: "📊", label: "PRESIÓN", v: `${m.pressure?.toFixed(1) ?? '--'} hPa`, c: "#ff8c35",
                                                                        sub: m.pressure > 1013 ? "Alta presión ↑" : "Baja presión ↓"
                                                                    },
                                                                    {
                                                                        icon: "💨", label: "VIENTO", v: `${m.windSpeed?.toFixed(1) ?? '--'} m/s`, c: "#00ff88",
                                                                        sub: st.winddir != null ? `${wdir(st.winddir)} (${st.winddir}°)` : null
                                                                    },
                                                                    { icon: "🌪️", label: "RÁFAGA MÁX.", v: `${m.windGust?.toFixed(1) ?? '--'} m/s`, c: "#ff4455" },
                                                                    { icon: "🌧️", label: "PRECIP. ACTUAL", v: `${m.precipRate?.toFixed(2) ?? '0.00'} mm/h`, c: "#00aaff" },
                                                                    { icon: "🌦️", label: "PRECIP. HOY", v: `${m.precipTotal?.toFixed(1) ?? '0.0'} mm`, c: "#4488ff" },
                                                                    { icon: "☀️", label: "RAD. SOLAR", v: st.solarRadiation != null ? `${st.solarRadiation} W/m²` : "--", c: "#ffcc00" },
                                                                    { icon: "🔆", label: "ÍNDICE UV", v: st.uv != null ? `${st.uv}` : "--", c: "#ff9900" },
                                                                ].map((x, i) => (
                                                                    <div key={i} className="pws-metric"
                                                                        style={{
                                                                            background: "rgba(0,15,48,.55)", border: "1px solid rgba(0,100,200,.13)",
                                                                            borderRadius: 10, padding: "10px 12px"
                                                                        }}>
                                                                        <div style={{ fontSize: 9, color: "rgba(100,145,195,.5)", letterSpacing: 1, marginBottom: 5 }}>
                                                                            {x.icon} {x.label}
                                                                        </div>
                                                                        <div style={{
                                                                            fontFamily: "'Orbitron',monospace", fontSize: 18, fontWeight: 700,
                                                                            color: x.c, textShadow: `0 0 10px ${x.c}44`
                                                                        }}>{x.v}</div>
                                                                        {x.sub && <div style={{ fontSize: 9, color: "rgba(100,145,195,.4)", marginTop: 3 }}>{x.sub}</div>}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        {/* Comparison vs official model */}
                                                        {wx && (
                                                            <div style={{
                                                                background: "rgba(0,10,40,.5)", border: "1px solid rgba(0,100,200,.12)",
                                                                borderRadius: 12, padding: "12px 14px"
                                                            }}>
                                                                <div style={{ fontSize: 9, letterSpacing: 3, color: "rgba(0,190,255,.55)", fontWeight: 700, marginBottom: 10 }}>
                                                                    ⚖️ COMPARACIÓN — ESTACIÓN PWS vs MODELO ECMWF (Open-Meteo)
                                                                </div>
                                                                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: 8 }}>
                                                                    {[
                                                                        { label: "Temperatura", pws: m.temp?.toFixed(1), model: wx.current.temperature_2m?.toFixed(1), unit: "°C" },
                                                                        { label: "Humedad", pws: st.humidity, model: wx.current.relative_humidity_2m, unit: "%" },
                                                                        { label: "Presión", pws: m.pressure?.toFixed(1), model: wx.current.pressure_msl?.toFixed(1), unit: " hPa" },
                                                                        {
                                                                            label: "Viento", pws: m.windSpeed != null ? `${(m.windSpeed * 3.6).toFixed(1)}` : null,
                                                                            model: wx.current.wind_speed_10m?.toFixed(1), unit: " km/h"
                                                                        },
                                                                    ].map((c, i) => {
                                                                        const diff = c.pws && c.model ? (parseFloat(c.pws) - parseFloat(c.model)).toFixed(1) : null;
                                                                        return (
                                                                            <div key={i} style={{ background: "rgba(0,20,55,.5)", borderRadius: 9, padding: "9px 11px" }}>
                                                                                <div style={{ fontSize: 9, color: "rgba(100,145,195,.45)", marginBottom: 5 }}>{c.label}</div>
                                                                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                                                    <div>
                                                                                        <div style={{ fontSize: 10, color: "rgba(100,145,195,.45)" }}>📡 PWS</div>
                                                                                        <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 14, fontWeight: 700, color: "#00d4ff" }}>
                                                                                            {c.pws ?? '--'}{c.unit}
                                                                                        </div>
                                                                                    </div>
                                                                                    {diff && (
                                                                                        <div style={{
                                                                                            fontSize: 12, fontWeight: 700, color: Math.abs(diff) > 2 ? "#ff8c35" : "#00ff88",
                                                                                            background: Math.abs(diff) > 2 ? "rgba(255,80,0,.1)" : "rgba(0,255,80,.08)",
                                                                                            border: `1px solid ${Math.abs(diff) > 2 ? "rgba(255,80,0,.2)" : "rgba(0,255,80,.15)"}`,
                                                                                            borderRadius: 6, padding: "2px 6px"
                                                                                        }}>
                                                                                            {diff > 0 ? "+" : ""}{diff}{c.unit}
                                                                                        </div>
                                                                                    )}
                                                                                    <div>
                                                                                        <div style={{ fontSize: 10, color: "rgba(100,145,195,.45)" }}>🛰️ ECMWF</div>
                                                                                        <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 14, fontWeight: 700, color: "#ff8c35" }}>
                                                                                            {c.model ?? '--'}{c.unit}
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </Card>
                                                );
                                            })()}
                                        </div>
                                    );
                                })()}
                            </div>
                        )}

                    </div>
                )}


                <footer style={{
                    borderTop: "1px solid rgba(0,100,200,.1)", padding: "8px 22px",
                    display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 4,
                    fontSize: 9, color: "rgba(100,145,195,.3)", letterSpacing: 1,
                    background: "rgba(3,11,26,.8)"
                }}>
                    <span>⚡ METEORIX PRO v5.0 · Open-Meteo.com (ECMWF · GFS) · IA: Claude Sonnet</span>
                    <span>Radar: Windy.com · Geocodificación: OpenStreetMap Nominatim · {now.toLocaleDateString("es-ES")}</span>
                </footer>
            </div>
            );
}