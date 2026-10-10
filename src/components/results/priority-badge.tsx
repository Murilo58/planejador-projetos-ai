import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type PriorityLevel = "alta" | "media" | "baixa";

const LEVEL_STYLES: Record<PriorityLevel, string> = {
  alta: "bg-destructive/10 text-destructive",
  media: "bg-warning/10 text-warning",
  baixa: "bg-muted text-muted-foreground",
};

const LEVEL_LABEL: Record<PriorityLevel, string> = {
  alta: "Alta",
  media: "Média",
  baixa: "Baixa",
};

/**
 * Badge de prioridade com cor semântica (RF-049) — nunca a única forma de
 * comunicar o nível: o texto ("Alta"/"Média"/"Baixa") sempre acompanha a
 * cor (RNF-022 / acessibilidade).
 */
export function PriorityBadge({
  level,
  label,
}: {
  level: PriorityLevel;
  label?: string;
}) {
  return (
    <Badge className={cn("border-transparent", LEVEL_STYLES[level])}>
      {label ? `${label}: ` : ""}
      {LEVEL_LABEL[level]}
    </Badge>
  );
}
