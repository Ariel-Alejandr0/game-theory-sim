// src/components/MapSelector.jsx

export default function MapSelector({
    maps,
    selectedMap,
    onSelectMap,
}) {
    return (
        <div
            style={{
                marginTop: "10px",
                marginBottom: "10px",
            }}
        >
            <label>Selecionar mapa: </label>

            <select
                value={selectedMap}
                onChange={(e) => onSelectMap(e.target.value)}
            >
                <option value="">
                    Selecione um mapa
                </option>

                {maps.map((map) => (
                    <option
                        key={map.id}
                        value={map.id}
                    >
                        {map.name} — ⭐ {map.difficulty}
                    </option>
                ))}
            </select>
        </div>
    );
}