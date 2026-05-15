export async function getGames() {
    const res = await fetch("http://localhost:3001/games");
    return await res.json();
}

export async function getGame(id) {
    const res = await fetch(`http://localhost:3001/games/${id}`);
    return await res.json();
}

export async function saveGame(gameState) {
    const res = await fetch("http://localhost:3001/games", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(gameState),
    });

    return await res.json();
}