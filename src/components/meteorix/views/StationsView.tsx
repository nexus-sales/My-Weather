import React, { useState, useMemo, useEffect } from 'react';
import { Card, SectionTitle } from '../MeteorixUI';
import { hdist } from '../meteorixUtils';
import { wdir } from '../MeteorixConstants';

export const StationsView = ({ coords, city, wx }: any) => {
    const [pwsSrc, setPwsSrc] = useState("netatmo");
    const [wuKey, setWuKey] = useState("");
    const [pwsStations, setPwsStations] = useState<any[]>([]);
    const [pwsSelected, setPwsSelected] = useState<any>(null);
    const [pwsLoading, setPwsLoading] = useState(false);
    const [pwsError, setPwsError] = useState<string | null>(null);
    const [pwsIdInput, setPwsIdInput] = useState("");
    const [pwsAutoRef, setPwsAutoRef] = useState(false);

    const demoStations = useMemo(() => {
        if (!wx) return [];
        const c = wx.current;
        const b = { t: c.temperature_2m, h: c.relative_humidity_2m, ws: c.wind_speed_10m, wd: c.wind_direction_10m, pr: c.pressure_msl, pp: c.precipitation, uv: c.uv_index };
        const mk = (id: string, name: string, dlat: number, dlon: number, dt: number, dh: number, dws: number, dpr: number, elev: number, sw: string, sr: number) => ({
            stationID: id, neighborhood: name, lat: coords.lat + dlat, lon: coords.lon + dlon,
            softwareType: sw, obsTimeLocal: new Date(Date.now() - Math.random() * 8 * 60000).toISOString(),
            _dist: hdist(coords.lat, coords.lon, coords.lat + dlat, coords.lon + dlon),
            humidity: Math.round(b.h + dh), winddir: Math.round((b.wd + 0) % 360),
            solarRadiation: sr, uv: +(b.uv + 0.2 * (Math.random() - .5) * 2).toFixed(1), qcStatus: 1,
            metric: {
                temp: +(b.t + dt).toFixed(1), dewpt: +(b.t + dt - ((100 - (b.h + dh)) / 5)).toFixed(1),
                windSpeed: +(b.ws / 3.6 * (1 + dws)).toFixed(1), windGust: +(b.ws / 3.6 * (1.4 + dws)).toFixed(1),
                pressure: +(b.pr + dpr).toFixed(1), precipRate: +(b.pp * (Math.random() * .3)).toFixed(2),
                precipTotal: +(b.pp * 24 * (0.8 + Math.random() * .5)).toFixed(1), elev
            }
        });
        return [
            mk("DEMO001", "Centro Urbano", 0.012, 0.008, 0.6, -2, 0, -0.8, 650, "Davis Vantage Pro2", 280),
            mk("DEMO002", "Parque Norte", 0.025, -0.018, -0.4, 3, 0.1, 0.3, 620, "WS-2315", 310),
            mk("DEMO003", "Aeropuerto", -0.031, 0.028, 1.2, -5, 0.2, -1.5, 610, "Vaisala AWS310", 265),
        ];
    }, [coords, wx]);

    const fetchWuNearby = async () => {
        if (!wuKey.trim()) { setPwsError("⚠️ Introduce tu API key de Weather Underground"); return; }
        setPwsLoading(true); setPwsError(null);
        const base = `https://api.weather.com/v2/pws/observations/nearby?geocode=${coords.lat},${coords.lon}&limit=20&format=json&units=m&apiKey=${wuKey.trim()}`;
        try {
            let d;
            try { const r = await fetch(base); if (!r.ok) throw new Error(r.status.toString()); d = await r.json(); }
            catch { const r = await fetch(`https://corsproxy.io/?${encodeURIComponent(base)}`); d = await r.json(); }
            const obs = (d.observations || []).map((o: any) => ({ ...o, _dist: hdist(coords.lat, coords.lon, o.lat || 0, o.lon || 0) }));
            obs.sort((a: any, b: any) => parseFloat(a._dist) - parseFloat(b._dist));
            setPwsStations(obs);
        } catch (e) { setPwsError("Error de conexión."); }
        setPwsLoading(false);
    };

    return (
        <div className="fadein">
            <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap", alignItems: "center" }}>
                {/* Simplified Source Selector */}
                {['netatmo', 'wu', 'demo'].map(s => (
                    <button key={s} onClick={() => setPwsSrc(s)} className={`src-btn${pwsSrc === s ? " on" : ""}`} style={{ background: "rgba(0,18,48,.6)", border: `1px solid rgba(0,130,200,${pwsSrc === s ? .5 : .15})`, borderRadius: 9, color: pwsSrc === s ? "#00e4ff" : "rgba(140,185,215,.6)", padding: "8px 14px", cursor: "pointer" }}>
                        {s.toUpperCase()}
                    </button>
                ))}
            </div>

            {pwsSrc === "netatmo" && (
                <div style={{ borderRadius: 16, overflow: "hidden", border: "1px solid rgba(0,150,255,.2)", height: 540 }}>
                    <iframe src="https://weathermap.netatmo.com/" width="100%" height="100%" frameBorder="0" title="Netatmo" style={{ display: "block" }} allow="geolocation" />
                </div>
            )}

            {pwsSrc === "demo" && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(195px,1fr))", gap: 10 }}>
                    {demoStations.map((st: any, i: number) => (
                        <Card key={i} style={{ background: "rgba(4,13,34,.78)", borderRadius: 14, padding: "14px 13px" }}>
                            <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 10, color: "#00d4ff" }}>{st.stationID}</div>
                            <div style={{ fontSize: 14, color: "#e8f4ff" }}>{st.metric.temp}°C</div>
                            <div style={{ fontSize: 9, color: "rgba(100,145,195,.45)" }}>{st.neighborhood}</div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};
