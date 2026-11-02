"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";

const order = ["system", "light", "dark"] as const;
const labels = { system: "Tema di sistema", light: "Tema chiaro", dark: "Tema scuro" };

const subscribe = () => () => {};

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  // Avoid hydration mismatch: theme is only known on the client.
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);
  const current = (mounted ? theme : "system") as (typeof order)[number];
  const next = order[(order.indexOf(current) + 1) % order.length];
  const Icon = current === "dark" ? Moon : current === "light" ? Sun : Monitor;

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(next)}
      aria-label={`${labels[current]} (passa a: ${labels[next].toLowerCase()})`}
      title={labels[current]}
    >
      <Icon />
    </Button>
  );
}
