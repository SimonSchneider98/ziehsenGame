import { useMemo } from "react";

// Reusable board renderer. Displays the layout matrix as columns of tiles.
// The matrix is an array of columns; each column is an array of booleans
// where `true` means the tile exists. This same component is used by the
// Config carousel (display-only) and the Game page (interactive).
//
// Optional props for gameplay:
// - removed:  2D boolean array, `true` where a tile has been removed (shown faded)
// - selected: 2D boolean array, `true` where a tile is selected this turn
// - onColumnClick(columnIndex): makes each column tappable
// - onTileClick(columnIndex, tileIndex): tile-level click handling
function Board({ matrix, removed, selected, onColumnClick, onTileClick }) {
  const interactive = Boolean(onColumnClick);

  const columns = useMemo(
    () =>
      matrix
        .map((column, columnIndex) => ({ column, columnIndex }))
        .filter(({ column }) => column.some(Boolean)),
    [matrix],
  );

  const boardColumns = columns.length;
  const boardMaxStack = useMemo(
    () =>
      columns.reduce(
        (max, { column }) =>
          Math.max(
            max,
            column.reduce((count, exists) => (exists ? count + 1 : count), 0),
          ),
        0,
      ),
    [columns],
  );
  const boardFitDivisor = Math.max(1, boardColumns, boardMaxStack);

  return (
    <div
      className="board"
      style={{
        "--board-columns": boardColumns,
        "--board-max-stack": boardMaxStack,
        "--board-fit-divisor": boardFitDivisor,
      }}
    >
      {columns.map(({ column, columnIndex }) => (
        <div
          className={
            interactive
              ? "board-column board-column--interactive"
              : "board-column"
          }
          key={columnIndex}
          role={interactive ? "button" : undefined}
          tabIndex={interactive ? 0 : undefined}
          onClick={interactive ? () => onColumnClick(columnIndex) : undefined}
          onKeyDown={
            interactive
              ? (event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onColumnClick(columnIndex);
                  }
                }
              : undefined
          }
        >
          {column.map((exists, tileIndex) => {
            if (!exists) return null;
            const isRemoved = removed?.[columnIndex]?.[tileIndex];
            const isSelected = selected?.[columnIndex]?.[tileIndex];
            const className = [
              "tile",
              isRemoved && "tile--removed",
              isSelected && "tile--selected",
            ]
              .filter(Boolean)
              .join(" ");
            const iconSrc = isRemoved
              ? "ziehseOff.svg"
              : isSelected
                ? "ziehseOn.svg"
                : "ziehse.svg";
            return (
              <div
                className={className}
                key={tileIndex}
                onClick={
                  onTileClick
                    ? (event) => {
                        const handled = onTileClick(columnIndex, tileIndex);
                        if (handled) {
                          event.stopPropagation();
                        }
                      }
                    : undefined
                }
              >
                <div className="tile-fill">
                  <img
                    className="tile-icon"
                    src={`${import.meta.env.BASE_URL}${iconSrc}`}
                    alt=""
                    aria-hidden="true"
                    draggable="false"
                  />
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

export default Board;
