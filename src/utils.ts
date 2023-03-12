import { card, Cards, Player } from "interface";

export function shuffle(array: string[]) {
  const copied = [...array];
  for (let index = copied.length - 1; index > 0; index--) {
    // 무작위 index 값을 만든다. (0 이상의 배열 길이 값)
    const randomPosition = Math.floor(Math.random() * (index + 1));

    // 임시로 원본 값을 저장하고, randomPosition을 사용해 배열 요소를 섞는다.
    const temporary = copied[index];
    copied[index] = copied[randomPosition];
    copied[randomPosition] = temporary;
  }
  return copied;
}

function remainedEmptyCards(
  numberOfPlayers: number,
  revealedEmptyCards: number
) {
  return numberOfPlayers * 4 - 1 - revealedEmptyCards;
}

function remainedTreasureCards(
  numberOfPlayers: number,
  revealedTreasureCards: number
) {
  return numberOfPlayers - revealedTreasureCards;
}

function shuffleCards(
  numberOfPlayers: number,
  revealedCards: { empty: number; treasure: number }
): card[] {
  const emptyCards = remainedEmptyCards(numberOfPlayers, revealedCards.empty);
  const treasureCards = remainedTreasureCards(
    numberOfPlayers,
    revealedCards.treasure
  );
  return shuffle([
    ...Array(emptyCards).fill(Cards.EMPTY),
    ...Array(treasureCards).fill(Cards.TREASURE),
    Cards.KRAKEN,
  ]) as card[];
}

export function dealCards(
  users: { [userId: string]: Omit<Player, "hands"> },
  revealedCards: {
    empty: number;
    treasure: number;
  } = { empty: 0, treasure: 0 },
  roundNumber = 1
): {
  [userId: string]: Player;
} {
  const shuffledCards = shuffleCards(Object.keys(users).length, revealedCards);
  const players: { [userId: string]: Player } = {};
  for (let userId in users) {
    players[userId] = { ...users[userId], hands: shuffledCards.splice(0, 5) };
  }
  return players;
}
