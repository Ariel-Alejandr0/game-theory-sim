import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getSessions } from "../service/BenchmarkService.js";

export default function ReportsPage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getSessions()
      .then(setSessions)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p style={{ padding: 16 }}>Carregando sessões...</p>;
  if (error)
    return (
      <p style={{ padding: 16, color: "crimson" }}>
        Erro ao carregar sessões: {error}
      </p>
    );

  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ fontSize: 20, marginBottom: 16 }}>Sessões de benchmark</h1>

      {sessions.length === 0 ? (
        <p>Nenhuma sessão registrada ainda.</p>
      ) : (
        <table style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "1px solid #ccc" }}>
              <th style={{ padding: "8px 12px" }}>ID</th>
              <th style={{ padding: "8px 12px" }}>Executado em</th>
              <th style={{ padding: "8px 12px" }}>Computador</th>
              <th style={{ padding: "8px 12px" }}>Repetições</th>
              <th style={{ padding: "8px 12px" }}>Origem</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((session) => (
              <tr key={session.id} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: "8px 12px" }}>
                  <Link to={`/reports/${session.id}`}>#{session.id}</Link>
                </td>
                <td style={{ padding: "8px 12px" }}>
                  {new Date(session.executedAt).toLocaleString()}
                </td>
                <td style={{ padding: "8px 12px" }}>
                  {session.computer ?? "—"}
                </td>
                <td style={{ padding: "8px 12px" }}>{session.repetitions}</td>
                <td style={{ padding: "8px 12px" }}>
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