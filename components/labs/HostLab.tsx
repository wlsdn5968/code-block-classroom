import { read, setL } from "@/lib/store";
import { LabBox } from "./LabBox";

// 실험실 7 · 내 노트북 vs 친구 휴대폰. my-app.vercel.app은 설명용 예시 주소.
const Cell = ({ ok, t }: { ok: boolean; t: string }) => <div className={`out ${ok ? "ok" : "no"}`}>{t}</div>;

export function HostLab() {
  const { L } = read();
  const d: boolean = L.dep ?? false;
  return (
    <LabBox title="내 노트북 vs 친구 휴대폰">
      <p>같은 주소를 두 기기에서 열어볼게요.</p>
      <div className="dev">
        <div className="dv">
          <b>💻 내 노트북 (개발 중)</b>
          <code>localhost:3000</code>
          <Cell ok t="열려요. 이 노트북 안에서 개발 서버가 돌고 있으니까요." />
          {d && (
            <>
              <code>my-app.vercel.app</code>
              <Cell ok t="열려요." />
            </>
          )}
        </div>
        <div className="dv">
          <b>📱 친구 휴대폰</b>
          <code>localhost:3000</code>
          <Cell ok={false} t="안 열려요. 친구 폰은 '친구 폰 자기 자신'에서 찾아요." />
          {d && (
            <>
              <code>my-app.vercel.app</code>
              <Cell ok t="열려요. 인터넷에 올라간 주소니까요." />
            </>
          )}
        </div>
      </div>
      {d ? (
        <div className="out nt">
          배포 완료. 주소 <code>my-app.vercel.app</code>는 설명용 예시예요.
        </div>
      ) : (
        <button className="btn" onClick={() => setL({ dep: true })}>
          배포하기 (인터넷에 올리기)
        </button>
      )}
    </LabBox>
  );
}
