const API_URL = "http://localhost:3001";

export async function getAllMaps() {
    try {
        const res = await fetch(`${API_URL}/maps`, {
            cache: "no-store",
        });

        if (!res.ok) {
            throw new Error("Erro ao buscar mapas");
        }

        const data = await res.json();

        return data;

    } catch (err) {
        console.error("MAP SERVICE ERROR:", err);

        return [];
    }
}