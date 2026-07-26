import { useNavigate } from 'react-router-dom'

function Settings() {
  const navigate = useNavigate()

  return (
    <div className="page">
      <h1>Settings</h1>
      <p>Settings go here.</p>
      <button onClick={() => navigate('/')}>Back</button>
    </div>
  )
}

export default Settings
