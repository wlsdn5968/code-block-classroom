# 인수인계 (HANDOFF)

갱신 2026-11-12. 지금 이어서 작업하는 데 필요한 것만 적는다. 규칙·일하는 순서는 [CLAUDE.md](../CLAUDE.md)(AI 티 점검은 규칙 12), 이력은 `docs/content-port-report.md`(최근 26절), 결정은 `docs/decisions.md`, 점검 결과는 `docs/audit-2026-11-12.md`.

## 지금 상태
- main은 PR #32(`nullzero`·`limits`·`bill` 쉬운 말)까지 합쳐졌고, 이 문서 PR이 그 위에 합쳐진다. 실제 주소에 새 문장이 올라간 것을 확인함(2026-11-12).
- 열린 PR: **#34 `content/aitone-m4-six` — im-not-ai 점검 반영, 운영자 승인 대기.** 레슨 6개(mem·dbslow·pileup·nullzero·limits·bill).

## 승인 대기
- PR #34: 연결어미 쉼표 37개 제거, 대조 공식 반복 2곳, 지시 대상 1곳, 길어진 문장 나누기 3곳("~할 수 있어요"는 규칙집대로 보존). 고치기 전·후 대조는 PR 본문에 있다.
- 승인되면: 문장은 더 고치지 않는다 → PR 댓글로 승인 기록 → merge → 실제 주소 확인.

## 다음 할 일
1. M4 나머지 레슨 6개를 2~3개씩(`mem`은 시범 레슨으로 끝남): `content/chapters/ops/`의 aidelete, retry → `content/chapters/ai-work/`의 ctx, mcp, skill, perm. 쉬운 말로 다시 쓰고, 같은 PR에서 im-not-ai 점검까지 한다(규칙 12).
   - 방법: 변환 스크립트로 단락을 옮기고, 옮긴 본문이 원래와 같은지 기계로 대조한다(보고서 26-2). 단락 번호는 JSON 순서대로 붙으므로 기본 단락을 앞에 둔다.
2. 이번에 쓴 임시 스크립트(단락 옮기기, 기계 대조, C-11 후보 뽑기)를 `scripts/`로 옮긴다(임시 폴더는 앱을 다시 켜면 비워짐). C-11 검사를 `check-plain`에 넣을지도 정한다.
3. M4 마무리: 경고가 0이 되면 `scripts/check-plain.mjs`를 빌드 실패로 바꾼다(`docs/plan-v2-game.md` 6-3). `mem`에 풀이 없는 영어 2개가 남아 있다.
4. 기존 문장 문제(보고서 26-3): `pileup`의 숫자·낱말 4곳.
5. M5 새 지역 "비밀과 개인정보 지키기"(plan-v2 7장), 그다음 M6. 출처 재확인 마감 **2027-02-02**(`content/sources.json`).
6. 운영자 몫: 실제 기기(Android·iPhone) 점검, 기획안 10장 결정(이름·수익화·도메인).

## 알아 둘 것
- 올리지 않은 패키지: TypeScript 7, ESLint 10. 개발 도구 보안 경고 7건(minimatch). 보고서 25-4.
- `lib/store.ts`의 `gameSize`: 진도 파일을 불러온 뒤 "새로 더한 기록" 숫자가 보스 별을 별 수만큼 센다(작은 문제).
- 한 줄 정리(`sum`)는 수칙 카드(`lib/kit.ts`)에도 그대로 나온다. 고치면 카드도 바뀐다.
