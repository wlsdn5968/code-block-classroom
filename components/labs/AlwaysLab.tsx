import { read, setL } from "@/lib/store";
import { LabBox } from "./LabBox";

// 실험실 8 · 봇은 어디서 돌고 있나 (시간표는 예시)
const ev = [
  ["09:00", "봇 시작, 시세 확인"],
  ["10:00", "조건 충족 → 매수 주문"],
  ["11:00", "💻 노트북을 덮음"],
  ["12:00", "시세 확인"],
  ["13:00", "조건 충족 → 매도 주문"],
  ["14:00", "시세 확인"],
];

export function AlwaysLab() {
  const { L } = read();
  const w: string = L.w ?? "laptop";
  return (
    <LabBox title="봇은 어디서 돌고 있나">
      <div className="ctrl">
        <span>봇이 도는 곳:</span>
        <button className={`tog ${w === "laptop" ? "on" : ""}`} onClick={() => setL({ w: "laptop" })}>내 노트북</button>
        <button className={`tog ${w === "vm" ? "on" : ""}`} onClick={() => setL({ w: "vm" })}>클라우드 가상 서버</button>
      </div>
      <div className="tl">
        {ev.map((e, i) => {
          const dead = w === "laptop" && i > 2;
          const t = w === "vm" && i === 2 ? "노트북을 덮음 (봇과 상관없음)" : e[1];
          return (
            <div key={i} className={dead ? "dead" : ""}>
              <span>{e[0]}</span>
              <span>{dead ? "— 기록 없음 (봇 멈춤)" : t}</span>
            </div>
          );
        })}
      </div>
      <div className={`out ${w === "laptop" ? "no" : "ok"}`}>
        {w === "laptop" ? "11시 이후 매도 주문을 놓쳤어요. 노트북이 잠들면서 봇도 멈췄기 때문이에요." : "내 노트북과 상관없이 계속 돌아요. 대신 켜둔 시간만큼 요금이 나가요."}
      </div>
    </LabBox>
  );
}
