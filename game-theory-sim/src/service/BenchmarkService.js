const BASE_URL = "http://localhost:3001";

async function handleResponse(res) {
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(
      errorBody.error || `Erro ${res.status} ao chamar ${res.url}`
    );
  }
  return await res.json();
}

export async function getSessions() {
  const res = await fetch(`${BASE_URL}/sessions`);
  return await handleResponse(res);
}

export async function getSession(id) {
  const res = await fetch(`${BASE_URL}/sessions/${id}`);
  return await handleResponse(res);
}

export async function saveSession(sessionData) {
  const res = await fetch(`${BASE_URL}/sessions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(sessionData),
  });
  return await handleResponse(res);
}

export async function getRuns(sessionId) {
  const res = await fetch(`${BASE_URL}/runs?sessionId=${sessionId}`);
  return await handleResponse(res);
}

export async function getAllRuns() {
  const res = await fetch(`${BASE_URL}/runs`);
  return await handleResponse(res);
}

export async function saveRun(runData) {
  const res = await fetch(`${BASE_URL}/runs`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(runData),
  });
  return await handleResponse(res);
}

export async function runBenchmark(config = {}) {
  const res = await fetch(`${BASE_URL}/benchmark/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(config),
  })
  return await handleResponse(res)
}

export async function saveRunsBulk(sessionId, runs) {
  const res = await fetch(`${BASE_URL}/runs/bulk`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ sessionId, runs }),
  });
  return await handleResponse(res);
}

// Conveniência: cria a sessão e salva todos os runs de uma vez,
// recebendo o array que vem de BenchmarkSuite.run()
export async function saveSuiteResults(results, { repetitions, sourceFile, notes } = {}) {
  const session = await saveSession({
    repetitions,
    computer: results[0]?.computer ?? null,
    sourceFile: sourceFile ?? null,
    notes: notes ?? null,
  });

  await saveRunsBulk(session.id, results);

  return session;
}