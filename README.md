# AcessaNet Connect

Plataforma própria da AcessaNet de captive portal, Wi-Fi marketing e gestão de
visitantes, para o access point **Grandstream GWN7664ELR**.

## Estado atual (Fase 1-2 do roadmap)

- ✅ Scaffold do monorepo (`apps/`, `packages/`, `infra/`, `docs/`)
- ✅ Design system (`packages/ui`) com tokens extraídos da identidade visual real da
  AcessaNet (ver `docs/architecture/identidade-visual.md`)
- ✅ Portal público `/wifi` completo (5 telas: boas-vindas, cadastro, conectando,
  conectado, erros) rodando sobre um `GrandstreamMockProvider` — **sem integração real
  com o access point ainda**
- ✅ Backend inicial de cadastro, consentimentos e sessões (`apps/api`)
- ✅ Integração somente leitura com o painel Marketing do Site AcessaNet
- ⬜ Dashboard administrativo `/admin` (Fase 4)
- ⬜ Editor visual do captive portal (Fase 5)
- ⬜ Migrar o banco de desenvolvimento para banco central de produção (Fase 6)
- ⬜ Integração real Grandstream + FreeRADIUS (Fase 7-8) — depende de acesso ao
  equipamento físico e confirmação do modo de gerenciamento (local / GDMS / GWN
  Manager) e versão de firmware
- ⬜ Campanhas, analytics, testes E2E, hardening e deploy (Fase 9-10)

## Estrutura

```
apps/
  web/              # React + Vite + TS + Tailwind — portal público (e, futuramente, /admin)
packages/
  ui/               # design system: tokens + componentes
  shared/           # tipos e schemas Zod compartilhados
  grandstream/      # reservado para a Fase 7-8 (GrandstreamCaptivePortalService)
  config/           # tsconfig base compartilhado
infra/
  docker/ radius/ nginx/   # reservados para a Fase 6+
docs/
  architecture/ api/ captive-portal/ deployment/
```

## Rodando localmente

```bash
npm install
npm run dev          # sobe apps/web em http://localhost:5173/wifi
```

O frontend e a API possuem arquivos `.env.example`. O desenho de produção para vários
roteadores está em `docs/deployment/production-architecture.md`.

## Modo demonstração

Enquanto não há acesso ao GWN7664ELR, todo o fluxo de autorização em `/wifi` roda
contra `apps/web/src/features/portal/mock/grandstreamMockProvider.ts`. A tela de
cadastro tem um seletor "Cenário de demonstração" para forçar qualquer um dos estados
exigidos pela Seção 17 do briefing (sucesso, rejeitado, falha do AP, RADIUS
indisponível, timeout, sessão expirada, portal indisponível). Todas as telas exibem um
selo "Modo demonstração" enquanto esse provider estiver ativo, para nunca ser
confundido com uma autorização real.
