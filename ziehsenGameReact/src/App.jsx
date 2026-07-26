import { Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Settings from './pages/Settings'
import Config from './pages/Config'
import Game from './pages/Game'
import './App.css'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/config" element={<Config />} />
      <Route path="/game" element={<Game />} />
    </Routes>
  )
}

export default App
