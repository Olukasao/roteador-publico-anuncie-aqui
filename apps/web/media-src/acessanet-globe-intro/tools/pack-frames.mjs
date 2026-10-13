// Empacota quadros (WebP estáticos) num único arquivo .frames para o player em canvas
// do portal (PortalIntro). Formato: "HFSEQ1" + uint32 LE (tamanho do JSON) + JSON
// {fps,width,height,frames:[[offset,length],...]} + bytes dos quadros concatenados.
// Uso: node tools/pack-frames.mjs <pasta-com-quadros> <fps> <largura> <altura> <saida.frames>
import fs from "node:fs";
import path from "node:path";

const [, , dir, fps, width, height, out] = process.argv;
const files = fs.readdirSync(dir).filter((f) => f.endsWith(".webp")).sort();
const blobs = files.map((f) => fs.readFileSync(path.join(dir, f)));
let offset = 0;
const frames = blobs.map((b) => {
  const entry = [offset, b.length];
  offset += b.length;
  return entry;
});
const header = Buffer.from(JSON.stringify({ fps: +fps, width: +width, height: +height, frames }));
const len = Buffer.alloc(4);
len.writeUInt32LE(header.length);
fs.writeFileSync(out, Buffer.concat([Buffer.from("HFSEQ1"), len, header, ...blobs]));
console.log(`${files.length} quadros → ${out} (${(fs.statSync(out).size / 1024).toFixed(0)} KB)`);
