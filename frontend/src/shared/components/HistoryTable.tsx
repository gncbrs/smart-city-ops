import "../styles/HistoryTable.css";

export interface HistoryTableCell {
  label: string;
  onClick?: () => void;
}

export interface HistoryTableRow {
  id: string;
  cells: HistoryTableCell[];
}

interface HistoryTableProps {
  columns: string[];
  rows: HistoryTableRow[];
  emptyMessage: string;
}

export function HistoryTable({ columns, rows, emptyMessage }: HistoryTableProps) {
  if (rows.length === 0) {
    return <p>{emptyMessage}</p>;
  }

  return (
    <div className="history-table__wrapper">
      <table className="history-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column}>{column}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              {row.cells.map((cell, cellIndex) =>
                cell.onClick ? (
                  <td key={cellIndex}>
                    <button type="button" className="history-table__link" onClick={cell.onClick}>
                      {cell.label}
                    </button>
                  </td>
                ) : (
                  <td key={cellIndex}>{cell.label}</td>
                )
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}