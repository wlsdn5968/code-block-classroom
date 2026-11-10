// AI에게 물어볼 질문 꾸러미 (기획서 v2 5장 ②): 레슨의 "AI에게 이렇게 물어보세요" 표를 모아 복사·저장한다.
// 질문 문장은 승인된 레슨 문장 그대로다
"use client";
import { useState } from "react";
import { saveBlob } from "@/lib/download";
import { ASK_SETS, askText } from "@/lib/kit";
import { go, read } from "@/lib/store";

export function Ask() {
  const { cseen } = read();
  const open = ASK_SETS.filter((s) => cseen[s.id]);
  const total = open.reduce((n, s) => n + s.items.length, 0);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(askText(cseen));
      setMsg({ ok: true, text: `질문 ${total}개를 복사했어요. AI 대화창에 붙여 넣으세요.` });
    } catch {
      setMsg({ ok: false, text: "복사하지 못했어요. '글자 파일로 저장'을 써 보세요." });
    }
  };
  const save = () => {
    saveBlob(new Blob([askText(cseen)], { type: "text/plain;charset=utf-8" }), "ai-questions.txt");
    setMsg({ ok: true, text: `질문 ${total}개를 글자 파일로 저장했어요.` });
  };
  return (
    <section className="page" data-new="game">
      <span className="eyebrow">내 가방 · 질문 꾸러미</span>
      <h2>AI에게 물어볼 질문 꾸러미</h2>
      <p className="lead">레슨의 맞혀보기에 답하면 그 레슨의 질문이 열려요. 복사해서 AI 대화창에 그대로 붙여 넣으세요.</p>
      <div className="row">
        <button className="btn" disabled={total === 0} onClick={copy}>
          열린 질문 복사
        </button>
        <button className="btn alt" disabled={total === 0} onClick={save}>
          글자 파일로 저장
        </button>
      </div>
      <div role="status" aria-live="polite">
        {msg && <div className={`out ${msg.ok ? "ok" : "no"}`}>{msg.text}</div>}
      </div>
      {ASK_SETS.map((s) => (
        <div className="rcard" key={s.id} data-set={s.id}>
          <div className="rhead">
            <b>{s.name}</b>
            <span>{cseen[s.id] ? `질문 ${s.items.length}개` : "🔒 아직"}</span>
          </div>
          {cseen[s.id] ? (
            <ul className="asks">
              {s.items.map((i) => (
                <li key={i.q}>
                  <b>{i.q}</b>
                  <span>왜: {i.why}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="lock">이 레슨의 맞혀보기에 답하면 열려요.</p>
          )}
        </div>
      ))}
      <div className="row">
        <button className="btn alt" onClick={() => go("me")}>
          내 기록으로
        </button>
        <button className="btn alt" onClick={() => go("home")}>
          지도로
        </button>
      </div>
    </section>
  );
}
