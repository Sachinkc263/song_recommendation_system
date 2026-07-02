import { BsChevronLeft, BsChevronRight } from "react-icons/bs";

export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  const pages = new Set(
    [1, totalPages, page, page - 1, page + 1].filter((p) => p >= 1 && p <= totalPages)
  );
  const sorted = [...pages].sort((a, b) => a - b);

  const items = [];
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) items.push("…");
    items.push(sorted[i]);
  }

  return (
    <div className="flex items-center justify-center gap-1 pt-7 pb-2">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        aria-label="Previous page"
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[13px] text-th-secondary hover:text-th-text hover:bg-th-elevated disabled:opacity-25 disabled:cursor-not-allowed transition-all"
      >
        <BsChevronLeft className="text-[10px]" /> Prev
      </button>

      <div className="flex items-center gap-0.5">
        {items.map((item, i) =>
          item === "…" ? (
            <span key={"e-" + i} className="px-2 text-th-muted text-[13px] select-none">…</span>
          ) : (
            <button
              key={item}
              onClick={() => onChange(item)}
              aria-label={`Page ${item}`}
              aria-current={item === page ? "page" : undefined}
              className={
                "w-8 h-8 rounded-lg text-[13px] font-medium transition-all " +
                (item === page
                  ? "bg-accent text-black shadow-[0_0_12px_rgba(29,185,84,0.3)]"
                  : "text-th-secondary hover:text-th-text hover:bg-th-elevated")
              }
            >
              {item}
            </button>
          )
        )}
      </div>

      <button
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        aria-label="Next page"
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[13px] text-th-secondary hover:text-th-text hover:bg-th-elevated disabled:opacity-25 disabled:cursor-not-allowed transition-all"
      >
        Next <BsChevronRight className="text-[10px]" />
      </button>
    </div>
  );
}
