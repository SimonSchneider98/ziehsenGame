import { useNavigate } from "react-router-dom";
import { DEFAULT_CONFIG } from "../gameConfig";

function Landing() {
  const navigate = useNavigate();

  return (
    <div className="page landing">
      <div className="page-content">
        <h1>Ziehsen Game</h1>
        <div className="menu">
          <button
            className="start-game-button"
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
    </div>
  );
}

export default Landing;
