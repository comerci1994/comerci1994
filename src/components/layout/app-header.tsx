import Link from "next/link";
import { Layers, LogOut } from "lucide-react";
import { signOut } from "@/auth";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";
import { NavLinks } from "./nav-links";

export function AppHeader({ user }: { user: { name: string | null; email: string } }) {
  return (
    <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center gap-2 px-4 sm:gap-4 sm:px-6">
        <Link href="/decks" className="flex items-center gap-2 font-semibold">
          <Layers className="size-5 text-primary" />
          <span className="hidden sm:inline">Flashcards</span>
        </Link>
        <NavLinks />
        <div className="ml-auto flex items-center gap-1">
          <span
            className="hidden max-w-48 truncate text-sm text-muted-foreground md:inline"
            title={user.email}
          >
            {user.name ?? user.email}
          </span>
          <ThemeToggle />
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
          >
            <Button variant="ghost" size="icon" type="submit" aria-label="Esci" title="Esci">
              <LogOut />
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
