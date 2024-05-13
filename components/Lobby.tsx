import { dealCards, RoomCode, shuffle } from "@/utils";
import db from "../firebase/firebase.config";
import { Lobby as ILobby, Player, User } from "interface";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "store";
import { setParticipants } from "store/slices/roomSlice";
import { Dispatch, useEffect } from "react";
import roles, { role } from "../src/roles";
import { AnyAction } from "@reduxjs/toolkit";
import styles from "../src/styles/Lobby.module.css";
import {
  DataSnapshot,
  get,
  onDisconnect,
  onValue,
  ref,
  remove,
  set,
  update,
} from "firebase/database";

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
  const docRef = ref(db, "rooms/" + roomCode);
  await remove(docRef);
  const participantsWithRoles = decideRoles(participants);
  const players = dealCards(participantsWithRoles);
  await set(ref(db, "games/" + roomCode), {
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
function convertObjectToArray(obj: { [userId: string]: User }) {
  if (obj) return Object.keys(obj).map((key) => obj[key]);
}

function isSameDataWithStoreParticipants(
  data: User[] | undefined,
  original: User[]
) {
  if (data) return JSON.stringify(data) === JSON.stringify(original);
}

// async function deleteParticipant(userId: string, roomCode: RoomCode) {
//   const docRef = ref(db, "rooms/" + roomCode);
//   const data = await get(docRef);
//   if (data.exists()) {
//     await update(docRef, {
//       participants: data
//         .val()
//         .participants.filter(
//           (participant: User) => participant.userId !== userId
//         ),
//     });
//   }
// }

function addListenerToParticipants(
  doc: DataSnapshot,
  participants: User[],
  dispatch: Dispatch<AnyAction>
) {
  const currentData = doc.val();
  if (
    currentData &&
    !isSameDataWithStoreParticipants(
      convertObjectToArray(currentData.participants),
      participants
    )
  )
    dispatch(setParticipants(convertObjectToArray(currentData.participants)));
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
  console.log("participants", participants);
  const dispatch = useDispatch();
  useEffect(() => {
    const unsubscribe = onValue(ref(db, "rooms/" + roomCode), (snapshot) =>
      addListenerToParticipants(snapshot, participants, dispatch)
    );
    // TODO: 방을 나갈 때 참가자 목록에서 삭제

    // window.addEventListener("beforeunload", () =>
    //   deleteParticipant(myUserId, roomCode)
    // );
    const userRef = ref(db, "rooms/" + roomCode + "/participants/" + myUserId);
    onDisconnect(userRef).remove();
    return () => {
      unsubscribe();
    };
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
