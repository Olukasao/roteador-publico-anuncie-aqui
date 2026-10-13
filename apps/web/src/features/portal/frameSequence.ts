/**
 * Player de sequência de quadros em <canvas> — a intro do globo quando o aparelho bloqueia
 * autoplay de vídeo. Canvas não passa pela política de autoplay, e cada quadro é um WebP
 * estático (decodificação rápida), ao contrário do WebP/GIF animado, que no Safari e em
 * celulares fracos decodifica devagar e "arrasta" a animação.
 *
 * O relógio manda: o quadro exibido é sempre o do tempo real decorrido. Se o aparelho não
 * acompanha, pula quadros em vez de desacelerar — a intro dura sempre o mesmo tempo.
 *
 * Arquivo .frames (gerado por media-src/acessanet-globe-intro/tools/pack-frames.mjs):
 * "HFSEQ1" + uint32 LE (tamanho do JSON) + JSON {fps,width,height,frames:[[offset,length]]}
 * + bytes dos quadros concatenados.
 */

export interface FrameSequence {
  fps: number;
  width: number;
  height: number;
  frames: Blob[];
}

type Decoded = ImageBitmap | HTMLImageElement;

// Quadros decodificados à frente do relógio (540×960×4 B ≈ 2 MB cada).
const LOOKAHEAD = 8;
// Quadros prontos antes de começar, para a abertura não engasgar.
const PREROLL = 6;

export async function loadFrameSequence(url: string): Promise<FrameSequence> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = await res.arrayBuffer();
  const text = new TextDecoder();
  if (text.decode(new Uint8Array(buf, 0, 6)) !== "HFSEQ1") throw new Error("formato inválido");
  const jsonLength = new DataView(buf).getUint32(6, true);
  const meta = JSON.parse(text.decode(new Uint8Array(buf, 10, jsonLength))) as {
    fps: number;
    width: number;
    height: number;
    frames: [number, number][];
  };
  const base = 10 + jsonLength;
  return {
    fps: meta.fps,
    width: meta.width,
    height: meta.height,
    frames: meta.frames.map(
      ([offset, length]) => new Blob([new Uint8Array(buf, base + offset, length)], { type: "image/webp" }),
    ),
  };
}

async function decodeFrame(blob: Blob): Promise<Decoded> {
  if (typeof createImageBitmap === "function") return createImageBitmap(blob);
  const img = new Image();
  const url = URL.createObjectURL(blob);
  img.src = url;
  try {
    await img.decode();
  } finally {
    URL.revokeObjectURL(url);
  }
  return img;
}

function releaseFrame(frame: Decoded) {
  if ("close" in frame) frame.close();
}

export interface FrameSequencePlayback {
  /** Resolve quando o primeiro quadro está na tela (rejeita se a decodificação falhar). */
  started: Promise<void>;
  stop: () => void;
}

export function playFrameSequence(
  canvas: HTMLCanvasElement,
  seq: FrameSequence,
  onEnd: () => void,
): FrameSequencePlayback {
  const ctx = canvas.getContext("2d");
  canvas.width = seq.width;
  canvas.height = seq.height;
  const total = seq.frames.length;
  const durationMs = (total / seq.fps) * 1000;
  const requested = new Set<number>();
  const ready = new Map<number, Decoded>();
  let stopped = false;
  let raf = 0;
  let shown = -1;
  let t0: number | undefined;

  const want = (i: number) => {
    const blob = seq.frames[i];
    if (!blob || requested.has(i)) return undefined;
    requested.add(i);
    return decodeFrame(blob).then((frame) => {
      // Já passou (ou parou): não guarda o quadro.
      if (stopped || i <= shown) releaseFrame(frame);
      else ready.set(i, frame);
    });
  };

  const show = (i: number) => {
    const frame = ready.get(i);
    if (!frame || !ctx) return;
    ctx.drawImage(frame, 0, 0, seq.width, seq.height);
    // Libera o que ficou para trás (inclusive quadros pulados).
    for (const [k, f] of ready) {
      if (k <= i) {
        if (k !== i) releaseFrame(f);
        ready.delete(k);
      }
    }
    releaseFrame(frame);
    shown = i;
  };

  const loop = (now: number) => {
    if (stopped) return;
    t0 ??= now;
    const elapsed = now - t0;
    const target = Math.min(total - 1, Math.floor((elapsed / 1000) * seq.fps));
    // O quadro mais recente já decodificado até o tempo atual.
    for (let i = target; i > shown; i--) {
      if (ready.has(i)) {
        show(i);
        break;
      }
    }
    for (let i = target + 1; i <= target + LOOKAHEAD; i++) want(i);
    if (elapsed >= durationMs) {
      onEnd();
      return;
    }
    raf = requestAnimationFrame(loop);
  };

  const started = (async () => {
    const preroll: Promise<void>[] = [];
    for (let i = 0; i < Math.min(PREROLL, total); i++) {
      const p = want(i);
      if (p) preroll.push(p);
    }
    for (let i = PREROLL; i < LOOKAHEAD; i++) want(i);
    await Promise.all(preroll);
    if (stopped) return;
    show(0);
    raf = requestAnimationFrame(loop);
  })();

  return {
    started,
    stop: () => {
      stopped = true;
      cancelAnimationFrame(raf);
      for (const f of ready.values()) releaseFrame(f);
      ready.clear();
    },
  };
}
