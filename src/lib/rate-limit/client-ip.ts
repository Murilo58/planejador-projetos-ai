import { headers } from "next/headers";

/**
 * IP do cliente, usado como chave de rate limiting (A2).
 *
 * Em produção na Vercel, isto é confiável mesmo contra um cliente
 * malicioso: a documentação oficial da Vercel afirma que a borda
 * **sobrescreve** o cabeçalho `x-forwarded-for` e **não repassa IPs
 * externos** — exatamente para impedir que o próprio cliente falsifique
 * esse valor (vercel.com/docs/headers/request-headers, seção
 * `x-forwarded-for`: "we currently overwrite the X-Forwarded-For header
 * and do not forward external IPs. This restriction is in place to
 * prevent IP spoofing."). `x-real-ip` é documentado como idêntico, usado
 * aqui só como fallback.
 *
 * Em desenvolvimento local (sem a borda da Vercel), esse cabeçalho
 * normalmente não existe — nesse caso, todas as requisições caem na
 * mesma chave fixa, o que é aceitável: rate limiting por IP não tem
 * sentido fora de produção com um único desenvolvedor.
 */
export async function getClientIp(): Promise<string> {
  const headerList = await headers();
  const forwarded =
    headerList.get("x-forwarded-for") ?? headerList.get("x-real-ip");
  if (!forwarded) return "unknown";
  return forwarded.split(",")[0]?.trim() || "unknown";
}
