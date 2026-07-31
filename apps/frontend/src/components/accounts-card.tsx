import { useState } from "react";
import { Check, Eye, EyeOff, Pencil, Plus, X } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import { createAccount, updateAccount, type Account } from "@/lib/api";

interface AccountsCardProps {
  accounts: Account[];
  onChange: () => void;
}

export function AccountsCard({ accounts, onChange }: AccountsCardProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newBalance, setNewBalance] = useState("");
  const [hidden, setHidden] = useState(false);

  async function saveEdit(id: string) {
    const balance = Number(editValue);
    if (Number.isNaN(balance)) return;
    await updateAccount(id, { balance });
    setEditingId(null);
    onChange();
  }

  async function saveNew() {
    if (!newName.trim()) return;
    const balance = Number(newBalance) || 0;
    await createAccount({ name: newName.trim(), balance });
    setNewName("");
    setNewBalance("");
    setAdding(false);
    onChange();
  }

  function cancelNew() {
    setNewName("");
    setNewBalance("");
    setAdding(false);
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <div className="flex items-center gap-1.5">
          <CardTitle>Cuentas</CardTitle>
          <button
            type="button"
            onClick={() => setHidden((prev) => !prev)}
            aria-label={hidden ? "Mostrar saldos" : "Ocultar saldos"}
            className="text-card-foreground/50 transition-colors hover:text-card-foreground"
          >
            {hidden ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
        <button
          type="button"
          onClick={() => (adding ? cancelNew() : setAdding(true))}
          aria-label={adding ? "Cancelar" : "Añadir cuenta"}
          className="flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground"
        >
          {adding ? <X className="size-4" /> : <Plus className="size-4" />}
        </button>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {accounts.length === 0 && !adding && (
          <p className="text-sm text-card-foreground/70">Todavía no has añadido ninguna cuenta.</p>
        )}

        {accounts.map((account) => (
          <div key={account.id} className="flex items-center justify-between gap-3">
            <span className="text-sm font-medium text-card-foreground">{account.name}</span>

            {editingId === account.id ? (
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  step="0.01"
                  value={editValue}
                  onChange={(event) => setEditValue(event.target.value)}
                  className="w-24 rounded-md border border-border bg-transparent px-2 py-1 text-right text-sm text-card-foreground outline-none focus:border-primary"
                  autoFocus
                />
                <button type="button" onClick={() => saveEdit(account.id)} aria-label="Guardar">
                  <Check className="size-4 text-[#10b981]" />
                </button>
                <button type="button" onClick={() => setEditingId(null)} aria-label="Cancelar">
                  <X className="size-4 text-card-foreground/40" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setEditingId(account.id);
                  setEditValue(String(account.balance));
                }}
                className="flex items-center gap-1.5 text-sm font-semibold text-card-foreground"
              >
                <span className={`transition-[filter] ${hidden ? "blur-sm select-none" : ""}`}>
                  {formatCurrency(account.balance)}
                </span>
                <Pencil className="size-3.5 text-card-foreground/40" />
              </button>
            )}
          </div>
        ))}

        {adding && (
          <div className="flex items-center gap-2 border-t border-border pt-3">
            <input
              placeholder="Nombre"
              value={newName}
              onChange={(event) => setNewName(event.target.value)}
              className="min-w-0 flex-1 rounded-md border border-border bg-transparent px-2 py-1 text-sm text-card-foreground outline-none focus:border-primary"
              autoFocus
            />
            <input
              placeholder="Saldo"
              type="number"
              step="0.01"
              value={newBalance}
              onChange={(event) => setNewBalance(event.target.value)}
              className="w-24 rounded-md border border-border bg-transparent px-2 py-1 text-right text-sm text-card-foreground outline-none focus:border-primary"
            />
            <button type="button" onClick={saveNew} aria-label="Guardar cuenta">
              <Check className="size-4 text-[#10b981]" />
            </button>
            <button type="button" onClick={cancelNew} aria-label="Cancelar">
              <X className="size-4 text-card-foreground/40" />
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
