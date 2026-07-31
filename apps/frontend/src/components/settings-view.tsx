import { useEffect, useState } from "react";
import { ArrowDown, ArrowLeft, ArrowUp, Check, Pencil, Plus, Trash2, X } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  fetchRecurringExpenses,
  createRecurringExpense,
  updateRecurringExpense,
  deleteRecurringExpense,
  type Category,
  type RecurringExpense,
} from "@/lib/api";
import {
  WIDGETS,
  getDashboardOrder,
  saveDashboardOrder,
  moveWidget,
  type WidgetId,
} from "@/lib/dashboard-order";
import { ICON_OPTIONS, resolveCategoryIcon } from "@/lib/category-icon";
import { formatCurrency } from "@/lib/format";

interface SettingsViewProps {
  onBack: () => void;
}

export function SettingsView({ onBack }: SettingsViewProps) {
  return (
    <div className="mx-auto max-w-md px-4 py-8">
      <div className="mb-4 flex items-center gap-2">
        <button
          type="button"
          onClick={onBack}
          aria-label="Volver"
          className="flex size-9 items-center justify-center rounded-full text-foreground/60 transition-colors hover:bg-foreground/5 hover:text-foreground"
        >
          <ArrowLeft className="size-5" />
        </button>
        <h1 className="text-lg font-semibold text-foreground">Ajustes</h1>
      </div>

      <div className="flex flex-col gap-4">
        <ReorderSection />
        <CategoriesSection />
        <RecurringExpensesSection />
      </div>
    </div>
  );
}

