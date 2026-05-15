export default function BattleInfo({ battle }) {
    if (!battle) return null;

    return (
        <div>
            <h3>Última batalha</h3>

            <p>Score A: {battle.scoreA}</p>
            <p>Score B: {battle.scoreB}</p>
            <p>Vencedor: {battle.winner}</p>
        </div>
    );
}