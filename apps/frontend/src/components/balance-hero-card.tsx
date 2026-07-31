import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import type { DailyBalancePoint } from "@/lib/api";
import { formatCurrency } from "@/lib/format";

interface BalanceHeroCardProps {
  balance: number;
  balanceChangePercent: number | null;
  dailyBalance: DailyBalancePoint[];
}

const VIEWBOX_WIDTH = 300;
const VIEWBOX_HEIGHT = 70;

function buildSmoothPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const curr = points[i];
    const next = points[i + 1];
    const midX = (curr.x + next.x) / 2;
    const midY = (curr.y + next.y) / 2;
    d += ` Q ${curr.x} ${curr.y} ${midX} ${midY}`;
  }
  const last = points[points.length - 1];
  d += ` T ${last.x} ${last.y}`;
  return d;
}

export function BalanceHeroCard({ balance, balanceChangePercent, dailyBalance }: BalanceHeroCardProps) {
  const [hidden, setHidden] = useState(false);

  const values = dailyBalance.map((point) => point.balance);
  const min = Math.min(...values, 0);
  const max = Math.max(...values, 0);
  const range = max - min || 1;

  const points = dailyBalance.map((point, index) => ({
    x: (index / Math.max(dailyBalance.length - 1, 1)) * VIEWBOX_WIDTH,
    y: VIEWBOX_HEIGHT - ((point.balance - min) / range) * VIEWBOX_HEIGHT,
  }));

  const linePath = buildSmoothPath(points);
  const areaPath =
    points.length > 1 ? `${linePath} L ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT} L 0 ${VIEWBOX_HEIGHT} Z` : "";

  const isPositive = (balanceChangePercent ?? 0) >= 0;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-primary px-6 pt-5 pb-3 text-primary-foreground shadow-sm shadow-black/10">
      <div className="flex items-center gap-1.5">
        <span className="text-sm opacity-80">Saldo total</span>
        <button
          type="button"
          onClick={() => setHidden((prev) => !prev)}
          aria-label={hidden ? "Mostrar saldo" : "Ocultar saldo"}
          className="opacity-80 transition-opacity hover:opacity-100"
        >
          {hidden ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
      <div
        className={`mt-1 text-4xl font-semibold transition-[filter] ${hidden ? "blur-md select-none" : ""}`}
      >
        {formatCurrency(balance)}
      </div>

      {balanceChangePercent !== null && (
        <div className="mt-1 flex items-center gap-1 text-xs opacity-90">
          <span>{isPositive ? "▲" : "▼"}</span>
          <span>{Math.abs(balanceChangePercent).toFixed(1)}% respecto al mes pasado</span>
        </div>
      )}

      {points.length > 1 && (
        <svg
          className="mt-3 h-16 w-full"
          viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path d={areaPath} fill="white" fillOpacity={0.18} stroke="none" />
          <path
            d={linePath}
            fill="none"
            stroke="white"
            strokeOpacity={0.9}
            strokeWidth={2}
            strokeLinecap="round"
          />
        </svg>
      )}
    </div>
  );
}
