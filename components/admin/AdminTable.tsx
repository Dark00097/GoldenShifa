// components/admin/AdminTable.tsx
'use client';

import { ReactNode, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Search, SlidersHorizontal } from 'lucide-react';
import styles from './AdminTable.module.css';

export type AdminColumn<T> = {
  header: string;
  render: (row: T) => ReactNode;
  searchValue?: (row: T) => string;
};

export function AdminTable<T>({
  rows,
  columns,
  searchPlaceholder = 'Rechercher…',
  filter,
  pageSize = 8,
}: {
  rows: T[];
  columns: AdminColumn<T>[];
  searchPlaceholder?: string;
  filter?: ReactNode;
  pageSize?: number;
}) {
  const [search, setSearch] = useState('');
  const [page, setPage]     = useState(1);

  const filtered = useMemo(() => {
    const value = search.trim().toLowerCase();
    if (!value) return rows;
    return rows.filter((row) =>
      columns.some((col) => col.searchValue?.(row).toLowerCase().includes(value))
    );
  }, [columns, rows, search]);

  const pageCount   = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visibleRows = filtered.slice((page - 1) * pageSize, page * pageSize);

  const pages = Array.from({ length: pageCount }, (_, i) => i + 1);

  return (
    <div className={styles.shell}>

      {/* ── Toolbar ── */}
      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <Search className={styles.searchIcon} size={15} />
          <input
            className={styles.searchInput}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder={searchPlaceholder}
          />
          {search && (
            <button
              className={styles.searchClear}
              onClick={() => { setSearch(''); setPage(1); }}
              aria-label="Effacer"
            >
              ×
            </button>
          )}
        </div>

        <div className={styles.toolbarRight}>
          {filter && (
            <div className={styles.filterWrap}>
              <SlidersHorizontal size={13} className={styles.filterIcon} />
              {filter}
            </div>
          )}
          <span className={styles.countPill}>
            {filtered.length} résultat{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* ── Table ── */}
      <div className={styles.tableScroller}>
        <table className={styles.table}>
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.header} className={styles.th}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row, i) => (
              <tr key={i} className={styles.tr}>
                {columns.map((col) => (
                  <td key={col.header} className={styles.td}>
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))}

            {visibleRows.length === 0 && (
              <tr>
                <td className={styles.emptyCell} colSpan={columns.length}>
                  <div className={styles.emptyInner}>
                    <Search size={28} className={styles.emptyIcon} />
                    <p className={styles.emptyTitle}>Aucun résultat</p>
                    <p className={styles.emptyText}>
                      Essayez un autre terme de recherche.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ── */}
      <div className={styles.pagination}>
        <span className={styles.paginationInfo}>
          Page <strong>{page}</strong> sur <strong>{pageCount}</strong>
          <span className={styles.paginationInfoSep}>·</span>
          {filtered.length} élément{filtered.length !== 1 ? 's' : ''}
        </span>

        <div className={styles.paginationActions}>
          {/* prev */}
          <button
            className={styles.pageBtn}
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            aria-label="Page précédente"
          >
            <ChevronLeft size={15} />
          </button>

          {/* page numbers */}
          <div className={styles.pageNumbers}>
            {pages.map((p) => (
              <button
                key={p}
                className={`${styles.pageNum} ${p === page ? styles.pageNumActive : ''}`}
                onClick={() => setPage(p)}
              >
                {p}
              </button>
            ))}
          </div>

          {/* next */}
          <button
            className={styles.pageBtn}
            onClick={() => setPage(Math.min(pageCount, page + 1))}
            disabled={page === pageCount}
            aria-label="Page suivante"
          >
            <ChevronRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}