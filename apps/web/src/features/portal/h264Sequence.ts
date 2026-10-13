/**
 * Player da intro via WebCodecs: decodifica H.264 no próprio navegador (decodificador de
 * hardware do aparelho) e desenha num <canvas>. Sem <video>, a política de autoplay não se
 * aplica — toca sozinho mesmo em iPhone no modo economia ou em janela de captive portal —
 * e com a qualidade e o peso do vídeo (o player de quadros soltos precisaria de 3–5× mais
 * bytes para a mesma nitidez).
 *
 * O relógio manda: exibe sempre o quadro do tempo real decorrido; se atrasar, pula quadros.
 *
 * Arquivo .h264seq (gerado por media-src/acessanet-globe-intro/tools/pack-h264.mjs, a partir
 * de um MP4 sem B-frames): "HFH264" + uint32 LE (tamanho do JSON) + JSON + bytes.
 */

interface H264Meta {
  codec: string;
  width: number;
  height: number;
  fps: number;
  duration: number;
  description: [number, number];
  samples: [number, number, number, number][];
}

export interface H264Sequence {
  config: VideoDecoderConfig;
  width: number;
  height: number;
  durationMs: number;
  chunks: EncodedVideoChunk[];
}

// Quadros decodificados mantidos à frente do relógio.
const AHEAD = 6;
// Quadros prontos antes de começar, para a abertura não engasgar.
const PREROLL = 3;

export function supportsWebCodecs(): boolean {
  return typeof window.VideoDecoder === "function" && typeof window.EncodedVideoChunk === "function";
}

export async function loadH264Sequence(url: string): Promise<H264Sequence> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = await res.arrayBuffer();
  const text = new TextDecoder();
  if (text.decode(new Uint8Array(buf, 0, 6)) !== "HFH264") throw new Error("formato inválido");
  const jsonLength = new DataView(buf).getUint32(6, true);
  const meta = JSON.parse(text.decode(new Uint8Array(buf, 10, jsonLength))) as H264Meta;
  const base = 10 + jsonLength;
  const [descOffset, descLength] = meta.description;
  const config: VideoDecoderConfig = {
    codec: meta.codec,
    codedWidth: meta.width,
    codedHeight: meta.height,
    description: new Uint8Array(buf, base + descOffset, descLength),
    optimizeForLatency: true,
  };
  const support = await VideoDecoder.isConfigSupported(config);
  if (!support.supported) throw new Error(`codec ${meta.codec} não suportado`);
  const frameUs = 1e6 / meta.fps;
  return {
    config,
    width: meta.width,
    height: meta.height,
    durationMs: (meta.samples.length * frameUs) / 1000,
    chunks: meta.samples.map(
      ([offset, length, key, timestamp]) =>
        new EncodedVideoChunk({
          type: key ? "key" : "delta",
          timestamp,
          duration: frameUs,
          data: new Uint8Array(buf, base + offset, length),
        }),
    ),
  };
}

export interface H264Playback {
  /** Resolve quando o primeiro quadro está na tela (rejeita se a decodificação falhar). */
  started: Promise<void>;
  stop: () => void;
}

export function playH264Sequence(canvas: HTMLCanvasElement, seq: H264Sequence, onEnd: () => void): H264Playback {
  const ctx = canvas.getContext("2d");
  canvas.width = seq.width;
  canvas.height = seq.height;
  const queue: VideoFrame[] = [];
  let next = 0;
  let flushed = false;
  let stopped = false;
  let raf = 0;
  let t0: number | undefined;
  let onFrame: (() => void) | undefined;
  let fail: ((err: Error) => void) | undefined;

  const decoder = new VideoDecoder({
    output: (frame) => {
      if (stopped) {
        frame.close();
        return;
      }
      queue.push(frame);
      onFrame?.();
    },
    error: (err) => fail?.(err instanceof Error ? err : new Error(String(err))),
  });
  decoder.configure(seq.config);

  // Mantém poucos quadros decodificados à frente (memória baixa mesmo em celular fraco).
  const feed = () => {
    if (decoder.state !== "configured") return;
    while (!stopped && next < seq.chunks.length && queue.length + decoder.decodeQueueSize < AHEAD) {
      decoder.decode(seq.chunks[next++]!);
    }
    if (!stopped && next >= seq.chunks.length && !flushed) {
      flushed = true;
      decoder.flush().catch(() => undefined);
    }
  };

  const draw = (frame: VideoFrame) => {
    ctx?.drawImage(frame, 0, 0, seq.width, seq.height);
    frame.close();
  };

  const loop = (now: number) => {
    if (stopped) return;
    t0 ??= now;
    const elapsedUs = (now - t0) * 1000;
    // Pega o quadro mais recente cujo tempo já chegou; os anteriores são pulados.
    let latest: VideoFrame | undefined;
    while (queue.length && queue[0]!.timestamp <= elapsedUs) {
      latest?.close();
      latest = queue.shift();
    }
    if (latest) draw(latest);
    feed();
    if (now - t0 >= seq.durationMs) {
      onEnd();
      return;
    }
    raf = requestAnimationFrame(loop);
  };

  const started = new Promise<void>((resolve, reject) => {
    fail = (err) => {
      stopped = true;
      reject(err);
    };
    onFrame = () => {
      if (queue.length < PREROLL && next < seq.chunks.length) return;
      onFrame = undefined;
      const first = queue.shift();
      if (first) draw(first);
      raf = requestAnimationFrame(loop);
      resolve();
    };
    feed();
  });

  return {
    started,
    stop: () => {
      stopped = true;
      cancelAnimationFrame(raf);
      queue.splice(0).forEach((f) => f.close());
      if (decoder.state !== "closed") decoder.close();
    },
  };
}
