const NOT_IDENTIFIED = "Não identificado na especificação.";

/** Destaca visualmente os campos marcados como ausentes (RF-052). */
export function FieldValue({ value }: { value: string }) {
  if (value.trim() === NOT_IDENTIFIED) {
    return <span className="text-muted-foreground italic">{value}</span>;
  }
  return <span className="text-muted-foreground">{value}</span>;
}

export function ListField({
  label,
  items,
}: {
  label: string;
  items: string[];
}) {
  return (
    <div>
      <p className="text-foreground font-medium">{label}</p>
      {items.length === 0 ? (
        <p className="text-muted-foreground italic">{NOT_IDENTIFIED}</p>
      ) : (
        <ul className="text-muted-foreground mt-1 list-disc space-y-0.5 pl-5">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
