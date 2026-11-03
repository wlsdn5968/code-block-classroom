import { read, setL } from "@/lib/store";
import { LabBox } from "./LabBox";

// 실험실 9 · 세이브 포인트로 되돌리기
const C = ["첫 화면 완성", "로그인 붙임", "차트 추가"];

export function RepoLab() {
  const { L } = read();
  const head: number = L.head ?? 2,
    broken: boolean = L.broken ?? false;
  return (
    <LabBox title="세이브 포인트로 되돌리기">
      <p>지금까지 커밋(세이브) 3개가 있어요.</p>
      <div className="commits">
        {C.map((c, i) => (
          <button key={i} className={`cm ${i === head && !broken ? "head" : ""}`} onClick={() => setL({ head: i, broken: false })}>
            <span className="dot"></span>
            <span>{c}</span>
            <i>{i === head && !broken ? "지금 여기" : "여기로 되돌리기"}</i>
          </button>
        ))}
      </div>
      <div className={`screen ${broken ? "bad" : ""}`}>{broken ? "(하얀 화면… 앱이 안 열려요)" : `앱 화면 · ${C.slice(0, head + 1).join(" + ")}`}</div>
      {broken ? (
        <div className="out no">AI의 수정으로 망가졌어요. 위에서 세이브 포인트를 눌러 되돌려보세요.</div>
      ) : (
        <button className="btn alt" onClick={() => setL({ broken: true })}>
          AI에게 대규모 수정 맡기기 (커밋 안 함)
        </button>
      )}
      <div className="out nt">되돌리면 세이브 이후에 한 수정은 사라져요. 그래서 &apos;잘 될 때마다 커밋&apos;이 습관이 되면 좋아요.</div>
    </LabBox>
  );
}
