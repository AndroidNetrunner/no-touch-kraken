import { dealCards, shuffle } from "@/utils";
import db from "../firebase/firebase.config";
import {
  doc,
  DocumentData,
  DocumentReference,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { Cards, Player, Round as IRound } from "interface";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "store";
import { setCurrentRound, setRevealedCards } from "store/slices/gameSlice";
import Action from "./Action";

async function startNewRound(
  docRef: DocumentReference<DocumentData>,
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
  await updateDoc(docRef, {
    players: playersWithNewHands,
    currentRound: {
      ...currentRound,
      roundNumber,
      openedCards: 0,
    },
  });
}

export default function Round({
  playerNumber,
  roomCode,
}: {
  playerNumber: 4 | 5 | 6;
  roomCode: string;
}) {
  const dispatch = useDispatch();
  const myUserId = useSelector((state: RootState) => state.user.userId);
  console.log(`myUserId:`, myUserId);
  const player = useSelector(
    (state: RootState) => state.game.players[myUserId]
  );
  const { roundNumber, openedCards } = useSelector(
    (state: RootState) => state.game.currentRound
  );
  const { players, revealedCards, currentRound } = useSelector(
    (state: RootState) => state.game
  );
  console.log(`players:`, players);
  const docRef = doc(db, "games", roomCode);
  useEffect(() => {
    const unSub = onSnapshot(docRef, (doc) => {
      const data = doc.data();
      if (data) {
        if (data.currentRound) dispatch(setCurrentRound(data.currentRound));
        if (data.revealedCards) dispatch(setRevealedCards(data.revealedCards));
      }
    });
  }, []);
  // TODO: 카드 오픈 후 턴 넘기기 행동 구현
  return (
    <>
      {myUserId === currentRound.currentTurnPlayerId && (
        <Action roomCode={roomCode} />
      )}
      <button
        className="btn btn-primary"
        disabled={!!(playerNumber - openedCards)}
        onClick={() =>
          startNewRound(docRef, { players, revealedCards, currentRound })
        }
      >
        다음 라운드 시작
      </button>
      <br />
      {roundNumber}라운드 남은 카드: {playerNumber - openedCards}장 <br />
      <p>현재 턴: {players[currentRound.currentTurnPlayerId]?.nickname}</p>
      <h3>손패 카드</h3>
      <div>
        빈 상자: {player?.hands.filter((card) => card === Cards.EMPTY).length}{" "}
        <br />
        보물상자:{" "}
        {player?.hands.filter((card) => card === Cards.TREASURE).length} <br />
        크라켄: {player?.hands.filter((card) => card === Cards.KRAKEN).length}
        <br />
      </div>
    </>
  );
}
