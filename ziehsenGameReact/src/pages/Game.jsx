import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Board from "../components/Board";
import { getLayout, layouts } from "../layouts";
import { loadConfig } from "../gameConfig";

function randomInt(max) {
  return Math.floor(Math.random() * max);
}

// Indices of tiles in a column that exist (matrix === true) and are not removed,
// in top-to-bottom order. The top-most active tile is the first entry.
function activeIndices(column, removedColumn) {
  const result = [];
  for (let i = 0; i < column.length; i += 1) {
    if (column[i] && !removedColumn[i]) result.push(i);
  }
  return result;
}

function makeEmptyRemoved(matrix) {
  return matrix.map((column) => column.map(() => false));
}

function countActive(matrix, removed) {
  let total = 0;
  for (let c = 0; c < matrix.length; c += 1) {
    total += activeIndices(matrix[c], removed[c]).length;
  }
  return total;
}

function pickRandomLegalMove(heaps) {
  const heap = heaps[randomInt(heaps.length)];
  return {
    column: heap.column,
    count: randomInt(heap.size) + 1,
  };
}

function pickPerfectMisereMove(matrix, removed) {
  const heaps = matrix
    .map((column, c) => ({
      column: c,
      size: activeIndices(column, removed[c]).length,
    }))
    .filter((heap) => heap.size > 0);

  if (heaps.length === 0) return null;

  const heapsOverOne = heaps.filter((heap) => heap.size > 1);
  const heapsOfOne = heaps.length - heapsOverOne.length;

  // Special misere phase: at most one heap larger than 1.
  // Choose whether to clear that heap or reduce it to 1 so the opponent
  // receives an odd number of 1-heaps.
  if (heapsOverOne.length <= 1) {
    if (heapsOverOne.length === 0) {
      // All heaps are size 1. Best play removes exactly one.
      return { column: heaps[0].column, count: 1 };
    }

    const bigHeap = heapsOverOne[0];
    const targetSize = heapsOfOne % 2 === 0 ? 1 : 0;
    const count = bigHeap.size - targetSize;
    return { column: bigHeap.column, count };
  }

  // Normal Nim phase: move to nim-sum 0.
  const nimSum = heaps.reduce((acc, heap) => acc ^ heap.size, 0);
  if (nimSum !== 0) {
    for (let i = 0; i < heaps.length; i += 1) {
      const heap = heaps[i];
      const targetSize = heap.size ^ nimSum;
      if (targetSize < heap.size) {
        return { column: heap.column, count: heap.size - targetSize };
      }
    }
  }

  // Losing position (nim-sum 0): no winning move exists, so randomize.
  return pickRandomLegalMove(heaps);
}

