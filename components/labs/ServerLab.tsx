import { read, setL } from "@/lib/store";
import { LabBox } from "./LabBox";

// 실험실 2 · 주문서 금액 바꿔치기
export function ServerLab() {
  const { L } = read();
  const amt = L.amt ?? 100,
    chk = L.chk ?? false,
    r = L.res;
  return (
    <LabBox title="주문서 금액 바꿔치기">
      <p>
        진짜 가격은 <b>9,900원</b>이에요. 화면에서 보내는 주문서의 금액을 바꿔서 보내보세요.
      </p>
      <div className="term">
        <span className="ln">POST /api/order</span>
        <span className="ln">{`{ "item": "고양이 쿠션", "amount": ${Number(amt) || 0} }`}</span>
      </div>
      <div className="ctrl">
        <label htmlFor="amt">보낼 금액</label>
        {/* 프로토타입과 달리 입력하면 미리보기가 따라오고 지난 결과는 지운다 (칸과 화면이 어긋나지 않게) */}
        <input id="amt" type="number" defaultValue={amt} onInput={(e) => setL({ amt: e.currentTarget.value, res: null })} /> 원
      </div>
      <div className="ctrl">
        <span>서버의 가격 확인:</span>
        <button className={`tog ${chk ? "on" : ""}`} onClick={() => setL({ chk: true, res: null })}>
          켬
        </button>
        <button className={`tog ${!chk ? "on" : ""}`} onClick={() => setL({ chk: false, res: null })}>
          끔
        </button>
      </div>
      <button className="btn" onClick={() => setL({ res: 1 })}>
        주문서 보내기
      </button>
      {r ? (
        +amt === 9900 ? (
          <div className="out ok">정상 결제: 9,900원</div>
        ) : chk ? (
          <div className="out ok">
            <b>서버가 막았어요.</b> 서버가 기록장의 진짜 가격(9,900원)과 비교했더니 {Number(amt).toLocaleString()}원으로 달라서 주문을 거절했어요.
          </div>
        ) : (
          <div className="out no">
            <b>{Number(amt).toLocaleString()}원에 팔렸어요.</b> 서버가 화면에서 온 금액을 그대로 믿었기 때문이에요. 확인을 켜고 다시 보내보세요.
          </div>
        )
      ) : null}
    </LabBox>
  );
}
