import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loadSettings, saveSettings } from "../settings";

function Settings() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState(loadSettings);

  // Persist on every change so the setting survives a refresh.
  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  function toggle(key) {
    setSettings((previous) => ({ ...previous, [key]: !previous[key] }));
  }

  return (
    <div className="page settings">
      <header className="page-header">
        <button
          className="icon-button"
          aria-label="Back"
          onClick={() => navigate("/")}
        >
          ‹
        </button>
        <span className="page-header-text">
          <span className="page-header-text-inner">Settings</span>
        </span>
      </header>
      <div className="page-content">
        <section className="config-section">
          <label className="setting-row">
            <span>Mute all sound</span>
            <input
              type="checkbox"
              className="switch"
              checked={settings.muted}
              onChange={() => toggle("muted")}
            />
          </label>
          <label className="setting-row">
            <span>Granular selection</span>
            <input
              type="checkbox"
              className="switch"
              checked={settings.granularSelection}
              onChange={() => toggle("granularSelection")}
            />
          </label>
          <label className="setting-row">
            <span>Taunt (Harald mode)</span>
            <input
              type="checkbox"
              className="switch"
              checked={settings.tauntHaraldMode}
              onChange={() => toggle("tauntHaraldMode")}
            />
          </label>
        </section>
      </div>
    </div>
  );
}

export default Settings;
