import db from "../firebase/firebase.config";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "store";
import {
  setCurrentRound,
  setDescription,
  setPlayers,
} from "store/slices/gameSlice";
import Round from "./Round";
import Result from "./Result";
import Cookies from "js-cookie";

export default function Game({ roomCode }: { roomCode: string }) {
  const myPlayerId = useSelector((state: RootState) => state.user.userId);
  const description = useSelector((state: RootState) => state.game.description);
  const { players, revealedCards } = useSelector(
    (state: RootState) => state.game
  );
  const myPlayer = players[myPlayerId];
  const { treasure, empty } = useSelector(
    (state: RootState) => state.game.revealedCards
  );
  const { roundNumber } = useSelector(
    (state: RootState) => state.game.currentRound
  );
  const dispatch = useDispatch();
  const docRef = doc(db, "games", roomCode);
  useEffect(() => {
    const unsubGame = onSnapshot(docRef, (doc) => {
      const data = doc.data();
      if (data) {
        dispatch(setPlayers(data.players));
        if (data.description) {
          dispatch(setDescription(data.description));
        }
        if (data.currentRound.roundNumber !== roundNumber)
          dispatch(setCurrentRound(data.currentRound));
      }
    });
    if (myPlayerId) Cookies.set("userId", myPlayerId);
    if (myPlayer) Cookies.set("nickname", myPlayer.nickname);
    if (roomCode) Cookies.set("roomCode", roomCode);
  }, []);
  return (
    <>
      {description ? (
        <Result
          players={players}
          description={description}
          roomCode={roomCode}
        />
      ) : (
        <>
          당신의 역할은 {myPlayer?.role}입니다.
          <h1>현재 등장한 카드</h1>
          보물상자: {treasure} 빈 상자: {empty}
          <Round
            playerNumber={Object.keys(players).length as 4 | 5 | 6}
            roomCode={roomCode}
          />
        </>
      )}
    </>
  );
}
