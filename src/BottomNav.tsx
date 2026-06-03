import type { ReactElement } from "react";
import type { TopNav } from "./types";
import { cn } from "./utils";
import { Home, Utensils, Dumbbell, CalendarDays, User } from "lucide-react";

export function BottomNav({
  active,
  onChange,
}: {
  active: TopNav;
  onChange: (tab: TopNav) => void;
}): ReactElement {
  const items: Array<{ id: TopNav; label: string; icon: ReactElement }> = [
    { id: "Home", label: "Home", icon: <Home size={20} strokeWidth={1.5} /> },
    { id: "Nutrition", label: "Nutrition", icon: <Utensils size={20} strokeWidth={1.5} /> },
    { id: "Training", label: "Training", icon: <Dumbbell size={20} strokeWidth={1.5} /> },
    { id: "Log", label: "Log", icon: <CalendarDays size={20} strokeWidth={1.5} /> },
    { id: "Profile", label: "Profile", icon: <User size={20} strokeWidth={1.5} /> },
  ];

  return (
    <nav className="bottom-nav">
      {items.map(({ id, label, icon }) => (
        <button
          key={id}
          className={cn({
            "bottom-nav__item": true,
            "bottom-nav__item--active": active === id,
          })}
          onClick={() => onChange(id)}
        >
          <span className="bottom-nav__icon">{icon}</span>
          <span className="bottom-nav__label">{label}</span>
        </button>
      ))}
    </nav>
  );
}