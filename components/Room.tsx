import { doc, onSnapshot } from "firebase/firestore";
import db from "../firebase/firebase.config";
import { useSelector } from "react-redux";
import { RootState } from "store";
import { useEffect, useState } from "react";
import Lobby from "components/Lobby";
import Game from "components/Game";

export default function Room() {
  const [gameExists, setGameExists] = useState(false);
  const { roomCode } = useSelector((state: RootState) => state.room);
  useEffect(() => {
    const unsubRoom = onSnapshot(doc(db, "rooms", roomCode), (doc) => {
      if (!doc.exists()) {
        setGameExists(true);
        unsubRoom();
      }
    });
  }, [roomCode]);
  if (!roomCode) return <></>;
  return gameExists ? <Game /> : <Lobby />;
}
