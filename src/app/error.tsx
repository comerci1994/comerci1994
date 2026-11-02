"use client";

import { Button } from "@/components/ui/button";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-4 text-center">
      <h1 className="text-2xl font-semibold">Qualcosa è andato storto</h1>
      <p className="max-w-md text-muted-foreground">
        Si è verificato un errore imprevisto. Riprova; se il problema persiste, ricarica la pagina.
      </p>
      {error.digest && <p className="font-mono text-xs text-muted-foreground">ref: {error.digest}</p>}
      <Button onClick={reset}>Riprova</Button>
    </div>
  );
}