function Game() {
  const navigate = useNavigate();
  const location = useLocation();

  // Prefer the config passed via navigation (Landing "Play" sends the default
  // config, Config "Start Game" sends the chosen one). Fall back to storage
  // for direct URL loads.
  const config = useMemo(
    () => location.state?.config ?? loadConfig(),
    [location.state],
  );

  const isVsCpu = config.mode === "cpu";
  const players = useMemo(
    () => (isVsCpu ? ["player", "cpu"] : ["p1", "p2"]),
    [isVsCpu],
  );
  const startIndex = isVsCpu && config.starter === "cpu" ? 1 : 0;

  // Resolve the layout once. For "random" pick a layout at mount; restart keeps
  // the same board so a rematch is on the same field.
  const layout = useMemo(() => {
    if (config.layoutMode === "random") {
      return layouts[randomInt(layouts.length)];
    }
    return getLayout(config.layout) ?? layouts[0];
  }, [config.layoutMode, config.layout]);

  const matrix = layout.matrix;

  const [removed, setRemoved] = useState(() => makeEmptyRemoved(matrix));
  const [selection, setSelection] = useState(null); // { column, count } | null
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [result, setResult] = useState(null); // { loserIndex } | null

  const currentId = players[currentIndex];
  const isHumanTurn = !result && currentId !== "cpu";

  // Derive the selected tiles (top `count` active tiles of the chosen column).
  const selected = useMemo(() => {
    const grid = makeEmptyRemoved(matrix);
    if (selection) {
      const active = activeIndices(
        matrix[selection.column],
        removed[selection.column],
      );
      for (let k = 0; k < selection.count && k < active.length; k += 1) {
        grid[selection.column][active[k]] = true;
      }
    }
    return grid;
  }, [matrix, removed, selection]);

  const finishTurn = useCallback(
    (nextRemoved, moverIndex) => {
      setRemoved(nextRemoved);
      setSelection(null);
      const remaining = countActive(matrix, nextRemoved);
      if (remaining <= 1) {
        // Misère: taking the last tile loses. If one tile remains, the next
        // player is forced to take it and loses; if none remain, the mover
        // took the last tile and loses.
        const loserIndex = remaining === 0 ? moverIndex : 1 - moverIndex;
        setResult({ loserIndex });
      } else {
        setCurrentIndex(1 - moverIndex);
      }
    },
    [matrix],
  );

  function handleColumnClick(columnIndex) {
    if (!isHumanTurn) return;
    const active = activeIndices(matrix[columnIndex], removed[columnIndex]);
    if (active.length === 0) return;
    setSelection((previous) => {
      if (!previous || previous.column !== columnIndex) {
        return { column: columnIndex, count: 1 };
      }
      // Same column tapped again: extend downward, cycling back to 1 at the end.
      const next = previous.count >= active.length ? 1 : previous.count + 1;
      return { column: columnIndex, count: next };
    });
  }

  function handleTileClick(columnIndex, tileIndex) {
    if (!isHumanTurn || !selection || selection.column !== columnIndex)
      return false;

    const active = activeIndices(matrix[columnIndex], removed[columnIndex]);
    const selectedIndices = active.slice(0, selection.count);
    if (!selectedIndices.includes(tileIndex)) return false;

    setSelection((previous) => {
      if (!previous || previous.column !== columnIndex) return previous;
      const next = Math.max(0, previous.count - 1);
      if (next === 0) return null;
      return { ...previous, count: next };
    });
    return true;
  }

  function confirmMove() {
    if (!selection || !isHumanTurn) return;
    const active = activeIndices(
      matrix[selection.column],
      removed[selection.column],
    );
    const toRemove = new Set(active.slice(0, selection.count));
    const nextRemoved = removed.map((column, c) =>
      c === selection.column
        ? column.map((value, i) => value || toRemove.has(i))
        : column,
    );
    finishTurn(nextRemoved, currentIndex);
  }

  function restart() {
    setRemoved(makeEmptyRemoved(matrix));
    setSelection(null);
    setCurrentIndex(startIndex);
    setResult(null);
  }

  // CPU turn: after a short pause, play optimal misere Nim.
  useEffect(() => {
    if (result || currentId !== "cpu") return;
    const timer = setTimeout(() => {
      const move = pickPerfectMisereMove(matrix, removed);
      if (!move) return;

      const active = activeIndices(matrix[move.column], removed[move.column]);
      const toRemove = new Set(active.slice(0, move.count));
      const nextRemoved = removed.map((column, c) =>
        c === move.column
          ? column.map((value, i) => value || toRemove.has(i))
          : column,
      );
      finishTurn(nextRemoved, currentIndex);
    }, 700);
    return () => clearTimeout(timer);
  }, [currentId, currentIndex, matrix, removed, result, finishTurn]);

  function turnLabel() {
    if (isVsCpu) return currentId === "player" ? "Your turn" : "Harald's turn";
    return currentId === "p1" ? "Player 1's turn" : "Player 2's turn";
  }

  function resultMessage() {
    const loserId = players[result.loserIndex];
    if (isVsCpu) return loserId === "player" ? "You lost!" : "You won!";
    const winnerId = players[1 - result.loserIndex];
    return winnerId === "p1" ? "Player 1 has won!" : "Player 2 has won!";
  }

  return (
    <div className="page game">
      <header className="game-header">
        <button
          className="icon-button"
          aria-label="Back"
          onClick={() => navigate(-1)}
        >
          ←
        </button>
        <span className="game-turn">{turnLabel()}</span>
        <button className="icon-button" aria-label="Restart" onClick={restart}>
          ↻
        </button>
      </header>

      <div className="game-board">
        <Board
          matrix={matrix}
          removed={removed}
          selected={selected}
          onColumnClick={isHumanTurn ? handleColumnClick : undefined}
          onTileClick={isHumanTurn ? handleTileClick : undefined}
        />
      </div>

      <footer className="game-footer">
        <button
          className="primary"
          disabled={!selection || !isHumanTurn}
          onClick={confirmMove}
        >
          Confirm
        </button>
      </footer>

      {result && (
        <div className="game-over">
          <div className="game-over-card">
            <h2>{resultMessage()}</h2>
            <div className="game-over-actions">
              <button className="primary" onClick={restart}>
                Restart
              </button>
              <button className="secondary" onClick={() => navigate("/")}>
                Menu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Game;
