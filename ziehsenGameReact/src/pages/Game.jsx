import { useNavigate } from 'react-router-dom'

function Game() {
  const navigate = useNavigate()

  // Turn-by-turn gameplay state lives here as regular React state,
  // not as routes, so the browser back button doesn't rewind moves.

  return (
    <div className="page">
      <h1>Game</h1>
      <p>The game will be played here.</p>
      <button onClick={() => navigate('/')}>Quit to Menu</button>
    </div>
  )
}

export default Game
