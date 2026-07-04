import { useEffect, useState, useMemo, useCallback } from "react"
import { Link } from "react-router-dom"
import { getSessions, getAllRuns, runBenchmark } from "../service/BenchmarkService.js"
import BenchmarkOverlay from "../components/BenchmarkOverlay.jsx"

const cellStyle = { padding: "8px 12px" }
const totalRowStyle = {
  borderTop: "2px solid #999",
  fontWeight: 600,
  backgroundColor: "#f9fafb",
}

function stdDev(values) {
  const n = values.length
  if (n < 2) return 0
  const mean = values.reduce((a, b) => a + b, 0) / n
  const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / n
  return Math.sqrt(variance)
}

function summarizeByGroup(runs) {
  const groups = new Map()
  for (const run of runs) {
    const key = `${run.map}|${run.player}|${run.algorithm}`
    if (!groups.has(key)) {
      groups.set(key, {
        map: run.map,
        player: run.player,
        algorithm: run.algorithm,
        times: [],
        totalCacheHits: 0,
        totalCacheMisses: 0,
        successCount: 0,
      })
    }
    const g = groups.get(key)
    g.times.push(run.executionTimeMs)
    g.totalCacheHits += run.cacheHits ?? 0
    g.totalCacheMisses += run.cacheMisses ?? 0
    g.successCount += run.success ? 1 : 0
  }
  return [...groups.values()].map((g) => {
    const count = g.times.length
    const avgTime = g.times.reduce((a, b) => a + b, 0) / count
    return {
      map: g.map,
      player: g.player,
      algorithm: g.algorithm,
      count,
      avgTime,
      stdDevTime: stdDev(g.times),
      avgCacheHits: g.totalCacheHits / count,
      avgCacheMisses: g.totalCacheMisses / count,
    }
  })
}

function computeOverall(summary) {
  if (!summary.length) return null
  const totalRuns = summary.reduce((s, r) => s + r.count, 0)
  return {
    avgTime: summary.reduce((s, r) => s + r.avgTime * r.count, 0) / totalRuns,
    stdDevTime: summary.reduce((s, r) => s + r.stdDevTime * r.count, 0) / totalRuns,
    avgCacheHits: summary.reduce((s, r) => s + r.avgCacheHits * r.count, 0) / totalRuns,
    avgCacheMisses: summary.reduce((s, r) => s + r.avgCacheMisses * r.count, 0) / totalRuns,
    totalRuns,
  }
}

async function fetchAll() {
  const [sessions, runs] = await Promise.all([getSessions(), getAllRuns()])
  return { sessions, runs }
}

export default function ReportsPage() {
  const [sessions, setSessions]     = useState([])
  const [runs, setRuns]             = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(null)
  const [running, setRunning]       = useState(false)
  const [runError, setRunError]     = useState(null)

  const load = useCallback(() => {
    setLoading(true)
    setError(null)
    fetchAll()
      .then(({ sessions, runs }) => {
        setSessions(sessions)
        setRuns(runs)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const handleRunBenchmark = async () => {
    setRunning(true)
    setRunError(null)
    try {
      await runBenchmark()
      await fetchAll().then(({ sessions, runs }) => {
        setSessions(sessions)
        setRuns(runs)
      })
    } catch (err) {
      setRunError(err.message)
    } finally {
      setRunning(false)
    }
  }

  const summary = useMemo(() => summarizeByGroup(runs), [runs])
  const overall = useMemo(() => computeOverall(summary), [summary])

  if (loading) return <p style={{ padding: 16 }}>Carregando...</p>
  if (error)
    return <p style={{ padding: 16, color: "crimson" }}>Erro ao carregar dados: {error}</p>

  return (
    <>
      <BenchmarkOverlay visible={running} />

      <div style={{ padding: 16 }}>

        {/* ── Cabeçalho com botão ── */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 24,
          flexWrap: "wrap",
          gap: 12,
        }}>
          <h1 style={{ fontSize: 22, margin: 0 }}>Relatórios de benchmark</h1>

          <button
            onClick={handleRunBenchmark}
            disabled={running}
            style={{
              padding: "10px 20px",
              background: running ? "#93c5fd" : "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              cursor: running ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            {running ? "⏳ Executando..." : "▶ Executar benchmark"}
          </button>
        </div>

        {runError && (
          <p style={{
            padding: "10px 14px",
            background: "#fee2e2",
            color: "#b91c1c",
            borderRadius: 8,
            marginBottom: 16,
            fontSize: 13,
          }}>
            Erro ao executar benchmark: {runError}
          </p>
        )}

        {/* ── Tabela de resultados agregados ── */}
        <h2 style={{ fontSize: 18, marginBottom: 8 }}>
          Resultado agregado — todas as sessões
        </h2>
        <p style={{ color: "#666", marginBottom: 12, fontSize: 13 }}>
          Agrupado por mapa / player / algoritmo. Médias e desvio padrão
          calculados sobre todas as repetições de todas as sessões registradas.
        </p>

        {summary.length === 0 ? (
          <p>Nenhum run registrado ainda.</p>
        ) : (
          <table style={{ borderCollapse: "collapse", width: "100%", marginBottom: 40 }}>
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
        )}

        {/* ── Sessões ── */}
        <h2 style={{ fontSize: 18, marginBottom: 12 }}>Sessões de benchmark</h2>

        {sessions.length === 0 ? (
          <p>Nenhuma sessão registrada ainda.</p>
        ) : (
          <table style={{ borderCollapse: "collapse", width: "100%" }}>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "1px solid #ccc" }}>
                <th style={cellStyle}>ID</th>
                <th style={cellStyle}>Executado em</th>
                <th style={cellStyle}>Computador</th>
                <th style={cellStyle}>Repetições</th>
                <th style={cellStyle}>Origem</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((session) => (
                <tr key={session.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={cellStyle}>
                    <Link to={`/reports/${session.id}`}>#{session.id}</Link>
                  </td>
                  <td style={cellStyle}>
                    {new Date(session.executedAt).toLocaleString()}
                  </td>
                  <td style={cellStyle}>{session.computer ?? "—"}</td>
                  <td style={cellStyle}>{session.repetitions}</td>
                  <td style={cellStyle}>{session.sourceFile ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  )
}