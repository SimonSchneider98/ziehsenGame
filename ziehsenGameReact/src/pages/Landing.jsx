import { useNavigate } from 'react-router-dom'

function Landing() {
  const navigate = useNavigate()

  return (
    <div className="page">
      <h1>Ziehsen</h1>
      <div className="menu">
        <button onClick={() => navigate('/game')}>Start Game</button>
        <button onClick={() => navigate('/config')}>Custom Game</button>
        <button
          className="settings-gear"
          aria-label="Settings"
          onClick={() => navigate('/settings')}
        >
          ⚙️
        </button>
      </div>
    </div>
  )
}

export default Landing
