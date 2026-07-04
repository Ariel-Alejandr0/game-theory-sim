export default function Controls({
    playerType,
    setPlayerType,
    strategies,
    calculatePath,
}) {
    return (
        <div style={{display: "flex", flexDirection: 'column', borderBottom: "1px solid", width: '100%'}}>
            <label>Escolha seu jogador: </label>
            <div style={{ display:'flex', gap: 5, width: "100%", alignItems: 'center', justifyContent: "center"}}> 
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
        </div>
    );
}