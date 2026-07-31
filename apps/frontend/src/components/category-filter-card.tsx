import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { fetchCategories, fetchTransactions, type Category, type Transaction } from "@/lib/api";
import { resolveCategoryIcon } from "@/lib/category-icon";
import { formatCurrency, formatDate } from "@/lib/format";

export function CategoryFilterCard() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch(() => setError("No se pudieron cargar las categorías."));
  }, []);

  useEffect(() => {
    if (selectedIds.length === 0) {
      setTransactions([]);
      return;
    }
    setLoading(true);
    setError(null);
    fetchTransactions(selectedIds)
      .then(setTransactions)
      .catch(() => setError("No se pudieron cargar los resultados."))
      .finally(() => setLoading(false));
  }, [selectedIds]);

  function toggleCategory(id: string) {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id]
    );
  }

  const categoryById = new Map(categories.map((category) => [category.id, category]));
  const total = transactions.reduce(
    (sum, transaction) =>
      sum + (transaction.transactionType === "EXPENSE" ? transaction.amount : -transaction.amount),
    0
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Filtrar por categoría</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => {
            const Icon = resolveCategoryIcon(category.name, category.icon);
            const selected = selectedIds.includes(category.id);
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => toggleCategory(category.id)}
                aria-pressed={selected}
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors ${
                  selected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-card-foreground/70 hover:bg-foreground/5"
                }`}
              >
                <Icon className="size-3.5" />
                {category.name}
              </button>
            );
          })}
          {categories.length === 0 && (
            <p className="text-sm text-card-foreground/60">Todavía no has creado categorías.</p>
          )}
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        {selectedIds.length === 0 && !error && (
          <p className="text-sm text-card-foreground/60">
            Selecciona una o más categorías para ver el resultado.
          </p>
        )}

        {selectedIds.length > 0 && !loading && (
          <>
            <div className="flex items-baseline justify-between border-t border-border pt-3">
              <span className="text-sm font-medium text-card-foreground/70">Total</span>
              <span className="text-lg font-semibold text-card-foreground">
                {formatCurrency(total)}
              </span>
            </div>

            {transactions.length === 0 ? (
              <p className="text-sm text-card-foreground/70">
                No hay movimientos para esta selección.
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {transactions.map((transaction) => {
                  const category = categoryById.get(transaction.categoryId);
                  const Icon = category
                    ? resolveCategoryIcon(category.name, category.icon)
                    : undefined;
                  return (
                    <div key={transaction.id} className="flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-2.5">
                        {Icon && (
                          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-card-foreground/70">
                            <Icon className="size-4" />
                          </span>
                        )}
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-card-foreground">
                            {transaction.description || category?.name || "Sin descripción"}
                          </p>
                          <p className="text-xs text-card-foreground/50">
                            {formatDate(transaction.date)}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`shrink-0 text-sm font-semibold ${
                          transaction.transactionType === "EXPENSE"
                            ? "text-card-foreground"
                            : "text-[#10b981]"
                        }`}
                      >
                        {transaction.transactionType === "EXPENSE" ? "-" : "+"}
                        {formatCurrency(transaction.amount)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
