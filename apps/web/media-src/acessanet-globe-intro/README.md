# AcessaNet — Global Data Globe (fonte HyperFrames + Three.js)

Intro de 4 s do captive portal com um globo 3D real (Three.js/WebGL) e marca em GSAP:

| Tempo     | Cena                                                                                   |
| --------- | -------------------------------------------------------------------------------------- |
| 0–0,8 s   | Brilho central sutil, partículas, órbitas começam a se desenhar, globo emerge; câmera aproxima |
| 0,8–1,8 s | Globo gira; órbitas com cometas de "fibra óptica"; primeiros rastros e arcos entre continentes |
| 1,8–2,8 s | Fluxos aceleram; mais arcos (Américas ↔ Europa ↔ África), nós pulsando nas cidades     |
| 2,8–3,5 s | Rotação desacelera, globo escurece; logo oficial + "Conecte-se ao que importa."        |
| 3,5–4 s   | Fade-out; o último frame é o gradiente exato do `PortalShell`                          |

## Estrutura

| Arquivo                       | Papel                                                                 |
| ----------------------------- | --------------------------------------------------------------------- |
| `index.html`                  | Entrada vertical 1080×1920 (importmap local do Three.js, GSAP, dados) |
| `formats/horizontal.html`     | Entrada horizontal 1920×1080, mesmas camadas                          |
| `compositions/globe.html`     | Cena Three.js: fundo do login, globo, atmosfera, continentes em pontos, órbitas, rastros, arcos, nós, partículas, bloom |
| `compositions/brand.html`     | Placa escura, luz, logo + reflexo, filete e assinatura (GSAP)         |
| `assets/land-dots.js`         | 4.792 pontos de terra pré-calculados do Natural Earth `land-110m` (domínio público) |
| `assets/three/`               | Three.js r181 + addons de pós-processamento, locais                   |

Determinismo: a cena Three.js é função pura do tempo do evento `hf-seek` (rotação e fluxos
por integral de passo fixo, sementes fixas); o bloom não usa histórico entre frames.
Enquadramento: o globo ocupa ~78% da largura no vertical e ~64% da altura no horizontal
(calculado do tamanho do canvas no setup).

Para trocar o logo, substitua `assets/logo-acessanet.png` (proporção 877×327) — o `src`
e a máscara do reflexo estão em `compositions/brand.html`.

## Regerar

```bash
cd /tmp   # rodar de fora de apps/web (senão o CLI pega o index.html do Vite)
P=/home/noc/roteador-publico/apps/web/media-src/acessanet-globe-intro
npx hyperframes check  $P
npx hyperframes render $P -f 30 -q delivery -o $P/renders/acessanet-globe-intro-vertical.mp4
npx hyperframes render $P -c formats/horizontal.html -f 30 -q delivery -o $P/renders/acessanet-globe-intro-horizontal.mp4

cd $P/renders
ffmpeg -y -i acessanet-globe-intro-vertical.mp4 -an -vf "scale=720:1280:flags=lanczos" \
  -c:v libx264 -profile:v main -level 3.1 -pix_fmt yuv420p -preset veryslow -crf 23 \
  -movflags +faststart acessanet-globe-intro-mobile.mp4
ffmpeg -y -ss 3.3 -i acessanet-globe-intro-vertical.mp4 -frames:v 1 -vf "scale=720:1280:flags=lanczos" \
  -c:v libwebp -quality 82 -compression_level 6 acessanet-globe-intro-poster.webp
```

Render em CPU (WebGL por software): ~4 min por versão a 30 fps nesta máquina; 60 fps dobra.
Para regerar os pontos de terra é preciso `world-atlas@2` + `topojson-client@3` (script de
rasterização: lat a cada 1,5°, ponto-em-polígono, longitudes proporcionais a cos(lat)).
