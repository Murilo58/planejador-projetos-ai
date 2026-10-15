import type { HybridGovernance } from "@/lib/ai/schemas/hybrid";

/**
 * Rótulos do vínculo de um item ágil com a EAP, idênticos na tela e nas
 * exportações. Os códigos já foram validados contra a EAP
 * (`findHybridIntegrityIssues`); o nome só é omitido se, por algum
 * motivo, o código não for encontrado.
 */

/** "1.2 Agendamento online". */
export function createEapLabel(governance: HybridGovernance) {
  const names = new Map<string, string>();
  for (const deliverable of governance.eap.deliverables) {
    names.set(deliverable.code, deliverable.name);
    for (const sub of deliverable.subDeliverables ?? []) {
      names.set(sub.code, sub.name);
    }
  }

  return (eapCode: string) => {
    const name = names.get(eapCode);
    return name ? `${eapCode} ${name}` : eapCode;
  };
}

/** "US-02 · EAP 1.2 Agendamento online". */
export function createItemReference(governance: HybridGovernance) {
  const eapLabel = createEapLabel(governance);
  return (id: string, eapCode: string) => `${id} · EAP ${eapLabel(eapCode)}`;
}
