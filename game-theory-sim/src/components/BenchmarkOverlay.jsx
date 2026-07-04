import { useEffect, useState } from "react"

const spinnerKeyframes = `
@keyframes bm-spin {
  to { transform: rotate(360deg); }
}
`

export default function BenchmarkOverlay({ visible }) {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (!visible) {
      setElapsed(0)
      return
    }
    const interval = setInterval(() => setElapsed((s) => s + 1), 1000)
    return () => clearInterval(interval)
  }, [visible])

  if (!visible) return null

  const mins = Math.floor(elapsed / 60)
  const secs = elapsed % 60
  const elapsedLabel = mins > 0
    ? `${mins}m ${String(secs).padStart(2, "0")}s`
    : `${secs}s`

  return (
    <>
      <style>{spinnerKeyframes}</style>

      <div style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}>
        <div style={{
          background: "#fff",
          borderRadius: 12,
          padding: "40px 48px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 20,
          minWidth: 320,
          boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
        }}>

          <div style={{
            width: 52,
            height: 52,
            border: "5px solid #e5e7eb",
            borderTopColor: "#2563eb",
            borderRadius: "50%",
            animation: "bm-spin 0.9s linear infinite",
          }} />

          <div style={{ textAlign: "center" }}>
            <p style={{ fontWeight: 700, fontSize: 18, margin: 0, color: "#111" }}>
              Executando benchmark
            </p>
            <p style={{ margin: "6px 0 0", fontSize: 13, color: "#6b7280" }}>
              Isso pode levar alguns minutos
            </p>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "#9ca3af" }}>
              {elapsedLabel} decorridos
            </p>
          </div>

          <p style={{
            fontSize: 12,
            color: "#9ca3af",
            margin: 0,
            textAlign: "center",
            maxWidth: 260,
          }}>
            Não feche esta janela. O servidor continuará processando
            mesmo que você saia desta aba.
          </p>
        </div>
      </div>
    </>
  )
}