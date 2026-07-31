import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createTransaction, fetchCategories, type Category } from "@/lib/api";
import { resolveCategoryIcon } from "@/lib/category-icon";

interface AddExpenseSheetProps {
  onClose: () => void;
  onCreated: () => void;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function AddExpenseSheet({ onClose, onCreated }: AddExpenseSheetProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(today());
  const [categoryId, setCategoryId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCategories()
      .then((data) => {
        setCategories(data);
        setCategoryId((current) => current || data[0]?.id || "");
      })
      .catch(() => setError("No se pudieron cargar las categorías."));
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const parsedAmount = Number(amount.replace(",", "."));
    if (!parsedAmount || parsedAmount <= 0) {
      setError("Introduce un importe válido.");
      return;
    }
    if (!categoryId) {
      setError("Selecciona una categoría.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await createTransaction({
        amount: parsedAmount,
        description: description.trim() || undefined,
        date,
        categoryId,
        transactionType: "EXPENSE",
      });
      onCreated();
      onClose();
    } catch {
      setError("No se pudo guardar el gasto.");
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button
        type="button"
        aria-label="Cerrar"
        onClick={onClose}
        className="absolute inset-0 bg-foreground/40"
      />
      <form
        onSubmit={handleSubmit}
        className="relative z-10 flex w-full max-w-md flex-col gap-4 rounded-t-2xl border border-border bg-card px-4 pt-4 pb-8 text-card-foreground"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Añadir gasto</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="flex size-8 items-center justify-center rounded-full text-card-foreground/60 hover:bg-foreground/5 hover:text-card-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="amount" className="text-sm font-medium text-card-foreground/70">
            Importe
          </label>
          <input
            id="amount"
            type="text"
            inputMode="decimal"
            placeholder="0,00"
            value={amount}
            onChange={(event) => {
              const value = event.target.value;
              if (/^[0-9]*[.,]?[0-9]*$/.test(value)) {
                setAmount(value);
              }
            }}
            className="rounded-md border border-border bg-transparent px-3 py-2 text-lg outline-none focus:border-primary"
            autoFocus
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="description" className="text-sm font-medium text-card-foreground/70">
            Descripción (opcional)
          </label>
          <input
            id="description"
            type="text"
            placeholder="Ej. Cena con amigos"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="rounded-md border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-primary"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="date" className="text-sm font-medium text-card-foreground/70">
            Fecha
          </label>
          <input
            id="date"
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="rounded-md border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-primary"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-card-foreground/70">Categoría</span>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const Icon = resolveCategoryIcon(category.name, category.icon);
              const selected = categoryId === category.id;
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setCategoryId(category.id)}
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
              <p className="text-sm text-card-foreground/60">
                Crea una categoría primero desde Ajustes.
              </p>
            )}
          </div>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button type="submit" disabled={saving} className="mt-1 h-11">
          {saving ? "Guardando..." : "Guardar gasto"}
        </Button>
      </form>
    </div>
  );
}
