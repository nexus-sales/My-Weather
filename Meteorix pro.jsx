import React from 'react';
import useMeteorixData from './src/components/meteorix/useMeteorixData';
import MeteorixConstants from './src/components/meteorix/MeteorixConstants';
import DashboardView from './src/components/meteorix/views/DashboardView';
import RadarView from './src/components/meteorix/views/RadarView';
import { AetherView as AetherChat } from './src/components/meteorix/views/AetherView';
import ChartsView from './src/components/meteorix/views/ChartsView';
import HistoryView from './src/components/meteorix/views/HistoryView';
import StationsView from './src/components/meteorix/views/StationsView';

const { GOOGLE_FONTS, CSS, TABS } = MeteorixConstants;

export default function MeteorixPro() {
    const {
        tab, setTab,
        city, coords, searchInput, setSearchInput, searchCity,
        wx, loading, now,
        forecastData, hourlyData, historyData,
        radarMode, setRadarMode,
        aiMsgs, aiInput, setAiInput, aiLoading, sendChat, chatEnd,
        pwsSrc, setPwsSrc, pwsStations, demoStations, pwsSelected, setPwsSelected,
        pwsLoading, pwsError, setPwsError, fetchWuNearby, fetchWuById,
        wuKey, setWuKey, pwsIdInput, setPwsIdInput, pwsAutoRef, setPwsAutoRef
    } = useMeteorixData();

    if (loading) {
        return (
            <div style={{
                background: "#030b1a", height: "100vh", display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center", color: "#00d4ff", fontFamily: "'Orbitron',sans-serif"
            }}>
                <div style={{ fontSize: 40, marginBottom: 20, animation: "pulse 1.5s infinite" }}>🌍</div>
                <div style={{ letterSpacing: 4 }}>SISTEMA INICIALIZANDO...</div>
                <style>{`@keyframes pulse { 0% { opacity: 0.4; } 50% { opacity: 1; } 100% { opacity: 0.4; } }`}</style>
            </div>
        );
    }

    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    const ss = String(now.getSeconds()).padStart(2, "0");

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

            {/* HEADER */}
            <header style={{
                position: "relative", zIndex: 20, borderBottom: "1px solid rgba(0,150,255,.14)", padding: "10px 20px",
                display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10,
                background: "rgba(3,11,26,.93)", backdropFilter: "blur(24px)"
            }}>
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

                <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, justifyContent: "center" }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#00ff88", boxShadow: "0 0 8px #00ff88" }} />
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#e8f4ff" }}>{city}</div>
                    <div style={{ fontSize: 10, color: "rgba(100,160,200,.45)", letterSpacing: 1 }}>
                        {coords.lat.toFixed(4)}°N / {coords.lon.toFixed(4)}°E
                    </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ display: "flex", gap: 4 }}>
                        <input value={searchInput} onChange={e => setSearchInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && searchCity()}
                            placeholder="Buscar ciudad..."
                            style={{
                                background: "rgba(0,25,65,.6)", border: "1px solid rgba(0,140,255,.22)", borderRadius: 7,
                                color: "#c8e0f0", padding: "5px 10px", fontSize: 12, width: 140, fontFamily: "'Exo 2',sans-serif"
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

            {/* NAV */}
            <nav style={{
                display: "flex", gap: 4, padding: "8px 20px", borderBottom: "1px solid rgba(0,130,255,.1)",
                background: "rgba(3,11,26,.88)", overflowX: "auto", position: "relative", zIndex: 10
            }}>
                {TABS.map(t => (
                    <button key={t.id} onClick={() => setTab(t.id)}
                        className={`tab-btn${tab === t.id ? " on" : ""}`}
                        style={{
                            background: "rgba(0,18,48,.55)", border: `1px solid rgba(0,120,200,${tab === t.id ? .5 : .1})`,
                            borderRadius: 9, color: tab === t.id ? "#00e4ff" : "rgba(140,185,215,.65)",
                            padding: "7px 15px", cursor: "pointer", fontSize: 11, letterSpacing: 1,
                            fontFamily: "'Exo 2',sans-serif", fontWeight: 700, display: "flex", alignItems: "center", gap: 6
                        }}>
                        <span>{t.icon}</span><span>{t.label}</span>
                    </button>
                ))}
                <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, fontSize: 10, color: "rgba(0,200,100,.5)", paddingRight: 4 }}>
                    <div className="dot-blink" style={{ width: 5, height: 5, borderRadius: "50%", background: "#00ff88" }} />
                    <span style={{ letterSpacing: 1 }}>DATOS EN VIVO</span>
                </div>
            </nav>

            {/* CONTENT */}
            <div style={{ position: "relative", zIndex: 5, padding: "16px 20px 40px", maxWidth: 1300, margin: "0 auto" }}>
                {tab === "dashboard" && <DashboardView wx={wx} forecastData={forecastData} hourlyData={hourlyData} now={now} />}
                {tab === "radar" && <RadarView coords={coords} mode={radarMode} setMode={setRadarMode} />}
                {tab === "ai" && <AetherChat msgs={aiMsgs} input={aiInput} setInput={setAiInput} loading={aiLoading} sendChat={sendChat} chatEnd={chatEnd} city={city} wx={wx} />}
                {tab === "charts" && <ChartsView forecastData={forecastData} hourlyData={hourlyData} />}
                {tab === "history" && <HistoryView historyData={historyData} wx={wx} />}
                {tab === "stations" && (
                    <StationsView
                        src={pwsSrc} setSrc={setPwsSrc}
                        stations={pwsStations} demoStations={demoStations}
                        selected={pwsSelected} setSelected={setPwsSelected}
                        loading={pwsLoading} error={pwsError} setError={setPwsError}
                        fetchNearby={fetchWuNearby} fetchById={fetchWuById}
                        wuKey={wuKey} setWuKey={setWuKey}
                        idInput={pwsIdInput} setIdInput={setPwsIdInput}
                        autoRef={pwsAutoRef} setAutoRef={setPwsAutoRef}
                        city={city} wx={wx}
                    />
                )}

                <footer style={{
                    borderTop: "1px solid rgba(0,100,200,.1)", padding: "8px 22px",
                    display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 4,
                    fontSize: 9, color: "rgba(100,145,195,.3)", letterSpacing: 1, background: "rgba(3,11,26,.8)"
                }}>
                    <span>⚡ METEORIX PRO v5.0 · Open-Meteo.com · Radar: Windy.com</span>
                    <span>Geocodificación: Nominatim · {now.toLocaleDateString("es-ES")}</span>
                </footer>
            </div>
        </div>
    );
}
