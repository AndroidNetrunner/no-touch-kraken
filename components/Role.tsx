import { Roles } from "@/roles";
import styles from "../src/styles/Lobby.module.css";
export default function Role({
  role,
}: {
  role: typeof Roles.PIRATE | typeof Roles.SKELETON;
}) {
  return (
    <>
      <h1>
        당신의 역할은{" "}
        <span
          className={role === Roles.PIRATE ? styles.pirate : styles.skeleton}
        >
          {role}
        </span>
        입니다.
      </h1>
      <span className={styles.description}>
        {"승리 조건: " +
          (role === Roles.PIRATE
            ? "4라운드 안에 크라켄을 만나지 않고 보물상자를 모두 찾기"
            : "4라운드동안 모든 보물상자를 찾지 못하거나, 크라켄을 조우하기")}
      </span>
    </>
  );
}
