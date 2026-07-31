export type WidgetId = "balance" | "income-expense" | "accounts" | "categories";

export const WIDGETS: { id: WidgetId; label: string }[] = [
  { id: "balance", label: "Saldo total" },
  { id: "income-expense", label: "Ingresos y gastos" },
  { id: "accounts", label: "Cuentas" },
  { id: "categories", label: "Gastos por categoría" },
];

const DEFAULT_ORDER: WidgetId[] = ["balance", "income-expense", "accounts", "categories"];
const STORAGE_KEY = "finanzai:dashboard-order";

export function getDashboardOrder(): WidgetId[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_ORDER;
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return DEFAULT_ORDER;
    const valid = parsed.filter((id): id is WidgetId =>
      DEFAULT_ORDER.includes(id as WidgetId)
    );
    const missing = DEFAULT_ORDER.filter((id) => !valid.includes(id));
    return [...valid, ...missing];
  } catch {
    return DEFAULT_ORDER;
  }
}

export function saveDashboardOrder(order: WidgetId[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(order));
}

export function moveWidget(order: WidgetId[], index: number, direction: -1 | 1): WidgetId[] {
  const target = index + direction;
  if (target < 0 || target >= order.length) return order;
  const next = [...order];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}
