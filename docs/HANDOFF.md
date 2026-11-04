# 인수인계 (HANDOFF)

마지막 갱신 2026-11-04 · 클라우드 세션 → 로컬 세션 이관용. 새 세션은 이 파일을 먼저 읽는다.

## 1. 현재 상태 (한눈에)
| 항목 | 상태 |
|---|---|
| 저장소 | github.com/wlsdn5968/code-block-classroom (Public), 기본 브랜치 main |
| 배포 | Vercel 팀 Gyeol Lab, 프로젝트 `code-block-classroom`, main 푸시 시 자동 배포 |
| 실제 주소 | https://code-block-classroom.vercel.app |
| 최신 main | PR #1~#9 merge 완료. 1단계 MVP + 출처 정비 + 신규 챕터 "AI와 일하는 법" 배포됨 |
| 검사 | `npm run build`(출처 검사·이식 검증 포함) 통과, `npm run test:parity` 77 시나리오 546회 실패 0 (로컬·실제 주소 모두). 사용자 PC(Node 24.14.0)에서도 같은 결과 확인 (2026-11-04) |
| 미결 | 아래 4절 |

## 2. 작업 규칙 (기획안 부록 A-3 + 이 프로젝트에서 합의한 것)
1. **콘텐츠 문장은 승인 없이 바꾸지 않는다.** 바꿔야 할 문장은 목록으로 보고 → 승인 → 수정. 승인된 변경은 `scripts/verify-port.mjs`의 `INTENDED_CHANGES`에 등록.
2. **출처 없는 사실 문장 금지.** 설명 단락·미션 해설·번역기·공통 규칙은 `sources`가 1개 이상. 설명·비유는 `noSource: "설명" | "비유"`. 출처 원문을 직접 내려받아 대조한 뒤에만 연결한다(추측 금지).
3. **main에 직접 커밋하지 않는다.** 브랜치 → PR → CI 통과 → merge. merge는 Claude가 해도 된다고 사용자가 허락함.
4. 새 콘텐츠는 **문장마다 원문 인용(`evidence`)을 붙여** 초안 → 인용을 원문 파일과 자동 대조 → 사람(또는 독립 검토 에이전트)이 의미 대조 → 승인 → 반영. 신규 챕터는 이 방식으로 만들었다(`docs/content-port-report.md` 9절).
5. 변경마다 **독립 검토**(낮은 등급 모델 에이전트, 읽기 전용)로 승인 범위·diff 대조·코드 버그를 교차 확인한다.
6. secret 키·service_role 키를 화면 코드나 `NEXT_PUBLIC_`에 두지 않는다. 버튼·입력 글자색은 명시(Android 버그 이력).
7. volatile 출처는 90일 안에 재확인(`checkedAt` 갱신). 현재 값 기준 **2027-02-02부터 빌드 실패**.

## 3. 저장소 지도
- `content/` 콘텐츠 JSON (sources.json 53건, blocks 9, types 7, phrases 19, rules 3, chapters/ai-work 레슨 4 + 번역기 5)
- `components/`, `lib/` 화면과 상태. `components/views/Chapter.tsx`가 신규 챕터 화면
- `scripts/check-sources.mjs` 출처 검사(빌드 전 실행) · `scripts/verify-port.mjs` 프로토타입 대비 글자 검증 · `scripts/extract-content.mjs` 최초 이식 도구(다시 실행 금지: content를 덮어씀)
- `tests/parity.mjs` 프로토타입 vs 앱 화면 동등성 (`APP_URL=https://code-block-classroom.vercel.app/ npm run test:parity`로 실제 배포 검사)
- `docs/content-port-report.md` 이식·대조·수정 이력 전부 (1~9절). `docs/proposals/` 승인된 초안 원본
- `prototype/`, `docs/code-block-classroom-plan.md` 원본(수정 금지)

## 4. 미결 과제 (우선순위 순)
| # | 과제 | 상태 | 다음 행동 |
|---|---|---|---|
| 1 | 열쇠 블록 설명 3의 보충 문장이 바로 앞 문장과 중복 | **완료** (2026-11-04) | 사용자 승인 (b-1): ghignore 원문 범위 표현으로 교체. `docs/content-port-report.md` 9-1 |
| 2 | 실제 기기(Android·iPhone) 점검 — 기획안 8장 7단계 | 사용자 미실행 | 주소 열어 블록 1개 끝까지 + 5번 메뉴. 이상 시 캡처 → 수정 |
| 3 | SNS 미션 2 "개인 계정이면 먼저 전환해야 해요" | 출처 추가됨(instafb), 문장은 부분 일치 | 문장 축소 승인 여부 결정 ("개인(일반) 계정은 쓸 수 없어요"가 원문 직접 근거) |
| 4 | 기획안 10장 결정 항목 | 미결 | 서비스 이름, 공개 범위(현재 Public·주소 공개), 수익화, 2단계(로그인) 시점, 도메인 |
| 5 | 2단계(로그인·진도 저장) | 미착수 | 기획안 6·7장. Supabase Free 프로젝트 2개 한도 확인부터 |
| 6 | 화면 머리글 "프로토타입 v3" 표기 | 원본 그대로 | 바꾸려면 승인 필요 |

## 5. 로컬에서 시작하는 법
```
git clone https://github.com/wlsdn5968/code-block-classroom
cd code-block-classroom
npm ci
npx playwright install chromium     # 동등성 검사용 (1회)
npm run build && npm run test:parity
```
CI는 Node 22 기준(`.github/workflows/check.yml`), 사용자 PC는 24.14.0. `gh` CLI가 로그인돼 있어야 PR 생성·merge가 된다(`gh auth status`).

## 6. 클라우드 세션에서만 있던 것 (로컬에 없음)
- 출처 원문 텍스트 파일(28+22건) — 재확인 때 다시 내려받으면 된다(URL은 `content/sources.json`).
- 위키독스(kismock)는 봇 차단으로 내려받지 못함 → 로컬 브라우저로 직접 확인.
