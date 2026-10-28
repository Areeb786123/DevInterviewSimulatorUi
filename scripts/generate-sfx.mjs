import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outDir = path.join(__dirname, '../public/assets/audio')
fs.mkdirSync(outDir, { recursive: true })

function writeWav(filename, samples, sampleRate = 22050) {
  const data = Buffer.alloc(44 + samples.length * 2)
  data.write('RIFF', 0)
  data.writeUInt32LE(36 + samples.length * 2, 4)
  data.write('WAVE', 8)
  data.write('fmt ', 12)
  data.writeUInt32LE(16, 16)
  data.writeUInt16LE(1, 20)
  data.writeUInt16LE(1, 22)
  data.writeUInt32LE(sampleRate, 24)
  data.writeUInt32LE(sampleRate * 2, 28)
  data.writeUInt16LE(2, 32)
  data.writeUInt16LE(16, 34)
  data.write('data', 36)
  data.writeUInt32LE(samples.length * 2, 40)
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]))
    data.writeInt16LE((s * 32767) | 0, 44 + i * 2)
  }
  fs.writeFileSync(path.join(outDir, filename), data)
}

function tone(freq, durSec, vol = 0.3, sampleRate = 22050) {
  const n = Math.floor(durSec * sampleRate)
  const samples = new Float32Array(n)
  for (let i = 0; i < n; i++) {
    const t = i / sampleRate
    const env = Math.min(1, i / 200) * Math.max(0, 1 - i / n)
    samples[i] = Math.sin(2 * Math.PI * freq * t) * vol * env
  }
  return samples
}

function concat(arrs) {
  const len = arrs.reduce((a, b) => a + b.length, 0)
  const out = new Float32Array(len)
  let o = 0
  for (const a of arrs) {
    out.set(a, o)
    o += a.length
  }
  return out
}

writeWav('click.wav', tone(880, 0.06, 0.35))
writeWav('deny.wav', tone(140, 0.12, 0.4))
writeWav('enter.wav', concat([tone(523, 0.08), tone(784, 0.1)]))
writeWav(
  'bgm.wav',
  concat([
    tone(220, 0.6, 0.08),
    tone(277, 0.6, 0.08),
    tone(330, 0.6, 0.08),
    tone(277, 0.6, 0.08),
  ]),
)

console.log('Wrote audio assets to', outDir)
