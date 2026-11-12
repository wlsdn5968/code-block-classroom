# 인수인계 (HANDOFF)

갱신 2026-11-12. 지금 이어서 작업하는 데 필요한 것만 적는다. 규칙·일하는 순서는 [CLAUDE.md](../CLAUDE.md)(AI 티 점검은 규칙 12), 이력은 `docs/content-port-report.md`(최근 26절), 결정은 `docs/decisions.md`, 점검 결과는 `docs/audit-2026-11-12.md`.

## 지금 상태
- main은 PR #34(레슨 6개 AI 티 줄이기)까지 합쳐졌고, 이 문서 PR이 그 위에 합쳐진다. 실제 주소 정상(전 과정 검사 330곳 문제 0, 2026-11-12).
- 열린 PR: **#35 `content/easy-m4-aidelete-retry` — 운영자 승인 대기.**

## 승인 대기
- PR #35: 레슨 `aidelete`·`retry` 쉬운 말 + im-not-ai 점검, PR #34 후속 쉼표 1곳(`dbslow`). 고치기 전·후 대조는 PR 본문에 있다. 자동 merge 꺼 둠.
- 승인되면: 문장은 더 고치지 않는다 → PR 댓글로 승인 기록 → merge → 실제 주소 확인.

## 다음 할 일
1. M4 마지막 레슨 4개를 2개씩: `content/chapters/ai-work/`의 ctx, mcp → skill, perm. 쉬운 말로 다시 쓰고 같은 PR에서 im-not-ai 점검까지 한다(규칙 12).
   - 방법: 변환 스크립트로 단락을 옮기고, 옮긴 본문이 원래와 같은지 기계로 대조한다(보고서 26-2). 단락 번호는 JSON 순서대로 붙으므로 기본 단락을 앞에 둔다.
2. 이번에 쓴 임시 스크립트(단락 옮기기, 기계 대조, 연결어미 쉼표 찾기)를 `scripts/`로 옮긴다(임시 폴더는 앱을 다시 켜면 비워짐). 연결어미 쉼표 검사를 `check-plain`에 넣을지도 정한다.
3. M4 마무리: 경고가 0이 되면 `scripts/check-plain.mjs`를 빌드 실패로 바꾼다(`docs/plan-v2-game.md` 6-3). `mem`에 풀이 없는 영어 2개가 남아 있다.
4. 기존 문장 문제(보고서 26-3, 26-5): `pileup` 숫자·낱말 4곳, `aidelete`의 'AI에게 이렇게 물어보세요' 표의 SELECT·UPDATE·커밋 풀이.
5. M5 새 지역 "비밀과 개인정보 지키기"(plan-v2 7장), 그다음 M6. 출처 재확인 마감 **2027-02-02**(`content/sources.json`).
6. 운영자 몫: 실제 기기(Android·iPhone) 점검, 기획안 10장 결정(이름·수익화·도메인).

## 알아 둘 것
- 올리지 않은 패키지: TypeScript 7, ESLint 10. 개발 도구 보안 경고 7건(minimatch). 보고서 25-4.
- `lib/store.ts`의 `gameSize`: 진도 파일을 불러온 뒤 "새로 더한 기록" 숫자가 보스 별을 별 수만큼 센다(작은 문제).
- 한 줄 정리(`sum`)는 수칙 카드(`lib/kit.ts`)에도 그대로 나온다. 고치면 카드도 바뀐다.
