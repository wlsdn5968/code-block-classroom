import { RULES, SOURCES, srcLink, srcLinks } from "@/lib/content";
import { go } from "@/lib/store";
import { Html } from "../Html";

export function Rules() {
  return (
    <section className="page">
      <span className="eyebrow">무엇을 만들든</span>
      <h2>공통 규칙 3가지</h2>
      <ol className="rules">
        {RULES.map((r, i) => (
          <Html as="li" key={i} html={`${r.html}<br><span class="src">${r.sources.every((k) => SOURCES[k].kind === "secondary") ? '<span class="badge2">2차 자료</span> ' : ""}근거 · ${srcLinks(r.sources)}</span>`} />
        ))}
      </ol>
      <span className="eyebrow">이 교실이 참고한 문서 전체 (2026-11-03 확인)</span>
      <ul className="srclist">
        {Object.keys(SOURCES).map((k) => (
          <Html as="li" key={k} html={srcLink(k)} />
        ))}
      </ul>
      <button className="btn alt" onClick={() => go("home")}>
        처음으로
      </button>
    </section>
  );
}
