import { dealCards, shuffle } from "@/utils";
import db from "../firebase/firebase.config";
import { deleteDoc, doc, onSnapshot, setDoc } from "firebase/firestore";
import { User } from "interface";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "store";
import { setParticipants } from "store/slices/roomSlice";

const Roles = {
  PIRATE: "해적",
  SKELETON: "스켈레톤",
} as const;

async function handleClick(
  roomCode: string,
  participants: { [userId: string]: User }
) {
  // Lobby 삭제
  await deleteDoc(doc(db, "rooms", roomCode));
  // Game 생성
  const roles = {
    4: [
      Roles.PIRATE,
      Roles.PIRATE,
      Roles.PIRATE,
      Roles.SKELETON,
      Roles.SKELETON,
    ],
    5: [
      Roles.PIRATE,
      Roles.PIRATE,
      Roles.PIRATE,
      Roles.PIRATE,
      Roles.SKELETON,
      Roles.SKELETON,
    ],
    6: [
      Roles.PIRATE,
      Roles.PIRATE,
      Roles.PIRATE,
      Roles.PIRATE,
      Roles.SKELETON,
      Roles.SKELETON,
    ],
  };
  const shuffledRoles = shuffle(
    roles[Object.keys(participants).length as 4 | 5 | 6]
  );
  const dealtCards = dealCards(Object.keys(participants).length, {
    empty: 0,
    treasure: 0,
  });
  let players: { [userId: string]: Object } = {};
  Object.entries(participants).forEach((elem, index) => {
    const user = elem[1];
    players[user.userId] = {
      ...user,
      role: shuffledRoles[index],
      hands: dealtCards.splice(0, 5),
    };
  });
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
  participants: { [userId: string]: User };
}) {
  const dispatch = useDispatch();
  const { nickname, userId } = useSelector((state: RootState) => state.user);
  const docRef = doc(db, "rooms", roomCode);
  const unSub = onSnapshot(docRef, (doc) => {
    const currentData = doc.data();
    if (!currentData) return;
    if (
      JSON.stringify(currentData.participants) !== JSON.stringify(participants)
    )
      dispatch(setParticipants(currentData.participants));
  });
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
