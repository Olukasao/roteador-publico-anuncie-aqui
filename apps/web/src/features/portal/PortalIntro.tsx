import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { loadFrameSequence, playFrameSequence } from "./frameSequence";
import { loadH264Sequence, playH264Sequence, supportsWebCodecs } from "./h264Sequence";

// /wifi?diag=1 mostra na tela o que aconteceu com a intro (teste em celular real).
const DIAG = typeof window !== "undefined" && new URLSearchParams(window.location.search).has("diag");

interface PortalIntroProps {
  onComplete: () => void;
  /** Sem animação (ex. "reduzir movimento" ligado): só a tela da marca. */
  staticOnly?: boolean;
}

// Vídeo carregado mas parado depois disso = autoplay bloqueado → quadros no canvas.
const BLOCKED_CHECK_MS = 1200;
// Rede lenta: se nem vídeo nem quadros começarem até aqui, fica a tela da marca e segue.
const START_TIMEOUT_MS = 6000;
// Os prazos de fim contam a partir da reprodução real, não do carregamento da página.
const END_GRACE_MS = 800;
// Travou para bufferizar no meio do vídeo por mais que isso: libera o login.
const STALL_MAX_MS = 1500;
// Sem animação, a tela da marca fica pelo menos isso desde que o portal abriu.
const SPLASH_MIN_MS = 2200;
// Teto absoluto de segurança: a intro nunca segura o visitante além disso.
const INTRO_HARD_CAP_MS = 12000;

type Mode = "loading" | "video" | "anim";

const isPortrait = () =>
  typeof window.matchMedia !== "function" || window.matchMedia("(max-aspect-ratio: 1/1)").matches;

/**
 * Abertura do portal, antes da Tela 1, automática — sem toque e sem botões.
 *
 * 1. Tela da marca (`.brand-splash`, a mesma do index.html, que aparece antes do JS).
 * 2. Vídeo do globo (fonte em apps/web/media-src/acessanet-globe-intro) por cima, assim que
 *    começa a tocar.
 * 3. Se o aparelho bloqueia autoplay de vídeo (iPhone em modo economia, janela de captive
 *    portal, economia de dados), a mesma animação toca num <canvas>, que não depende da
 *    política de autoplay:
 *    - WebCodecs (h264Sequence.ts): o próprio H.264, decodificado pelo navegador — mesma
 *      qualidade e peso do vídeo (iOS 16.4+, Android/Chrome);
 *    - sem WebCodecs: quadros WebP soltos (frameSequence.ts), mais leves e menos nítidos.
 *    Os dois seguem o relógio: se o aparelho atrasar, pulam quadro em vez de "arrastar".
 *
 * Falha geral ou rede muito lenta: a tela da marca segura uns instantes e libera o login.
 * Nunca bloqueia a autenticação.
 */
