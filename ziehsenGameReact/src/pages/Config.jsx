import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Board from '../components/Board'
import { layouts } from '../layouts'
import { DEFAULT_CONFIG, loadConfig, saveConfig } from '../gameConfig'

function Config() {
  const navigate = useNavigate()
  const [config, setConfig] = useState(loadConfig)

  // Persist the config on every change so a refresh doesn't lose it.
  useEffect(() => {
    saveConfig(config)
  }, [config])

  const carouselIndex = useMemo(() => {
    const index = layouts.findIndex((layout) => layout.name === config.layout)
    return index === -1 ? 0 : index
  }, [config.layout])

  const currentLayout = layouts[carouselIndex]

  function update(patch) {
    setConfig((previous) => ({ ...previous, ...patch }))
  }

  function moveCarousel(delta) {
    const next = (carouselIndex + delta + layouts.length) % layouts.length
    update({ layout: layouts[next].name })
  }

  function reset() {
    setConfig(DEFAULT_CONFIG)
  }

  return (
    <div className="page config">
      <header className="config-header">
        <button
          className="icon-button"
          aria-label="Back"
          onClick={() => navigate('/')}
        >
          ←
        </button>
        <h1>Custom Game</h1>
      </header>

      <section className="config-section">
        <h2>Mode</h2>
        <div className="option-row">
          <button
            className={config.mode === 'cpu' ? 'chip chip--active' : 'chip'}
            onClick={() => update({ mode: 'cpu' })}
          >
            Harald
          </button>
          <button
            className={config.mode === 'local' ? 'chip chip--active' : 'chip'}
            onClick={() => update({ mode: 'local' })}
          >
            2 Players
          </button>
        </div>
      </section>

      {config.mode === 'cpu' && (
        <section className="config-section">
          <h2>Who starts?</h2>
          <div className="option-row">
            <button
              className={
                config.starter === 'player' ? 'chip chip--active' : 'chip'
              }
              onClick={() => update({ starter: 'player' })}
            >
              Player
            </button>
            <button
              className={
                config.starter === 'cpu' ? 'chip chip--active' : 'chip'
              }
              onClick={() => update({ starter: 'cpu' })}
            >
              Harald
            </button>
          </div>
        </section>
      )}

      <section className="config-section">
        <h2>Board</h2>
        <div className="option-row">
          <button
            className={
              config.layoutMode === 'random' ? 'chip chip--active' : 'chip'
            }
            onClick={() => update({ layoutMode: 'random' })}
          >
            Random
          </button>
          <button
            className={
              config.layoutMode === 'custom' ? 'chip chip--active' : 'chip'
            }
            onClick={() => update({ layoutMode: 'custom' })}
          >
            Choose
          </button>
        </div>

        {config.layoutMode === 'custom' && currentLayout && (
          <>
            <div className="selected-board-info">
              <span className="carousel-number">#{currentLayout.number}</span>
              <span className="carousel-name">{currentLayout.file}</span>
              <span className="carousel-count">{currentLayout.ziehsen} Ziehsen</span>
            </div>
            <div className="carousel">
              <button
                className="icon-button"
                aria-label="Previous board"
                onClick={() => moveCarousel(-1)}
              >
                ‹
              </button>
              <div className="carousel-item">
                <div className="carousel-board">
                  <Board matrix={currentLayout.matrix} />
                </div>
              </div>
              <button
                className="icon-button"
                aria-label="Next board"
                onClick={() => moveCarousel(1)}
              >
                ›
              </button>
            </div>
          </>
        )}
      </section>

      <footer className="config-footer">
        <button
          className="primary"
          onClick={() => navigate('/game', { state: { config } })}
        >
          Start Game
        </button>
        <button className="secondary" onClick={reset}>
          Reset
        </button>
      </footer>
    </div>
  )
}

export default Config
