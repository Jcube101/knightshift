import { Chess } from 'chess.js'

export const openingFamilies = ['Open games', 'Semi-open defences', 'Queen’s pawn and Indian structures', 'Flank openings'] as const
export type OpeningFamily = typeof openingFamilies[number]

export type OpeningVariation = {
  id: string
  name: string
  eco: string
  san: string[]
  idea: string
}

export type Opening = {
  id: string
  family: OpeningFamily
  name: string
  eco: string
  startingMoves: string[]
  idea: string
  variations: OpeningVariation[]
}

export function replaySan(moves: string[]): Chess {
  const chess = new Chess()
  for (const move of moves) chess.move(move)
  return chess
}

export const openings: Opening[] = [
  {
    id: 'italian-game', family: 'Open games', name: 'Italian Game', eco: 'C50', startingMoves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4'], idea: 'A classical open game that develops quickly and places pressure on f7.',
    variations: [
      { id: 'italian-giuoco-piano', name: 'Giuoco Piano', eco: 'C50', san: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5', 'c3', 'Nf6', 'd3'], idea: 'Both sides develop behind a stable central structure.' },
      { id: 'italian-evans-gambit', name: 'Evans Gambit', eco: 'C51', san: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5', 'b4'], idea: 'White offers a wing pawn to gain time and central space.' },
    ],
  },
  {
    id: 'ruy-lopez', family: 'Open games', name: 'Ruy Lopez', eco: 'C60', startingMoves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5'], idea: 'White develops with pressure on the knight that helps defend e5.',
    variations: [
      { id: 'ruy-lopez-morphy', name: 'Morphy Defense', eco: 'C60', san: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6', 'Ba4', 'Nf6', 'O-O'], idea: 'Black questions the bishop while continuing natural development.' },
      { id: 'ruy-lopez-berlin', name: 'Berlin Defense', eco: 'C65', san: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'Nf6'], idea: 'Black counterattacks e4 immediately and aims for a resilient structure.' },
    ],
  },
  {
    id: 'scotch-game', family: 'Open games', name: 'Scotch Game', eco: 'C44', startingMoves: ['e4', 'e5', 'Nf3', 'Nc6', 'd4'], idea: 'White challenges the centre early to open lines for development.',
    variations: [
      { id: 'scotch-classical', name: 'Classical Variation', eco: 'C44', san: ['e4', 'e5', 'Nf3', 'Nc6', 'd4', 'exd4', 'Nxd4', 'Bc5'], idea: 'Black develops with tempo against the knight on d4.' },
      { id: 'scotch-schmidt', name: 'Schmidt Variation', eco: 'C45', san: ['e4', 'e5', 'Nf3', 'Nc6', 'd4', 'exd4', 'Nxd4', 'Nf6'], idea: 'Black develops the knight and attacks White’s central pawn.' },
    ],
  },
  {
    id: 'vienna-game', family: 'Open games', name: 'Vienna Game', eco: 'C25', startingMoves: ['e4', 'e5', 'Nc3'], idea: 'White develops the queen’s knight first, keeping central options open.',
    variations: [
      { id: 'vienna-gambit', name: 'Vienna Gambit', eco: 'C29', san: ['e4', 'e5', 'Nc3', 'Nf6', 'f4'], idea: 'White offers a pawn to gain central momentum and open lines.' },
      { id: 'vienna-falkbeer', name: 'Falkbeer Variation', eco: 'C25', san: ['e4', 'e5', 'Nc3', 'Nf6'], idea: 'Black develops actively and contests e4 at once.' },
    ],
  },
  {
    id: 'sicilian-defense', family: 'Semi-open defences', name: 'Sicilian Defense', eco: 'B20', startingMoves: ['e4', 'c5'], idea: 'Black fights for the centre asymmetrically from the c-pawn.',
    variations: [
      { id: 'sicilian-najdorf', name: 'Najdorf Variation', eco: 'B90', san: ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'a6'], idea: 'Black prepares flexible development and controls b5.' },
      { id: 'sicilian-dragon', name: 'Dragon Variation', eco: 'B70', san: ['e4', 'c5', 'Nf3', 'g6', 'd4', 'cxd4', 'Nxd4', 'Bg7'], idea: 'Black fianchettoes the bishop toward the long diagonal.' },
      { id: 'sicilian-alapin', name: 'Alapin Variation', eco: 'B22', san: ['e4', 'c5', 'c3'], idea: 'White supports a later central d4 advance.' },
    ],
  },
  {
    id: 'scandinavian-defense', family: 'Semi-open defences', name: 'Scandinavian Defense', eco: 'B01', startingMoves: ['e4', 'd5'], idea: 'Black challenges White’s centre immediately with the d-pawn.',
    variations: [
      { id: 'scandinavian-main-line', name: 'Main Line', eco: 'B01', san: ['e4', 'd5', 'exd5', 'Qxd5', 'Nc3', 'Qa5'], idea: 'Black recaptures with the queen, then places it on a5 while continuing development.' },
      { id: 'scandinavian-modern', name: 'Modern Variation', eco: 'B01', san: ['e4', 'd5', 'exd5', 'Nf6', 'd4', 'Nxd5'], idea: 'Black develops with tempo and recaptures the pawn after White supports the centre.' },
    ],
  },
  {
    id: 'french-defense', family: 'Semi-open defences', name: 'French Defense', eco: 'C00', startingMoves: ['e4', 'e6'], idea: 'Black prepares d5 to challenge White’s central pawn chain.',
    variations: [
      { id: 'french-advance', name: 'Advance Variation', eco: 'C02', san: ['e4', 'e6', 'd4', 'd5', 'e5'], idea: 'White closes the centre and gains space with the e-pawn.' },
      { id: 'french-winawer', name: 'Winawer Variation', eco: 'C15', san: ['e4', 'e6', 'd4', 'd5', 'Nc3', 'Bb4'], idea: 'Black pins the knight and immediately creates structural tension.' },
    ],
  },
  {
    id: 'caro-kann-defense', family: 'Semi-open defences', name: 'Caro-Kann Defense', eco: 'B10', startingMoves: ['e4', 'c6'], idea: 'Black supports a central d5 break with the c-pawn.',
    variations: [
      { id: 'caro-kann-classical', name: 'Classical Variation', eco: 'B18', san: ['e4', 'c6', 'd4', 'd5', 'Nc3', 'dxe4', 'Nxe4', 'Bf5'], idea: 'Black develops the light-squared bishop outside the pawn chain.' },
      { id: 'caro-kann-advance', name: 'Advance Variation', eco: 'B12', san: ['e4', 'c6', 'd4', 'd5', 'e5'], idea: 'White gains space while Black plans to challenge the pawn chain.' },
    ],
  },
  {
    id: 'queens-gambit', family: 'Queen’s pawn and Indian structures', name: 'Queen’s Gambit', eco: 'D06', startingMoves: ['d4', 'd5', 'c4'], idea: 'White challenges Black’s central d5 pawn with the c-pawn.',
    variations: [
      { id: 'queens-gambit-declined', name: 'Queen’s Gambit Declined', eco: 'D30', san: ['d4', 'd5', 'c4', 'e6'], idea: 'Black supports d5 and keeps the central pawn structure intact.' },
      { id: 'slav-defense', name: 'Slav Defense', eco: 'D10', san: ['d4', 'd5', 'c4', 'c6'], idea: 'Black supports d5 with the c-pawn and keeps the light bishop freer.' },
    ],
  },
  {
    id: 'kings-indian-defense', family: 'Queen’s pawn and Indian structures', name: 'King’s Indian Defense', eco: 'E60', startingMoves: ['d4', 'Nf6', 'c4', 'g6'], idea: 'Black allows central space while preparing a kingside fianchetto.',
    variations: [
      { id: 'kings-indian-classical', name: 'Classical Variation', eco: 'E90', san: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'Bg7', 'e4', 'd6', 'Nf3', 'O-O', 'Be2', 'e5'], idea: 'Black challenges White’s centre after completing kingside development.' },
      { id: 'kings-indian-fianchetto', name: 'Fianchetto Variation', eco: 'E60', san: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'Bg7', 'g3'], idea: 'White prepares to meet Black’s bishop with a kingside fianchetto.' },
    ],
  },
  {
    id: 'nimzo-indian-defense', family: 'Queen’s pawn and Indian structures', name: 'Nimzo-Indian Defense', eco: 'E20', startingMoves: ['d4', 'Nf6', 'c4', 'e6', 'Nc3', 'Bb4'], idea: 'Black pins the knight and contests White’s central development.',
    variations: [
      { id: 'nimzo-indian-classical', name: 'Classical Variation', eco: 'E32', san: ['d4', 'Nf6', 'c4', 'e6', 'Nc3', 'Bb4', 'Qc2', 'O-O'], idea: 'White protects the knight while Black completes kingside safety.' },
      { id: 'nimzo-indian-rubinstein', name: 'Rubinstein Variation', eco: 'E54', san: ['d4', 'Nf6', 'c4', 'e6', 'Nc3', 'Bb4', 'e3'], idea: 'White reinforces the centre and opens the diagonal for the bishop.' },
    ],
  },
  {
    id: 'english-opening', family: 'Flank openings', name: 'English Opening', eco: 'A20', startingMoves: ['c4'], idea: 'White controls d5 from the flank and keeps central structures flexible.',
    variations: [
      { id: 'english-symmetrical', name: 'Symmetrical Variation', eco: 'A30', san: ['c4', 'c5', 'Nc3', 'Nc6', 'g3', 'g6', 'Bg2', 'Bg7'], idea: 'Both sides mirror a flexible fianchetto structure.' },
      { id: 'english-anglo-indian', name: 'Anglo-Indian Defense', eco: 'A16', san: ['c4', 'Nf6', 'Nc3', 'e6', 'Nf3', 'b6'], idea: 'Black develops with an Indian-style setup against the English.' },
    ],
  },
  {
    id: 'reti-opening', family: 'Flank openings', name: 'Réti Opening', eco: 'A04', startingMoves: ['Nf3'], idea: 'White delays committing central pawns and keeps transpositions available.',
    variations: [
      { id: 'reti-kings-indian-attack', name: 'King’s Indian Attack', eco: 'A05', san: ['Nf3', 'Nf6', 'g3', 'd5', 'Bg2'], idea: 'White builds a kingside fianchetto before deciding on the centre.' },
      { id: 'reti-queens-gambit-invitation', name: 'Queen’s Gambit Invitation', eco: 'A06', san: ['Nf3', 'd5', 'c4'], idea: 'White invites a queen’s-pawn structure through a move-order choice.' },
    ],
  },
]