export function PortalIntro({ onComplete, staticOnly = false }: PortalIntroProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const completedRef = useRef(false);
  const modeRef = useRef<Mode>("loading");
  const animStartedRef = useRef(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const playbackRef = useRef<{ stop: () => void }>();
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const mountedAtRef = useRef(Date.now());
  const [mode, setMode] = useState<Mode>("loading");
  const [diag, setDiag] = useState<string[]>([]);

  const log = (msg: string) => {
    if (DIAG) setDiag((d) => [...d, `${((Date.now() - mountedAtRef.current) / 1000).toFixed(1)}s ${msg}`]);
  };
  const later = (fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms);
    timersRef.current.push(id);
    return id;
  };

  // Em ?diag=1 a intro só fecha tocando no quadro, para dar tempo de ler o diagnóstico.
  const finish = (manual = false) => {
    if (completedRef.current || (DIAG && !manual)) return;
    completedRef.current = true;
    onComplete();
  };

  const enterMode = (next: Mode) => {
    modeRef.current = next;
    setMode(next);
  };

  // Autoplay de vídeo bloqueado ou vídeo sem fonte tocável: toca os quadros no canvas.
  const switchToAnim = (reason: string) => {
    if (completedRef.current || animStartedRef.current || modeRef.current === "video") return;
    animStartedRef.current = true;
    log(`vídeo indisponível (${reason}) → quadros no canvas`);
    videoRef.current?.pause();
    const portrait = isPortrait();
    const onEnd = () => later(finish, END_GRACE_MS);
    const showCanvas = (label: string) => {
      log(`${label} na tela`);
      enterMode("anim");
    };

    const playFrames = () =>
      loadFrameSequence(portrait ? "/intro/globe-portrait.frames" : "/intro/globe-landscape.frames").then((seq) => {
        const canvas = canvasRef.current;
        if (completedRef.current || !canvas) return;
        const playback = playFrameSequence(canvas, seq, onEnd);
        playbackRef.current = playback;
        return playback.started.then(() => showCanvas("quadros WebP"));
      });

    const playH264 = () =>
      loadH264Sequence(portrait ? "/intro/globe-portrait.h264seq" : "/intro/globe-landscape.h264seq").then((seq) => {
        const canvas = canvasRef.current;
        if (completedRef.current || !canvas) return;
        const playback = playH264Sequence(canvas, seq, onEnd);
        playbackRef.current = playback;
        return playback.started.then(() => showCanvas("H.264 via WebCodecs"));
      });

    (supportsWebCodecs()
      ? playH264().catch((err: Error) => {
          log(`WebCodecs falhou (${err.message}) → quadros WebP`);
          playbackRef.current?.stop();
          return playFrames();
        })
      : playFrames()
    ).catch((err: Error) => {
      log(`animação falhou: ${err.message}`);
      later(finish, Math.max(800, SPLASH_MIN_MS - (Date.now() - mountedAtRef.current)));
    });
  };

  // <source> com `media` que não casa com a tela também dispara `error` (é assim que o
  // navegador pula para o próximo). Só desiste quando de fato não sobrou fonte tocável.
  const handleMediaError = () => {
    later(() => {
      const video = videoRef.current;
      if (!video || video.error || video.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) {
        switchToAnim(`erro de mídia ${video?.error?.code ?? "sem fonte"}`);
      }
    }, 50);
  };

  useEffect(() => {
    if (staticOnly) {
      later(finish, SPLASH_MIN_MS);
      return () => timersRef.current.forEach(clearTimeout);
    }

    const video = videoRef.current;
    later(finish, INTRO_HARD_CAP_MS);
    later(() => {
      if (modeRef.current === "loading") {
        log("nada começou a tempo → login");
        finish();
      }
    }, START_TIMEOUT_MS);
    // Vídeo já tem dados mas não andou: é bloqueio de autoplay, não rede lenta.
    later(() => {
      if (video && modeRef.current === "loading" && video.paused && video.readyState >= 2) {
        switchToAnim("carregado mas parado");
      }
    }, BLOCKED_CHECK_MS);

    let endTimer: ReturnType<typeof setTimeout> | undefined;
    let stallTimer: ReturnType<typeof setTimeout> | undefined;

    const onPlaying = () => {
      if (!video || animStartedRef.current) return;
      log(`tocando ${video.currentSrc.split("/").pop()}`);
      enterMode("video");
      clearTimeout(stallTimer);
      clearTimeout(endTimer);
      const remaining = Number.isFinite(video.duration) ? video.duration - video.currentTime : 4;
      endTimer = setTimeout(() => finish(), remaining * 1000 + END_GRACE_MS);
    };
    const onWaiting = () => {
      clearTimeout(endTimer);
      clearTimeout(stallTimer);
      stallTimer = setTimeout(() => finish(), STALL_MAX_MS);
    };

    if (video) {
      video.addEventListener("playing", onPlaying);
      video.addEventListener("waiting", onWaiting);
      // React não renderiza o atributo `muted`; iOS exige o vídeo mudo antes do play().
      video.muted = true;
      video.defaultMuted = true;
      video.play()?.then(
        () => log("play() ok"),
        (err: Error) => {
          log(`play() recusado: ${err?.name ?? err}`);
          // AbortError = o navegador trocou de <source> no meio; o autoplay segue sozinho.
          if (err?.name === "AbortError" || !video.paused) return;
          switchToAnim(`play() ${err?.name ?? "recusado"}`);
        },
      );
    }

    return () => {
      timersRef.current.forEach(clearTimeout);
      clearTimeout(endTimer);
      clearTimeout(stallTimer);
      video?.removeEventListener("playing", onPlaying);
      video?.removeEventListener("waiting", onWaiting);
      playbackRef.current?.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="flex w-full flex-1"
    >
      {/* Mesma marcação da tela do index.html: a troca do HTML estático para o React é invisível. */}
      <div className="brand-splash" aria-label="AcessaNet">
        <img
          className="brand-splash__logo"
          src="/brand/logo-acessanet-splash.webp"
          width={880}
          height={328}
          alt="AcessaNet"
        />
        <p className="brand-splash__tagline">
          Conecte-se ao que <b>importa.</b>
        </p>
      </div>

      {!staticOnly && (
        <video
          ref={videoRef}
          className="portal-intro-video pointer-events-none fixed inset-0 z-[21] h-full w-full transition-opacity duration-300"
          style={{ opacity: mode === "video" ? 1 : 0 }}
          autoPlay
          muted
          playsInline
          preload="auto"
          disablePictureInPicture
          aria-hidden
          onEnded={() => finish()}
          onError={handleMediaError}
        >
          {/* Retrato primeiro: navegadores antigos que ignoram `media` ficam com ele (a maioria
              dos visitantes do captive portal está no celular); telas largas recebem o 16:9.
              MP4 (H.264) antes do WebM: toca em qualquer celular, inclusive iPhone. */}
          <source src="/intro/globe-portrait.mp4" type="video/mp4" media="(max-aspect-ratio: 1/1)" />
          <source src="/intro/globe-portrait.webm" type="video/webm" media="(max-aspect-ratio: 1/1)" />
          <source src="/intro/globe-landscape.mp4" type="video/mp4" />
          {/* onError do <video> não dispara para falha de <source>; o último cobre todas. */}
          <source src="/intro/globe-landscape.webm" type="video/webm" onError={handleMediaError} />
        </video>
      )}

      {!staticOnly && (
        <canvas
          ref={canvasRef}
          aria-hidden
          className="portal-intro-video pointer-events-none fixed inset-0 z-[22] h-full w-full"
          style={{ opacity: mode === "anim" ? 1 : 0 }}
        />
      )}

      {DIAG && (
        <pre
          onClick={() => finish(true)}
          className="fixed left-2 right-2 top-2 z-40 max-h-[40vh] overflow-auto rounded bg-black/70 p-2 text-[10px] leading-tight text-green-300"
        >
          {[
            `UA: ${navigator.userAgent}`,
            `mp4 H.264: ${document.createElement("video").canPlayType('video/mp4; codecs="avc1.4D401F"') || "não"}`,
            `webm VP9: ${document.createElement("video").canPlayType('video/webm; codecs="vp9"') || "não"}`,
            `reduzir movimento: ${staticOnly ? "sim" : "não"}`,
            `modo: ${mode}`,
            ...diag,
            "(toque aqui para fechar)",
          ].join("\n")}
        </pre>
      )}
    </motion.div>
  );
}
