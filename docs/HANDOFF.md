# 인수인계 (HANDOFF)

갱신 2026-11-17. 지금 이어서 작업하는 데 필요한 것만 적는다. 규칙은 [CLAUDE.md](../CLAUDE.md), 대화에만 있던 원칙은 [principles.md](principles.md), 이력은 `docs/content-port-report.md`(최근 27절), 결정은 `docs/decisions.md`. CLEAR 뒤 붙여 넣을 프롬프트는 [next-session-prompt.md](next-session-prompt.md).

## 지금 상태
- main은 PR #38(도구)과 이 정리 PR(문서만)까지 합쳐진다. 실제 주소 정상: 전 과정 검사 336곳 문제 0(2026-11-13, main `d0115d7`).
- 열린 PR: **#37 `content/easy-m4-ctx-mcp` — 운영자 승인 대기.**

## 승인 대기
- PR #37: 레슨 `ctx`·`mcp` 쉬운 말 + im-not-ai 점검. MCP 팀 저장소 단락의 사실 바로잡기(`claude -p`에서는 묻지 않고 불러옴) 포함. 대조표는 PR 본문. 자동 merge 꺼 둠.
- 승인되면: 문장은 더 고치지 않는다 → PR 댓글로 승인 기록 → merge → 실제 주소 확인.

## 다음 할 일
1. M4 마지막 레슨 2개: `content/chapters/ai-work/`의 skill, perm. 쉬운 말 + im-not-ai 점검을 한 PR에서(규칙 10·12, [ai-tone-check.md](ai-tone-check.md)). `perm`은 맞혀보기 보기2·해설·제목에도 연결어미 쉼표가 있다.
2. M4 마무리: 경고가 0이 되면 `scripts/check-plain.mjs`를 빌드 실패로 바꾼다(`docs/plan-v2-game.md` 6-3). `mem`에 풀이 없는 영어 2개가 남아 있다.
3. 기존 문장 문제(보고서 26-3, 26-5, 26-6): `pileup` 숫자·낱말 4곳, `aidelete`의 'AI에게 이렇게 물어보세요' 표 풀이, `ctx`·`mcp`의 남은 검토 지적.
4. M5 새 지역 "비밀과 개인정보 지키기"(plan-v2 7장), 그다음 M6. 출처 재확인 마감 **2027-02-02**(`content/sources.json`, 자주 바뀌는 출처 32건).
5. 운영자 몫: 실제 기기(Android·iPhone) 점검, 기획안 10장 결정(이름·수익화·도메인).

## 알아 둘 것
- 임시 폴더(scratchpad)는 앱을 다시 켜면 비워진다. 계속 쓸 도구는 `scripts/`(레슨 도우미 `lesson-tools.mjs`).
- 올리지 않은 패키지: TypeScript 7, ESLint 10. 개발 도구 보안 경고 7건(minimatch). 보고서 25-4.
- 이미 합쳐진 브랜치(GitHub 37·이 PC 11)는 그대로 두기로 함(2026-11-17 승인). 한 줄 정리(`sum`)는 수칙 카드(`lib/kit.ts`)에도 나온다.
