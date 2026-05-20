import React from 'react';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, ComposedChart, ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Card, SectionTitle, CTip } from '../MeteorixUI';
import { wmo } from '../MeteorixConstants';

export const HistoryView = ({ historyData }: any) => {
    return (
        <div className="fadein">
            <SectionTitle icon="📅">REGISTRO METEOROLÓGICO — ÚLTIMOS 7 DÍAS</SectionTitle>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 8, marginBottom: 16 }}>
                {historyData.map((d: any, i: number) => (
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
                    </div>
                ))}
            </div>

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
        </div>
    );
};
