import React, { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, Search, SearchX } from "lucide-react";
import { EmptyState } from "./States";

/*
  columns: [{
    key, header, render?: (row) => node, align?: "left" | "right" | "center",
    sortValue?: (row) => string | number,   // enables sorting on that column
    hideOnMobile?: boolean,                 // omit from the stacked mobile card
    className?: string,
  }]
  The first column is the card title on mobile; a column with key "actions"
  renders at the card's foot. Pass `mobileRow(row)` to replace that default
  card with a custom compact row.
*/
const DataTable = ({
  columns,
  rows,
  rowKey = "_id",
  search,
  toolbar,
  pageSize = 10,
  empty,
  caption,
  stickyHeader = false,
  initialSort,
  mobileRow,
}) => {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [sort, setSort] = useState(initialSort || null); // { key, dir }

  const filtered = useMemo(() => {
    let out = rows;
    if (search && query.trim()) {
      const q = query.trim().toLowerCase();
      out = out.filter((r) => search.getText(r).toLowerCase().includes(q));
    }
    if (sort) {
      const col = columns.find((c) => c.key === sort.key);
      if (col?.sortValue) {
        out = [...out].sort((a, b) => {
          const va = col.sortValue(a);
          const vb = col.sortValue(b);
          const cmp = va > vb ? 1 : va < vb ? -1 : 0;
          return sort.dir === "asc" ? cmp : -cmp;
        });
      }
    }
    return out;
  }, [rows, query, search, sort, columns]);

  useEffect(() => setPage(0), [query]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  // Keep the page valid when rows shrink, without jumping on in-place edits.
  useEffect(() => {
    if (page > pageCount - 1) setPage(pageCount - 1);
  }, [page, pageCount]);
  const current = filtered.slice(page * pageSize, page * pageSize + pageSize);
  const getKey = (row, i) => (typeof rowKey === "function" ? rowKey(row) : (row[rowKey] ?? i));
  const [titleCol, ...restCols] = columns;
  const actionsCol = columns.find((c) => c.key === "actions");
  const detailCols = restCols.filter((c) => c.key !== "actions" && !c.hideOnMobile);

  const toggleSort = (key) => setSort((s) => (s?.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "desc" }));

  const alignClass = (a) => (a === "right" ? "text-right" : a === "center" ? "text-center" : "text-left");

  return (
    <div>
      {(search || toolbar) && (
        <div className="flex flex-col gap-2 border-b border-line px-4 py-3 sm:flex-row sm:items-center sm:px-5">
          {search && (
            <label className="relative block w-full sm:max-w-xs">
              <span className="sr-only">{search.placeholder}</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" aria-hidden="true" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={search.placeholder}
                className="focus-ring h-9 w-full rounded-lg border border-line bg-surface pl-9 pr-3 text-sm text-ink placeholder:text-ink-3 focus-visible:border-brand/60 focus-visible:ring-offset-0"
              />
            </label>
          )}
          {toolbar && <div className="flex flex-wrap items-center gap-2 sm:ml-auto">{toolbar}</div>}
        </div>
      )}

      {filtered.length === 0 ? (
        query ? (
          <EmptyState icon={SearchX} title="No matches" description={`Nothing matches “${query}”.`} compact />
        ) : (
          empty
        )
      ) : (
        <>
          {/* Desktop / tablet table */}
          <div className={`hidden md:block ${stickyHeader ? "max-h-[560px] overflow-auto scrollbar-thin" : "overflow-x-auto"}`}>
            <table className="w-full border-collapse text-sm">
              {caption && <caption className="sr-only">{caption}</caption>}
              <thead className={stickyHeader ? "sticky top-0 z-[1]" : ""}>
                <tr className="border-b border-line bg-surface-2/70 backdrop-blur">
                  {columns.map((col) => {
                    const sorted = sort?.key === col.key;
                    return (
                      <th
                        key={col.key}
                        scope="col"
                        aria-sort={sorted ? (sort.dir === "asc" ? "ascending" : "descending") : undefined}
                        className={`whitespace-nowrap px-5 py-2.5 text-xs font-medium text-ink-3 ${alignClass(col.align)}`}
                      >
                        {col.sortValue ? (
                          <button
                            type="button"
                            onClick={() => toggleSort(col.key)}
                            className="focus-ring -mx-1 inline-flex items-center gap-1 rounded px-1 hover:text-ink"
                          >
                            {col.header}
                            {sorted &&
                              (sort.dir === "asc" ? (
                                <ArrowUp className="h-3 w-3" aria-hidden="true" />
                              ) : (
                                <ArrowDown className="h-3 w-3" aria-hidden="true" />
                              ))}
                          </button>
                        ) : (
                          col.header
                        )}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {current.map((row, i) => (
                  <tr key={getKey(row, i)} className="border-b border-line transition-colors last:border-0 hover:bg-surface-2/60">
                    {columns.map((col) => (
                      <td key={col.key} className={`px-5 py-3 align-middle text-ink-2 ${alignClass(col.align)} ${col.className || ""}`}>
                        {col.render ? col.render(row) : row[col.key]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile: rows become compact cards instead of a scrolling table */}
          <ul className="divide-y divide-line md:hidden">
            {current.map((row, i) => (
              <li key={getKey(row, i)} className="px-4 py-3.5">
                {mobileRow ? (
                  mobileRow(row)
                ) : (
                  <>
                    <div className="min-w-0">{titleCol.render ? titleCol.render(row) : row[titleCol.key]}</div>
                    {detailCols.length > 0 && (
                      <dl className="mt-2.5 grid grid-cols-2 gap-x-4 gap-y-2">
                        {detailCols.map((col) => (
                          <div key={col.key} className="min-w-0">
                            <dt className="text-[11px] font-medium uppercase tracking-wide text-ink-3">{col.header}</dt>
                            <dd className="mt-0.5 text-[13px] text-ink-2">{col.render ? col.render(row) : row[col.key]}</dd>
                          </div>
                        ))}
                      </dl>
                    )}
                    {actionsCol && <div className="mt-3 flex justify-end gap-2">{actionsCol.render(row)}</div>}
                  </>
                )}
              </li>
            ))}
          </ul>

          {filtered.length > pageSize && (
            <nav
              aria-label="Pagination"
              className="flex items-center justify-between gap-3 border-t border-line px-4 py-3 text-[13px] text-ink-3 sm:px-5"
            >
              <span className="tabular-nums">
                {page * pageSize + 1}–{Math.min(filtered.length, (page + 1) * pageSize)} of {filtered.length}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  aria-label="Previous page"
                  className="focus-ring inline-flex h-8 w-8 items-center justify-center rounded-lg text-ink-2 hover:bg-surface-2 disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="px-1 tabular-nums">
                  {page + 1} / {pageCount}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
                  disabled={page >= pageCount - 1}
                  aria-label="Next page"
                  className="focus-ring inline-flex h-8 w-8 items-center justify-center rounded-lg text-ink-2 hover:bg-surface-2 disabled:opacity-40"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </nav>
          )}
        </>
      )}
    </div>
  );
};

export default DataTable;
