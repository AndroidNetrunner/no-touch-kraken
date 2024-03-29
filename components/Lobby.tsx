import { dealCards, RoomCode, shuffle } from "@/utils";
import db from "../firebase/firebase.config";
import {
  deleteDoc,
  doc,
  DocumentData,
  DocumentSnapshot,
  getDoc,
  onSnapshot,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { Player, User } from "interface";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "store";
import { setParticipants } from "store/slices/roomSlice";
import { Dispatch, useEffect } from "react";
import roles, { role } from "../src/roles";
import { AnyAction } from "@reduxjs/toolkit";
import styles from "../src/styles/Lobby.module.css";

function decideRoles(participants: User[]): {
  [userId: string]: Omit<Player, "hands">;
} {
  const shuffledRoles = shuffle(
    roles[participants.length as 4 | 5 | 6]
  ) as role[];
  const participantsWithRoles: {
    [userId: string]: Omit<Player, "hands">;
  } = {};
  for (let participant of participants) {
    participantsWithRoles[participant.userId] = {
      ...participant,
      role: shuffledRoles.shift() as role,
    };
  }
  return participantsWithRoles;
}

async function handleClick(roomCode: RoomCode, participants: User[]) {
  await deleteDoc(doc(db, "rooms", roomCode));
  const participantsWithRoles = decideRoles(participants);
  const players = dealCards(participantsWithRoles);
  await setDoc(doc(db, "games", roomCode), {
    players,
    revealedCards: {
      empty: 0,
      treasure: 0,
    },
    currentRound: {
      openedCards: 0,
      currentTurnPlayerId:
        participants[
          Math.floor(Math.random() * Object.keys(participants).length)
        ].userId,
      roundNumber: 1,
    },
  });
}

function getNicknames(participants: Object) {
  return Object.values(participants)
    .map((participant) => participant.nickname)
    .join(", ");
}

function isSameDataWithStoreParticipants(data: DocumentData, original: User[]) {
  if (data)
    return JSON.stringify(data.participants) === JSON.stringify(original);
}

async function deleteParticipant(userId: string, roomCode: RoomCode) {
  const docRef = doc(db, "rooms", roomCode);
  const data = await getDoc(docRef);
  if (data.exists()) {
    await updateDoc(docRef, {
      participants: data
        .data()
        .participants.filter(
          (participant: User) => participant.userId !== userId
        ),
    });
  }
}

function addListenerToParticipants(
  doc: DocumentSnapshot,
  participants: User[],
  dispatch: Dispatch<AnyAction>
) {
  const currentData = doc.data();
  if (
    currentData &&
    !isSameDataWithStoreParticipants(currentData, participants)
  )
    dispatch(setParticipants(currentData.participants));
}

function areEnoughPeople(participants: User[]) {
  return (
    Object.keys(participants).length >= 4 &&
    Object.keys(participants).length <= 6
  );
}

export default function Lobby() {
  const { nickname, userId: myUserId } = useSelector(
    (state: RootState) => state.user
  );
  const { participants, roomCode } = useSelector(
    (state: RootState) => state.room
  );
  const dispatch = useDispatch();
  useEffect(() => {
    onSnapshot(doc(db, "rooms", roomCode), (doc) =>
      addListenerToParticipants(doc, participants, dispatch)
    );
    window.addEventListener("beforeunload", () =>
      deleteParticipant(myUserId, roomCode)
    );
  }, [dispatch, myUserId, participants, roomCode]);
  return (
    <>
      <div className={styles.main + " " + "container"}>
        <h1>입장 코드: {roomCode}</h1>
        <h2>
          내 닉네임: {nickname}, 참가자: {getNicknames(participants)}
        </h2>
        <iframe
          width="560"
          height="315"
          src="https://www.youtube.com/embed/ckd5Au7lryE?start=12"
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        ></iframe>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={!areEnoughPeople(participants)}
          onClick={() => handleClick(roomCode, participants)}
        >
          게임 시작
        </button>
        {!areEnoughPeople(participants) && (
          <p>게임을 시작하기 위해서는 최소 4명, 최대 6명이 필요합니다.</p>
        )}
      </div>
    </>
  );
}
