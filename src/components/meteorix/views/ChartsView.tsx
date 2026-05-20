import React from 'react';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, ComposedChart, ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ReferenceLine } from 'recharts';
import { Card, SectionTitle, CTip } from '../MeteorixUI';

export const ChartsView = ({ forecastData, hourlyData }: any) => {
    return (
        <div className="fadein" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
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

            <Card>
                <SectionTitle icon="📊">PRESIÓN ATMOSFÉRICA (24H)</SectionTitle>
                <ResponsiveContainer width="100%" height={185}>
                    <LineChart data={hourlyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,100,200,.09)" />
                        <XAxis dataKey="h" tick={{ fill: "rgba(100,145,195,.4)", fontSize: 9 }} axisLine={false} tickLine={false} interval={3} />
                        <YAxis tick={{ fill: "rgba(100,145,195,.4)", fontSize: 9 }} axisLine={false} tickLine={false} domain={["auto", "auto"]} unit=" hPa" />
                        <Tooltip content={<CTip />} />
                        <ReferenceLine y={1013.25} stroke="rgba(255,200,0,.25)" strokeDasharray="4 4" label={{ value: "1013 hPa", fill: "rgba(255,200,0,.4)", fontSize: 9, position: "right" }} />
                        <Line type="monotone" dataKey="pressure" stroke="#ff8c35" strokeWidth={2} dot={false} name="Presión" unit=" hPa" />
                    </LineChart>
                </ResponsiveContainer>
            </Card>

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
        </div>
    );
};
