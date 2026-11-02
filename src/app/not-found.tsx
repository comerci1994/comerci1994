import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-4 text-center">
      <p className="text-sm font-medium text-muted-foreground">404</p>
      <h1 className="text-2xl font-semibold">Pagina non trovata</h1>
      <p className="text-muted-foreground">La risorsa non esiste o non hai i permessi per vederla.</p>
      <Button asChild variant="outline">
        <Link href="/decks">Torna ai mazzi</Link>
      </Button>
    </div>
  );
}
