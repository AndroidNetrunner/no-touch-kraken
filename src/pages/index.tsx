"use client";

import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import db from "../../firebase/firebase.config";
import { doc, getDoc } from "firebase/firestore";
import { setRoomCode } from "store/slices/roomSlice";
import { AnyAction, Dispatch } from "@reduxjs/toolkit";
import { setNickname, setUserId } from "store/slices/userSlice";
import { RootState } from "store";
import Room from "components/Room";
import Cookies from "js-cookie";
import {
  setCurrentRound,
  setPlayers,
  setRevealedCards,
} from "store/slices/gameSlice";
import Entrance from "components/Entrance";
import { RoomCode } from "@/utils";
import { get, ref } from "firebase/database";

async function syncStoreWithFirebase(
  {
    roomCode,
    nickname,
    userId,
  }: {
    roomCode: RoomCode;
    nickname: string;
    userId: string;
  },
  dispatch: Dispatch<AnyAction>
) {
  if (!roomCode || !nickname || !userId) return;
  const data = (await get(ref(db, "games/" + roomCode))).val();
  if (data) {
    dispatch(setRoomCode(roomCode));
    dispatch(setNickname(nickname));
    dispatch(setUserId(userId));
    dispatch(setPlayers(data.players));
    dispatch(setRevealedCards(data.revealedCards));
    dispatch(setCurrentRound(data.currentRound));
  }
}

export default function Home() {
  const code = useSelector((state: RootState) => state.room.roomCode);
  const dispatch = useDispatch();
  useEffect(() => {
    const { roomCode, nickname, userId } = Cookies.get();
    if (!roomCode || !nickname || !userId) return;
    syncStoreWithFirebase({ roomCode, nickname, userId }, dispatch);
  }, [dispatch]);
  return code ? <Room /> : <Entrance />;
}
