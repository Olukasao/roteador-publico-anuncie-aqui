// Empacota um MP4 H.264 sem B-frames num arquivo .h264seq para o player WebCodecs do portal
// (PortalIntro → h264Sequence.ts), que decodifica no navegador e desenha num <canvas> —
// sem <video>, então a política de autoplay não se aplica.
// Formato: "HFH264" + uint32 LE (tamanho do JSON) + JSON + bytes.
// JSON: {codec,width,height,fps,duration,description:[offset,length],samples:[[offset,length,key,timestampUs],...]}
// Uso: node tools/pack-h264.mjs <entrada.mp4> <saida.h264seq>   (precisa de ffprobe no PATH)
import fs from "node:fs";
import { execFileSync } from "node:child_process";

const [, , input, output] = process.argv;
const mp4 = fs.readFileSync(input);
const probe = (args) => JSON.parse(execFileSync("ffprobe", ["-v", "error", "-of", "json", ...args, input]).toString());

const stream = probe(["-select_streams", "v:0", "-show_entries", "stream=width,height,r_frame_rate,has_b_frames,duration"]).streams[0];
if (Number(stream.has_b_frames)) throw new Error("o stream tem B-frames: reencode com -bf 0");
const [num, den] = stream.r_frame_rate.split("/").map(Number);
const packets = probe(["-select_streams", "v:0", "-show_entries", "packet=pts_time,pos,size,flags"]).packets;

// avcC (configuração do decodificador) = payload da caixa 'avcC' do MP4.
const at = mp4.indexOf(Buffer.from("avcC"));
if (at < 4) throw new Error("caixa avcC não encontrada");
const avcC = mp4.subarray(at + 4, at - 4 + mp4.readUInt32BE(at - 4));
const hex = (n) => n.toString(16).padStart(2, "0");
const codec = `avc1.${hex(avcC[1])}${hex(avcC[2])}${hex(avcC[3])}`;

const chunks = [avcC];
let offset = avcC.length;
const samples = packets.map((p) => {
  const data = mp4.subarray(Number(p.pos), Number(p.pos) + Number(p.size));
  chunks.push(data);
  const entry = [offset, data.length, p.flags.includes("K") ? 1 : 0, Math.round(Number(p.pts_time) * 1e6)];
  offset += data.length;
  return entry;
});
const meta = {
  codec,
  width: stream.width,
  height: stream.height,
  fps: num / den,
  duration: Number(stream.duration),
  description: [0, avcC.length],
  samples,
};
const header = Buffer.from(JSON.stringify(meta));
const len = Buffer.alloc(4);
len.writeUInt32LE(header.length);
fs.writeFileSync(output, Buffer.concat([Buffer.from("HFH264"), len, header, ...chunks]));
console.log(`${samples.length} amostras, ${codec}, ${stream.width}x${stream.height} → ${output} (${(fs.statSync(output).size / 1024).toFixed(0)} KB)`);