export type StudySide = 'w' | 'b'

const blackStudyOpeningIds = new Set(['sicilian-defense', 'scandinavian-defense', 'french-defense', 'caro-kann-defense', 'queens-gambit', 'kings-indian-defense', 'nimzo-indian-defense', 'english-opening'])

export function openingsForStudy(side: StudySide): Opening[] {
  return side === 'b' ? openings.filter(opening => blackStudyOpeningIds.has(opening.id)) : openings.filter(opening => !blackStudyOpeningIds.has(opening.id) || opening.id === 'queens-gambit' || opening.id === 'english-opening')
}

export function studyPrompt(variation: OpeningVariation, ply: number, side: StudySide): { actor: 'You' | 'Opponent'; move: string; label: string } | null {
  const move = variation.san[ply]
  if (!move) return null
  const learnerTurn = (ply % 2 === 0) === (side === 'w')
  if (side === 'b' && ply === 1) return { actor: 'You', move, label: `Your response to 1. ${variation.san[0]}` }
  return { actor: learnerTurn ? 'You' : 'Opponent', move, label: learnerTurn ? 'Your next move' : 'Opponent’s next move' }
}

export function openingById(id: string | undefined): Opening | undefined {
  return openings.find(opening => opening.id === id)
}

export function variationById(opening: Opening, id: string | undefined): OpeningVariation | undefined {
  return opening.variations.find(variation => variation.id === id)
}
