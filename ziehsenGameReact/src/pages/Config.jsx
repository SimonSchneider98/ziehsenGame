import { useNavigate } from 'react-router-dom'

function Config() {
  const navigate = useNavigate()

  return (
    <div className="page">
      <h1>Custom Game</h1>
      <p>Configure your custom game here.</p>
      <div className="menu">
        <button onClick={() => navigate('/game')}>Start</button>
        <button onClick={() => navigate('/')}>Back</button>
      </div>
    </div>
  )
}

export default Config
