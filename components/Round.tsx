import { dealCards, RoomCode } from "@/utils";
import db from "../firebase/firebase.config";
import { Cards, Player, Round as IRound } from "interface";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "store";
import { setCurrentRound, setRevealedCards } from "store/slices/gameSlice";
import Action from "./Action";
import { DatabaseReference, onValue, ref, update } from "firebase/database";

// TODO: firebase realtime database로 변경
async function startNewRound(
  docRef: DatabaseReference,
  {
    players,
    revealedCards,
    currentRound,
  }: {
    players: {
      [userId: string]: Player;
    };
    revealedCards: {
      empty: number;
      treasure: number;
    };
    currentRound: IRound;
  }
) {
  const roundNumber = currentRound.roundNumber + 1;
  const playersWithNewHands = dealCards(players, revealedCards, roundNumber);
  await update(docRef, {
    players: playersWithNewHands,
    currentRound: {
      ...currentRound,
      roundNumber,
      openedCards: 0,
    },
  });
}

function countCards(
  player: Player,
  box: typeof Cards.KRAKEN | typeof Cards.EMPTY | typeof Cards.TREASURE
): number {
  return player?.hands.filter((card) => card === box).length;
}

export default function Round({
  playerNumber,
  roomCode,
}: {
  playerNumber: 4 | 5 | 6;
  roomCode: RoomCode;
}) {
  const dispatch = useDispatch();
  const myUserId = useSelector((state: RootState) => state.user.userId);
  const player = useSelector(
    (state: RootState) => state.game.players[myUserId]
  );
  const { roundNumber, openedCards } = useSelector(
    (state: RootState) => state.game.currentRound
  );
  const { players, revealedCards, currentRound } = useSelector(
    (state: RootState) => state.game
  );
  const docRef = ref(db, "games/" + roomCode);
  useEffect(() => {
    const unSub = onValue(docRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        if (data.currentRound) dispatch(setCurrentRound(data.currentRound));
        if (data.revealedCards) dispatch(setRevealedCards(data.revealedCards));
      }
    });
    return () => {
      unSub();
    };
  }, []);
  return (
    <>
      {myUserId === currentRound.currentTurnPlayerId && (
        <Action roomCode={roomCode} />
      )}{" "}
      {!(playerNumber - openedCards) && (
        <button
          className="btn btn-primary"
          disabled={!!(playerNumber - openedCards)}
          onClick={() =>
            startNewRound(docRef, { players, revealedCards, currentRound })
          }
        >
          다음 라운드 시작
        </button>
      )}
      <br />
      <p>
        {roundNumber}라운드 남은 카드: {playerNumber - openedCards}장
      </p>{" "}
      <br />
      현재 턴: {players[currentRound.currentTurnPlayerId]?.nickname}
      <h3>손패 카드</h3>
      <div>
        빈 상자: {countCards(player, Cards.EMPTY)} <br />
        보물상자: {countCards(player, Cards.TREASURE)} <br />
        크라켄: {countCards(player, Cards.KRAKEN)}
        <br />
      </div>
    </>
  );
}
