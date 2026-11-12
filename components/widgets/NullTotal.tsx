"use client";
// 레슨 '못 읽은 값은 0이 아니다'의 비교: 계좌 하나를 못 읽었을 때, 0으로 넣는 코드와 '모름'으로 다루는 코드.
// 숫자(계좌 300·500·200만 원, 어제 1,000만 원, 30% 경보 기준)는 설명용 예시다.
import { useEffect, useState } from "react";
import { gameEvent } from "@/lib/store";
import { Quest } from "../game/Quest";
import { LabBox } from "../labs/LabBox";

const A = 300;
const B = 500;
const C = 200;
const YESTERDAY = A + B + C;
const ALERT_PCT = 30;
type St = "read" | "fail" | "zero";
const LABEL: Record<St, string> = { read: "읽음(500만 원)", fail: "못 읽음", zero: "정말 0원" };

export function NullTotal() {
  const [st, setSt] = useState<St>("read");
  // 배지 "0과 모름": 세 상태를 모두 눌러 봄
  const [tried, setTried] = useState<St[]>([]); // 시작 상태(읽음)도 직접 눌러야 센다
  useEffect(() => {
    if (tried.length === 3) gameEvent("null-all3");
  }, [tried]);
  const b = st === "read" ? B : 0;
  const naive = A + b + C;
  const drop = Math.round(((YESTERDAY - naive) / YESTERDAY) * 100);
  const alert = drop >= ALERT_PCT;
  return (
    <LabBox title="못 읽은 계좌를 어떻게 셀까">
      <p>계좌 3개(A 300만 원, B 500만 원, C 200만 원)를 더해 총자산을 내요. 어제 총자산은 1,000만 원이고, {ALERT_PCT}% 이상 줄면 경보를 울려요. B의 상태를 바꿔 보세요.</p>
      {/* 목표: ①은 경보, ②는 보류로 갈리는 상태(못 읽음)를 직접 눌러 찾기 */}
      <Quest id="null" met={st === "fail"} />
      <div className="ctrl">
        <span>B 계좌</span>
        {(Object.keys(LABEL) as St[]).map((k) => (
          <button key={k} className={`tog ${st === k ? "on" : ""}`} onClick={() => {
              setSt(k);
              setTried((t) => (t.includes(k) ? t : [...t, k]));
            }}>
            {LABEL[k]}
          </button>
        ))}
      </div>
      <p className="lead">① 못 읽으면 0으로 넣는 코드</p>
      <div className={`out ${alert ? "no" : "ok"}`} data-k="naive">
        총자산 <b>{naive.toLocaleString()}만 원</b>
        {alert ? <> → 어제보다 {drop}% 줄었다며 <b>경보</b>를 울려요.</> : <> → 정상이에요.</>}
      </div>
      <p className="lead">② 못 읽은 값을 &apos;모름&apos;으로 다루는 코드</p>
      {st === "fail" ? (
        <div className="out nt" data-k="careful">
          B를 못 읽었어요. 총자산 계산을 <b>보류</b>하고 B를 다시 읽어요.
        </div>
      ) : (
        <div className={`out ${alert ? "no" : "ok"}`} data-k="careful">
          총자산 <b>{naive.toLocaleString()}만 원</b>
          {alert ? <> → 정말 {drop}% 줄었으니 <b>경보</b>가 맞아요.</> : <> → 정상이에요.</>}
        </div>
      )}
      <p className="lead">숫자는 설명용 예시예요. &apos;못 읽음&apos;과 &apos;정말 0원&apos;은 ①에서는 똑같이 보이지만, ②에서는 다르게 처리돼요.</p>
    </LabBox>
  );
}
