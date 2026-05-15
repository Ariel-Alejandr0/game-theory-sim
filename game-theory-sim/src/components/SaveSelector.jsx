export default function SaveSelector({
    history,
    loadGame,
    loadHistory,
    saveGame,
}) {
    return (
        <div>
            <select
                onChange={(e) => {
                    const id = e.target.value;

                    if (!id) return;

                    loadGame(id);
                }}
            >
                <option value="">Selecione um save</option>

                {history.map((game) => (
                    <option key={game.id} value={game.id}>
                        Game #{game.id} - {game.playerType}
                    </option>
                ))}
            </select>

            <button onClick={loadHistory}>
                Carregar Histórico
            </button>
            <button onClick={saveGame}>
                Salvar Jogo
            </button>
        </div>
    );
}