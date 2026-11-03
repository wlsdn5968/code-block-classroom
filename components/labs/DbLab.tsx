import { read, setL } from "@/lib/store";
import { LabBox } from "./LabBox";

// 실험실 3 · 출입 규칙(RLS) 켜고 끄기. 표의 이름·주문은 예시.
const rows: [number, string, string, number][] = [
  [1, "민지", "고양이 쿠션", 9900],
  [2, "준호", "머그컵", 12000],
  [3, "민지", "노트", 3000],
  [4, "서연", "우산", 15000],
  [5, "준호", "양말", 5000],
];

export function DbLab() {
  const { L } = read();
  const who: string = L.who ?? "민지",
    rls: boolean = L.rls ?? true;
  const vis = (r: (typeof rows)[number]) => !rls || (who !== "익명" && r[1] === who);
  const n = rows.filter(vis).length;
  return (
    <LabBox title="출입 규칙(RLS) 켜고 끄기">
      <p>주문 표(orders)예요. 누가 로그인했는지, RLS가 켜졌는지에 따라 보이는 줄이 달라져요.</p>
      <div className="ctrl">
        <span>로그인한 사람:</span>
        {["민지", "준호", "서연", "익명"].map((w) => (
          <button key={w} className={`tog ${who === w ? "on" : ""}`} onClick={() => setL({ who: w })}>
            {w === "익명" ? "로그인 안 함" : w}
          </button>
        ))}
      </div>
      <div className="ctrl">
        <span>RLS:</span>
        <button className={`tog ${rls ? "on" : ""}`} onClick={() => setL({ rls: true })}>
          켬
        </button>
        <button className={`tog ${!rls ? "on" : ""}`} onClick={() => setL({ rls: false })}>
          끔
        </button>
      </div>
      {rls && (
        <div className="term">
          <span className="ln">create policy &quot;내 주문만&quot; on orders</span>
          <span className="ln">{"  for select using ( auth.uid() = user_id );"}</span>
        </div>
      )}
      <div className="dbt">
        <table>
          <tbody>
            <tr>
              <th>id</th>
              <th>주문자</th>
              <th>상품</th>
              <th>금액</th>
            </tr>
            {rows.map((r) => (
              <tr key={r[0]} className={vis(r) ? "" : "hide"}>
                <td>{r[0]}</td>
                <td>{r[1]}</td>
                <td>{r[2]}</td>
                <td>{r[3].toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className={`out ${rls ? "ok" : "no"}`}>
        {rls ? (
          who === "익명" ? (
            "로그인하지 않으면 '본인'을 알 수 없어서 아무 줄도 안 보여요."
          ) : (
            `${who}에게는 자기 주문 ${n}건만 보여요.`
          )
        ) : (
          <>
            RLS가 꺼져서 <b>누구든 5건 전부</b>를 봐요. 로그인 안 한 사람까지요.
          </>
        )}
      </div>
    </LabBox>
  );
}
