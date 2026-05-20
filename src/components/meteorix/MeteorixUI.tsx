import React from 'react';
import { GOOGLE_FONTS, CSS } from './MeteorixConstants';

export const CTip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{ background: "rgba(4,12,32,.97)", border: "1px solid rgba(0,180,255,.3)", borderRadius: 9, padding: "8px 13px", fontSize: 11, fontFamily: "'Exo 2',sans-serif" }}>
            <p style={{ color: "#00d4ff", marginBottom: 4, fontWeight: 600 }}>{label}</p>
            {payload.map((p: any, i: number) => (
                <p key={i} style={{ color: p.color || "#c8e0f0", lineHeight: 1.6 }}>
                    {p.name}: <strong style={{ color: "#fff" }}>{typeof p.value === "number" ? p.value.toFixed(1) : p.value}{p.unit || ""}</strong>
                </p>
            ))}
        </div>
    );
};

export const Card = ({ children, style = {}, className = "" }: { children: React.ReactNode; style?: React.CSSProperties; className?: string }) => (
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

export const SectionTitle = ({ icon, children }: { icon: string; children: React.ReactNode }) => (
    <h3 style={{ fontSize: 10, letterSpacing: 3, color: "rgba(0,190,255,.65)", marginBottom: 12, fontWeight: 700, fontFamily: "'Exo 2',sans-serif" }}>
        {icon} {children}
    </h3>
);

export const LoadingScreen = () => (
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
