# Identidade visual AcessaNet — origem dos tokens

Levantado a partir dos projetos AcessaNet já existentes nesta VM
(`Site-Acessanet`, `SiteAcessanetV2`, `RoletaAcessaNet`) em 2026-10-08, para que o
captive portal use a marca real em vez de uma paleta inventada.

- **Logo**: globo azul com linhas de fibra + wordmark "acessa" (cinza) + "NET" (azul
  gradiente). Copiado para `apps/web/public/brand/`:
  - `logo-acessanet-dark-text.png` — texto escuro, usar sobre fundos claros
  - `logo-acessanet-light-text.png` — texto claro, usar sobre fundos escuros/navy
  - `favicon.ico`
- **Cores**: família de azuis sobre navy (`packages/ui/src/tokens.css`, escala
  `--brand-50` a `--brand-950`), extraída de `landing.css`/`header.css` e confirmada
  independentemente em `RoletaAcessaNet`.
- **Tipografia**: Poppins (pesos 400-800), usada em todos os sites AcessaNet.
  Self-hosted em `apps/web/public/fonts/` (subset latin, ~39KB total) em vez de
  carregada via Google Fonts, para não depender de CDN externa no ambiente
  pré-autenticação do captive portal (Seção 16 do briefing).

Se a marca real divergir disso (ex.: guideline de marca oficial em PDF/Figma que o
time de marketing possua), os tokens em `packages/ui/src/tokens.css` devem ser
atualizados a partir dessa fonte oficial.
