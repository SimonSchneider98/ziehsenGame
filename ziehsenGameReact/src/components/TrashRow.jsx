import { useMemo } from "react";

// A row of "trash" tiles rendered below the game board, one tile per board
// column. Clicking a tile selects every tile in the vertically aligned column
// on the board. It intentionally mirrors the board's column-filtering and
// fit-divisor math so its columns and tiles line up perfectly with the board,
// while living outside the `.board` element so it never affects the board's
// own flex layout.
function TrashRow({ matrix, onColumnClick }) {
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
      className="board trash-board"
      style={{
        "--board-columns": boardColumns,
        "--board-max-stack": boardMaxStack,
        "--board-fit-divisor": boardFitDivisor,
      }}
    >
      {columns.map(({ columnIndex }) => (
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
          <div className="tile">
            <div className="tile-fill"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default TrashRow;
