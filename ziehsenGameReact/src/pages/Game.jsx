import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Board from "../components/Board";
import TrashRow from "../components/TrashRow";
import { getLayout, layouts } from "../layouts";
import { loadConfig } from "../gameConfig";
import { loadSettings } from "../settings";

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

  // Granular selection lets the player pick individual tiles within a column
  // instead of only the top `count` tiles.
  const granularSelection = useMemo(() => loadSettings().granularSelection, []);

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

  // Same fit-divisor math as TrashRow: it renders one tile per non-empty
  // column, each sized `board-size / fitDivisor`. We need it here to reserve
  // vertical space for the trash row when sizing the board square.
  const fitDivisor = useMemo(() => {
    const columns = matrix.filter((column) => column.some(Boolean));
    const maxStack = columns.reduce(
      (max, column) =>
        Math.max(
          max,
          column.reduce((count, exists) => (exists ? count + 1 : count), 0),
        ),
      0,
    );
    return Math.max(1, columns.length, maxStack);
  }, [matrix]);

  const [removed, setRemoved] = useState(() => makeEmptyRemoved(matrix));
  // Classic mode: { column, count } (top `count` active tiles).
  // Granular mode: { column, indices } (exact tile indices selected).
  const [selection, setSelection] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [result, setResult] = useState(null); // { loserIndex } | null

  const currentId = players[currentIndex];
  const isHumanTurn = !result && currentId !== "cpu";

  // Size the board as the largest square that fits the game area. Container
  // query units (cqw/cqh) aren't supported on older Android browsers, so we
  // measure the (stable) game area and expose the side length as a CSS
  // variable. The trash row is a sibling of the board inside this area, so we
  // reserve its space here: it consumes its top margin plus one tile of height
  // `board-size / fitDivisor`. Solving `side + margin + side / fitDivisor <=
  // availHeight` for the square side keeps board + trash fully visible.
  const boardBoxRef = useRef(null);
  useEffect(() => {
    const element = boardBoxRef.current;
    if (!element) return undefined;
    const update = () => {
      const style = getComputedStyle(element);
      const padX =
        parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
      const padY =
        parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
      const availWidth = element.clientWidth - padX;
      const availHeight = element.clientHeight - padY;

      const trash = element.querySelector(".trash-board");
      const trashMargin = trash
        ? parseFloat(getComputedStyle(trash).marginTop)
        : 0;
      const heightForBoard =
        ((availHeight - trashMargin) * fitDivisor) / (fitDivisor + 1);

      const side = Math.min(availWidth, heightForBoard);
      element.style.setProperty("--board-size", `${Math.max(0, side)}px`);
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, [fitDivisor]);

  // Derive the selected tiles. Classic mode selects the top `count` active
  // tiles; granular mode selects exactly the chosen tile indices.
  const selected = useMemo(() => {
    const grid = makeEmptyRemoved(matrix);
    if (selection) {
      if (selection.indices) {
        for (const index of selection.indices) {
          grid[selection.column][index] = true;
        }
      } else {
        const active = activeIndices(
          matrix[selection.column],
          removed[selection.column],
        );
        for (let k = 0; k < selection.count && k < active.length; k += 1) {
          grid[selection.column][active[k]] = true;
        }
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
    // In granular mode, selection is driven entirely by individual tile clicks;
    // clicks on the column gaps do nothing.
    if (granularSelection) return;
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

  // Granular mode: toggle a single tile. Selecting a tile in a different column
  // discards the previous column's selection. Returns true when the click was
  // handled so the Board can stop it bubbling to the column handler.
  function handleTileClick(columnIndex, tileIndex) {
    if (!isHumanTurn) return false;
    if (removed[columnIndex]?.[tileIndex]) return false;
    setSelection((previous) => {
      if (!previous || previous.column !== columnIndex) {
        return { column: columnIndex, indices: [tileIndex] };
      }
      const has = previous.indices.includes(tileIndex);
      const indices = has
        ? previous.indices.filter((index) => index !== tileIndex)
        : [...previous.indices, tileIndex];
      if (indices.length === 0) return null;
      return { column: columnIndex, indices };
    });
    return true;
  }

  function handleTrashClick(columnIndex) {
    if (!isHumanTurn) return;
    const active = activeIndices(matrix[columnIndex], removed[columnIndex]);
    if (active.length === 0) return;
    // If the whole column is already selected, tapping the trash tile clears it.
    const fullySelected =
      selection?.column === columnIndex &&
      (selection.indices
        ? active.every((index) => selection.indices.includes(index))
        : selection.count >= active.length);
    if (fullySelected) {
      setSelection(null);
      return;
    }
    if (granularSelection) {
      setSelection({ column: columnIndex, indices: active });
    } else {
      setSelection({ column: columnIndex, count: active.length });
    }
  }

  function confirmMove() {
    if (!selection || !isHumanTurn) return;
    const toRemove = selection.indices
      ? new Set(selection.indices)
      : new Set(
          activeIndices(
            matrix[selection.column],
            removed[selection.column],
          ).slice(0, selection.count),
        );
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

  const turnTextClass = isVsCpu
    ? "game-turn-text game-turn-text--cpu"
    : currentId === "p1"
      ? "game-turn-text game-turn-text--p1"
      : currentId === "p2"
        ? "game-turn-text game-turn-text--p2"
        : "game-turn-text";

  const confirmButtonClass =
    !isVsCpu && currentId === "p1"
      ? "primary confirm-button confirm-button--p1"
      : !isVsCpu && currentId === "p2"
        ? "primary confirm-button confirm-button--p2"
        : "primary confirm-button";

  const restartButtonClass =
    result && !isVsCpu && players[1 - result.loserIndex] === "p2"
      ? "primary game-over-restart--p2"
      : "primary";

  const backButtonClass =
    currentId === "p2" ? "icon-button icon-button--p2" : "icon-button";

  const restartIconClass =
    !isVsCpu && currentId === "p1"
      ? "icon-button icon-button--p1"
      : !isVsCpu && currentId === "p2"
        ? "icon-button icon-button--p2"
        : "icon-button";

  return (
    <div className="page game">
      <header className="page-header">
        <button
          className={backButtonClass}
          aria-label="Back"
          onClick={() => navigate(-1)}
        >
          ‹
        </button>
        <span className="game-turn">
          <span className={turnTextClass}>{turnLabel()}</span>
        </span>
        <button
          className={restartIconClass}
          aria-label="Restart"
          onClick={restart}
        >
          ↻
        </button>
      </header>

      <div className="page-content">
        <div className="game-area" ref={boardBoxRef}>
          <div
            className={
              !isVsCpu && currentId === "p2"
                ? "game-board game-board--p2"
                : "game-board"
            }
          >
            <Board
              matrix={matrix}
              removed={removed}
              selected={selected}
              onColumnClick={isHumanTurn ? handleColumnClick : undefined}
              onTileClick={
                isHumanTurn && granularSelection ? handleTileClick : undefined
              }
            />
          </div>
          <TrashRow
            matrix={matrix}
            onColumnClick={isHumanTurn ? handleTrashClick : undefined}
          />
        </div>
      </div>
      <footer className="page-footer">
        <button
          className={confirmButtonClass}
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
              <button className={restartButtonClass} onClick={restart}>
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
