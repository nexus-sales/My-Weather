import React from 'react';
import { Card } from '../MeteorixUI';
import { wmo } from '../MeteorixConstants';

export const AetherView = ({ msgs, input, setInput, loading, sendChat, chatEnd, city, wx }: any) => {
    return (
        <div className="fadein">
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
                            <span style={{ fontSize: 9, background: "rgba(0,100,50,.3)", border: "1px solid rgba(0,200,100,.3)", borderRadius: 5, padding: "2px 9px", color: "#00ff88", letterSpacing: 1 }}>● OPERATIVO</span>
                            <span style={{ fontSize: 9, background: "rgba(0,50,100,.3)", border: "1px solid rgba(0,130,230,.3)", borderRadius: 5, padding: "2px 9px", color: "#00d4ff", letterSpacing: 1 }}>NIVEL ECMWF SENIOR</span>
                            <span style={{ fontSize: 9, background: "rgba(60,0,100,.3)", border: "1px solid rgba(150,50,255,.3)", borderRadius: 5, padding: "2px 9px", color: "#cc88ff", letterSpacing: 1 }}>IA GENERATIVA · Claude</span>
                        </div>
                    </div>
                </div>
            </Card>

            <div style={{
                height: 480, display: "flex", flexDirection: "column",
                background: "rgba(0,15,45,.7)", borderRadius: 12, border: "1px solid rgba(0,120,255,.15)",
                overflow: "hidden", backdropFilter: "blur(20px)"
            }}>
                <div style={{ flex: 1, overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
                    {msgs.length === 0 && (
                        <div style={{ textAlign: "center", marginTop: 60, opacity: .6 }}>
                            <div style={{ fontSize: 40, marginBottom: 15 }}>🛸</div>
                            <div style={{ fontSize: 12, letterSpacing: 1, color: "#00d4ff" }}>AETHER EN ESPERA</div>
                        </div>
                    )}
                    {msgs.map((m: any, i: number) => (
                        <div key={i} style={{
                            alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                            maxWidth: "85%",
                            background: m.role === "user" ? "rgba(0,80,255,.2)" : "rgba(0,30,80,.45)",
                            border: `1px solid rgba(0,150,255,${m.role === "user" ? .3 : .15})`,
                            borderRadius: m.role === "user" ? "14px 14px 2px 14px" : "14px 14px 14px 2px",
                            padding: "12px 16px",
                            fontSize: 13, lineHeight: 1.6, color: m.role === "user" ? "#fff" : "#cde0f0"
                        }}>
                            <div style={{ whiteSpace: "pre-wrap" }}>{m.content}</div>
                            <div style={{ fontSize: 9, opacity: .4, marginTop: 6, textAlign: "right" }}>
                                {m.ts.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                    ))}
                    <div ref={chatEnd} />
                </div>

                <div style={{ padding: 14, background: "rgba(0,10,30,.8)", borderTop: "1px solid rgba(0,120,255,.1)" }}>
                    <div style={{ display: "flex", gap: 8 }}>
                        <input value={input} onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && sendChat()}
                            placeholder="Pregunta a AETHER sobre el tiempo, modelos o climatología..."
                            disabled={loading}
                            style={{
                                flex: 1, background: "rgba(0,25,65,.6)", border: "1px solid rgba(0,140,255,.25)",
                                borderRadius: 8, padding: "10px 15px", color: "#fff", outline: "none"
                            }} />
                        <button onClick={() => sendChat()} disabled={loading}
                            style={{
                                width: 44, background: "#0070f3", border: "none", borderRadius: 8, cursor: "pointer",
                                opacity: loading ? .5 : 1, display: "flex", alignItems: "center", justifyContent: "center"
                            }}>
                            {loading ? "..." : "⚡"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

    return (
        <div className="fadein">
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
                            <span style={{ fontSize: 9, background: "rgba(0,100,50,.3)", border: "1px solid rgba(0,200,100,.3)", borderRadius: 5, padding: "2px 9px", color: "#00ff88", letterSpacing: 1 }}>● OPERATIVO</span>
                            <span style={{ fontSize: 9, background: "rgba(0,50,100,.3)", border: "1px solid rgba(0,130,230,.3)", borderRadius: 5, padding: "2px 9px", color: "#00d4ff", letterSpacing: 1 }}>NIVEL ECMWF SENIOR</span>
                            <span style={{ fontSize: 9, background: "rgba(60,0,100,.3)", border: "1px solid rgba(150,50,255,.3)", borderRadius: 5, padding: "2px 9px", color: "#cc88ff", letterSpacing: 1 }}>IA GENERATIVA · Claude</span>
                        </div>
                    </div>
                    <div style={{ marginLeft: "auto", textAlign: "right" }}>
                        <div style={{ fontSize: 10, color: "rgba(100,145,195,.4)", marginBottom: 4 }}>Analizando</div>
                        <div style={{ fontWeight: 700, color: "#e8f4ff", fontSize: 13 }}>{city}</div>
                        <div style={{ fontSize: 11, color: "#ff8c35", fontFamily: "'Orbitron',monospace" }}>
                            {Math.round(cur.temperature_2m)}° · {wmo(cur.weather_code).e}
                        </div>
                    </div>
                </div>
            </Card>

            <Card>
                <div style={{ height: 430, overflowY: "auto", marginBottom: 12, paddingRight: 4 }}>
                    {aiLoading && aiMsgs.length === 0 ? (
                        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%", flexDirection: "column", gap: 14 }}>
                            <div style={{ fontSize: 40, animation: "bounce 1.5s infinite" }}>🌍</div>
                            <div style={{ color: "rgba(100,160,200,.6)", fontSize: 12, letterSpacing: 3 }}>AETHER ANALIZANDO DATOS...</div>
                            <div style={{ display: "flex", gap: 8 }}>
                                {[0, 1, 2].map(i => <div key={i} className="dot-blink" style={{ width: 7, height: 7, borderRadius: "50%", background: "#00d4ff", animationDelay: `${i * .2}s` }} />)}
                            </div>
                        </div>
                    ) : (
                        aiMsgs.map((m, i) => (
                            <div key={i} style={{ marginBottom: 16, display: "flex", gap: 10, flexDirection: m.role === "user" ? "row-reverse" : "row" }}>
                                <div style={{ width: 34, height: 34, borderRadius: "50%", flexShrink: 0, background: m.role === "user" ? "rgba(0,50,100,.55)" : "linear-gradient(135deg,#002255,#005599)", border: "1px solid rgba(0,180,255,.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>
                                    {m.role === "user" ? "👤" : "🤖"}
                                </div>
                                <div style={{ background: m.role === "user" ? "rgba(0,45,100,.45)" : "rgba(0,15,45,.65)", border: `1px solid ${m.role === "user" ? "rgba(0,100,200,.3)" : "rgba(0,180,255,.14)"}`, borderRadius: 13, padding: "11px 15px", maxWidth: "84%", fontSize: 12, lineHeight: 1.75 }}>
                                    {m.content.split("\n").map((line: string, j: number) => {
                                        if (line.startsWith("## ")) return <div key={j} style={{ fontWeight: 700, color: "#00aaff", fontSize: 14, marginBottom: 5, marginTop: 8 }}>{line.slice(3)}</div>;
                                        if (line.match(/^\*\*(.+)\*\*$/)) return <div key={j} style={{ fontWeight: 700, color: "#00d4ff", marginBottom: 3, fontSize: 13 }}>{line.slice(2, -2)}</div>;
                                        return <div key={j}>{line}</div>;
                                    })}
                                </div>
                            </div>
                        ))
                    )}
                    <div ref={chatEnd} />
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                    <input value={aiInput} onChange={e => setAiInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendChat()} placeholder="Consulta a Dr. AETHER..." style={{ flex: 1, background: "rgba(0,18,55,.65)", border: "1px solid rgba(0,140,255,.22)", borderRadius: 10, color: "#c8e0f0", padding: "11px 14px" }} />
                    <button onClick={sendChat} disabled={aiLoading || !aiInput.trim()} style={{ background: "rgba(0,100,220,.38)", border: "1px solid rgba(0,150,255,.3)", borderRadius: 10, color: "#00d4ff", padding: "11px 18px" }}>➤</button>
                </div>
            </Card>
        </div>
    );
};
