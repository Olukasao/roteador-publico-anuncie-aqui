# AcessaNet — abertura cinematográfica (fonte HyperFrames)

Intro de 3 s do captive portal: ponto de luz → feixes convergem → ondas de conexão →
logotipo oficial → "Conecte-se ao que importa." → fade para o fundo exato da tela de login.

Tudo é local (GSAP em `assets/gsap.min.js`, Poppins em `assets/fonts/`, logo PNG original
877×327 em `assets/logo-acessanet.png`): nenhum CDN no render.

## Estrutura

| Arquivo                          | Papel                                                        |
| -------------------------------- | ------------------------------------------------------------ |
| `index.html`                     | Entrada vertical 1080×1920 (a única na raiz do projeto)      |
| `formats/horizontal.html`        | Entrada horizontal 1920×1080, mesmas camadas                 |
| `compositions/atmosphere.html`   | Véu escuro, névoa volumétrica, feixe difuso, partículas      |
| `compositions/energy.html`       | Ponto luminoso, feixes, convergência, horizonte, ondas, rede |
| `compositions/brand.html`        | Luz atrás da marca, logo + reflexo, filete, assinatura       |

As camadas usam px a partir do centro do quadro (âncora em `50%, 50% - 60px`). Como as
duas telas têm 1920 px no lado maior, o mesmo layout serve às duas — só o recorte muda.

## Regerar

```bash
cd /tmp   # rodar de fora: dentro de apps/web o CLI detecta o index.html do Vite
P=/home/noc/roteador-publico/apps/web/media-src/acessanet-intro
npx hyperframes check  $P
npx hyperframes render $P -f 60 -q delivery -o $P/renders/acessanet-intro-vertical.mp4
npx hyperframes render $P -c formats/horizontal.html -f 60 -q delivery -o $P/renders/acessanet-intro-horizontal.mp4

cd $P/renders
# Versão captive portal: 720×1280, 30 fps, H.264 Main 3.1 (iOS/Android), sem áudio, faststart
ffmpeg -y -i acessanet-intro-vertical.mp4 -an -vf "scale=720:1280:flags=lanczos,fps=30" \
  -c:v libx264 -profile:v main -level 3.1 -pix_fmt yuv420p -preset veryslow -tune film -crf 20 \
  -movflags +faststart acessanet-intro-mobile-optimized.mp4
# Poster = quadro da marca completa (fallback se o vídeo não carregar)
ffmpeg -y -ss 2.3 -i acessanet-intro-vertical.mp4 -frames:v 1 -vf "scale=720:1280:flags=lanczos" \
  -c:v libwebp -quality 82 -compression_level 6 acessanet-intro-poster.webp
```

Se a duração mudar, ajuste `data-duration` nas duas entradas e `INTRO_MAX_MS` em
`src/features/portal/PortalIntro.tsx`.