function ReorderSection() {
  const [order, setOrder] = useState<WidgetId[]>(() => getDashboardOrder());
  const labelById = new Map(WIDGETS.map((widget) => [widget.id, widget.label]));

  function move(index: number, direction: -1 | 1) {
    const next = moveWidget(order, index, direction);
    setOrder(next);
    saveDashboardOrder(next);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Orden de la pantalla principal</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {order.map((id, index) => (
          <div
            key={id}
            className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2"
          >
            <span className="text-sm text-card-foreground">{labelById.get(id)}</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => move(index, -1)}
                disabled={index === 0}
                aria-label="Mover arriba"
                className="flex size-7 items-center justify-center rounded-full text-card-foreground/50 hover:text-card-foreground disabled:opacity-30"
              >
                <ArrowUp className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => move(index, 1)}
                disabled={index === order.length - 1}
                aria-label="Mover abajo"
                className="flex size-7 items-center justify-center rounded-full text-card-foreground/50 hover:text-card-foreground disabled:opacity-30"
              >
                <ArrowDown className="size-4" />
              </button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

interface IconPickerProps {
  value: string;
  onChange: (name: string) => void;
}

function IconPicker({ value, onChange }: IconPickerProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {ICON_OPTIONS.map(({ name, icon: Icon }) => {
        const selected = value === name;
        return (
          <button
            key={name}
            type="button"
            onClick={() => onChange(name)}
            aria-label={name}
            aria-pressed={selected}
            className={`flex size-9 items-center justify-center rounded-full border transition-colors ${
              selected
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-card-foreground/60 hover:border-primary hover:text-card-foreground"
            }`}
          >
            <Icon className="size-4" />
          </button>
        );
      })}
    </div>
  );
}

function CategoriesSection() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editIcon, setEditIcon] = useState("");
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newIcon, setNewIcon] = useState("");

  function load() {
    fetchCategories()
      .then(setCategories)
      .catch(() => setError("No se pudieron cargar las categorías."));
  }

  useEffect(load, []);

  async function saveEdit(id: string) {
    if (!editName.trim()) return;
    try {
      await updateCategory(id, {
        name: editName.trim(),
        description: editDescription.trim() || undefined,
        icon: editIcon || undefined,
      });
      setEditingId(null);
      setError(null);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo actualizar la categoría.");
    }
  }

  async function saveNew() {
    if (!newName.trim()) return;
    try {
      await createCategory({
        name: newName.trim(),
        description: newDescription.trim() || undefined,
        icon: newIcon || undefined,
      });
      cancelNew();
      setError(null);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear la categoría.");
    }
  }

  async function remove(id: string) {
    if (!window.confirm("¿Eliminar esta categoría?")) return;
    try {
      await deleteCategory(id);
      setError(null);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo eliminar la categoría.");
    }
  }

  function cancelNew() {
    setNewName("");
    setNewDescription("");
    setNewIcon("");
    setAdding(false);
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Categorías</CardTitle>
        <button
          type="button"
          onClick={() => (adding ? cancelNew() : setAdding(true))}
          aria-label={adding ? "Cancelar" : "Añadir categoría"}
          className="flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground"
        >
          {adding ? <X className="size-4" /> : <Plus className="size-4" />}
        </button>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {error && <p className="text-sm text-[#dc2626]">{error}</p>}
        {categories.length === 0 && !adding && (
          <p className="text-sm text-card-foreground/70">Todavía no has añadido ninguna categoría.</p>
        )}

        {categories.map((category) => {
          const CategoryIcon = resolveCategoryIcon(category.name, category.icon);
          return (
            <div
              key={category.id}
              className="flex flex-col gap-2 border-b border-border pb-3 last:border-0 last:pb-0"
            >
              {editingId === category.id ? (
                <div className="flex flex-col gap-2">
                  <input
                    value={editName}
                    onChange={(event) => setEditName(event.target.value)}
                    placeholder="Nombre"
                    className="rounded-md border border-border bg-transparent px-2 py-1 text-sm text-card-foreground outline-none focus:border-primary"
                    autoFocus
                  />
                  <input
                    value={editDescription}
                    onChange={(event) => setEditDescription(event.target.value)}
                    placeholder="Descripción (opcional)"
                    className="rounded-md border border-border bg-transparent px-2 py-1 text-sm text-card-foreground outline-none focus:border-primary"
                  />
                  <IconPicker value={editIcon} onChange={setEditIcon} />
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => saveEdit(category.id)} aria-label="Guardar">
                      <Check className="size-4 text-[#10b981]" />
                    </button>
                    <button type="button" onClick={() => setEditingId(null)} aria-label="Cancelar">
                      <X className="size-4 text-card-foreground/40" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-card-foreground/70">
                      <CategoryIcon className="size-4" />
                    </span>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-card-foreground">
                        {category.name}
                      </div>
                      {category.description && (
                        <div className="truncate text-xs text-card-foreground/60">
                          {category.description}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(category.id);
                        setEditName(category.name);
                        setEditDescription(category.description ?? "");
                        setEditIcon(category.icon ?? "");
                      }}
                      aria-label="Editar"
                      className="flex size-7 items-center justify-center text-card-foreground/40 hover:text-card-foreground"
                    >
                      <Pencil className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(category.id)}
                      aria-label="Eliminar"
                      className="flex size-7 items-center justify-center text-card-foreground/40 hover:text-[#dc2626]"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {adding && (
          <div className="flex flex-col gap-2 border-t border-border pt-3">
            <input
              value={newName}
              onChange={(event) => setNewName(event.target.value)}
              placeholder="Nombre"
              className="rounded-md border border-border bg-transparent px-2 py-1 text-sm text-card-foreground outline-none focus:border-primary"
              autoFocus
            />
            <input
              value={newDescription}
              onChange={(event) => setNewDescription(event.target.value)}
              placeholder="Descripción (opcional)"
              className="rounded-md border border-border bg-transparent px-2 py-1 text-sm text-card-foreground outline-none focus:border-primary"
            />
            <IconPicker value={newIcon} onChange={setNewIcon} />
            <div className="flex items-center gap-2">
              <button type="button" onClick={saveNew} aria-label="Guardar categoría">
                <Check className="size-4 text-[#10b981]" />
              </button>
              <button type="button" onClick={cancelNew} aria-label="Cancelar">
                <X className="size-4 text-card-foreground/40" />
              </button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface RecurringExpenseFormState {
  amount: string;
  description: string;
  dayOfMonth: string;
  categoryId: string;
  active: boolean;
}

const emptyRecurringExpenseForm: RecurringExpenseFormState = {
  amount: "",
  description: "",
  dayOfMonth: "",
  categoryId: "",
  active: true,
};

function RecurringExpensesSection() {
  const [expenses, setExpenses] = useState<RecurringExpense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<RecurringExpenseFormState>(emptyRecurringExpenseForm);
  const [adding, setAdding] = useState(false);
  const [newForm, setNewForm] = useState<RecurringExpenseFormState>(emptyRecurringExpenseForm);

  const categoryById = new Map(categories.map((category) => [category.id, category]));

  function load() {
    Promise.all([fetchRecurringExpenses(), fetchCategories()])
      .then(([expenseList, categoryList]) => {
        setExpenses(expenseList);
        setCategories(categoryList);
      })
      .catch(() => setError("No se pudieron cargar los gastos fijos."));
  }

  useEffect(load, []);

  function parseForm(form: RecurringExpenseFormState) {
    const amount = Number(form.amount);
    const dayOfMonth = Number(form.dayOfMonth);
    if (!form.categoryId || !Number.isFinite(amount) || amount <= 0) return null;
    if (!Number.isInteger(dayOfMonth) || dayOfMonth < 1 || dayOfMonth > 31) return null;
    return {
      amount,
      dayOfMonth,
      categoryId: form.categoryId,
      description: form.description.trim() || undefined,
      active: form.active,
    };
  }

  async function saveEdit(id: string) {
    const data = parseForm(editForm);
    if (!data) return;
    try {
      await updateRecurringExpense(id, data);
      setEditingId(null);
      setError(null);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo actualizar el gasto fijo.");
    }
  }

  async function saveNew() {
    const data = parseForm(newForm);
    if (!data) return;
    try {
      await createRecurringExpense(data);
      cancelNew();
      setError(null);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear el gasto fijo.");
    }
  }

  async function remove(id: string) {
    if (!window.confirm("¿Eliminar este gasto fijo?")) return;
    try {
      await deleteRecurringExpense(id);
      setError(null);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo eliminar el gasto fijo.");
    }
  }

  function cancelNew() {
    setNewForm(emptyRecurringExpenseForm);
    setAdding(false);
  }

  function renderForm(
    form: RecurringExpenseFormState,
    setForm: (updater: (prev: RecurringExpenseFormState) => RecurringExpenseFormState) => void,
  ) {
    return (
      <div className="flex flex-col gap-2">
        <input
          value={form.description}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, description: event.target.value }))
          }
          placeholder="Descripción (p.ej. Netflix)"
          className="rounded-md border border-border bg-transparent px-2 py-1 text-sm text-card-foreground outline-none focus:border-primary"
          autoFocus
        />
        <div className="flex gap-2">
          <input
            value={form.amount}
            onChange={(event) => setForm((prev) => ({ ...prev, amount: event.target.value }))}
            placeholder="Importe"
            type="number"
            min="0"
            step="0.01"
            className="w-1/2 rounded-md border border-border bg-transparent px-2 py-1 text-sm text-card-foreground outline-none focus:border-primary"
          />
          <input
            value={form.dayOfMonth}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, dayOfMonth: event.target.value }))
            }
            placeholder="Día del mes"
            type="number"
            min="1"
            max="31"
            className="w-1/2 rounded-md border border-border bg-transparent px-2 py-1 text-sm text-card-foreground outline-none focus:border-primary"
          />
        </div>
        <select
          value={form.categoryId}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, categoryId: event.target.value }))
          }
          className="rounded-md border border-border bg-transparent px-2 py-1 text-sm text-card-foreground outline-none focus:border-primary"
        >
          <option value="" disabled>
            Selecciona una categoría
          </option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm text-card-foreground/70">
          <input
            type="checkbox"
            checked={form.active}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, active: event.target.checked }))
            }
          />
          Activo
        </label>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Gastos fijos</CardTitle>
        <button
          type="button"
          onClick={() => (adding ? cancelNew() : setAdding(true))}
          aria-label={adding ? "Cancelar" : "Añadir gasto fijo"}
          className="flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground"
        >
          {adding ? <X className="size-4" /> : <Plus className="size-4" />}
        </button>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {error && <p className="text-sm text-[#dc2626]">{error}</p>}
        {expenses.length === 0 && !adding && (
          <p className="text-sm text-card-foreground/70">
            Todavía no has añadido ningún gasto fijo.
          </p>
        )}

        {expenses.map((expense) => {
          const category = categoryById.get(expense.categoryId);
          const CategoryIcon = resolveCategoryIcon(category?.name ?? "", category?.icon ?? null);
          return (
            <div
              key={expense.id}
              className="flex flex-col gap-2 border-b border-border pb-3 last:border-0 last:pb-0"
            >
              {editingId === expense.id ? (
                <div className="flex flex-col gap-2">
                  {renderForm(editForm, setEditForm)}
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => saveEdit(expense.id)} aria-label="Guardar">
                      <Check className="size-4 text-[#10b981]" />
                    </button>
                    <button type="button" onClick={() => setEditingId(null)} aria-label="Cancelar">
                      <X className="size-4 text-card-foreground/40" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-card-foreground/70">
                      <CategoryIcon className="size-4" />
                    </span>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-card-foreground">
                        {expense.description || category?.name || "Gasto fijo"}
                      </div>
                      <div className="truncate text-xs text-card-foreground/60">
                        {formatCurrency(expense.amount)} · día {expense.dayOfMonth}
                        {!expense.active && " · pausado"}
                      </div>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(expense.id);
                        setEditForm({
                          amount: String(expense.amount),
                          description: expense.description ?? "",
                          dayOfMonth: String(expense.dayOfMonth),
                          categoryId: expense.categoryId,
                          active: expense.active,
                        });
                      }}
                      aria-label="Editar"
                      className="flex size-7 items-center justify-center text-card-foreground/40 hover:text-card-foreground"
                    >
                      <Pencil className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(expense.id)}
                      aria-label="Eliminar"
                      className="flex size-7 items-center justify-center text-card-foreground/40 hover:text-[#dc2626]"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {adding && (
          <div className="flex flex-col gap-2 border-t border-border pt-3">
            {renderForm(newForm, setNewForm)}
            <div className="flex items-center gap-2">
              <button type="button" onClick={saveNew} aria-label="Guardar gasto fijo">
                <Check className="size-4 text-[#10b981]" />
              </button>
              <button type="button" onClick={cancelNew} aria-label="Cancelar">
                <X className="size-4 text-card-foreground/40" />
              </button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
