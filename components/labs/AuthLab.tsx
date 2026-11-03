import { read, setL } from "@/lib/store";
import { LabBox } from "./LabBox";

// 실험실 4 · 인증과 권한, 둘 중 하나만 있으면?
export function AuthLab() {
  const { L } = read();
  const a: boolean = L.a ?? true,
    z: boolean = L.z ?? false;
  let msg: React.ReactNode, c: string;
  if (a && z) {
    msg = <>준호는 로그인했고, 규칙이 &apos;자기 것만&apos;이라 민지 주문은 <b>안 보여요</b>. 정상이에요.</>;
    c = "ok";
  } else if (a && !z) {
    msg = <>준호가 누구인지는 알지만 &apos;자기 것만&apos; 규칙이 없어서 <b>민지 주문까지 보여요</b>. 퀴즈의 그 상황이에요.</>;
    c = "no";
  } else if (!a && z) {
    msg = <>규칙은 있지만 누가 누구인지 모르니 &apos;본인&apos;을 판단할 수 없어요. 그래서 <b>아무것도 안 보여요</b>. 안전하지만 서비스를 쓸 수 없어요.</>;
    c = "nt";
  } else {
    msg = <>누구인지도 모르고 규칙도 없어요. <b>아무나 모든 주문</b>을 봐요.</>;
    c = "no";
  }
  return (
    <LabBox title="인증과 권한, 둘 중 하나만 있으면?">
      <p>준호가 민지의 주문 내역을 열어보려고 해요.</p>
      <div className="ctrl">
        <span>인증(로그인):</span>
        <button className={`tog ${a ? "on" : ""}`} onClick={() => setL({ a: true })}>있음</button>
        <button className={`tog ${!a ? "on" : ""}`} onClick={() => setL({ a: false })}>없음</button>
      </div>
      <div className="ctrl">
        <span>권한(자기 것만 규칙):</span>
        <button className={`tog ${z ? "on" : ""}`} onClick={() => setL({ z: true })}>있음</button>
        <button className={`tog ${!z ? "on" : ""}`} onClick={() => setL({ z: false })}>없음</button>
      </div>
      <div className={`out ${c}`}>{msg}</div>
    </LabBox>
  );
}
