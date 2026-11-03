import { read, setL } from "@/lib/store";
import { LabBox } from "./LabBox";

// 실험실 1 · 남의 화면 코드 열어보기. 아래 키는 가짜이고 잘려 있다 (예시).
const lines = ['<div class="item">', "  <h3>고양이 쿠션</h3>", '  <p class="price">9,900원</p>', '  <button onclick="buy()">구매하기</button>', "</div>", "<script>", '  const PAY_SECRET_KEY = "live_sk_7Hq2...";', "  function buy(){ pay(9900, PAY_SECRET_KEY) }", "</" + "script>"];

export function UiLab() {
  const { L } = read();
  const f = L.found;
  return (
    <LabBox title="남의 화면 코드 열어보기">
      <div className="shop">
        <span>
          <b>고양이 쿠션</b> · 9,900원
        </span>
        <button className="btn sm" onClick={() => setL({ open: !L.open })}>
          {L.open ? "개발자 도구 닫기" : "개발자 도구 열기 (F12)"}
        </button>
      </div>
      {L.open ? (
        <>
          <p>
            이 쇼핑몰의 화면 코드예요. <b>위험한 줄</b>을 눌러보세요.
          </p>
          <div className="term">
            {lines.map((t, i) => (
              <button key={i} className={`ln ${f === i ? (i === 6 ? "hit" : "miss") : ""}`} onClick={() => setL({ found: i })}>
                {`${String(i + 1).padStart(2, " ")}  ${t}`}
              </button>
            ))}
          </div>
          {f != null &&
            (f === 6 ? (
              <div className="out ok">
                <b>찾았어요.</b> 7번 줄에 결제 <b>시크릿 키</b>가 그대로 있어요. 이 화면을 연 사람은 누구나 이 키를 복사할 수 있어요. 시크릿 키는 서버에만 둬야 해요.
              </div>
            ) : (
              <div className="out nt">이 줄은 화면 모양이나 동작이라 보여도 괜찮아요. 다른 줄을 찾아보세요.</div>
            ))}
        </>
      ) : (
        <p className="lead">버튼을 눌러 이 쇼핑몰의 화면 코드를 열어보세요.</p>
      )}
    </LabBox>
  );
}
