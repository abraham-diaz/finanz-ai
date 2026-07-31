import { Card } from "@/components/ui/card";
import { formatCurrency, formatMonthLabel } from "@/lib/format";

interface IncomeExpenseDonutProps {
  month: string;
  income: number;
  expense: number;
}

const SIZE = 88;
const STROKE = 10;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function IncomeExpenseDonut({ month, income, expense }: IncomeExpenseDonutProps) {
  const ratio = income > 0 ? expense / income : 0;
  const percent = Math.round(ratio * 100);
  const dashOffset = CIRCUMFERENCE * (1 - Math.min(ratio, 1));

  return (
    <Card className="gap-3 px-5">
      <span className="text-sm text-card-foreground/60">{formatMonthLabel(month)}</span>

      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-3">
          <div>
            <span className="text-xs text-card-foreground/60">Ingresos</span>
            <div className="text-lg font-semibold text-[#10b981]">{formatCurrency(income)}</div>
          </div>
          <div>
            <span className="text-xs text-card-foreground/60">Gastos</span>
            <div className="text-lg font-semibold text-[#ef4444]">{formatCurrency(expense)}</div>
          </div>
        </div>

        <div className="relative shrink-0" style={{ width: SIZE, height: SIZE }}>
          <svg width={SIZE} height={SIZE} className="-rotate-90">
            <circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke="var(--muted)"
              strokeWidth={STROKE}
            />
            <circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke="var(--primary)"
              strokeWidth={STROKE}
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={dashOffset}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-base font-semibold text-card-foreground">{percent}%</span>
            <span className="text-[10px] text-card-foreground/50">gastado</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
