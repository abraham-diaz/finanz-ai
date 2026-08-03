import { useCallback, useEffect, useState } from "react";
import { ArrowDownCircle, ArrowUpCircle, Plus, Settings, X } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BalanceHeroCard } from "@/components/balance-hero-card";
import { IncomeExpenseDonut } from "@/components/income-expense-donut";
import { CategoryBarChart } from "@/components/category-bar-chart";
import { AccountsCard } from "@/components/accounts-card";
import { CategoryFilterCard } from "@/components/category-filter-card";
import { SettingsView } from "@/components/settings-view";
import { AddTransactionSheet } from "@/components/add-transaction-sheet";
import { fetchDashboardSummary, fetchAccounts, type DashboardSummary, type Account } from "@/lib/api";
import { getDashboardOrder, type WidgetId } from "@/lib/dashboard-order";

function App() {
  const [view, setView] = useState<"dashboard" | "settings">("dashboard");
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<WidgetId[]>(() => getDashboardOrder());
  const [fabOpen, setFabOpen] = useState(false);
  const [addingType, setAddingType] = useState<"INCOME" | "EXPENSE" | null>(null);

  const loadAccounts = useCallback(() => {
    fetchAccounts()
      .then(setAccounts)
      .catch(() => setError("No se pudo cargar el dashboard. ¿Está el backend corriendo?"));
  }, []);

  const loadSummary = useCallback(() => {
    fetchDashboardSummary()
      .then(setSummary)
      .catch(() => setError("No se pudo cargar el dashboard. ¿Está el backend corriendo?"));
  }, []);

  useEffect(() => {
    loadSummary();
    loadAccounts();
  }, [loadSummary, loadAccounts]);

  if (view === "settings") {
    return (
      <SettingsView
        onBack={() => {
          setOrder(getDashboardOrder());
          setView("dashboard");
        }}
      />
    );
  }

  const widgetContent: Record<WidgetId, React.ReactNode> = summary
    ? {
        balance: (
          <BalanceHeroCard
            balance={summary.balance}
            balanceChangePercent={summary.balanceChangePercent}
            dailyBalance={summary.dailyBalance}
          />
        ),
        "income-expense": (
          <IncomeExpenseDonut
            month={summary.month}
            income={summary.income}
            expense={summary.expense}
          />
        ),
        accounts: <AccountsCard accounts={accounts} onChange={loadAccounts} />,
        categories: (
          <Card>
            <CardHeader>
              <CardTitle>Gastos por categoría</CardTitle>
            </CardHeader>
            <CardContent>
              <CategoryBarChart byCategory={summary.byCategory} />
            </CardContent>
          </Card>
        ),
        "category-filter": <CategoryFilterCard />,
      }
    : ({} as Record<WidgetId, React.ReactNode>);

  return (
    <div className="mx-auto max-w-md px-4 py-8">
      <div className="mb-2 flex justify-end">
        <button
          type="button"
          onClick={() => setView("settings")}
          aria-label="Ajustes"
          className="flex size-9 items-center justify-center rounded-full text-foreground/60 transition-colors hover:bg-foreground/5 hover:text-foreground"
        >
          <Settings className="size-5" />
        </button>
      </div>

      {!summary && !error && <p className="mb-4 text-sm text-foreground/60">Cargando...</p>}
      {error && <p className="text-sm text-[#dc2626]">{error}</p>}

      {summary && (
        <div className="flex flex-col gap-4">
          {order.map((id) => (
            <div key={id}>{widgetContent[id]}</div>
          ))}
        </div>
      )}

      {fabOpen && (
        <button
          type="button"
          aria-label="Cerrar menú"
          onClick={() => setFabOpen(false)}
          className="fixed inset-0 z-40"
        />
      )}

      <div className="fixed right-6 bottom-6 z-50 flex flex-col items-end gap-3">
        {fabOpen && (
          <>
            <button
              type="button"
              onClick={() => {
                setFabOpen(false);
                setAddingType("INCOME");
              }}
              className="flex items-center gap-2 rounded-full bg-card py-2 pr-4 pl-3 text-sm font-medium text-card-foreground shadow-lg"
            >
              <ArrowUpCircle className="size-5 text-[#10b981]" />
              Ingreso
            </button>
            <button
              type="button"
              onClick={() => {
                setFabOpen(false);
                setAddingType("EXPENSE");
              }}
              className="flex items-center gap-2 rounded-full bg-card py-2 pr-4 pl-3 text-sm font-medium text-card-foreground shadow-lg"
            >
              <ArrowDownCircle className="size-5 text-[#ef4444]" />
              Gasto
            </button>
          </>
        )}

        <button
          type="button"
          onClick={() => setFabOpen((prev) => !prev)}
          aria-label={fabOpen ? "Cerrar menú" : "Añadir movimiento"}
          aria-expanded={fabOpen}
          className="flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-[background-color,transform] hover:bg-(--primary-hover)"
        >
          {fabOpen ? <X className="size-6" /> : <Plus className="size-6" />}
        </button>
      </div>

      {addingType && (
        <AddTransactionSheet
          type={addingType}
          onClose={() => setAddingType(null)}
          onCreated={() => {
            loadSummary();
            loadAccounts();
          }}
        />
      )}
    </div>
  );
}

export default App;
