export default function Controls({
    playerType,
    setPlayerType,
    strategies,
    calculatePath,
}) {
    return (
        <div>
            <label>Escolha seu jogador: </label>

            <select
                value={playerType}
                onChange={(e) => setPlayerType(e.target.value)}
            >
                {strategies.map((name) => (
                    <option key={name} value={name}>
                        {name}
                    </option>
                ))}
            </select>

            <button onClick={calculatePath}>
                Calcular Caminho
            </button>
        </div>
    );
}