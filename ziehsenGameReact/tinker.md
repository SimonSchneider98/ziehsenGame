# Game Specification

Implementation spec for the ziehsenGame React app.

## Global

- All four routes are directly reachable via URL (HashRouter): `/` Landing, `/config` Config,
  `/settings` Settings, `/game` Game.
- Persistence (localStorage):
  - Landing: no persistent state.
  - Config: the full custom game config is loaded from and saved to localStorage. Any change is
    persisted immediately, so a refresh does not lose the config.
  - Settings: loaded from and saved to localStorage.
- A **layout** = one JSON file from `src/starters/` (an N×N matrix; `true` = active tile,
  `false` = empty). There are 15 layouts, shown to the user numbered 1–15.

## Default config

Used by the Landing "Play" button and as the Config reset target:

- Mode: player vs CPU
- Starter: user starts
- Layout: `10-2.json`

## Landing (`/`)

- **Play** button: immediately starts a game using the default config above.
- **Custom game** button: navigates to Config (`/config`).
- **Settings** button: navigates to Settings (`/settings`).

## Config (`/config`)

Custom game options, top to bottom:

1. **Mode**: player vs CPU, or 2 players (local hot-seat on one screen).
2. **Starter**: who moves first — player or CPU. Ignored/hidden in 2-player mode.
3. **Layout selection** (`ziehsenLayout`):
   - Option `random`: pick a random layout at game start.
   - Option `custom`: show a carousel of all layouts from `src/starters/`.
     - Default selection is `10-2.json`.
     - The carousel renders each board using the **same board component as the Game page**.
     - Each option has an overlay showing an identifying number (1–15) and the count of active
       tiles ("ziehsen") in that board.

At the bottom:

- **Start game** button: starts a game with the configured values.
- **Reset** button: resets the config back to the default config.

## Settings (`/settings`)

- Toggle: mute all app sound.
- Persisted to localStorage.

## Game (`/game`)

### Layout

- Top-left: **back arrow** → previous page (Landing or Config).
- Top-right: **restart game** button.
- Bottom: **confirm** button — confirms the current selection and ends the turn.
- Board area has left/right padding.

### Board rendering

- Outer board is a flex container (row of columns).
- Each column is a flex container (`flex-direction: column`) that centers its tiles; columns
  grow within the board.
- A tile is always a square with a centered cigarette emoji.
- Tiles per column come from the layout matrix in the active game config.
- A confirmed (removed) tile stays visible but becomes **opaque/inactive** and can no longer be
  selected.

### Turn flow

- Each turn, the current actor (user or CPU) selects tiles to remove, then confirms.
- Nim rule: any number of tiles (≥1) may be selected, but **only from a single column**.
- User selection interaction:
  - Tap a column → highlight its top-most active tile as selected.
  - Tap the **same** column again → extend the selection to the next active tile down.
  - Tap a **different** column → clear the previous column's selection and select the top-most
    active tile of the new column.
- **Confirm** disables (removes) the selected tiles and ends the turn.

### End condition (misère)

- The game ends when only **one** active tile remains.
- The player whose turn it is at that moment **loses**.

### Game end screen

Shown when the game ends. Content depends on the mode:

- Player vs CPU: `You won!` if the user won, `You lost!` if the user lost.
- Player 1 vs Player 2: `Player 1 has won!` / `Player 2 has won!`.

Actions:

- **Restart**: start a new game with the same config.
- **Menu**: navigate back to the Landing page (`/`).

## CPU

- Mode: player vs CPU. A closer strategy spec (which column/tile to pick) will follow later.
- For now the CPU plays a **random legal move**: pick a random column that still has active
  tiles, then remove a random number (≥1) of its active tiles.
