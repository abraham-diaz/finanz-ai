import {
  Car,
  Home,
  Utensils,
  HeartPulse,
  Sparkles,
  Shirt,
  GraduationCap,
  Plane,
  Coffee,
  Gift,
  Dumbbell,
  ShoppingBag,
  Gamepad2,
  PawPrint,
  Wallet,
  Tag,
  type LucideIcon,
} from "lucide-react";

export const ICON_OPTIONS: { name: string; icon: LucideIcon }[] = [
  { name: "Utensils", icon: Utensils },
  { name: "Car", icon: Car },
  { name: "Home", icon: Home },
  { name: "HeartPulse", icon: HeartPulse },
  { name: "Sparkles", icon: Sparkles },
  { name: "Shirt", icon: Shirt },
  { name: "GraduationCap", icon: GraduationCap },
  { name: "Plane", icon: Plane },
  { name: "Coffee", icon: Coffee },
  { name: "Gift", icon: Gift },
  { name: "Dumbbell", icon: Dumbbell },
  { name: "ShoppingBag", icon: ShoppingBag },
  { name: "Gamepad2", icon: Gamepad2 },
  { name: "PawPrint", icon: PawPrint },
  { name: "Wallet", icon: Wallet },
  { name: "Tag", icon: Tag },
];

const ICON_BY_NAME = new Map(ICON_OPTIONS.map((option) => [option.name, option.icon]));

const KEYWORD_ICONS: Array<{ keywords: string[]; icon: LucideIcon }> = [
  { keywords: ["comida", "aliment", "super", "restaur"], icon: Utensils },
  { keywords: ["transporte", "coche", "gasolina", "taxi", "bus", "metro"], icon: Car },
  { keywords: ["vivienda", "casa", "alquiler", "hipoteca"], icon: Home },
  { keywords: ["salud", "medic", "farmacia"], icon: HeartPulse },
  { keywords: ["ocio", "entreten", "diversion"], icon: Sparkles },
  { keywords: ["ropa", "moda"], icon: Shirt },
  { keywords: ["educa", "curso", "libro"], icon: GraduationCap },
  { keywords: ["viaje", "vacacion"], icon: Plane },
];

const CIRCLE_COLORS = ["#f97316", "#3b82f6", "#10b981", "#ec4899", "#a855f7", "#0ea5e9"];

export function getIconByName(name?: string | null): LucideIcon | undefined {
  return name ? ICON_BY_NAME.get(name) : undefined;
}

export function resolveCategoryIcon(name: string, icon?: string | null): LucideIcon {
  const stored = getIconByName(icon);
  if (stored) return stored;

  const normalized = name.toLowerCase();
  const match = KEYWORD_ICONS.find((entry) =>
    entry.keywords.some((keyword) => normalized.includes(keyword))
  );
  return match?.icon ?? Tag;
}

export function getCategoryColor(index: number): string {
  return CIRCLE_COLORS[index % CIRCLE_COLORS.length];
}
