import React, { useState } from 'react';
import { RADAR_MODES } from '../MeteorixConstants';

export const RadarView = ({ coords }: any) => {
    const [radarMode, setRadarMode] = useState("rain");

    return (
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
    );
};
