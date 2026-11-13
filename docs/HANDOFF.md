# 인수인계 (HANDOFF)

갱신 2026-11-13. 지금 이어서 작업하는 데 필요한 것만 적는다. 규칙·일하는 순서는 [CLAUDE.md](../CLAUDE.md)(AI 티 점검은 규칙 12), 이력은 `docs/content-port-report.md`(최근 26절), 결정은 `docs/decisions.md`, 점검 결과는 `docs/audit-2026-11-12.md`.

## 지금 상태
- main은 PR #35(`aidelete`·`retry`)·#36(문서)까지 합쳐졌고, 이 도구·문서 PR이 그 위에 합쳐진다. 실제 주소에 PR #35 문장이 올라간 것을 확인함(2026-11-13).
- 열린 PR: **#37 `content/easy-m4-ctx-mcp` — 운영자 승인 대기.**

## 승인 대기
- PR #37: 레슨 `ctx`·`mcp` 쉬운 말 + im-not-ai 점검. MCP 팀 저장소 단락의 사실 바로잡기(`claude -p`에서는 묻지 않고 불러옴) 포함. 고치기 전·후 대조는 PR 본문. 자동 merge 꺼 둠.
- 승인되면: 문장은 더 고치지 않는다 → PR 댓글로 승인 기록 → merge → 실제 주소 확인.

## 다음 할 일
1. M4 마지막 레슨 2개: `content/chapters/ai-work/`의 skill, perm. 쉬운 말 + im-not-ai 점검을 한 PR에서(규칙 12). `perm`은 맞혀보기 보기2·해설·제목에도 연결어미 쉼표가 있다.
   - 도구: `node scripts/lesson-tools.mjs`(verify·comma·extract·packet, 사용법은 파일 맨 위). 단락 번호는 JSON 순서대로 붙으므로 기본 단락을 앞에 둔다.
2. M4 마무리: 경고가 0이 되면 `scripts/check-plain.mjs`를 빌드 실패로 바꾼다(`docs/plan-v2-game.md` 6-3). `mem`에 풀이 없는 영어 2개가 남아 있다. 연결어미 쉼표 검사(`lesson-tools.mjs comma`)를 빌드 검사에 넣을지도 정한다.
3. 기존 문장 문제(보고서 26-3, 26-5, 26-6): `pileup` 숫자·낱말 4곳, `aidelete` 'AI에게 이렇게 물어보세요' 표의 SELECT·UPDATE·커밋 풀이, `ctx`·`mcp`의 남은 검토 지적.
4. M5 새 지역 "비밀과 개인정보 지키기"(plan-v2 7장), 그다음 M6. 출처 재확인 마감 **2027-02-02**(`content/sources.json`).
5. 운영자 몫: 실제 기기(Android·iPhone) 점검, 기획안 10장 결정(이름·수익화·도메인).

## 알아 둘 것
- 임시 폴더(scratchpad)는 앱을 다시 켜면 비워진다(2026-11-13 실제로 비워짐). 계속 쓸 도구는 `scripts/`에 둔다.
- 올리지 않은 패키지: TypeScript 7, ESLint 10. 개발 도구 보안 경고 7건(minimatch). 보고서 25-4.
- `lib/store.ts`의 `gameSize`: 진도 파일을 불러온 뒤 "새로 더한 기록" 숫자가 보스 별을 별 수만큼 센다(작은 문제).
- 한 줄 정리(`sum`)는 수칙 카드(`lib/kit.ts`)에도 그대로 나온다. 고치면 카드도 바뀐다.
