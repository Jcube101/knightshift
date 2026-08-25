export function parseScore(line: string): { centipawns: number; bestMove: string } | null {
  const match = /\bscore cp (-?\d+)\b.*\bpv ([a-h][1-8][a-h][1-8][qrbn]?)/.exec(line)
  if (!match) return null
  return { centipawns: Number(match[1]), bestMove: match[2] }
}

export function parseBestMove(line: string): string | null {
  const match = /^bestmove\s+([a-h][1-8][a-h][1-8][qrbn]?)/.exec(line.trim())
  return match?.[1] ?? null
}

type EngineMessage = MessageEvent<string>

type EngineOptions = {
  fen: string
  moves: string[]
  skillLevel: number
  nodes: number
}

export class StockfishEngine {
  private readonly worker: Worker

  constructor(worker = new Worker('/stockfish/stockfish-18-lite-single.js')) {
    this.worker = worker
  }

  bestMove({ fen, moves, skillLevel, nodes }: EngineOptions): Promise<string> {
    return new Promise((resolve, reject) => {
      const timeout = window.setTimeout(() => {
        this.worker.removeEventListener('message', handleMessage)
        reject(new Error('Stockfish did not return a move in time.'))
      }, 15_000)

      const handleMessage = (event: EngineMessage) => {
        const bestMove = parseBestMove(event.data)
        if (!bestMove) return
        window.clearTimeout(timeout)
        this.worker.removeEventListener('message', handleMessage)
        resolve(bestMove)
      }

      this.worker.addEventListener('message', handleMessage)
      this.worker.postMessage('uci')
      this.worker.postMessage(`setoption name Skill Level value ${skillLevel}`)
      this.worker.postMessage(`position fen ${fen}${moves.length ? ` moves ${moves.join(' ')}` : ''}`)
      this.worker.postMessage(`go nodes ${nodes}`)
    })
  }

  analyse({ fen, moves, skillLevel, nodes }: EngineOptions): Promise<{ centipawns: number; bestMove: string }> {
    return new Promise((resolve, reject) => {
      let latestScore: { centipawns: number; bestMove: string } | null = null
      const timeout = window.setTimeout(() => {
        this.worker.removeEventListener('message', handleMessage)
        reject(new Error('Stockfish did not finish analysis in time.'))
      }, 20_000)
      const handleMessage = (event: EngineMessage) => {
        const score = parseScore(event.data)
        if (score) latestScore = score
        if (!parseBestMove(event.data)) return
        window.clearTimeout(timeout)
        this.worker.removeEventListener('message', handleMessage)
        if (!latestScore) reject(new Error('Stockfish returned no evaluation score.'))
        else resolve(latestScore)
      }
      this.worker.addEventListener('message', handleMessage)
      this.worker.postMessage('uci')
      this.worker.postMessage(`setoption name Skill Level value ${skillLevel}`)
      this.worker.postMessage(`position fen ${fen}${moves.length ? ` moves ${moves.join(' ')}` : ''}`)
      this.worker.postMessage(`go nodes ${nodes}`)
    })
  }

  terminate(): void {
    this.worker.terminate()
  }
}
