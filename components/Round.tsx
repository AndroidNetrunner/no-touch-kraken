import { dealCards } from "@/utils";
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
  roomCode: string;
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
        ?????? ????????? ??????
      </button>
      <br />
      <p>
        {roundNumber}????????? ?????? ??????: {playerNumber - openedCards}???
      </p>{" "}
      <br />
      ?????? ???: {players[currentRound.currentTurnPlayerId]?.nickname}
      <h3>?????? ??????</h3>
      <div>
        ??? ??????: {countCards(player, Cards.EMPTY)} <br />
        ????????????: {countCards(player, Cards.TREASURE)} <br />
        ?????????: {countCards(player, Cards.KRAKEN)}
        <br />
      </div>
    </>
  );
}
