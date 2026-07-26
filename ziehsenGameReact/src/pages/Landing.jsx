import { useNavigate } from "react-router-dom";
import { DEFAULT_CONFIG } from "../gameConfig";

function Landing() {
  const navigate = useNavigate();

  return (
    <div className="page">
      <h1>Ziehsen Game</h1>
      <div className="menu">
        <button
          onClick={() =>
            navigate("/game", { state: { config: DEFAULT_CONFIG } })
          }
        >
          Start Game
        </button>
        <button onClick={() => navigate("/config")}>Custom Game</button>
        <button onClick={() => navigate("/settings")}>Settings</button>
      </div>
    </div>
  );
}

export default Landing;
