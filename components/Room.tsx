import { doc, onSnapshot } from "firebase/firestore";
import db from "../firebase/firebase.config";
import { useSelector } from "react-redux";
import { RootState } from "store";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import Lobby from "components/Lobby";
import Game from "components/Game";

function addListenerToFirebase(
  setGameExists: Dispatch<SetStateAction<boolean>>,
  roomCode: string
) {
  const unsubRoom = onSnapshot(doc(db, "rooms", roomCode), (doc) => {
    if (!doc.exists()) {
      setGameExists(true);
      unsubRoom();
    }
  });
}

export default function Room() {
  const [gameExists, setGameExists] = useState(false);
  const { roomCode } = useSelector((state: RootState) => state.room);
  if (!roomCode) return <></>;
  useEffect(() => addListenerToFirebase(setGameExists, roomCode), []);
  return gameExists ? <Game /> : <Lobby />;
}
