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

function mapLabel(map) {
  return map.replace("./", "").replace(".txt", "");
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
        count: 0,
        totalTime: 0,
        totalCacheHits: 0,
        totalCacheMisses: 0,
        successCount: 0,
      });
    }
    const group = groups.get(key);
    group.count += 1;
    group.totalTime += run.executionTimeMs;
    group.totalCacheHits += run.cacheHits ?? 0;
    group.totalCacheMisses += run.cacheMisses ?? 0;
    group.successCount += run.success ? 1 : 0;
  }

  return [...groups.values()].map((g) => ({
    ...g,
    avgTime: g.totalTime / g.count,
    avgCacheHits: g.totalCacheHits / g.count,
    avgCacheMisses: g.totalCacheMisses / g.count,
  }));
}

// Pivota os runs para { map, basic: tempoMedio, cached: tempoMedio },
// formato que o recharts usa para desenhar barras lado a lado por mapa.
function buildTimeComparison(runs) {
  const byMapAlgo = new Map();

  for (const run of runs) {
    const key = `${run.map}|${run.algorithm}`;
    if (!byMapAlgo.has(key)) {
      byMapAlgo.set(key, {
        map: run.map,
        algorithm: run.algorithm,
        total: 0,
        count: 0,
      });
    }
    const entry = byMapAlgo.get(key);
    entry.total += run.executionTimeMs;
    entry.count += 1;
  }

  const byMap = new Map();
  for (const entry of byMapAlgo.values()) {
    if (!byMap.has(entry.map)) {
      byMap.set(entry.map, { map: mapLabel(entry.map) });
    }
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
      byMap.set(run.map, {
        map: mapLabel(run.map),
        totalHits: 0,
        totalMisses: 0,
      });
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
    getRuns(id)
      .then(setRuns)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const summary = useMemo(() => summarizeByGroup(runs), [runs]);
  const timeComparison = useMemo(() => buildTimeComparison(runs), [runs]);
  const cacheHitRate = useMemo(() => buildCacheHitRate(runs), [runs]);

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
            <th style={{ padding: "8px 12px" }}>Mapa</th>
            <th style={{ padding: "8px 12px" }}>Player</th>
            <th style={{ padding: "8px 12px" }}>Algoritmo</th>
            <th style={{ padding: "8px 12px" }}>Execuções</th>
            <th style={{ padding: "8px 12px" }}>Tempo médio (ms)</th>
            <th style={{ padding: "8px 12px" }}>Cache hits (média)</th>
            <th style={{ padding: "8px 12px" }}>Cache miss (média)</th>
          </tr>
        </thead>
        <tbody>
          {summary.map((row) => (
            <tr
              key={`${row.map}-${row.player}-${row.algorithm}`}
              style={{ borderBottom: "1px solid #eee" }}
            >
              <td style={{ padding: "8px 12px" }}>{row.map}</td>
              <td style={{ padding: "8px 12px" }}>{row.player}</td>
              <td style={{ padding: "8px 12px" }}>{row.algorithm}</td>
              <td style={{ padding: "8px 12px" }}>{row.count}</td>
              <td style={{ padding: "8px 12px" }}>{row.avgTime.toFixed(2)}</td>
              <td style={{ padding: "8px 12px" }}>
                {row.avgCacheHits.toFixed(1)}
              </td>
              <td style={{ padding: "8px 12px" }}>
                {row.avgCacheMisses.toFixed(1)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}