"use client";
// 레슨 'AI가 지운 데이터'의 미리보기: DELETE에 WHERE 조건이 있는지, 마지막에 COMMIT 하는지 ROLLBACK 하는지에 따라 남는 행.
// 주문 5건은 설명용 예시다.
import { useEffect, useState } from "react";
import { gameEvent } from "@/lib/store";
import { Quest } from "../game/Quest";
import { LabBox } from "../labs/LabBox";

const ROWS = [
  { id: 1, st: "완료" },
  { id: 2, st: "취소" },
  { id: 3, st: "완료" },
  { id: 4, st: "취소" },
  { id: 5, st: "배송 중" },
];

export function DeletePreview() {
  const [where, setWhere] = useState(true);
  const [end, setEnd] = useState<"commit" | "rollback">("commit");
  const [emptied, setEmptied] = useState(false); // 표를 한 번이라도 비워 봤는지(목표 판정용)
  // 배지 "되돌리기 장인": WHERE 없이 지우고 ROLLBACK으로 5건을 지킴
  useEffect(() => {
    if (!where && end === "rollback") gameEvent("delete-rollback");
  }, [where, end]);
  const hit = (r: (typeof ROWS)[number]) => !where || r.st === "취소";
  const left = end === "rollback" ? ROWS : ROWS.filter((r) => !hit(r));
  const sql = `BEGIN;\nDELETE FROM orders${where ? "\n  WHERE status = '취소'" : ""};\n${end === "commit" ? "COMMIT" : "ROLLBACK"};`;
  return (
    <LabBox title="지우기 전에 미리 보기">
      <p>주문 5건(예시)이 있는 표에서 지워 봐요. 조건과 마무리를 바꿔 보세요.</p>
      {/* 목표: 먼저 표를 비우고(WHERE 없음 + COMMIT), 그다음 ROLLBACK으로 되돌리기 */}
      <Quest id="delete" met={emptied && !where && end === "rollback"} />
      <div className="ctrl">
        <span>조건</span>
        <button className={`tog ${where ? "on" : ""}`} onClick={() => setWhere(true)}>
          WHERE 있음
        </button>
        <button className={`tog ${!where ? "on" : ""}`} onClick={() => {
            setWhere(false);
            if (end === "commit") setEmptied(true);
          }}
        >
          WHERE 없음
        </button>
      </div>
      <div className="ctrl">
        <span>마무리</span>
        <button className={`tog ${end === "commit" ? "on" : ""}`} onClick={() => {
            setEnd("commit");
            if (!where) setEmptied(true);
          }}
        >
          COMMIT
        </button>
        <button className={`tog ${end === "rollback" ? "on" : ""}`} onClick={() => setEnd("rollback")}>
          ROLLBACK
        </button>
      </div>
      <div className="term">
        <pre style={{ margin: 0, padding: "0 14px" }}>{sql}</pre>
      </div>
      <div className={`out ${left.length === 0 ? "no" : left.length === ROWS.length ? "nt" : "ok"}`} data-k="left">
        남은 주문 <b>{left.length}건</b>
        {left.length ? `: ${left.map((r) => `${r.id}번(${r.st})`).join(", ")}` : " — 표는 남았지만 비었어요."}
      </div>
      <p className="lead">주문 5건은 설명용 예시예요. ROLLBACK을 고르면 지운 것이 모두 취소돼요.</p>
    </LabBox>
  );
}
