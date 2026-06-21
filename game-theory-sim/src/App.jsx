import { Routes, Route, NavLink } from "react-router-dom";
import GamePage from "./pages/Gamepage.jsx";
import ReportsPage from "./pages/ReportsPage.jsx";
import SessionDetailPage from "./pages/SessionDetailPage.jsx";

const navLinkStyle = ({ isActive }) => ({
    padding: "8px 16px",
    textDecoration: "none",
    color: isActive ? "#111" : "#666",
    fontWeight: isActive ? 600 : 400,
    borderBottom: isActive ? "2px solid #111" : "2px solid transparent",
});

export default function App() {
    return (
        <div
            style={{
                height: "100%",
                width: "100%",
                display: "flex",
                flexDirection: "column",
            }}
        >
            <nav
                style={{
                    display: "flex",
                    gap: 8,
                    padding: "8px 16px",
                    borderBottom: "1px solid #ddd",
                }}
            >
                <NavLink to="/" style={navLinkStyle} end>
                    Jogo
                </NavLink>
                <NavLink to="/reports" style={navLinkStyle}>
                    Relatórios
                </NavLink>
            </nav>

            <div style={{ flex: 1, minHeight: 0 }}>
                <Routes>
                    <Route path="/" element={<GamePage />} />
                    <Route path="/reports" element={<ReportsPage />} />
                    <Route
                        path="/reports/:id"
                        element={<SessionDetailPage />}
                    />
                </Routes>
            </div>
        </div>
    );
}
