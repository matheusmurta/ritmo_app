// Gera os ícones PWA a partir de public/favicon.svg (executar: node scripts/generate-icons.mjs)
import sharp from 'sharp'
import { readFileSync } from 'node:fs'

const svg = readFileSync('public/favicon.svg')
const out = 'public/icons/'
await sharp(svg).resize(192, 192).png().toFile(out + 'pwa-192.png')
await sharp(svg).resize(512, 512).png().toFile(out + 'pwa-512.png')
await sharp(svg).resize(180, 180).png().toFile(out + 'apple-touch-icon.png')

// Maskable: fundo sangrado + glifo reduzido dentro da zona segura (80%).
const mask = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3B5BFF"/><stop offset="1" stop-color="#7968F8"/></linearGradient></defs><rect width="512" height="512" fill="url(#g)"/><g transform="translate(76 76) scale(0.7)"><path d="M96 300h72l44-132 76 190 52-124h76" fill="none" stroke="#fff" stroke-width="36" stroke-linecap="round" stroke-linejoin="round"/></g></svg>`
await sharp(Buffer.from(mask)).resize(512, 512).png().toFile(out + 'maskable-512.png')
console.log('Ícones gerados.')
