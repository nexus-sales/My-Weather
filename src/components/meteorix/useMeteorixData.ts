import { useState, useEffect, useMemo, useRef } from 'react';
import { hdist } from './meteorixUtils';

export function useMeteorixData() {
    const [tab, setTab] = useState("dashboard");
    const [coords, setCoords] = useState({ lat: 40.4165, lon: -3.7026 });
    const [city, setCity] = useState("Madrid, ES");
    const [wx, setWx] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [now, setNow] = useState(new Date());

    const [searchInput, setSearchInput] = useState("");
    const [radarMode, setRadarMode] = useState("radar");

    // -- clock
    useEffect(() => {
        const t = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(t);
    }, []);

    // -- search city
    const searchCity = async () => {
        if (!searchInput.trim()) return;
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchInput)}&format=json&limit=1`);
            const d = await res.json();
            if (d[0]) setCoords({ lat: parseFloat(d[0].lat), lon: parseFloat(d[0].lon) });
        } catch (e) { console.error(e); }
    };

    // -- geolocation
    useEffect(() => {
        navigator.geolocation?.getCurrentPosition(
            p => setCoords({ lat: p.coords.latitude, lon: p.coords.longitude }),
            () => { }
        );
    }, []);

    // -- fetch weather
    useEffect(() => {
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
        fetchWx();
    }, [coords]);

    // -- AI logic
    const [aiMsgs, setAiMsgs] = useState<any[]>([]);
    const [aiInput, setAiInput] = useState("");
    const [aiLoading, setAiLoading] = useState(false);
    const chatEnd = useRef<HTMLDivElement>(null);

    const sendChat = async (input?: string) => {
        const msg = input || aiInput;
        if (!msg.trim() || aiLoading) return;
        setAiInput("");
        setAiLoading(true);
        setAiMsgs(prev => [...prev, { role: "user", content: msg, ts: new Date() }]);
        
        try {
            const res = await fetch("/api/ai", {
                method: "POST",
                body: JSON.stringify({
                    messages: [...aiMsgs.map(m => ({ role: m.role, content: m.content })), { role: "user", content: msg }],
                    systemPrompt: `IA Meteorológica para ${city}. Datos actual: ${wx?.current?.temperature_2m}°C.`
                })
            });
            const data = await res.json();
            setAiMsgs(prev => [...prev, { role: "assistant", content: data.content?.[0]?.text || data.error, ts: new Date() }]);
        } catch (e) {
            setAiMsgs(prev => [...prev, { role: "assistant", content: "Error de IA", ts: new Date() }]);
        }
        setAiLoading(false);
    };

    // -- PWS logic
    const [pwsSrc, setPwsSrc] = useState("demomap");
    const [pwsStations, setPwsStations] = useState([]);
    const [demoStations, setDemoStations] = useState([
        { id: "DEMO1", name: "Estación Centro", lat: coords.lat + 0.01, lon: coords.lon + 0.01, temp: 22, hum: 45 },
        { id: "DEMO2", name: "Estación Norte", lat: coords.lat + 0.02, lon: coords.lon - 0.01, temp: 20, hum: 50 },
    ]);
    const [pwsSelected, setPwsSelected] = useState<any>(null);
    const [pwsLoading, setPwsLoading] = useState(false);
    const [pwsError, setPwsError] = useState(null);
    const [wuKey, setWuKey] = useState("");
    const [pwsIdInput, setPwsIdInput] = useState("");
    const [pwsAutoRef, setPwsAutoRef] = useState(false);

    const fetchWuNearby = async () => {
        if (!wuKey) return;
        setPwsLoading(true);
        try {
            const res = await fetch(`/api/wu?path=pws/observations/nearby&apiKey=${wuKey}&lat=${coords.lat}&lon=${coords.lon}`);
            const data = await res.json();
            setPwsStations(data.observations || []);
        } catch (e: any) { setPwsError(e.message); }
        setPwsLoading(false);
    };

    const fetchWuById = async (id?: string) => {
        const targetId = id || pwsIdInput;
        if (!wuKey || !targetId) return;
        setPwsLoading(true);
        try {
            const res = await fetch(`/api/wu?path=pws/observations/current&apiKey=${wuKey}&stationId=${targetId}`);
            const data = await res.json();
            if (data.observations?.[0]) setPwsSelected(data.observations[0]);
        } catch (e: any) { setPwsError(e.message); }
        setPwsLoading(false);
    };

    const hourlyData = useMemo(() => {
        if (!wx) return [];
        const nowIso = now.toISOString().slice(0, 13);
        let idx = wx.hourly.time.findIndex((t: string) => t.slice(0, 13) >= nowIso);
        if (idx < 0) idx = 0;
        return wx.hourly.time.slice(idx, idx + 24).map((t: string, i: number) => ({
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
        return wx.daily.time.slice(0, 7).map((t: string, i: number) => {
            const d = new Date(t + "T12:00:00");
            return {
                day: i === 0 ? "Hoy" : D[d.getDay()],
                date: `${d.getDate()}/${d.getMonth() + 1}`,
                max: wx.daily.temperature_2m_max[i],
                min: wx.daily.temperature_2m_min[i],
                precip: wx.daily.precipitation_sum[i],
                prob: wx.daily.precipitation_probability_max[i],
                code: wx.daily.weather_code[i],
            };
        });
    }, [wx]);

    const historyData = useMemo(() => {
        if (!wx) return [];
        const D = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
        return wx.daily.time.slice(0, 7).map((t: string, i: number) => {
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

    return {
        tab, setTab,
        coords, setCoords, city, setCity, wx, loading, now, hourlyData, forecastData, historyData,
        searchInput, setSearchInput, searchCity,
        radarMode, setRadarMode,
        aiMsgs, aiInput, setAiInput, aiLoading, sendChat, chatEnd,
        pwsSrc, setPwsSrc, pwsStations, demoStations, pwsSelected, setPwsSelected,
        pwsLoading, pwsError, setPwsError, fetchWuNearby, fetchWuById,
        wuKey, setWuKey, pwsIdInput, setPwsIdInput, pwsAutoRef, setPwsAutoRef
    };
}
