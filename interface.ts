import { Roles } from "@/roles";

export const Cards = {
  TREASURE: "보물상자",
  EMPTY: "빈 상자",
  KRAKEN: "크라켄",
} as const;

export type card = (typeof Cards)[keyof typeof Cards];

export interface User {
  nickname: string;
  userId: string[10];
}

export interface Player extends User {
  role: typeof Roles.PIRATE | typeof Roles.SKELETON;
  hands: card[];
}

export interface Lobby {
  roomCode: string;
  participants: User[];
}

export interface Game {
  players: { [userId: string]: Player };
  revealedCards: {
    empty: number;
    treasure: number;
  };
  currentRound: Round;
  gameEndingDescription: string;
}

export interface Round {
  openedCards: number;
  currentTurnPlayerId: string;
  roundNumber: 1 | 2 | 3 | 4;
}
