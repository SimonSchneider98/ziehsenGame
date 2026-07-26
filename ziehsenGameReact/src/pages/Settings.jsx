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
    <div className="page config">
      <header className="config-header">
        <button
          className="icon-button"
          aria-label="Back"
          onClick={() => navigate("/")}
        >
          ←
        </button>
        <h1>Settings</h1>
      </header>

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
      </section>
    </div>
  );
}

export default Settings;
