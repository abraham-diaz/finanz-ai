const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export interface CategoryBreakdown {
  categoryId: string;
  categoryName: string;
  icon: string | null;
  total: number;
}

export interface DailyBalancePoint {
  date: string;
  balance: number;
}

export interface DashboardSummary {
  month: string;
  income: number;
  expense: number;
  balance: number;
  balanceChangePercent: number | null;
  dailyBalance: DailyBalancePoint[];
  byCategory: CategoryBreakdown[];
}

export async function fetchDashboardSummary(month?: string): Promise<DashboardSummary> {
  const url = new URL("/dashboard/summary", API_URL);
  if (month) url.searchParams.set("month", month);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch dashboard summary: ${response.status}`);
  }
  return response.json();
}

export interface Account {
  id: string;
  name: string;
  balance: number;
}

export async function fetchAccounts(): Promise<Account[]> {
  const response = await fetch(new URL("/account", API_URL));
  if (!response.ok) {
    throw new Error(`Failed to fetch accounts: ${response.status}`);
  }
  return response.json();
}

export async function createAccount(data: { name: string; balance: number }): Promise<Account> {
  const response = await fetch(new URL("/account", API_URL), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error(`Failed to create account: ${response.status}`);
  }
  return response.json();
}

export async function updateAccount(
  id: string,
  data: { name?: string; balance?: number }
): Promise<Account> {
  const response = await fetch(new URL(`/account/${id}`, API_URL), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error(`Failed to update account: ${response.status}`);
  }
  return response.json();
}

export interface Category {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
}

async function readJsonOrThrow(response: Response, action: string) {
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message ?? `Failed to ${action}: ${response.status}`);
  }
  return response.json();
}

export async function fetchCategories(): Promise<Category[]> {
  const response = await fetch(new URL("/category", API_URL));
  return readJsonOrThrow(response, "fetch categories");
}

export async function createCategory(data: {
  name: string;
  description?: string;
  icon?: string;
}): Promise<Category> {
  const response = await fetch(new URL("/category", API_URL), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return readJsonOrThrow(response, "create category");
}

export async function updateCategory(
  id: string,
  data: { name?: string; description?: string; icon?: string }
): Promise<Category> {
  const response = await fetch(new URL(`/category/${id}`, API_URL), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return readJsonOrThrow(response, "update category");
}

export async function deleteCategory(id: string): Promise<void> {
  const response = await fetch(new URL(`/category/${id}`, API_URL), { method: "DELETE" });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message ?? `Failed to delete category: ${response.status}`);
  }
}
