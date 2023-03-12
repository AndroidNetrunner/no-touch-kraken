import { dealCards, shuffle } from "@/utils";
import db from "../firebase/firebase.config";
import {
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { Player, User } from "interface";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "store";
import { setParticipants } from "store/slices/roomSlice";
import { useEffect } from "react";
import roles from "../src/roles";

function decideRoles(participants: User[]): {
  [userId: string]: Omit<Player, "hands">;
} {
  const shuffledRoles = shuffle(roles[participants.length as 4 | 5 | 6]);
  const participantsWithRoles: {
    [userId: string]: Omit<Player, "hands">;
  } = {};
  for (let participant of participants) {
    participantsWithRoles[participant.userId] = {
      ...participant,
      role: shuffledRoles.shift() as string,
    };
  }
  return participantsWithRoles;
}

async function handleClick(roomCode: string, participants: User[]) {
  // Lobby 삭제
  await deleteDoc(doc(db, "rooms", roomCode));
  // Game 생성
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

export default function Lobby({
  roomCode,
  participants,
}: {
  roomCode: string;
  participants: User[];
}) {
  const dispatch = useDispatch();
  const { nickname, userId } = useSelector((state: RootState) => state.user);
  const docRef = doc(db, "rooms", roomCode);
  useEffect(() => {
    const unSub = onSnapshot(docRef, (doc) => {
      const currentData = doc.data();
      if (!currentData) return;
      if (
        JSON.stringify(currentData.participants) !==
        JSON.stringify(participants)
      )
        dispatch(setParticipants(currentData.participants));
    });

    window.addEventListener("beforeunload", async () => {
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
    });
  }, []);
  return (
    <>
      <h1>입장 코드: {roomCode}</h1>
      <h2>내 정보</h2>
      <p>
        닉네임: {nickname} 유저 ID: {userId}
      </p>
      <h2>방 정보</h2>
      <span>
        참가자:{" "}
        {Object.values(participants)
          .map((participant) => participant.nickname)
          .join(", ")}
      </span>
      <br />
      <button
        type="submit"
        className="btn btn-primary"
        disabled={
          !(
            Object.keys(participants).length >= 4 &&
            Object.keys(participants).length <= 6
          )
        }
        onClick={async () => await handleClick(roomCode, participants)}
      >
        게임 시작
      </button>
    </>
  );
}
