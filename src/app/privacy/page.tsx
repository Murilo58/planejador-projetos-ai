import type { Metadata } from "next";

import { Container } from "@/components/layout/container";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

export const metadata: Metadata = {
  title: "Privacidade — Planejador de Projetos AI",
  description:
    "Como o Planejador de Projetos AI trata sua especificação, seus dados de conta e o uso de Inteligência Artificial.",
};

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 py-16 sm:py-20">
        <Container className="max-w-3xl">
          <h1 className="text-foreground text-3xl font-semibold tracking-tight sm:text-4xl">
            Privacidade
          </h1>
          <p className="text-muted-foreground mt-4 text-base leading-relaxed">
            Esta página explica, de forma direta, o que acontece com a
            especificação que você envia, com os dados da sua conta e com o uso
            de Inteligência Artificial no Planejador de Projetos AI.
          </p>

          <div className="mt-10 flex flex-col gap-10">
            <section>
              <h2 className="text-foreground text-lg font-semibold">
                Sua especificação (PDF ou texto)
              </h2>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                A especificação que você envia é usada apenas durante o
                processamento do seu planejamento. Quando enviada como PDF, o
                texto é extraído no seu próprio navegador — o arquivo original
                não é armazenado por nós. O conteúdo não compõe histórico: não
                existe, nesta versão do produto, um repositório permanente de
                especificações ou de documentos enviados.
              </p>
            </section>

            <section>
              <h2 className="text-foreground text-lg font-semibold">
                Uso de Inteligência Artificial
              </h2>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                A estruturação dos artefatos é feita com apoio de um provedor de
                Inteligência Artificial, acionado exclusivamente pelo nosso
                servidor — sua especificação nunca é enviada à IA diretamente
                pelo navegador, e a chave de acesso ao provedor nunca é exposta
                publicamente.
              </p>
            </section>

            <section>
              <h2 className="text-foreground text-lg font-semibold">
                Resultado da sua sessão
              </h2>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                O resultado gerado permanece disponível apenas durante a sua
                sessão de uso, para que você possa navegar entre as seções e
                exportá-lo. Ele não é salvo de forma permanente em nosso banco
                de dados.
              </p>
            </section>

            <section>
              <h2 className="text-foreground text-lg font-semibold">
                Dados de autenticação
              </h2>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                Para que você possa criar uma conta e entrar, armazenamos seu
                email e um hash seguro da sua senha — nunca a senha em texto
                simples. Esses dados ficam em um banco de dados PostgreSQL,
                usados exclusivamente para autenticação e operação básica da
                aplicação.
              </p>
            </section>

            <section>
              <h2 className="text-foreground text-lg font-semibold">
                O que não fazemos
              </h2>
              <ul className="text-muted-foreground mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed">
                <li>Não armazenamos o arquivo PDF original enviado.</li>
                <li>
                  Não mantemos um histórico permanente de planejamentos nesta
                  versão do produto.
                </li>
                <li>
                  Não usamos sua especificação para nenhuma finalidade além de
                  gerar o seu planejamento.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-foreground text-lg font-semibold">
                Cuidados recomendados
              </h2>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                Evite incluir na especificação dados sensíveis que não sejam
                necessários ao planejamento do projeto. O resultado gerado é um
                apoio à estruturação inicial e deve ser revisado pelo
                responsável pelo projeto antes de qualquer uso real.
              </p>
            </section>
          </div>
        </Container>
      </main>
      <SiteFooter />
    </>
  );
}
