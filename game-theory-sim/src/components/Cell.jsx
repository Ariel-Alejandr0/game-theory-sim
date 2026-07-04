// Sprite sheet: /sandbox_hats.png — 640×80px, 8 chapéus de 80×80px cada
// Exibimos em 48×48px (scale = 0.6) para caber na célula de 80px
const SPRITE_SRC = "/sandbox_hats.png";
const DISPLAY_SIZE = 16;
const SCALE = DISPLAY_SIZE / 80; // 0.6
const SHEET_DISPLAY_W = 640 * SCALE; // 384px
const SHEET_DISPLAY_H = 80 * SCALE; //  48px

function backgroundColor(isPlayer, isPath, reachedGoal, isGoal, isNeighbor) {
    if (isPlayer) return "#00ffcc";
    if (isPath && reachedGoal) return "#ffcc00";
    if (isPath) return "#ff8888";
    if (isGoal) return "#aaaaff";
    if (isNeighbor) return "#ccffcc";
    return "#f0f0f0";
}

export default function Cell({
    row,
    col,
    strategy,
    isPlayer,
    isPath,
    reachedGoal,
    isGoal,
    isNeighbor,
    onClick,
}) {
    const bg = backgroundColor(
        isPlayer,
        isPath,
        reachedGoal,
        isGoal,
        isNeighbor,
    );

    const label = strategy ? strategy.name : "Empty";

    return (
        <div
            onClick={onClick}
            style={{
                border: "1px solid black",
                textAlign: "center",
                fontSize: "12px",
                cursor: "pointer",
                padding: 1,
                height: 60,
                width: 60,
                backgroundColor: bg,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            {isPlayer && <span>PLAYER</span>}
            {/* Chapéu da estratégia — exibido apenas na célula do jogador */}
            {strategy?.sprite && (
                <div
                    style={{
                        width: DISPLAY_SIZE,
                        height: DISPLAY_SIZE,
                        backgroundImage: `url('${SPRITE_SRC}')`,
                        backgroundRepeat: "no-repeat",
                        backgroundSize: `${SHEET_DISPLAY_W}px ${SHEET_DISPLAY_H}px`,
                        backgroundPosition: `${-(strategy.sprite.x * SCALE)}px ${-(strategy.sprite.y * SCALE)}px`,
                        imageRendering: "pixelated",
                    }}
                />
            )}
            <strong style={{ fontSize: 10 }}>
                {label} ({row},{col})
            </strong>
        </div>
    );
}
