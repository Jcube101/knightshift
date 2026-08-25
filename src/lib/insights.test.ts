import { describe, expect, it } from 'vitest'
import { summarizeInsights } from './insights'

describe('summarizeInsights', () => {
  it('counts concrete piece-loss and check events from analysed games', () => {
    const summary = summarizeInsights([
      { id: 'one', playedAt: '2026-08-25T09:00:00.000Z', result: '0-1', moves: [], playerColor: 'w', analysis: [{ moveNumber: 9, played: 'Re1', best: 'Qa3', loss: 180, rank: 1, label: 'Significant mistake', explanation: '', afterFen: 'r6k/8/8/8/8/8/B7/7K b - - 0 1', replyUci: 'a8a2' }] },
      { id: 'two', playedAt: '2026-08-26T09:00:00.000Z', result: '0-1', moves: [], playerColor: 'w', analysis: [{ moveNumber: 14, played: 'h3', best: 'O-O', loss: 110, rank: 1, label: 'Missed opportunity', explanation: '', afterFen: '7k/8/8/8/8/8/6q1/7K b - - 0 1', replyUci: 'g2h2' }] },
      { id: 'three', playedAt: '2026-08-27T09:00:00.000Z', result: '0-1', moves: [], playerColor: 'w', analysis: [{ moveNumber: 18, played: 'Qd2', best: 'O-O', loss: 210, rank: 1, label: 'Significant mistake', explanation: '', afterFen: '7k/8/8/8/8/1n6/2R1R3/7K b - - 0 1', replyUci: 'b3d4' }] },
    ])

    expect(summary).toEqual([
      { kind: 'piece-loss', count: 1, label: 'Pieces lost to a critical reply' },
      { kind: 'check-allowed', count: 1, label: 'Critical replies that gave check' },
      { kind: 'fork', count: 1, label: 'Forks allowed in critical moments' },
    ])
  })
})
