import { describe, expect, it } from 'vitest'
import { parseBestMove, parseScore, StockfishEngine } from './engine'

class FakeWorker {
  messages: string[] = []
  private listener: ((event: MessageEvent<string>) => void) | null = null
  addEventListener(_: string, listener: (event: MessageEvent<string>) => void) { this.listener = listener }
  removeEventListener(_: string, listener: (event: MessageEvent<string>) => void) { if (this.listener === listener) this.listener = null }
  postMessage(message: string) { this.messages.push(message) }
  terminate() {}
  emit(message: string) { this.listener?.({ data: message } as MessageEvent<string>) }
}

describe('StockfishEngine', () => {
  it('waits for the UCI readiness handshake before starting a search', async () => {
    const worker = new FakeWorker(); const engine = new StockfishEngine(worker as unknown as Worker)
    const pending = engine.bestMove({ fen: 'startpos', moves: [], skillLevel: 3, nodes: 2000 })
    expect(worker.messages).toEqual(['uci'])
    worker.emit('uciok')
    expect(worker.messages).toEqual(['uci', 'isready'])
    worker.emit('readyok')
    await Promise.resolve()
    expect(worker.messages).toEqual(['uci', 'isready', 'setoption name Skill Level value 3', 'position fen startpos', 'go nodes 2000'])
    worker.emit('bestmove e2e4')
    await expect(pending).resolves.toBe('e2e4')
  })
})

describe('parseBestMove', () => {
  it('extracts a UCI best move from Stockfish output', () => {
    expect(parseBestMove('bestmove e7e5 ponder g1f3')).toBe('e7e5')
  })

  it('extracts a centipawn score and principal variation from Stockfish info', () => {
    expect(parseScore('info depth 12 score cp -143 pv e7e5 g1f3')).toEqual({ centipawns: -143, bestMove: 'e7e5' })
  })

  it('accepts a terminal mate score even when Stockfish has no principal variation', () => {
    expect(parseScore('info depth 0 score mate 0')).toEqual({ centipawns: 0, bestMove: null })
  })

  it('returns null for non-final engine output', () => {
    expect(parseBestMove('info depth 8 score cp 32 pv e7e5 g1f3')).toBeNull()
  })
})
