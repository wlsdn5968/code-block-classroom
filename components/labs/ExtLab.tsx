import { read, setL } from "@/lib/store";
import { LabBox } from "./LabBox";

// 실험실 5 · 남의 기능에 요청 보내보기. 주소와 응답은 설명용 예시.
export function ExtLab() {
  const { L } = read();
  const key: boolean = L.key ?? true,
    sent = L.sent;
  return (
    <LabBox title="남의 기능에 요청 보내보기">
      <p>
        가상의 날씨 서비스에 &quot;서울 날씨 알려줘&quot;라고 요청하는 모습이에요. 주소와 응답 모양은 <b>설명용 예시</b>예요.
      </p>
      <div className="term">
        <span className="ln">GET https://api.example-weather.test/now?city=seoul</span>
        <span className="ln">{key ? "Authorization: Bearer ●●●●●● (내 API 키)" : "(열쇠 없음)"}</span>
      </div>
      <div className="ctrl">
        <span>열쇠:</span>
        <button className={`tog ${key ? "on" : ""}`} onClick={() => setL({ key: true, sent: 0 })}>넣기</button>
        <button className={`tog ${!key ? "on" : ""}`} onClick={() => setL({ key: false, sent: 0 })}>빼기</button>
      </div>
      <button className="btn" onClick={() => setL({ sent: 1 })}>
        요청 보내기
      </button>
      {sent ? (
        key ? (
          <>
            <div className="term">
              <span className="ln">200 OK</span>
              <span className="ln">{"{"}</span>
              <span className="ln">{'  "city": "seoul",'}</span>
              <span className="ln">{'  "temp": 18,'}</span>
              <span className="ln">{'  "sky": "맑음"'}</span>
              <span className="ln">{"}"}</span>
            </div>
            <div className="out ok">
              성공(200). 답이 <b>JSON</b>으로 왔어요. &quot;temp&quot; 이름표에 18이 들어 있죠.
            </div>
          </>
        ) : (
          <div className="out no">
            열쇠가 없어서 <b>권한 오류</b>가 돌아와요. 어떤 번호(예: 401, 403)를 주는지는 서비스마다 달라요.
          </div>
        )
      ) : null}
    </LabBox>
  );
}
