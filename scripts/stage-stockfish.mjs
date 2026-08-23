import { cp, mkdir } from 'node:fs/promises'

const source = 'node_modules/stockfish'
const target = 'public/stockfish'

await mkdir(target, { recursive: true })
await Promise.all([
  cp(`${source}/bin/stockfish-18-lite-single.js`, `${target}/stockfish-18-lite-single.js`),
  cp(`${source}/bin/stockfish-18-lite-single.wasm`, `${target}/stockfish-18-lite-single.wasm`),
  cp(`${source}/Copying.txt`, `${target}/COPYING.txt`),
])
