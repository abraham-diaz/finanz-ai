import type { CategoryBreakdown } from "@/lib/api";
import { formatCurrency } from "@/lib/format";
import { resolveCategoryIcon, getCategoryColor } from "@/lib/category-icon";

export function CategoryBarChart({ byCategory }: { byCategory: CategoryBreakdown[] }) {
  if (byCategory.length === 0) {
    return <p className="text-sm text-card-foreground/70">Sin gastos este mes.</p>;
  }

  const rows = [...byCategory].sort((a, b) => b.total - a.total);
  const total = rows.reduce((sum, row) => sum + row.total, 0);
  const max = Math.max(...rows.map((row) => row.total));

  return (
    <div className="flex flex-col gap-4">
      {rows.map((row, index) => {
        const Icon = resolveCategoryIcon(row.categoryName, row.icon);
        const color = getCategoryColor(index);
        const share = total === 0 ? 0 : Math.round((row.total / total) * 100);
        const barWidth = max === 0 ? 0 : (row.total / max) * 100;

        return (
          <div key={row.categoryId} className="flex items-center gap-3">
            <span
              className="flex size-10 shrink-0 items-center justify-center rounded-full"
              style={{ backgroundColor: `${color}1a`, color }}
            >
              <Icon className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <span className="truncate text-sm font-medium text-card-foreground">
                  {row.categoryName}
                </span>
                <span className="shrink-0 text-sm font-semibold text-card-foreground">
                  {formatCurrency(row.total)}
                </span>
              </div>
              <div className="mt-1.5 flex items-center gap-2">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
                <span className="shrink-0 text-xs text-card-foreground/60">{share}%</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
