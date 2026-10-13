# Intro do portal (fonte HyperFrames)

Fonte da animação de abertura do `/wifi`. Os arquivos servidos pelo app ficam em
`apps/web/public/intro/` — este diretório só existe para regerá-los.

```bash
cd apps/web/media-src/portal-intro
npx --yes hyperframes@0.8.143 render -f 30 -q looks -o /tmp/intro-master.mp4

# Versões web: sem áudio, H.264 main (iOS) + VP9 (Android/Chrome) + poster do 1º frame
ffmpeg -y -i /tmp/intro-master.mp4 -an -c:v libx264 -profile:v main -level 3.1 -pix_fmt yuv420p \
  -preset slow -crf 26 -movflags +faststart ../../public/intro/intro.mp4
ffmpeg -y -i /tmp/intro-master.mp4 -an -c:v libvpx-vp9 -b:v 0 -crf 38 -row-mt 1 -pix_fmt yuv420p \
  ../../public/intro/intro.webm
ffmpeg -y -i /tmp/intro-master.mp4 -frames:v 1 -q:v 4 ../../public/intro/intro-poster.jpg
```

O fundo da composição replica o gradiente do `PortalShell` para o último frame emendar
na tela de login. Se a duração mudar, ajuste `INTRO_MAX_MS` em `PortalIntro.tsx`.
