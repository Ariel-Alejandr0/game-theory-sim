import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { getSessions, getAllRuns } from "../service/BenchmarkService.js";

const cellStyle = { padding: "8px 12px" };
const totalRowStyle = {
    borderTop: "2px solid #999",
    fontWeight: 600,
    backgroundColor: "#f9fafb",
};

function stdDev(values) {
    const n = values.length;
    if (n < 2) return 0;
    const mean = values.reduce((a, b) => a + b, 0) / n;
    const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / n;
    return Math.sqrt(variance);
}

function summarizeByGroup(runs) {
    const groups = new Map();

    for (const run of runs) {
        const key = `${run.map}|${run.player}|${run.algorithm}`;
        if (!groups.has(key)) {
            groups.set(key, {
                map: run.map,
                player: run.player,
                algorithm: run.algorithm,
                times: [],
                totalCacheHits: 0,
                totalCacheMisses: 0,
                successCount: 0,
            });
        }
        const g = groups.get(key);
        g.times.push(run.executionTimeMs);
        g.totalCacheHits += run.cacheHits ?? 0;
        g.totalCacheMisses += run.cacheMisses ?? 0;
        g.successCount += run.success ? 1 : 0;
    }

    return [...groups.values()].map((g) => {
        const count = g.times.length;
        const avgTime = g.times.reduce((a, b) => a + b, 0) / count;
        return {
            map: g.map,
            player: g.player,
            algorithm: g.algorithm,
            count,
            avgTime,
            stdDevTime: stdDev(g.times),
            avgCacheHits: g.totalCacheHits / count,
            avgCacheMisses: g.totalCacheMisses / count,
        };
    });
}

function computeOverall(summary) {
    if (!summary.length) return null;
    const totalRuns = summary.reduce((s, r) => s + r.count, 0);
    return {
        avgTime:
            summary.reduce((s, r) => s + r.avgTime * r.count, 0) / totalRuns,
        stdDevTime:
            summary.reduce((s, r) => s + r.stdDevTime * r.count, 0) / totalRuns,
        avgCacheHits:
            summary.reduce((s, r) => s + r.avgCacheHits * r.count, 0) /
            totalRuns,
        avgCacheMisses:
            summary.reduce((s, r) => s + r.avgCacheMisses * r.count, 0) /
            totalRuns,
        totalRuns,
    };
}

export default function ReportsPage() {
    const [sessions, setSessions] = useState([]);
    const [runs, setRuns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        Promise.all([getSessions(), getAllRuns()])
            .then(([s, r]) => {
                setSessions(s);
                setRuns(r);
            })
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    const summary = useMemo(() => summarizeByGroup(runs), [runs]);
    const overall = useMemo(() => computeOverall(summary), [summary]);

    if (loading) return <p style={{ padding: 16 }}>Carregando...</p>;
    if (error)
        return (
            <p style={{ padding: 16, color: "crimson" }}>
                Erro ao carregar dados: {error}
            </p>
        );

    return (
        <div style={{ padding: 16 }}>
            {/* ── Tabela de resultados agregados ── */}
            <h2 style={{ fontSize: 18, marginBottom: 8 }}>
                Resultado agregado — todas as sessões
            </h2>
            <p style={{ color: "#666", marginBottom: 12, fontSize: 13 }}>
                Agrupado por mapa / player / algoritmo. Médias e desvio padrão
                calculados sobre todas as repetições de todas as sessões
                registradas.
            </p>

            {summary.length === 0 ? (
                <p>Nenhum run registrado ainda.</p>
            ) : (
                <table style={{ borderCollapse: "collapse", width: "100%" }}>
                    <thead>
                        <tr
                            style={{
                                textAlign: "left",
                                borderBottom: "1px solid #ccc",
                            }}
                        >
                            <th style={cellStyle}>Mapa</th>
                            <th style={cellStyle}>Player</th>
                            <th style={cellStyle}>Algoritmo</th>
                            <th style={cellStyle}>Execuções</th>
                            <th style={cellStyle}>Tempo médio (ms)</th>
                            <th style={cellStyle}>Desvio padrão (ms)</th>
                            <th style={cellStyle}>Cache hits (média)</th>
                            <th style={cellStyle}>Cache miss (média)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {summary.map((row) => (
                            <tr
                                key={`${row.map}-${row.player}-${row.algorithm}`}
                                style={{ borderBottom: "1px solid #eee" }}
                            >
                                <td style={cellStyle}>{row.map}</td>
                                <td style={cellStyle}>{row.player}</td>
                                <td style={cellStyle}>{row.algorithm}</td>
                                <td style={cellStyle}>{row.count}</td>
                                <td style={cellStyle}>
                                    {row.avgTime.toFixed(2)}
                                </td>
                                <td style={cellStyle}>
                                    {row.stdDevTime.toFixed(2)}
                                </td>
                                <td style={cellStyle}>
                                    {row.avgCacheHits.toFixed(1)}
                                </td>
                                <td style={cellStyle}>
                                    {row.avgCacheMisses.toFixed(1)}
                                </td>
                            </tr>
                        ))}

                        {overall && (
                            <tr style={totalRowStyle}>
                                <td style={cellStyle} colSpan={3}>
                                    Média geral ({overall.totalRuns} runs)
                                </td>
                                <td style={cellStyle}>—</td>
                                <td style={cellStyle}>
                                    {overall.avgTime.toFixed(2)}
                                </td>
                                <td style={cellStyle}>
                                    {overall.stdDevTime.toFixed(2)}
                                </td>
                                <td style={cellStyle}>
                                    {overall.avgCacheHits.toFixed(1)}
                                </td>
                                <td style={cellStyle}>
                                    {overall.avgCacheMisses.toFixed(1)}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            )}
            {/* ── Sessões ── */}
            <h1 style={{ fontSize: 20, marginBottom: 16 }}>
                Sessões de benchmark
            </h1>

            {sessions.length === 0 ? (
                <p>Nenhuma sessão registrada ainda.</p>
            ) : (
                <table
                    style={{
                        borderCollapse: "collapse",
                        width: "100%",
                        marginBottom: 32,
                    }}
                >
                    <thead>
                        <tr
                            style={{
                                textAlign: "left",
                                borderBottom: "1px solid #ccc",
                            }}
                        >
                            <th style={cellStyle}>ID</th>
                            <th style={cellStyle}>Executado em</th>
                            <th style={cellStyle}>Computador</th>
                            <th style={cellStyle}>Repetições</th>
                            <th style={cellStyle}>Origem</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sessions.map((session) => (
                            <tr
                                key={session.id}
                                style={{ borderBottom: "1px solid #eee" }}
                            >
                                <td style={cellStyle}>
                                    <Link to={`/reports/${session.id}`}>
                                        #{session.id}
                                    </Link>
                                </td>
                                <td style={cellStyle}>
                                    {new Date(
                                        session.executedAt,
                                    ).toLocaleString()}
                                </td>
                                <td style={cellStyle}>
                                    {session.computer ?? "—"}
                                </td>
                                <td style={cellStyle}>{session.repetitions}</td>
                                <td style={cellStyle}>
                                    {session.sourceFile ?? "—"}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
