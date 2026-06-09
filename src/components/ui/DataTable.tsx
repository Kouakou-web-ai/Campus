import React, { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import type { TableColumn } from '../../types';

interface DataTableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  emptyMessage?: string;
  emptyDescription?: string;
}

export default function DataTable<T>({
  data,
  columns,
  emptyMessage = 'Aucune donnée trouvée',
  emptyDescription,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const sortedData = React.useMemo(() => {
    if (!sortKey) return data;
    return [...data].sort((a, b) => {
      const aVal = (a as any)[sortKey];
      const bVal = (b as any)[sortKey];
      if (aVal === bVal) return 0;
      if (aVal === undefined || aVal === null) return 1;
      if (bVal === undefined || bVal === null) return -1;
      
      const order = sortOrder === 'asc' ? 1 : -1;
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return (aVal - bVal) * order;
      }
      return String(aVal).localeCompare(String(bVal)) * order;
    });
  }, [data, sortKey, sortOrder]);

  if (sortedData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 mb-4 border border-slate-100">
          🔍
        </div>
        <h4 className="text-sm font-semibold text-slate-800">{emptyMessage}</h4>
        {emptyDescription && (
          <p className="text-xs text-slate-400 mt-1 max-w-sm">{emptyDescription}</p>
        )}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto w-full">
      <table className="w-full table-premium">
        <thead>
          <tr>
            {columns.map((col, idx) => {
              const isSortable = col.sortable;
              const isSorted = sortKey === col.key;
              return (
                <th
                  key={idx}
                  style={{ width: col.width }}
                  onClick={() => isSortable && handleSort(String(col.key))}
                  className={isSortable ? 'cursor-pointer select-none group' : ''}
                >
                  <div className="flex items-center gap-1.5">
                    <span>{col.label}</span>
                    {isSortable && (
                      <span className="text-slate-400 group-hover:text-slate-600 transition-colors">
                        {isSorted ? (
                          sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                        ) : (
                          <ChevronDown size={14} className="opacity-0 group-hover:opacity-100" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row, rIdx) => (
            <tr key={rIdx} className="hover:bg-slate-50/50 transition-colors">
              {columns.map((col, cIdx) => {
                const val = (row as any)[col.key];
                return (
                  <td key={cIdx}>
                    {col.render ? col.render(val, row) : String(val ?? '')}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
