import React from 'react';

interface Column<T> {
  header: string;
  accessorKey: keyof T | string;
  cell?: (item: T) => React.ReactNode;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  isLoading?: boolean;
  emptyMessage?: string;
}

export function Table<T>({ data, columns, isLoading, emptyMessage = 'Aucune donnée disponible.' }: TableProps<T>) {
  if (isLoading) {
    return (
      <div className="w-full flex justify-center py-12">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="w-full py-12 text-center text-slate-500 bg-slate-50 rounded-lg border border-slate-200 border-dashed">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto w-full">
      <table className="table table-zebra w-full">
        <thead>
          <tr>
            {columns.map((col, i) => (
              <th key={i}>{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {columns.map((col, colIndex) => (
                <td key={colIndex}>
                  {col.cell ? col.cell(row) : String((row as any)[col.accessorKey] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
