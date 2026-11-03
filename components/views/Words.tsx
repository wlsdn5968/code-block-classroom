import { BLOCKS, BORDER, PHRASES, srcLinks } from "@/lib/content";
import { go, read } from "@/lib/store";
import { Html } from "../Html";

export function Words() {
  const { S } = read();
  const f = S.filter,
    list = PHRASES.filter((p) => f === "all" || p.block === f || (f === "danger" && p.danger));
  return (
    <section className="page">
      <span className="eyebrow">AI 말 번역기</span>
      <h2>AI가 이렇게 말하면, 이런 뜻이에요</h2>
      <p className="lead">승인 버튼을 누르기 전에 &quot;확인할 것&quot;만 한 번 보세요.</p>
      <div className="chips">
        <button className={`chip ${f === "all" ? "on" : ""}`} onClick={() => go("words", { filter: "all" })}>
          전체
        </button>
        <button className={`chip ${f === "danger" ? "on" : ""}`} onClick={() => go("words", { filter: "danger" })}>
          ⚠ 조심할 말
        </button>
        {BORDER.map((k) => (
          <button key={k} className={`chip ${f === k ? "on" : ""}`} onClick={() => go("words", { filter: k })}>
            {BLOCKS[k].name}
          </button>
        ))}
      </div>
      {list.map((p) => (
        <div className="ph" key={p.say}>
          <Html as="div" className={`say ${p.danger ? "danger" : ""}`} html={`${p.danger ? "⚠ " : "💬 "}"${p.say}"`} />
          <dl>
            <dt>뜻</dt>
            <Html as="dd" html={p.mean} />
            <dt>확인할 것</dt>
            <Html as="dd" html={p.chk} />
          </dl>
          <Html className="src" html={`${p.block !== "all" ? BLOCKS[p.block].name + " 블록 · " : ""}근거 · ${srcLinks(p.sources)}`} />
        </div>
      ))}
    </section>
  );
}
