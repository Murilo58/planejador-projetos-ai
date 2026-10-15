/**
 * Observações curtas da consolidação — apoio à revisão na tela, nunca
 * parte do documento impresso.
 */
export function ValidationNotes({ notes }: { notes: string[] }) {
  if (notes.length === 0) {
    return null;
  }

  return (
    <details className="border-border bg-muted/40 rounded-lg border p-4 text-sm print:hidden">
      <summary className="text-foreground cursor-pointer font-medium">
        Observações da validação ({notes.length})
      </summary>
      <ul className="text-muted-foreground mt-2 list-disc space-y-1 pl-5">
        {notes.map((note) => (
          <li key={note}>{note}</li>
        ))}
      </ul>
    </details>
  );
}
