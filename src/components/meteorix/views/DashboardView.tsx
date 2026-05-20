import React from 'react';
import { AreaChart, Area, BarChart, Bar, ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Card, SectionTitle, CTip } from '../MeteorixUI';
import { wmo, wdir } from '../MeteorixConstants';

export const DashboardView = ({ wx, now, forecastData, hourlyData }: any) => {
    const cur = wx.current;
    const curWmo = wmo(cur.weather_code);
    const today = forecastData[0] || {};

    return (
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
                    {forecastData.map((d: any, i: number) => (
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
                        <BarChart data={hourlyData.filter((_: any, i: number) => i % 2 === 0)}>
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
    );
};
