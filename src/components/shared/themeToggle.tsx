"use client";

import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";

const THEME_STORAGE_KEY = "theme";
const THEME_CHANGE_EVENT = "themechange";

const subscribeToThemeChanges = (onChange: () => void) => {
  window.addEventListener(THEME_CHANGE_EVENT, onChange);
  return () => window.removeEventListener(THEME_CHANGE_EVENT, onChange);
};

const getThemeSnapshot = () =>
  document.documentElement.classList.contains("dark");

const getServerThemeSnapshot = () => false;

const ThemeToggle = () => {
  const isDark = useSyncExternalStore(
    subscribeToThemeChanges,
    getThemeSnapshot,
    getServerThemeSnapshot,
  );

  const toggleTheme = () => {
    const nextIsDark = !getThemeSnapshot();

    document.documentElement.classList.toggle("dark", nextIsDark);
    document.documentElement.dataset.theme = nextIsDark ? "dark" : "light";

    try {
      window.localStorage.setItem(
        THEME_STORAGE_KEY,
        nextIsDark ? "dark" : "light",
      );
    } catch {
      // Storage can be unavailable (private mode, blocked cookies, etc.).
    }

    window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
  };

  const label = isDark ? "Switch to light theme" : "Switch to dark theme";

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      aria-label={label}
      aria-pressed={isDark}
      title={label}
      className="text-green-800 hover:bg-green-50 hover:text-green-900 dark:text-lime-300 dark:hover:bg-green-900/40 dark:hover:text-lime-200"
    >
      <Sun aria-hidden="true" className="size-4 dark:hidden" />
      <Moon aria-hidden="true" className="hidden size-4 dark:block" />
    </Button>
  );
};

export default ThemeToggle;
