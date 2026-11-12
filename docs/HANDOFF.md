# 인수인계 (HANDOFF)

갱신 2026-11-12(세션 정리). 지금 이어서 작업하는 데 필요한 것만 적는다. 규칙·일하는 순서는 [CLAUDE.md](../CLAUDE.md), 이력은 `docs/content-port-report.md`, 결정은 `docs/decisions.md`, 점검 결과는 `docs/audit-2026-11-12.md`.

## 지금 상태
- main은 PR #30까지 합쳐졌고, 이 세션 정리 문서 PR이 그 위에 합쳐진다. 실제 주소 정상(전 과정 검사 315곳·동등성 검사 539회 문제 0, 2026-11-12).
- 열린 PR: **#29 `content/easy-m4-db-pileup` — 운영자 승인 대기.**

## 승인 대기
- PR #29: 레슨 `dbslow`·`pileup`의 쉬운 말 초안. 검토·재검토 끝, 자동 검사 통과, 자동 merge 꺼 둠. 고치기 전·후 문장 대조는 PR 본문에 있다.
- 승인되면: 문장은 더 고치지 않는다 → PR 댓글로 승인 기록 → merge → 실제 주소 확인 → 보고서에 26절 추가.

## 다음 할 일
1. M4 나머지 레슨 9개를 2~3개씩: `content/chapters/ops/`의 nullzero, limits, bill, aidelete, retry → `content/chapters/ai-work/`의 ctx, mcp, skill, perm.
   - 방법: 접는 단락은 본문을 그대로 옮기고 기본 단락만 짧게 끊는다. 한 줄 정리가 가리키는 내용은 기본에 남긴다. 기준은 `scripts/check-plain.mjs`.
2. M4 마무리: 경고가 0이 되면 `scripts/check-plain.mjs`를 빌드 실패로 바꾼다(`docs/plan-v2-game.md` 6-3).
3. M5 새 지역 "비밀과 개인정보 지키기"(plan-v2 7장), 그다음 M6(plan-v2 5장).
4. 자주 바뀌는 출처 재확인. 마감 **2027-02-02**(그날부터 빌드가 멈춘다). `content/sources.json`.
5. 운영자 몫: 실제 기기(Android·iPhone) 점검, 기획안 10장 결정(이름·수익화·도메인).

## 알아 둘 것
- 올리지 않은 패키지: TypeScript 7, ESLint 10(검사 도구 부품이 아직 지원 안 함). 개발 도구 보안 경고 7건(minimatch)이 남아 있다. 보고서 25-4.
- `lib/store.ts`의 `gameSize`: 진도 파일을 불러온 뒤 "새로 더한 기록" 숫자가 보스 별을 별 수만큼 센다(작은 문제).
- PR 미리보기 주소는 Vercel 로그인이 필요하다.
- 이미 합쳐진 브랜치가 남아 있다(GitHub 29개, 이 PC 3개). 동작에는 영향 없음. 감사 보고서 #6.
