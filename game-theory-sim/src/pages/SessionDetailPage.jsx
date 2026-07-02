import { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { getRuns } from "../service/BenchmarkService.js";

const ALGORITHM_COLORS = {
  basic: "#6b7280",
  cached: "#2563eb",
};

const cellStyle = { padding: "8px 12px" };
const totalRowStyle = {
  borderTop: "2px solid #999",
  fontWeight: 600,
  backgroundColor: "#f9fafb",
};

function mapLabel(map) {
  return map.replace("./", "").replace(".txt", "");
}

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
      successCount: g.successCount,
    };
  });
}

// Média geral de todas as linhas do summary (ponderada pelo nº de execuções)
function computeOverall(summary) {
  if (!summary.length) return null;
  const totalRuns = summary.reduce((s, r) => s + r.count, 0);
  return {
    avgTime:
      summary.reduce((s, r) => s + r.avgTime * r.count, 0) / totalRuns,
    stdDevTime:
      summary.reduce((s, r) => s + r.stdDevTime * r.count, 0) / totalRuns,
    avgCacheHits:
      summary.reduce((s, r) => s + r.avgCacheHits * r.count, 0) / totalRuns,
    avgCacheMisses:
      summary.reduce((s, r) => s + r.avgCacheMisses * r.count, 0) / totalRuns,
    totalRuns,
  };
}

function buildTimeComparison(runs) {
  const byMapAlgo = new Map();

  for (const run of runs) {
    const key = `${run.map}|${run.algorithm}`;
    if (!byMapAlgo.has(key)) {
      byMapAlgo.set(key, { map: run.map, algorithm: run.algorithm, total: 0, count: 0 });
    }
    const entry = byMapAlgo.get(key);
    entry.total += run.executionTimeMs;
    entry.count += 1;
  }

  const byMap = new Map();
  for (const entry of byMapAlgo.values()) {
    if (!byMap.has(entry.map)) byMap.set(entry.map, { map: mapLabel(entry.map) });
    byMap.get(entry.map)[entry.algorithm] = Number(
      (entry.total / entry.count).toFixed(2)
    );
  }

  return [...byMap.values()];
}

function buildCacheHitRate(runs) {
  const byMap = new Map();

  for (const run of runs) {
    if (run.algorithm !== "cached") continue;
    if (!byMap.has(run.map)) {
      byMap.set(run.map, { map: mapLabel(run.map), totalHits: 0, totalMisses: 0 });
    }
    const entry = byMap.get(run.map);
    entry.totalHits += run.cacheHits ?? 0;
    entry.totalMisses += run.cacheMisses ?? 0;
  }

  return [...byMap.values()].map((e) => {
    const total = e.totalHits + e.totalMisses;
    return {
      map: e.map,
      hitRate: total === 0 ? 0 : Number(((e.totalHits / total) * 100).toFixed(1)),
    };
  });
}

export default function SessionDetailPage() {
  const { id } = useParams();
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getRuns(id)
      .then(setRuns)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const summary = useMemo(() => summarizeByGroup(runs), [runs]);
  const overall = useMemo(() => computeOverall(summary), [summary]);
  const timeComparison = useMemo(() => buildTimeComparison(runs), [runs]);
  const cacheHitRate = useMemo(() => buildCacheHitRate(runs), [runs]);

  if (!id) return <p style={{ padding: 16 }}>ID de sessão inválido.</p>;
  if (loading) return <p style={{ padding: 16 }}>Carregando runs...</p>;
  if (error)
    return (
      <p style={{ padding: 16, color: "crimson" }}>
        Erro ao carregar runs: {error}
      </p>
    );

  return (
    <div style={{ padding: 16 }}>
      <Link to="/reports">&larr; Voltar para sessões</Link>
      <h1 style={{ fontSize: 20, margin: "16px 0" }}>
        Sessão #{id} — {runs.length} runs
      </h1>

      <h2 style={{ fontSize: 16, margin: "24px 0 8px" }}>
        Tempo médio de execução: basic vs cached
      </h2>
      <div style={{ width: "100%", height: 280 }}>
        <ResponsiveContainer>
          <BarChart data={timeComparison}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="map" />
            <YAxis unit="ms" />
            <Tooltip />
            <Legend />
            <Bar dataKey="basic" fill={ALGORITHM_COLORS.basic} name="Basic" />
            <Bar dataKey="cached" fill={ALGORITHM_COLORS.cached} name="Cached" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <h2 style={{ fontSize: 16, margin: "24px 0 8px" }}>
        Taxa de acerto de cache (algoritmo cached)
      </h2>
      <div style={{ width: "100%", height: 240 }}>
        <ResponsiveContainer>
          <BarChart data={cacheHitRate}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="map" />
            <YAxis unit="%" domain={[0, 100]} />
            <Tooltip />
            <Bar dataKey="hitRate" fill={ALGORITHM_COLORS.cached} name="Hit rate" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <h2 style={{ fontSize: 16, margin: "24px 0 8px" }}>
        Detalhe por mapa / player / algoritmo
      </h2>
      <table style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr style={{ textAlign: "left", borderBottom: "1px solid #ccc" }}>
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
              <td style={cellStyle}>{row.avgTime.toFixed(2)}</td>
              <td style={cellStyle}>{row.stdDevTime.toFixed(2)}</td>
              <td style={cellStyle}>{row.avgCacheHits.toFixed(1)}</td>
              <td style={cellStyle}>{row.avgCacheMisses.toFixed(1)}</td>
            </tr>
          ))}

          {overall && (
            <tr style={totalRowStyle}>
              <td style={cellStyle} colSpan={3}>
                Média geral ({overall.totalRuns} runs)
              </td>
              <td style={cellStyle}>—</td>
              <td style={cellStyle}>{overall.avgTime.toFixed(2)}</td>
              <td style={cellStyle}>{overall.stdDevTime.toFixed(2)}</td>
              <td style={cellStyle}>{overall.avgCacheHits.toFixed(1)}</td>
              <td style={cellStyle}>{overall.avgCacheMisses.toFixed(1)}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}