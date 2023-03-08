import { doc, onSnapshot } from "firebase/firestore";
import db from "../firebase/firebase.config";
import { useSelector } from "react-redux";
import { RootState } from "store";
import { useEffect, useState } from "react";
import Loading from "./Loading";
import Lobby from "components/Lobby";
import Game from "components/Game";

export default function Room() {
  const [doneLoading, setDoneLoading] = useState(false);
  const [gameExists, setGameExists] = useState(false);
  const { roomCode, participants } = useSelector(
    (state: RootState) => state.room
  );
  useEffect(() => {
    (() => {
      setDoneLoading(true);
      const unsubRoom = onSnapshot(docRef, (doc) => {
        if (!doc.exists()) {
          setGameExists(true);
          unsubRoom();
        }
      });
    })();
  }, []);
  if (!roomCode) return <></>;
  const docRef = doc(db, "rooms", roomCode);

  return !doneLoading ? (
    <Loading />
  ) : gameExists ? (
    <Game roomCode={roomCode} />
  ) : (
    <Lobby roomCode={roomCode} participants={participants} />
  );
}
