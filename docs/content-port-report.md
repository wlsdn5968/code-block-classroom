# 콘텐츠 이식 보고 (1단계)

작성 2026-11-03 · 프로토타입 v4 → `content/` JSON 이식 결과와, 사람이 확인해야 할 항목.

## 1. 이식 결과

| 항목 | 개수 | 검증 |
|---|---|---|
| 출처 (sources.json) | 29 | `npm run verify:port` — 제목·URL이 원본과 글자 단위로 같음 |
| 블록 레슨 (blocks/) | 9 (설명 단락 38) | 위와 같음 |
| 서비스 유형 (types/) | 7 (미션 17, 조립도 63, 흐름 27) | 위와 같음 |
| AI 말 번역기 (phrases.json) | 19 | 위와 같음 |
| 공통 규칙 (rules.json) | 3 | 위와 같음 |
| 화면·실험실 | 6 화면 + 실험실 9 | `npm run test:parity` — 77 시나리오, 546회 비교, 차이 0 |

문장은 한 글자도 바꾸지 않았다. 바뀐 것은 데이터 모양뿐이다.

| 바뀐 것 | 전 | 후 |
|---|---|---|
| 번역기·미션의 출처 칸 | `s: "nextenv"` (글자 하나) | `sources: ["nextenv"]` (배열) |
| 번역기 위험 표시 | `danger: 1` | `danger: true` |
| 조립도 | `ui: [2, "이유"]` | `ui: { level: 2, reason: "이유" }` |
| 블록 설명 단락 | `["제목", "본문", ["출처"]]` | `{ title, body, sources }` |
| 자동매매봇 흐름 출처 | 화면 코드 안에 `t.id==="bot"?srcs(["kis"])` | `types/bot.json`의 `flowSources: ["kis"]` |

## 2. 출처 필드 값의 근거 (기획안 5장)

프로토타입에는 `title`·`url`만 있었다. 나머지 세 필드는 아래 기준으로 채웠고, **모두 사람이 원문을 열어 확인하기 전까지는 임시값**이다.

| 필드 | 값 | 근거 |
|---|---|---|
| `checkedAt` | 전부 `2026-10-09` | 프로토타입 머리말 "출처 (2026-10-09 확인)" |
| `kind: secondary` | `kismock` 1건 | 원본 제목에 "(2차 자료)"로 표시된 유일한 항목. 기획안 2장 "2차 자료 1건"과 일치 |
| `volatile: true` | sbkey, sbpause, tosskey, upbit, kakao, insta, ec2, claude, kismock | 가격·키 이름·플랜 정책·권한 정책·계정 조건처럼 기획안 5장이 "자주 바뀌는 정보"로 든 종류. **판단 기준은 제목뿐이므로 확인 필요** |

## 3. 출처 검사 범위 (결정: (a)안)

출처 칸이 있는 77개 항목(설명 단락 38·번역기 19·미션 해설 17·공통 규칙 3)은 출처가 없으면 빌드가 실패한다.
출처 칸이 없는 항목(맞혀보기 해설 9·한 줄 정리 9·유형 소개 7·조립도 이유 63·흐름 27)은 경고로만 센다 — `npm run check:sources -- --verbose`.

## 4. 수정이 필요해 보이는 문장 (A-3 조건에 따라 고치지 않고 목록만)

아래는 파일만 보고 찾은 것이다. 공식 문서 사이트는 이 세션의 네트워크 정책에 막혀 **원문 대조를 하지 못했다.** 고치기 전에 사람이 원문을 열어 확인해야 한다.

| # | 위치 | 문장 | 왜 확인이 필요한가 |
|---|---|---|---|
| 1 | blocks/key.json · 설명 2 | "Supabase는 anon, service_role 키를 2026년 말까지 없앨 예정이라고 안내해요." | 시한이 두 달 남음. 원문의 현재 일정 확인 |
| 2 | blocks/always.json · 설명 3 | "AWS 온디맨드 인스턴스는 쓴 만큼 초 단위로 과금돼요(최소 60초)." | 달린 출처(EC2 개념 페이지)에 이 내용이 있는지, 운영체제별 예외가 있는지 확인 |
| 3 | blocks/db.json · 설명 1 | "기록장은 엑셀 표처럼 생겼어요" → 출처 `sbrls`(RLS 문서) | 내용과 출처 주제가 다름 (제목 기준) |
| 4 | blocks/always.json · 설명 4 | "모든 서비스에 필요한 건 아니에요" → 출처 `mdn`(클라이언트-서버 개요) | 같음 |
| 5 | blocks/host.json · 설명 4 | "주소가 생기면 누구나 들어와요" → 출처 `sbauth` | 같음 |
| 6 | types/design.json · 미션 1, 2 | 출처 `mdn`, `tosskey` | 미션 내용(시안 단계 판단)과 출처 주제가 다름 |
| 7 | 화면 머리글 (`components/Classroom.tsx`) | "프로토타입 v3" | 파일은 v4인데 표시는 v3. 프로토타입 원본도 v3로 적혀 있어 그대로 옮김 |

(독립 검토 결과는 5절에 추가)

## 5. 독립 검토 결과 — 콘텐츠 감사

별도 검토자(파일만 근거, 외부 문서 접근 없음)가 전 항목을 훑은 결과. 4절과 겹치는 것은 뺐다.
**전부 "확인 필요" 목록이며, 확인 전에는 문장을 고치지 않는다.**

### 5-A. 출처 주제 불일치 (제목 기준) — 4절 3~6번 외 추가
| 위치 | 문장 | 달린 출처 |
|---|---|---|
| blocks/db.json · 설명 2 | "넣기, 읽기, 고치기, 지우기예요. 이걸 시키는 말이 SQL이에요." | sbmig (마이그레이션) |
| phrases.json · "API 라우트(엔드포인트)를 만들게요" | — | nextenv (환경 변수) |
| blocks/ui.json · 설명 4 | "Next.js는 React로 화면을 만들면서 서버 쪽 코드도 같은 프로젝트에 넣을 수 있는 도구예요." | react, nextenv. 기획안 2장에서 v1 오류 이력이 있는 문장 |
| blocks/auth.json · 설명 3 | "아무나 쓰게 두면 요금은 서비스 주인이 내요." | claude (요금표) |
| blocks/server.json · 설명 3 | "MDN은 주소에 붙은 값을 … 안전하지 않다고 설명해요." | mdn — 'MDN이 설명한다'는 귀속이 그 페이지에 있는지 |
| blocks/host.json · 설명 1 | "그 기기 안에서 프로그램을 구분하는 번호(포트)예요" | rfc (RFC 6761에 포트 설명이 있는지) |
| blocks/repo.json · 설명 4 | "한 번 올린 비밀 키는 지워도 기록에 남을 수 있어요." | gitpush, ghignore (ghleak이 더 맞아 보임) |
| types/bot.json · 흐름 1, 2 | "앱키·앱시크릿으로 토큰을 먼저 받아요", "웹소켓이라는 통로로 받아요" | kis (포털 소개 페이지에 세부 절차가 있는지) |
| types/sns.json · 미션 1 해설 | "정보성 안내는 알림톡, 광고는 … 브랜드 메시지로 보내요." | kakao (알림톡·브랜드 메시지가 그 페이지 범위인지) |
| types/ai.json · 미션 1 해설 | "화면 코드는 누구나 열어볼 수 있어요." | claude (요금표) |

### 5-B. 시점·변동 위험 — 4절 1~2번 외 추가
| 위치 | 문장 |
|---|---|
| blocks/db.json · 설명 5, types/dash.json · 미션 2 | "7일 동안 활동이 적은 무료 프로젝트를 일시정지해요." (기획안 4장은 "1주 비활성") |
| types/bot.json · 미션 2 해설 | "키 하나에 IP를 최대 10개까지" |
| types/pay.json · 미션 3 해설 | "test_로 시작하는" 키 형식, "전자결제 신청 이후에 확인" |
| blocks/key.json · 설명 2 | 토스 클라이언트 키 접두사 `ck`, `gck` |
| blocks/auth.json · 설명 2 | "구글·애플·깃허브 등을 지원" (지원 목록) |
| sources.json · npm | URL이 `cli/v10` 고정 |
| 기획안 4장 요금표 | Vercel Hobby/Pro, Supabase Free/Pro 수치 전부. 이 페이지들은 sources.json에 없음 (기획안 하단 목록에만) |

### 5-C. 내부 불일치
| 위치 | 내용 | 확인 결과 |
|---|---|---|
| types/dash.json · 조립도 auth | 등급 1("상황 따라")인데 이유는 "…꼭 필요해요." | **파일에서 확인됨.** 등급을 바꿀지 문장을 바꿀지 결정 필요 |
| types/dash.json · 조립도 key vs db | key: "기록장에 접근하려면 열쇠가 필요" (꼭 필요) ↔ db: "구글 시트나 엑셀 파일일 수도" | 파일에서 확인됨 |
| blocks/db.json · 설명 4 ↔ key 맞혀보기 해설 | "어떤 경로로 들어와도 똑같이 적용" ↔ "secret 키는 모든 RLS 규칙을 무시" | 둘 다 원문대로. 보충 문장 필요 여부 결정 |
| 화면 바닥글 | "모든 설명은 … 공식 문서로 2026-10-09에 확인" | kismock은 2차 자료이고, 출처 칸 없는 항목이 115건 있어 "모든"과 맞지 않음 |

### 5-D. 2차 자료 표시 없음 (기획안 5장 규칙 2)
- rules.json 3번 "주식은 모의투자 계좌로 먼저 돌려봐요." 와 types/bot.json 미션 3: 2차 표시가 링크 제목의 "(2차 자료)" 글자뿐. 프로토타입에도 2차 배지 로직이 없어 그대로 옮김. **화면에 '2차 자료' 배지를 붙일지 결정 필요** (문장은 안 바뀌고 표시만 추가).

### 5-E. 비유에 '실제로는' 보충 없음 (기획안 5장 규칙 4)
".env = 비밀 메모장" (key 설명 3, 번역기), "VM = 빌린 내 전용 컴퓨터" (always 설명 2), 엑셀 비유 (db 설명 1), "게임의 세이브 포인트와 같아요" (repo 맞혀보기 해설), "설계도를 받아서 내 기기가 직접 그리는 것" (ui 설명 1).

### 5-F. 출처 없이 단정한 문장 중 행동 위험이 있는 것
- key 맞혀보기 해설 "secret 키는 브라우저와 소스 관리(GitHub)에 절대 두지 말라고 해요" — Supabase 귀속인데 출처 칸 없음
- types/pay.json 조립도·흐름 5단계 (결제 금액 검증 절차) — 출처 없음, 돈과 직결
- key 실험실 `sk-ant-api03-…` 키 형식 — 출처 없음
- ui 설명 3 개발자 도구 단축키 — 브라우저별 차이 미언급
- 기획안 8장 "조직 비공개 저장소는 Vercel Hobby로 배포 불가", 4장 "후원 요청은 상업적 사용 아님" — 약관성 단정, 원문 대조 필요

## 6. 독립 검토 결과 — 코드 검토 (A-3 조건 대조)

높음 등급 없음. 검토자가 확인한 것: 프로토타입 render 함수·실험실에 박힌 문구를 줄 단위로 대조해 다른 글자 없음, CSS는 프로토타입과 주석 2줄만 다름, 정적 내보내기에서 못 쓰는 기능 없음, localStorage는 브라우저에서만 접근, 비밀 키 없음(교육용 가짜 문자열뿐), 상태 규칙(점수·진도 키·조립도 정렬)이 프로토타입과 같음.

| 지적 | 처리 |
|---|---|
| order.json에 id를 추가해도 화면 코드 등록을 빠뜨리면 조용히 깨짐 | 반영: `lib/content.ts`가 빌드 때 등록 누락을 오류로 멈춤. `check-sources`가 order.json ↔ 파일 존재 ↔ 파일 안 id를 대조 |
| 화면의 확인일 "2026-10-09"가 sources.json `checkedAt`과 연결 안 됨 | 반영: `check-sources`가 화면 확인일과 최신 `checkedAt`이 다르면 빌드 실패. (문구 자체는 원문 유지) |
| 화면 동등성 검사가 빌드에 없어 이후 수정에서 조용히 깨질 수 있음 | 반영: `.github/workflows/check.yml`에서 푸시·PR마다 빌드 + 동등성 검사 |
| 열쇠 실험실 정답표가 두 곳에 있음 | 반영: `lib/keyLab.ts` 한 곳으로 통합 |
| 블록 개수 9가 코드에 박힘 | 반영: `BORDER.length` 사용 (화면 문구 "블록 9개"는 콘텐츠라 유지) |
| checkedAt 검사가 느슨함(2026-13-45 통과), 2차 자료 표시와 kind 불일치 미검사, 번역기 문장 중복 미검사 | 반영: 실제 날짜·미래 날짜·2차 표시·중복 검사 추가. volatile 출처는 경과일 경고 |
| 같은 블록·미션을 다시 풀면 점수 분모가 계속 늘어남 | 프로토타입과 같은 동작이라 유지. 후속 개선 후보 |
| `dangerouslySetInnerHTML` | 현재 24곳 모두 저장소 JSON·고정 문구만 넣음. 사용자 입력은 없음. 경계는 `components/Html.tsx` 주석에 명시 |
| 확인 불가: Vercel이 `npm run build`(검사 포함)를 쓰는지 | Vercel 기본 빌드 명령은 저장소 package.json의 build 스크립트. 연결 후 대시보드에서 확인 필요 |
| 확인 불가: Android 실제 기기에서 글자 사라짐 해결 여부 | CSS 동일성까지만 확인. 기획안 8장 7단계(실제 기기 점검)는 사용자 작업 |

## 7. 출처 원문 대조 결과 (2026-11-03)

출처 29건 중 28건의 원문을 이 날 직접 내려받아(텍스트로 변환) 콘텐츠 문장 88줄과 대조했다. 대조는 출처별로 나눈 검토자 4명이 했고, 검토자가 인용한 구절 12개를 무작위로 골라 원문 파일에 그대로 있는지 다시 확인했다(12/12 존재).
`kismock`(위키독스)은 봇 차단 페이지만 내려와 **원문 확인 불가** — 이 출처를 쓰는 2줄(공통 규칙 3, 자동매매봇 미션 3)은 미대조.

### 7-1. 집계
| 판정 | 뜻 | 줄 수 |
|---|---|---|
| 일치 | 원문이 문장의 사실을 직접 뒷받침 | 36 |
| 부분 일치 | 일부만 뒷받침. 나머지는 비유·권고·다른 출처 범위 | 32 |
| **불일치** | 원문이 문장과 반대 | **0** |
| 원문에 없음 | 달린 출처가 그 내용을 다루지 않음 (문장이 틀렸다는 뜻은 아님) | 20 |
| 확인 불가 | kismock 봇 차단 | 2 |

### 7-2. 수정 검토가 필요한 문장 (사실 강도가 원문보다 센 경우)
| 위치 | 문장 | 원문 | 메모 |
|---|---|---|---|
| blocks/key 설명 2 | "Supabase는 anon, service_role 키를 2026년 말까지 **없앨 예정**이라고 안내해요." | "Supabase is deprecating the anon and service_role keys by the end of 2026." / "Creating publishable and secret keys doesn't revoke your legacy keys. Both key systems work at the same time." / "They stay valid until you disable them" | 날짜는 맞음. '없앤다(제거)'가 아니라 '지원 중단(deprecate)'이며, 기존 키는 사용자가 끄기 전까지 유효. 표현 완화 검토 |
| blocks/db 설명 5, types/dash 미션 2 | "7일 동안 활동이 적은 무료 프로젝트를 일시정지" | "pauses Free Plan projects that show low activity over a 7-day period" | 일치. 보충 가능: 복원은 정지 후 1년 이내 |
| blocks/host 설명 3, phrases "푸시하면 자동으로 배포돼요" | "main에 올리면 실제 서비스가 바뀌어요" | 프로덕션 브랜치는 "often called main"이며 변경 가능. 프로덕션 배포는 프로덕션 브랜치에 merge될 때 | 일치하되 'main'은 기본값이라는 점 보충 검토 |
| types/sns 미션 2 | "개인 계정이면 먼저 전환해야 해요" | Instagram Business/Creator 계정 요건은 있음. 개인 계정 전환 언급 없음 | 뒷부분만 원문 밖. 개요 페이지라 세부 문서에는 있을 수 있음 |
| blocks/ext 설명 5, types/ai 미션 2 | "100만 토큰 단위로" | 요금표는 "$10 / MTok" 표기. 같은 페이지 캐시 설명에 "per million tokens" 표현 있음 | 일치로 봐도 됨 |

### 7-3. 출처를 바꾸거나 보강해야 하는 줄 (원문에 없음 20건)
문장 자체가 틀렸다는 뜻이 아니라, **달린 출처가 그 내용을 다루지 않는다**는 뜻이다. 기획안 5장 규칙 1("출처 id 1개 이상")은 형식상 지키지만, 실질적으로는 근거 없는 줄이다.

| 위치 | 문장 요지 | 달린 출처 | 처리 후보 |
|---|---|---|---|
| blocks/ui 설명 2 | HTML/CSS/JS 재료 표 | mdn(클라이언트-서버 개요) | MDN의 HTML/CSS/JS 소개 문서로 교체 |
| blocks/ui 설명 4 (뒷문장) | "Next.js는 서버 쪽 코드도 같은 프로젝트에" | react, nextenv | Next.js 소개 문서 추가 |
| blocks/server 설명 2 | 서버 코드는 배달되지 않음, 비밀·가격·권한 확인은 서버에서 | mdn | 관련 MDN 문서 교체 |
| blocks/ext 설명 1 | API = 미리 정한 양식 | mdn | MDN API 소개 문서 |
| blocks/always 설명 4 | 모든 서비스에 24시간 컴퓨터가 필요한 건 아님 | mdn | 출처 불필요한 설명 → '출처 없음(설명)' 분류 검토 |
| blocks/db 설명 1 | 엑셀 비유 표 | sbrls | 비유 → '출처 없음(비유)' 분류 검토 |
| blocks/db 설명 2 | CRUD, SQL, delete/drop 주의 | sbmig | SQL 기초 문서 추가 |
| blocks/host 설명 2 | 배포 정의, my-app.vercel.app 예시 | vercel | Vercel 배포 개요 문서 |
| blocks/host 설명 4 | 주소를 알면 누구나 접속 | sbauth | '출처 없음(설명)' 분류 검토 |
| blocks/auth 설명 3 | 로그인이 꼭 필요한 때, 요금은 주인이 냄 | claude | '출처 없음(설명)' 분류 검토 |
| blocks/repo 설명 1, 2 | Git/GitHub 구분, 커밋·푸시·브랜치·머지 뜻 | gitbook(버전 관리란) | Git 책의 해당 장(Basics, Branching) 문서로 교체 |
| phrases "API 라우트…" | 서버 창구 | nextenv | Next.js Route Handlers 문서 |
| phrases "커밋할게요" | 세이브 포인트 | gitbook | Git 책 Basics |
| types/game 미션 1 | 혼자 하는 게임의 블록 조합 | mdn | '출처 없음(설명)' |
| types/design 미션 1, 2 | 시안 단계 판단 | mdn, tosskey | '출처 없음(설명)' |
| types/dash 미션 3 | 공개 저장소는 누구나 봄 | ghleak | GitHub 저장소 공개 범위 문서 |
| types/ai 미션 1 | 화면 코드는 누구나 열어봄, 키는 서버에 | claude | sbkey/tosskey 쪽 문장으로 출처 교체 |

### 7-4. 부분 일치(32건)의 공통 패턴
- 비유("열쇠", "기록장", "세이브 포인트")와 **권고문**("…물어보세요", "…거절하세요")은 원문에 없는 게 당연하다. 기획안 5장 규칙 4(비유에 '실제로는' 보충)의 대상.
- 한 문장에 출처 둘 이상의 내용이 섞인 경우(예: blocks/key 설명 2 표에 Supabase와 토스가 함께) 각 출처는 자기 몫만 뒷받침한다 — 정상.
- 출처가 **개요 페이지**인 경우(kis, insta, gitbook) 세부 사실은 그 페이지에 없다. 세부 문서 URL로 바꾸면 해결.

### 7-5. 검토자별 원본 판정표
아래는 검토자 4명의 표를 손대지 않고 그대로 옮긴 것이다.

#### 검토자 A — mdn, devtools, react, rfc, claude, ec2
| 출처 | 위치 | 문장(앞 40자) | 판정 | 원문 인용 또는 사유 |
|---|---|---|---|---|
| mdn | ui 설명1 | 주소창에 주소를 치면 브라우저(크롬, 사파리 같은 프로그램)가 그 주소의 컴퓨터에 "화면 파일 주세요"라고 | 일치 | "the browser sends an HTTP Request to the server." / "When an HTML page is returned, it is rendered by the web browser." |
| mdn | ui 설명2 | 재료 하는 일 예시 HTML 뼈대… CSS 옷… JavaScript 움직임 | 원문에 없음 | 원문에 HTML·CSS·JS의 역할 설명이 없음. 페이지가 JS·CSS 파일을 참조한다는 언급만 있음. |
| mdn | server 설명1 | 화면은 서버에 요청을 보내고, 서버는 응답을 돌려줘요… 200/404/403 | 일치 | "200 OK for success, 404 Not Found if the resource cannot be found, 403 Forbidden if the user isn't authorized to see the resource" |
| mdn | server 설명2 | 서버 코드는 서비스 쪽 컴퓨터에서 돌아가고… 코드 자체는 배달되지 않아요 | 원문에 없음 | 코드가 사용자에게 전달되지 않는다거나 비밀 키·가격·권한 확인을 서버에서 한다는 서술이 없음. |
| mdn | server 설명3 | MDN은 주소에 붙은 값을 사용자가 바꿔서 다시 보낼 수 있으니 안전하지 않다고… | 부분 일치 | 지지되는 부분은 URL 파라미터가 안전하지 않다는 것: "URL parameters are inherently "insecure" as they can be changed by users and then resubmitted." 금액·점수·등급으로의 확장과 "서버가 자기 기록과 다시 비교"는 원문에 없음. |
| mdn | ext 설명1 | API = 미리 정한 주문 양식 | 원문에 없음 | API 개념에 대한 서술이 없음. |
| mdn | ext 설명2 | JSON은 이름표가 붙은 데이터예요. {"temp": 18}… | 부분 일치 | 서버가 JSON을 돌려줄 수 있다는 부분만 지지됨: "or even data (JSON, XML, etc.)". "보통 JSON", 이름표 설명, 사람이 읽을 수 있다는 점은 원문에 없음. |
| mdn | always 설명4 | 대시보드나 혼자 하는 게임은 보는 순간에만 돌아가면… | 원문에 없음 | 상시 구동 프로그램(봇, 실시간 게임)에 대한 서술이 없음. |
| mdn | phrases "404 / 403" | 뜻: 404는 찾는 게 없음, 403은 권한 없음… | 일치 | "404 Not Found if the resource cannot be found, 403 Forbidden if the user isn't authorized to see the resource" |
| mdn | types/game 미션1 | 저장도 랭킹도 없는 혼자 하는 퍼즐 게임… | 원문에 없음 | 혼자 하는 게임에 필요한 블록 조합에 대한 서술이 없음. |
| mdn | types/game 미션2 | 1등에게 상품을 주는 랭킹… 서버가 점수를 다시 확인해야 | 부분 일치 | "URL parameters are inherently "insecure" as they can be changed by users and then resubmitted." 지지되는 것은 URL 파라미터가 변조될 수 있다는 점까지. 화면에서 계산한 점수 일반으로의 확장과 "서버가 점수를 다시 확인해야 한다"는 원문에 없음. |
| mdn | types/design 미션1 | 앱 화면 시안만 먼저… Supabase 프로젝트부터 만들까요? | 원문에 없음 | 시안 단계나 Supabase에 대한 서술이 없음. |
| mdn | rules 2 | 사용자가 보낸 값은 서버가 다시 확인. 점수, 금액, 권한처럼… | 부분 일치 | "URL parameters are inherently "insecure" as they can be changed by users and then resubmitted." 서버 재확인 규칙과 점수·금액·권한에 대한 언급은 원문에 없음. |
| devtools | ui 설명3 | '개발자 도구'… 윈도우는 F12 또는 Ctrl+Shift+I, 맥은 ⌘+⌥+I… 저장되지는 않아요 | 일치 | "Windows and Linux: Ctrl + Shift + I or F12 / macOS: ⌘ + ⌥ + I" / "You can make any changes you want, but you cannot save your changes." |
| react | ui 설명4 | React는 화면을 '부품' 단위로… 컴포넌트… 다시 쓸 수 있는 화면 조각 / Next.js는… 서버 쪽 코드도 | 부분 일치 | 컴포넌트 부분은 지지됨: "React lets you create components, reusable UI elements for your app." Next.js가 서버 쪽 코드를 같은 프로젝트에 넣게 해 준다는 서술은 없음. Next.js는 예시로 한 번 언급되고, React 기반 프레임워크가 HTML을 자동 생성한다는 내용만 있음. |
| react | phrases "컴포넌트를 만들게요" | 뜻: 화면 부품(버튼, 카드 같은 조각)을 하나 만든다 | 일치 | "components, reusable UI elements for your app" / "not only ... reusable pieces like buttons, but also for larger pieces like sidebars, lists" |
| rfc | host 설명1 | RFC 6761… localhost를 언제나 그 기기 자신(루프백 주소)으로… :3000은 포트… | 부분 일치 | 루프백 부분은 지지됨: "Users may assume that IPv4 and IPv6 address queries for localhost names will always resolve to the respective IP loopback address." 포트 번호(:3000), 개발 화면 미리보기 용도는 원문에 없음. |
| rfc | phrases "localhost:3000" | 뜻: 내 컴퓨터 안에서만 열리는 미리보기 주소예요… 배포가 필요 | 부분 일치 | 루프백 주소로 해석된다는 점만 지지됨(위 인용과 같음). "미리보기 용도", 포트, 남에게 보여주려면 배포가 필요하다는 점은 원문에 없음. |
| claude | auth 설명3 | 남이 보면 안 되는 정보… 돈이 드는 기능… 요금은 서비스 주인이 내요 | 원문에 없음 | 인증이 필요한 때나 키 소유자가 요금을 부담한다는 서술이 없음. 요금표 문서임. |
| claude | ext 설명5 | Claude API는 모델마다 입력과 출력 가격을 100만 토큰 단위로 따로… | 부분 일치 | 모델별·입력/출력별 가격은 지지됨. 표 머리글은 "Name Input Output 5m writes 1h writes Hits and refreshes", 값은 "$10 / MTok", "$50 / MTok" 형식. "100만"이나 million이라는 단어가 원문에 없고 MTok 표기만 있음. (통합 검토 메모: 같은 페이지 캐시 설명에 "per million tokens" 표현이 있음 → 일치로 봐도 됨) |
| claude | types/ai 미션1 | Claude API 키를 화면 코드에 넣어서… 열쇠는 서버에 | 원문에 없음 | API 키 보관, 화면 코드 노출, 서버 호출에 대한 서술이 없음. |
| claude | types/ai 미션2 | Claude API 요금표는 모델마다 입력과 출력 가격을 100만 토큰 단위로… 긴 대화일수록 비싸져요 | 부분 일치 | 모델별 입력/출력 가격은 지지됨(위와 같음). "100만"이라는 명시와 "긴 대화일수록 비싸진다"는 직접 서술이 없음. 인접 문장은 "A 900k-token request is billed at the same per-token rate as a 9k-token request." |
| ec2 | always 설명1 | 클라우드는 … 빌려 쓰는 거예요. AWS 문서는 EC2를 '필요할 때 늘리고 줄일 수 있는 컴퓨팅 능력' | 일치 | "provides on-demand, scalable computing capacity in the Amazon Web Services (AWS) Cloud" / "add capacity (scale up)… reduce capacity (scale down) again." |
| ec2 | always 설명2 | AWS 문서는 EC2 인스턴스를 'AWS 클라우드 안의 가상 서버'라고 | 일치 | "An EC2 instance is a virtual server in the AWS Cloud." ("큰 컴퓨터를 나눠서"라는 설명 자체는 원문에 없고 비유로 처리) |
| ec2 | always 설명3 | AWS 온디맨드 인스턴스는 쓴 만큼 초 단위로 과금(최소 60초) | 일치 | "Pay for the instances that you use by the second, with a minimum of 60 seconds, with no long-term commitments or upfront payments." |
| ec2 | phrases "EC2 인스턴스를 하나 만들게요" | 가상 서버 한 대를 켠다… 켜둔 만큼 요금 | 일치 | "EC2 instance is a virtual server in the AWS Cloud" / "Per-second billing: Removes the cost of unused minutes and seconds from your bill." |

#### 검토자 B — sbkey, sbrls, sbmig, sbpause, sbauth
| 출처 | 위치 | 문장(앞 40자) | 판정 | 원문 인용 또는 사유 |
|---|---|---|---|---|
| sbkey | blocks/server 설명4 | Supabase를 쓰면 기록장 읽기·쓰기는 화면에서 바로 하고, 출입 규칙(RLS)이 확인을 맡을 수 있어요. 하지만 숨겨야… | 부분 일치 | 지지: "Publishable key … Anyone can read it, so it only reaches what Row Level Security allows" / "Secret key … must never leave your control". 결제 승인·AI 호출처럼 서버가 꼭 필요하다는 예시와 "서버가 있어야 한다"는 결론은 원문에 없음. 원문은 키를 둘 위치만 구분함. |
| sbkey | blocks/key 설명1 | 현관 비밀번호를 아는 사람은 누구든 들어가요. API 키도 똑같아요. 키를 가진 사람이 곧 주인으로 취급돼요. | 부분 일치 | 원문: "Every request to your Supabase project carries an API key." 또 "The secret key is the master key". 그러나 "키를 가진 사람이 곧 주인"이라는 표현은 직접 없음. 원문은 키가 "What is accessing the project?"(앱 구성요소)를 식별하고 "doesn't distinguish between users"라고 함. |
| sbkey | blocks/key 설명2 (표) | 보여도 되는 키 sb_publishable_ (예전 이름 anon) / 숨겨야 하는 키 sb_secret_ (예전 이름 service_role) | 일치 | "Publishable key sb_publishable_... " 와 "anon JWT … Legacy version of publishable keys." / "Secret keys sb_secret_..." 와 "service_role JWT … Legacy version of secret keys." |
| sbkey | blocks/key 설명2 | 화면에 둬도 됨 / 서버에만 (둘 곳) | 일치 | "Publishable key … Safe to expose online: web page, mobile or desktop app, GitHub actions, CLIs, source code." / "Secret keys … Only use in backend components of your app, such as servers…" |
| sbkey | blocks/key 설명2 | Supabase는 anon, service_role 키를 2026년 말까지 없앨 예정이라고 안내해요. | 부분 일치 | "Supabase is deprecating the anon and service_role keys by the end of 2026." 날짜는 일치하나 원문은 "deprecating(지원 중단 예정)"이지 "없앨 예정(제거)"이 아님. 또 "Creating publishable and secret keys doesn't revoke your legacy keys. Both key systems work at the same time." / "They stay valid until you disable them". 제거 시점은 명시되지 않음. |
| sbkey | phrases "service_role(secret) 키로 바꾸면…" | 뜻: 모든 출입 규칙을 무시하는 마스터키를 쓰겠다는 뜻이에요. / 확인할 것: 화면 코드에 넣는 거라면 거절하고, RLS 규칙을 고치자고 하세요. | 부분 일치 | 지지: "It bypasses Row Level Security, so it must never leave your control", "The secret key is the master key", "Never put one in a browser, a shipped application, or source control." "RLS 규칙을 고치자고 하라"는 조언 자체는 원문에 없음(권고 성격). |
| sbkey | rules 1 | 숨겨야 하는 열쇠는 서버에만. 화면 코드와 GitHub에는 두지 않아요. 새면 지우기보다 폐기하고 새로 발급이 먼저예요. | 부분 일치 | 지지: "Never put one in a browser, a shipped application, or source control." 및 "A web page, a public document, source code, or a bundled mobile…". 폐기: "Rotate a leaked key as soon as you fix the cause of the leak." 원문은 "원인을 고친 뒤 즉시 교체(rotate)"라고 하며 "지우기보다 폐기가 먼저"라는 순서 비교는 없음. "GitHub"라는 단어 자체는 없고 "source control"로 표현됨. |
| sbrls | blocks/db 설명1 | 엑셀/데이터베이스 대응표(시트=표, 가로줄=기록 한 건, 세로칸=항목) | 원문에 없음 | 비유 설명이며 해당 대응 서술이 원문에 없음. |
| sbrls | blocks/db 설명4 | RLS(Row Level Security)는 표의 줄마다 누가 볼 수 있는지 정하는 규칙이에요. 규칙이 기록장 안에 있어서, 어떤 경로로… | 일치 | "RLS gives you granular authorization rules that run inside the database." / "Because RLS is a Postgres primitive, it also protects your data when it is reached through third-party tooling". 단 "표의 줄마다"는 policy가 "WHERE clause"처럼 행을 거른다는 서술과 부합. |
| sbrls | blocks/db 설명4 | Supabase는 외부에 열린 모든 표에 RLS를 켜라고 해요. | 일치 | "Enable RLS on every table in an exposed schema." |
| sbrls | phrases "RLS 정책을 추가할게요" | 뜻: 표의 줄마다 누가 볼 수 있는지 규칙을 건다는 뜻이에요. / 확인할 것: 좋은 제안이에요. 반대로 'RLS를 끌게요'는 거절하세요. | 일치(뜻) / 부분(거절 권고) | 뜻 지지: "Policies decide which rows that operation applies to." 'RLS를 끌게요 거절' 권고는 원문에 직접 없으나 "Enable RLS on every table in an exposed schema."와 방향 일치. |
| sbrls | types/dash 미션1 | RLS가 없으면 열쇠만 있으면 누구나 그 표를 읽을 수 있어요. 화면용 열쇠는 원래 공개되는 열쇠라서 더 위험해요. | 일치 | RLS: "A table in an exposed schema without RLS is readable and writable by any role with a grant on it." 공개 키는 sbkey 쪽 "Anyone can read it"(sbrls 자체에는 없음, sbkey로 보강). 정확히는 "읽기만이 아니라 읽기·쓰기 가능"이므로 원문이 더 넓음. |
| sbrls | types/dash 미션1 | Supabase는 외부에 열린 모든 표에 RLS를 켜라고 해요. | 일치 | "Enable RLS on every table in an exposed schema." |
| sbmig | blocks/db 설명2 | 넣기, 읽기, 고치기, 지우기… select * from orders는 "주문 표 전부 보여줘"… delete나 drop 주의 | 원문에 없음 | 원문은 CRUD·SQL 기초나 select/drop 설명을 다루지 않음(마이그레이션 SQL 예시만 있음). |
| sbmig | blocks/db 설명3 | Supabase 문서는 마이그레이션을 '스키마(표 구조)를 만들고 바꾸고 지우는 SQL'이라고 설명해요. 변경 기록이 남아서 언제 무엇을 바꿨는지 추적할 수 있어요. | 일치 | "Database migrations are SQL statements that create, update, or delete your existing database schemas. They are a common way of tracking changes to your database over time." ("언제 무엇을"의 시각 기록까지는 명시 안 됨.) |
| sbmig | phrases "마이그레이션을 적용할게요" | 뜻: 기록장의 표 구조를 바꾸는 SQL을 실행한다는 뜻이에요. / 확인할 것: drop이나 delete가 있으면 데이터가 지워질 수 있어요… | 부분 일치 | 지지: 위 정의와 "Run this migration to create the employees table." drop/delete 시 데이터가 지워질 수 있다는 경고는 원문에 없음(정의의 "delete your existing database schemas"만 있음). |
| sbpause | blocks/db 설명5 | Supabase는 7일 동안 활동이 적은 무료 프로젝트를 일시정지해요. 갑자기 안 열리면 이것부터 확인하세요. | 일치 | "Supabase pauses Free Plan projects that show low activity over a 7-day period to save server resources." ("이것부터 확인하세요"는 권고.) |
| sbpause | types/dash 미션2 | Supabase는 7일 동안 활동이 적은 무료 프로젝트를 일시정지해요. 대시보드에서 다시 켤 수 있어요. | 일치 | 위 인용 + "You can restore a paused project for up to 1 year after it was paused: … Click Resume project and confirm". (복원은 정지 후 1년 이내라는 제한이 문장엔 없음.) |
| sbauth | blocks/auth 설명1 | 인증은 '사용자가 본인이 맞는지 확인', 권한은 '무엇에 접근할 수 있는지 확인' (로그인/자기 주문만 보기 예시) | 일치 | "Authentication means checking that a user is who they say they are. Authorization means checking what resources a user is allowed to access." (예시는 쉬운 비유.) |
| sbauth | blocks/auth 설명2 | Supabase Auth는 구글·애플·깃허브 등을 지원하고, OAuth2를 지원하는 다른 곳도 붙일 수 있어요. | 일치 | 목록에 Apple, GitHub, Google 포함. "To add a provider that isn't listed, use Custom OAuth/OIDC Providers. It works with any OAuth2 or OIDC-compatible identity provider." ("대신 확인해주기" 설명은 원문에 없는 풀이.) |
| sbauth | blocks/host 설명4 | 주소를 아는 사람은 누구든 접속할 수 있다… 로그인과 권한 규칙이 함께 있어야 해요. | 원문에 없음 | 호스팅 주소 공개에 관한 서술은 없음(Auth 일반 문서). |
| sbauth | phrases "OAuth(소셜 로그인)를 설정할게요" | 뜻: 구글·깃허브 같은 다른 회사 계정으로 로그인하게 한다 / 그 회사 개발자 사이트에서 앱 등록이 필요해요. | 부분 일치 | 지지: 소셜 로그인 provider 목록(Google, GitHub 등). 개발자 사이트 앱 등록 필요성은 이 파일에 없음(공급자별 하위 문서 내용). |

#### 검토자 C — tosskey, tossflow, tosshook, upbit, kis, kakao, insta
| 출처 | 위치 | 문장(앞 40자) | 판정 | 원문 인용 또는 사유 |
|---|---|---|---|---|
| tosskey | blocks/server 설명4 | Supabase를 쓰면 기록장 읽기·쓰기는 화면에서 바로 하고, 출입 규칙(RLS)이 확… | 부분 일치 | 지지되는 부분은 "시크릿 키를 클라이언트에 두지 말 것"뿐: "GitHub, 클라이언트 코드 등 외부에 보이는 곳에 추가하지 마세요." Supabase/RLS, AI 호출, "서버가 있어야 한다"는 서술은 원문에 없음. |
| tosskey | blocks/ext 설명4 | 회사가 직접 만들어 준 코드 묶음이에요. 예를 들어 토스페이먼츠는 브라우저에서 SDK를 시… | 일치 | "클라이언트 키 는 브라우저에서 토스페이먼츠 SDK를 초기화할 때 사용해요." |
| tosskey | blocks/key 설명2 | 보여도 되는 키/숨겨야 하는 키 … 토스페이먼츠 클라이언트 키 (ck, gck) 시크릿 키 (sk, gsk) … | 부분 일치 | 토스 부분 일치: "결제 클라이언트 키는 중간에 gck 가 있고, API 개별 연동 키는 중간에 ck 가 있어요." / "결제 시크릿 키는 중간에 gsk 가 있고, … 중간에 sk 가 있어요." 클라이언트 키는 "브라우저에 노출되는 공개 식별값". Supabase 키 이름(sb_publishable_, sb_secret_, anon/service_role)과 2026년 말 폐지 안내는 이 문서에 없음. |
| tosskey | phrases "SDK를 설치(초기화)할게요" | 뜻: 빌려 쓰기를 쉽게 해주는 공식 도구 묶음을 쓴다는 뜻이에요. / 확인할 것: 초기화에 쓰는 키가… | 부분 일치 | 키 부분은 일치: "클라이언트 키 는 브라우저에서 토스페이먼츠 SDK를 초기화할 때 사용해요." / "토스페이먼츠 SDK에 시크릿 키를 넣으면 INSECURE_KEY_USAGE 에러가 발생하고 결제가 진행되지 않아요." "공식 도구 묶음" 정의는 원문에 없음. |
| tosskey | types/pay 미션2 | 토스페이먼츠 시크릿 키는 어디에 둬야 할까? 해설: 시크릿 키가 외부에 노출되면 안 된다고… | 일치 | "시크릿 키는 외부에 노출되면 안 돼요. GitHub, 클라이언트 코드 등 외부에 보이는 곳에 추가하지 마세요." 화면에 클라이언트 키만 쓴다는 점도 위 SDK 초기화 문장과 부합. |
| tosskey | types/pay 미션3 | test_로 시작하는 테스트 키로 결제해 보면? 테스트 환경에서는 결제 승인이 모의로 처리돼서… | 일치 | "테스트 키 는 test 로 시작해요. … 결제 승인은 가상으로 이루어져요. 결제수단에서 금액이 차감되지 않아요." / "주문서형, 결제창형 연동 키는 토스페이먼츠 전자결제 신청 이후에만 확인할 수 있어요." |
| tosskey | types/design 미션2 | 디자인한 '구매하기' 버튼을 누르면 실제로 결제가 되게 하려면? 디자인은 모양만 정해요… | 원문에 없음 | API 키 문서에 해당 내용 없음. |
| tosskey | rules 1 | 숨겨야 하는 열쇠는 서버에만. 화면 코드와 GitHub에는 두지 않아요. 새면 지우기보다 폐기하고… | 일치 | "저장소, 클라이언트 코드, 앱, 로그에 넣지 말고 전용 시크릿 저장소에 분리 보관하세요." / "이때는 결제 실패를 감수하더라도 폐기가 우선이에요." / "노출된 시크릿 키는 재발급 하세요." ("지우기보다"라는 비교 표현 자체는 없음) |
| tosskey | rules 3 | 진짜 돈 전에 테스트. 결제는 테스트 키, 주식은 모의투자 계좌로 먼저 돌려봐요. | 부분 일치 | 결제 테스트 키 부분만 지지: "결제 승인은 가상으로 이루어져요. 결제수단에서 금액이 차감되지 않아요." 주식 모의투자 계좌는 이 문서에 없음. |
| tossflow | types/pay 미션1 | 결제 승인할 때 화면에서 넘어온 금액을 그대로 써서 승인 요청할게요. 해설: 주문 번호와 금액을 서버에 미리 저장하고… | 일치 | "결제를 요청하기 전에 orderId 와 amount 를 서버에 임시로 저장하세요." / "쿼리 파라미터의 amount 값과 setAmount() 의 amount 파라미터의 값이 같은지 반드시 확인하세요. … 값이 다르다면 결제를 취소하고 구매자에게 알려주세요." |
| tossflow | rules 2 | 사용자가 보낸 값은 서버가 다시 확인. 점수, 금액, 권한처럼 중요한 값은 화면에서 온 그대로… | 부분 일치 | 금액 부분만 지지: "클라이언트에서 결제 금액을 조작하는 행위를 방지할 수 있습니다." 점수·권한 등 일반 원칙은 원문에 없음. |
| tosshook | blocks/ext 설명3 | 보통은 내가 물어보지만, 웹훅은 상대가 먼저 알려줘요. 토스페이먼츠 문서는 웹훅을 '데이터가 변경됐을 때… | 일치 | "웹훅 이란 데이터가 변경되었을 때 실시간으로 알림을 받을 수 있는 기능이에요." / "결제 상태가 변경되어 등록한 이벤트가 발생하면 웹훅 URL로 웹훅 이벤트가 전송됩니다." |
| tosshook | phrases "웹훅 URL을 등록해 주세요" | 뜻: 상대 서비스가 변화를 알려줄 내 주소를 알려주라는 뜻이에요. / 확인할 것: 그 주소는 인터넷에서… | 일치 | "웹훅 URL은 온라인에서 접근할 수 있는 주소를 등록해야 합니다. 로컬 개발 환경은 외부에서 접근할 수 없기 때문에 로컬 서버 포트가 포함된 URL은 웹훅으로 등록할 수 없습니다." |
| upbit | types/bot 미션1 | 업비트 API 키를 만들 때 나중에 편하도록 출금하기까지 모든 권한을 체크해 주세요. 해설: … | 부분 일치 | "업비트 API Key는 발급 시 사용 용도에 따라 필요한 권한만 선택적으로 부여할 수 있습니다." "출금하기" 권한 그룹이 별도로 존재함(출금하기, 출금조회). "매매봇에 출금 권한은 필요 없다", "출금 권한 키가 새면 피해가 훨씬 크다"는 서술은 원문에 없음. |
| upbit | types/bot 미션2 | 업비트 API 키를 쓰려면 꼭 해야 하는 설정은? 호출하는 곳의 IP를 허용 목록에 등록… 최대 10개 | 일치 | "호출지의 IP를 허용 목록에 등록해야 합니다. API Key 당 최대 10개의 IP를 등록할 수 있습니다." |
| kis | types/bot 흐름 | 봇이 증권사 API 키로 접속해요 (한국투자증권은 앱키·앱시크릿으로 토큰을 먼저 받아요) / 시세를 받아요 (실시간은 웹소켓…) … | 일치 | "계좌의 Appkey, App secret으로 토큰을 발급받고, 이것을 이용하여 REST API를 호출합니다." / "접속키 발급 후, 웹소켓에 연결하여 데이터를 실시간으로 수신 받고, 이것을 기반으로 매수/매도할 수 있습니다". ("24시간 컴퓨터에서 반복"은 원문에 없으나 사실 주장이 아닌 흐름 설명) |
| kakao | types/sns 미션1 | 예약이 확정되면 고객 카톡으로 자동 안내를 보내고 싶어요. … 카카오톡 메시지 API는 사용자끼리… 알림톡 … 브랜드 메시지 | 일치 | "두 제품 모두 사용자간 메시지 전송만 지원하며, 서비스가 사용자에게 메시지를 발송할 수 없습니다." / "알림톡 서비스가 정보성 메시지를 사용자에게 발송합니다." / "브랜드 메시지 … 마케팅 수신 동의 회원을 대상으로 브랜드 메시지를 전송합니다." |
| insta | types/sns 미션2 | 내 인스타 게시물을 홈페이지에 자동으로 띄우려면 인스타 계정이 어떤 종류여야 할까? Meta 문서의 Instagram API는 비즈니스 또는 크리에이터 계정을 요구… | 부분 일치 | 지지: "allows app users to use your app to manage their Instagram Business or Creator accounts." / "connect their Instagram professional account". "개인 계정이면 먼저 전환해야 해요"는 원문에 없음(개인 계정 언급 자체가 없음). 또한 "Use Instagram embeds to add public Instagram photos and videos to your website."라는 별도 임베드 방식이 문서에 있음(계정 유형 요건은 언급 없음). |

#### 검토자 D — nextenv, vercel, ghignore, ghleak, gitbook, gitwt, gitpush, ccwt, npm, rm
| 출처 | 위치 | 문장(앞 40자) | 판정 | 원문 인용 또는 사유 |
|---|---|---|---|---|
| nextenv | blocks/ui 설명4 | React는 화면을 '부품' 단위로 만드는 도구예요. React 공식 문서는 … | 원문에 없음 | 이 환경변수 문서는 React 컴포넌트와 Next.js의 정의를 다루지 않음 |
| nextenv | blocks/key 설명3 | 이름=값을 한 줄씩 적는 파일이에요. … Next.js 기본 템플릿은 .env를 .gitignore에 | 일치 | "The default create-next-app template ensures all .env files are added to your .gitignore . You almost never want to commit these files to your repository." (이름=값 한 줄 형식은 `DB_HOST=localhost` 예시로 뒷받침. "GitHub에 안 올라가게"는 해석) |
| nextenv | blocks/key 설명4 | Next.js에서 이름 앞에 NEXT_PUBLIC_을 붙이면, 그 값이 브라우저로 … | 일치 | "Next.js can "inline" a value, at build time, into the js bundle that is delivered to the client… prefix the variable with NEXT_PUBLIC_" / "Non- NEXT_PUBLIC_ environment variables are only available in the Node.js environment". ("숨겨야 하는 키에 붙이지 말라"는 직접 문장 없음, 위 내용에서 따라 나오는 권고) |
| nextenv | phrases "API 라우트…" | 뜻: 서버에 요청을 받는 창구 하나를 만든다 … | 원문에 없음 | API 라우트 정의와 로그인/권한 확인 권고는 이 문서에 없음. 문서는 "Route Handlers" 예시(app/api/route.js)만 있음 |
| nextenv | phrases ".env 파일에 키를…" | 뜻: 비밀 메모장 파일에 열쇠를 적으라는 뜻 … .env가 .gitignore에 | 부분 일치 | "all .env files are added to your .gitignore" 부분만 일치. "비밀 메모장/열쇠" 비유와 "직접 확인하라"는 권고는 원문에 없음 |
| nextenv | phrases "NEXT_PUBLIC_을 붙일게요" | 뜻: 그 값을 브라우저로 가는 화면 코드에 넣겠다는 … | 일치 | "It will be inlined into any JavaScript sent to the browser." ("숨겨야 하는 키라면 거절" 권고는 원문에 없는 해석) |
| vercel | blocks/host 설명2 | 남도 들어오게 하려면 … 이걸 배포(deploy)라고 해요. … my-app.vercel.app | 원문에 없음 | 배포 정의와 `my-app.vercel.app` 주소 예시 모두 이 문서에 없음 |
| vercel | blocks/host 설명3 | Vercel 문서에 따르면 GitHub 저장소를 연결해 두면 … 자동으로 배포 | 일치 | "Vercel allows for automatic deployments on every branch push and merges onto the production branch"; "Preview deployments for every push."; "all other branches are deployed as pre-production branches (either preview branches…)". 참고: 프로덕션 배포는 "A Production deployment will be created each time you merge to the production branch"이고 "대표 갈래=보통 main"은 "often called main". 즉 "푸시할 때마다 실서비스"가 아니라 프로덕션 브랜치에 병합될 때 프로덕션 배포 |
| vercel | phrases "푸시하면 자동으로…" | 뜻: GitHub에 올리면 Vercel 등이 알아서 … main에 올리면 실제 서비스가 바뀌어요 | 일치 | "have a branch that works as your production branch, often called main… merge your PR into the main branch, and Vercel will create a production deployment." / "all other branches are deployed as pre-production branches" (main = 프로덕션 브랜치는 기본값 가정; 문서는 프로덕션 브랜치 변경 가능하다고 명시) |
| ghignore | blocks/key 설명3 | 이름=값을 한 줄씩 … Next.js 기본 템플릿은 .env를 .gitignore에 | 원문에 없음 | 이 문서는 Next.js 템플릿을 언급하지 않음 (해당 근거는 nextenv에 있음). .gitignore 설명만 있음 |
| ghignore | blocks/repo 설명4 | git push --force는 … 한 번 올린 비밀 키는 … .gitignore에 적어도 이미 올라간 파일은 계속 추적 | 부분 일치 | "If you want to ignore a file that is already checked in, you must untrack the file before you add a rule to ignore it." -> "이미 올라간(checked in) 파일은 먼저 untrack해야 무시됨"과 맥락상 일치(단, "계속 추적돼요"라는 문구 자체는 없음). git push --force 경고와 비밀 키 기록 잔존은 이 문서에 없음(gitpush/ghleak 담당) |
| ghleak | blocks/key 설명5 | GitHub 문서는 비밀이 올라갔다면 첫 단계로 그 비밀을 폐기하거나 교체 | 일치 | "if the sensitive data you need to remove is a secret… as a first step you need to revoke and/or rotate that secret. Once the secret is revoked or rotated, it can no longer be used for access" |
| ghleak | types/dash 미션3 | 회사 실적 엑셀을 공개 GitHub 저장소에 올려서 … 공개 저장소는 누구나 | 원문에 없음 | 공개 저장소 가시성, 회사 보안정책 확인, 로그인 있는 기록장 권고 모두 이 문서에 없음 |
| ghleak | rules 1 | 숨겨야 하는 열쇠는 서버에만. … 새면 지우기보다 폐기하고 새로 발급이 먼저 | 부분 일치 | 폐기/교체 우선 부분만 일치: "as a first step you need to revoke and/or rotate that secret… Going through the extra steps to rewrite the history… may not be warranted." "서버에만, 화면 코드와 GitHub에 두지 않는다"는 원문에 없음 |
| gitbook | blocks/repo 설명1 | 뜻 Git 내 컴퓨터에서 세이브 기록을 남기는 프로그램 / GitHub 인터넷 보관·공유 사이트 | 원문에 없음 | Git과 GitHub를 구분 정의하는 문장 없음. 본문은 VCS 개요(예: "In a DVCS (such as Git…), clients… fully mirror the repository, including its full history.")이며 GitHub는 목차 항목("6. GitHub")으로만 등장 |
| gitbook | blocks/repo 설명2 | 말 쉬운 뜻 커밋/푸시/브랜치/머지 … | 원문에 없음 | 이 페이지(About Version Control)는 commit·push·branch·merge를 정의하지 않음. 목차에 장 제목("Git Branching", "Basic Branching and Merging")만 있음 |
| gitbook | phrases "커밋할게요" | 뜻: 지금 상태를 세이브 포인트로 저장 … 비밀 파일 포함 여부 | 원문에 없음 | commit 정의 및 비밀 파일 점검 권고 없음. 근접 문구는 "snapshot"(DVCS 설명)뿐 |
| gitwt | blocks/repo 설명3 | 워크트리를 쓰면 한 보관함의 여러 갈래를 서로 다른 폴더에 동시에 … Claude Code 문서는 … 부딪히지 않게 | 부분 일치 | Git 부분은 일치: "A git repository can support multiple working trees, allowing you to check out more than one branch at a time. With git worktree add a new working tree is associated with the repository" 및 "git worktree add <path>". "Claude Code 문서가 충돌 방지를 설명" 부분은 gitwt에 없음(ccwt 참조) |
| gitpush | blocks/repo 설명4 | git push --force는 … 저장소의 커밋을 잃게 만들 수 있으니 조심 … | 부분 일치 | 일치: "It can cause the remote repository to lose commits; use it with care." 또한 "git push --force is a method reserved for a case where you do mean to lose history." "기록을 강제로 덮어써요"는 "disables that check"와 맥락 일치. "비밀 키는 기록에 남을 수 있다"와 ".gitignore 후에도 계속 추적"은 이 문서에 없음 |
| gitpush | phrases "git push --force 할게요" | 뜻: GitHub의 기록을 강제로 덮어쓴다 … 커밋을 잃을 수 있어요 | 일치 | "It can cause the remote repository to lose commits; use it with care." (원문은 "remote"이며 GitHub로 한정하진 않음. "왜 필요한지 물어보라"는 권고는 해석) |
| ccwt | blocks/repo 설명3 | … Claude Code 문서는 이걸로 여러 작업을 동시에 시켜도 수정이 서로 부딪히지 않게 | 일치 | "Work on a feature in one terminal while Claude fixes a bug in another, without the edits colliding. Each git worktree is a separate checkout on its own branch" / "Run parallel sessions with worktrees so concurrent edits don't collide". (Git 문서 부분과 "옆 폴더에서 작업"은 gitwt/ccwt 일부로 뒷받침. "원래 폴더는 안 건드린다"는 명시 문장 미확인) |
| ccwt | phrases "워크트리에서 작업할게요" | 뜻: 원래 폴더는 그대로 두고 옆 폴더에 갈래를 펼쳐 … 합칠지(merge) 버릴지 | 부분 일치 | "Each git worktree is a separate checkout on its own branch" 및 "isolated parallel session"은 일치. "원래 폴더는 그대로"와 "끝나면 합칠지/버릴지 정해야 함"은 확인된 문장 없음(cleanup은 "See Worktrees for cleanup"으로 다른 페이지 참조만 있음) |
| npm | phrases "npm install ○○ 할게요" | 남이 만든 코드 묶음(패키지)과, 그게 필요로 하는 다른 패키지까지 … package.json에 기록 | 일치 | "This command installs a package and any packages that it depends on." / "npm install saves any specified packages into dependencies by default." / "Save installed packages to a package.json file as dependencies." ("패키지 이름 확인" 권고는 해석) |
| rm | phrases "rm -rf ○○ 실행할게요" | 뜻: 폴더째, 묻지 않고 지운다 … 휴지통으로 가지 않아요 | 부분 일치 | 일치: "-f, --force: ignore nonexistent files and arguments, never prompt" / "-r, -R, --recursive: remove directories and their contents recursively" / "Remove (unlink) the FILE(s)." "휴지통으로 가지 않는다"는 직접 문장 없음(근접: "it might be possible to recover some of its contents, given sufficient expertise and/or time"는 복구 가능성을 시사하나 휴지통 언급은 아님) |

## 8. 승인된 수정 (2026-11-03, 결정 1·2·3·a·b·c)

문장을 바꾼 곳은 **2줄**뿐이다. 나머지는 출처 연결과 표시 방식의 변경이다. 문장·출처 변경은 `scripts/verify-port.mjs`의 `INTENDED_CHANGES`에 등록돼 있다(`noSource`·`checkedAt` 필드는 verify-port가 아니라 check-sources가 검사한다).

### 8-1. 문장 수정 (2줄)
| 위치 | 전 | 후 | 근거 |
|---|---|---|---|
| blocks/key 설명 2 | "…2026년 말까지 없앨 예정이라고 안내해요." | "…2026년 말까지 지원 중단(deprecate)할 예정이라고 안내해요. 새 키를 만들어도 예전 키는 직접 끄기 전까지는 계속 동작해요." | sbkey 원문: "Supabase is deprecating the anon and service_role keys by the end of 2026." / "Creating publishable and secret keys doesn't revoke your legacy keys." / "They stay valid until you disable them" |
| types/dash 조립도 '로그인' (등급 1 유지) | "회사 숫자처럼 남이 보면 안 되면 꼭 필요해요." | "회사 숫자처럼 남이 보면 안 되는 숫자면 필요해요. 나만 보는 숫자면 없어도 돼요." | 등급 '상황 따라'와 문장 충돌 해소 (결정 a) |

### 8-2. 출처 교체·추가 (사실 문장 13줄 + KIS 2줄)
새 출처 16건을 2026-11-03에 직접 내려받아 아래 문장을 확인했다. 전부 1차(공식) 자료.

| 위치 | 바뀐 출처 | 원문에서 확인한 구절 |
|---|---|---|
| ui 설명 2 (HTML/CSS/JS 역할) | mdn → **mdnfirst** | "HTML … is the code that is used to structure a web page and its content" / "CSS … is the code that styles web content" / "JavaScript is a programming language that adds interactivity to websites" |
| ui 설명 4 (Next.js 정의) | react, nextenv → react, **nextdocs** | "Next.js is a React framework for building full-stack web applications." |
| server 설명 2 (서버가 확인·계산, 결과만 보냄) | mdn → **mdnserver** | "The server-side code handles tasks like validating submitted data and requests, using databases to store and retrieve data and sending the correct data to the client as required." |
| server 설명 3, game 미션 2, 공통 규칙 2 (화면에서 온 값은 믿지 않기) | + **mdnsec** | "never trust data from the browser. This includes … data in URL parameters of GET requests, POST requests, HTTP headers and cookies" |
| ext 설명 1 (API 정의) | mdn → **mdnapi** | "Application Programming Interfaces (APIs) are constructs made available in programming languages to allow developers to create complex functionality more easily." |
| ext 설명 2 (JSON) | mdn → **mdnjson** | "JSON is a standard text-based format for representing structured data … commonly used for transmitting data in web applications (e.g., sending some data from the server to the client" |
| db 설명 2 (SQL) | sbmig → **mdnsql** | "SQL (Structured Query Language) is a descriptive computer language designed for updating, retrieving, and calculating data in table-based databases." (select/delete/drop 예시는 원문에 없음 — 부분) |
| host 설명 2 (배포, vercel.app 주소) | vercel → **vgenurls**, vercel | "<project-name>-<unique-hash>-<scope-slug>.vercel.app" / "Production URL Points to the project's production deployment." |
| repo 설명 1 (Git vs GitHub) | gitbook → **ghgit** | "Git is a version control system that tracks changes to files. It lets you work on your own copy of a project, record a history of your changes" / "GitHub is a platform that supports your entire software development process" |
| repo 설명 2 (커밋·푸시·브랜치·머지) | gitbook → **gitwhat, gitbranch, gitremotes** | "every time you commit, or save the state of your project, Git basically takes a picture of what all your files look like at that moment" / "When you have your project at a point that you want to share, you have to push it upstream" / 브랜치·머지 장 |
| 번역기 "커밋할게요" | gitbook → **gitwhat** | "every time you commit, or save the state of your project, Git basically takes a picture" |
| 번역기 "API 라우트(엔드포인트)를 만들게요" | nextenv → **nextroute** | "Route Handlers allow you to create custom request handlers for a given route using the Web Request and Response APIs." |
| dash 미션 3 (공개 저장소) | ghleak → **ghvis** | "Public repositories are accessible to everyone on the internet." |
| ai 미션 1 (AI 키는 서버에) | claude → **claudeintro** | "Keep the key out of source control, client-side code, and prompts." |
| bot 미션 3, 공통 규칙 3 (KIS 모의투자) | kismock → **kisgh** + kismock | 한국투자증권 공식 GitHub README: "홈페이지 or 앱에서 Open API 서비스 신청 → 앱키·앱시크릿 발급 → 모의투자 및 실전투자 앱키 각각 준비", 설정에 "모의투자 증권계좌 8자리". '모의투자를 먼저 신청해 받은 모의계좌번호로 API를 신청' 절차 자체는 README에 없어 **부분 일치** — 2차 자료를 함께 유지 |

### 8-3. 출처 없음 표시 (설명·비유 7줄)
`noSource: "설명" | "비유"` 필드를 두고 화면에 "출처 없음 · 설명/비유"로 표시한다. 검사 스크립트는 이 표시가 있으면 통과시키되 경고로 센다.
db 설명 1(비유), always 설명 4, host 설명 4, auth 설명 3, game 미션 1, design 미션 1·2.

### 8-4. 표시·검사 장치
- **2차 자료 배지** (결정 b): 한 항목의 출처가 전부 2차 자료일 때 '2차 자료' 배지를 붙인다. kisgh를 추가한 지금은 해당 항목이 없어 배지가 보이는 곳은 없다. 2차 자료만 남는 항목이 생기면 자동으로 보인다.
- **volatile 재확인** (결정 c): 분기 1회 = 90일. volatile 출처의 `checkedAt`이 90일을 넘으면 **빌드가 실패**한다. 원문을 다시 열어 확인하고 `checkedAt`과 화면 확인일을 갱신해야 한다. 지금 값(2026-11-03) 기준 **2027-02-02부터 빌드 실패** — 그 전에 재확인 필요.
- 출처 28건의 `checkedAt`을 2026-11-03으로 갱신했다(이 날 원문 대조). kismock만 2026-10-09 유지(봇 차단으로 재확인 못 함).
- 화면 동등성 검사(`tests/parity.mjs`)는 출처 표시 영역(`.src`, `.srclist`)을 비교에서 빼고, 승인된 문장 변경은 프로토타입 쪽 글자를 바꿔 비교한다.

### 8-5. 남은 확인 필요 항목
- 바닥글 "모든 설명은 … 공식 문서로 … 확인" — 이제 '출처 없음' 7줄이 있어 '모든'이 정확하지 않다. 문구 변경은 미승인.
- sns 미션 2 "개인 계정이면 먼저 전환해야 해요" — Meta 개요 페이지에 없음(부분 일치). 세부 문서 확인 필요.
- 7-4의 비유 문장 '실제로는' 보충(기획안 5장 규칙 4) — 미착수.

## 9. 과제 2·4 반영 (2026-11-03, 승인)

### 9-1. 비유 5곳 '실제로는' 보충 (기획안 5장 규칙 4)
| 위치 | 추가한 문장 | 근거 |
|---|---|---|
| blocks/ui 설명 1 | 실제로는 서버가 완성된 HTML을 만들어 보내는 방식도 있어요. 어느 쪽이든 받은 파일을 화면으로 그리는 건 내 기기의 브라우저예요. | mdnserver "sent to the client to be displayed via some code (e.g., HTML and JavaScript)" / mdn "When an HTML page is returned, it is rendered by the web browser." (출처 mdnserver 추가) |
| blocks/db 설명 1 | 실제로는 Supabase 문서도 표를 엑셀 시트에 비유해요. 다만 데이터베이스 표는 열마다 자료형이 정해져 있고, 표끼리 서로 연결해서 써요. | sbtables "Tables are similar to Excel spreadsheets." / "link it to other tables" / "column data types that Postgres supports" |
| blocks/key 설명 3 | 실제로는 .gitignore는 커밋할 때 무시할 파일을 Git에 알려 주는 목록이에요. 이미 올린 파일은 규칙을 적기 전에 추적을 먼저 풀어야 해요. | ghignore "to tell Git which files and directories to ignore when you make a commit" / "If you want to ignore a file that is already checked in, you must untrack the file before you add a rule to ignore it." (2026-11-04 승인 b-1로 교체. 이 날 ghignore 원문을 다시 내려받아 위 두 구절을 확인했고, 출처 전체를 재대조한 것은 아니라 `checkedAt`은 그대로 둠. 이전 문구 "실제로는 Next.js 기본 템플릿이 .env 파일을 .gitignore에 넣어 두어서, 저장소에 올라가지 않게 해요."는 바로 앞 기존 문장과 중복) |
| blocks/always 설명 2 | 실제로는 물리 컴퓨터 한 대를 통째로 받는 게 아니라 AWS 클라우드 안에 만들어진 가상 서버예요. 필요할 때 늘리고 줄일 수 있어요. | ec2 "An EC2 instance is a virtual server in the AWS Cloud." / "scale up … scale down" |
| blocks/repo 맞혀보기 해설 | 실제로는 커밋은 그 시점 파일 전체의 모습을 '스냅샷'으로 저장해 두는 거예요. | gitwhat "takes a picture of what all your files look like at that moment and stores a reference to that snapshot" (설명 2의 출처로 이미 연결) |

### 9-2. 신규 챕터 "AI와 일하는 법" (기획안 3장·8장 8단계)
- 위치: `content/chapters/ai-work/` — 레슨 4개(컨텍스트 ctx · MCP mcp · 스킬 skill · 권한 승인 perm, 설명 단락 22개) + 번역기 5개. 홈 메뉴 5번, 번역기 필터 칩 4개 추가. 실험실 없음.
- 출처 6건(cchow, ccmemory, claudectx, ccmcp, ccskills, ccperm) 모두 2026-11-03 원문 내려받아 확인, volatile(90일 재확인).
- 작성 방식: 낮은 등급 모델이 **문장마다 원문 인용(`evidence`)을 붙이는 조건**으로 초안 → 인용 70건을 원문 파일과 자동 대조(누락 0) → 사람 역할의 검토에서 근거 없는 문장 1개 삭제("세션 하나는 대화 하나예요"), 과한 추론 2곳 축소("커밋하면 팀원도 받아요" → "저장소에 커밋해 둘 수 있어요") → 승인.
- 근거를 못 찾아 넣지 않은 것: 프롬프트 인젝션의 정의, 권한 모드별 기본값, 컨텍스트 창 크기 숫자, MCP 서버 보안 점검 방법.
- 동등성 검사: 새 요소(`data-new`)는 비교에서 제외하고, 기존 화면이 그대로인지 계속 검사한다. 홈의 "AI가 자주 하는 말 19개"는 24개로 바뀜(치환 비교).

## 10. SNS 미션 2 문장 축소 (2026-11-04, 승인)

| 위치 | 전 | 후 |
|---|---|---|
| types/sns 미션 2 해설 | 개인 계정이면 먼저 전환해야 해요. | 개인(일반) 계정은 쓸 수 없어요. |

- 근거: 2026-11-04에 instafb 원문(한국어판)을 다시 내려받아 제한 사항의 "Facebook 로그인을 통한 Instagram API는 Instagram 소비자 계정(예: 비즈니스 또는 크리에이터가 아닌 Instagram 계정)에 액세스할 수 없습니다."를 확인했다. '먼저 전환' 안내는 내려받은 insta·instafb 본문에서 찾지 못했다.
- 남은 범위 차이: 이 명시 문장은 Facebook 로그인 방식의 것이다. [Instagram 로그인 방식 문서](https://developers.facebook.com/documentation/instagram-platform/instagram-api-with-instagram-login)에서는 같은 표현을 찾지 못했고, insta 개요가 "Instagram 비즈니스 또는 크리에이터 계정을 관리"한다고 적는다. 해설 문장은 방식을 구분하지 않는다.
- 미해결 문제 제기: insta 개요는 "Instagram 퍼가기를 사용하여 웹사이트에 공개 Instagram 사진과 동영상을 추가"하는 방법을 따로 적으며, 그 구절에 계정 종류 조건은 없다. 미션 질문과 오답 보기 "아무 개인 계정이나 된다"가 이 방법과 어떤 관계인지는 확인 필요. 문장은 바꾸지 않았다.

## 11. 머리글 표기 삭제 (2026-11-04, 승인 a)

4절 7번 항목의 처리. `components/Classroom.tsx` 머리글의 `<small>프로토타입 v3</small>`을 지웠다. 이 표기는 `content/` 밖의 화면 코드에 있어 `INTENDED_CHANGES` 대상이 아니므로, `tests/parity.mjs`가 프로토타입 쪽에서만 이 요소를 지우고 비교한다. 앱에 표기가 다시 생기면 동등성 검사가 실패한다.

- 유지: 바닥글 "교육용 프로토타입"(별도 승인 전까지 그대로), 프로토타입 원본, `app/globals.css`의 `.brand small` 규칙(프로토타입 스타일 원본 복사본).

## 12. SNS 미션 2 질문·해설 수정 (2026-11-05, 승인 a)

10절에서 남긴 범위 문제를 처리했다. 보기 2개와 정답은 그대로다.

| 위치 | 전 | 후 |
|---|---|---|
| types/sns 미션 2 질문 | 내 인스타 게시물을 홈페이지에 자동으로 띄우려면 인스타 계정이 어떤 종류여야 할까? | 내 인스타 계정을 Instagram API로 연결하려면 계정이 어떤 종류여야 할까? |
| types/sns 미션 2 해설 | Meta 문서의 Instagram API는 비즈니스 또는 크리에이터 계정을 요구해요. 개인(일반) 계정은 쓸 수 없어요. | Meta 문서는 Instagram API의 두 방식(Instagram 로그인, Facebook 로그인) 모두 비즈니스 또는 크리에이터 계정을 관리하는 기능이라고 설명해요. Facebook 로그인 방식 문서에는 소비자 계정에 접근할 수 없다고 적혀 있어요. 공개 게시물을 웹사이트에 넣는 '퍼가기'는 따로 있어요. 비공개·비활성·연령 제한 계정의 게시물과 퍼가기를 끈 계정은 지원되지 않아요. |
| 출처 instafb 제목 | …(개인 계정 제한) | …(소비자 계정 제한) |
| 출처 추가 | 없음 | instaoembed (Meta · Instagram 게시물 퍼가기, volatile) |

- 근거: 2026-11-05에 insta·instafb·instaoembed 원문을 다시 내려받아 확인했다. insta "Instagram 퍼가기를 사용하여 웹사이트에 공개 Instagram 사진과 동영상을 추가하세요." / instafb "Facebook 로그인을 통한 Instagram API는 Instagram 소비자 계정(예: 비즈니스 또는 크리에이터가 아닌 Instagram 계정)에 액세스할 수 없습니다." / instaoembed "비공개, 비활성, 연령 제한 Instagram 계정의 게시물은 지원되지 않습니다." "Embeds를 비활성화 한 계정은 지원되지 않습니다."
- 원문으로 답할 수 없어 화면에 넣지 않은 것: 퍼가기 API에 앱·접근 토큰이 필요한지, 새 게시물을 홈페이지에 자동으로 보여주는 구체적인 방법.
- 화면 확인일: check-sources는 화면 날짜가 sources.json의 가장 최근 checkedAt과 같기를 요구해, 바닥글과 공통 규칙의 날짜가 2026-11-05로 바뀌었다. 이 날 다시 확인한 것은 위 3건이고, 나머지 출처의 checkedAt은 그대로다(각 출처의 실제 확인일은 sources.json 기준). 전체 재확인 전까지 화면 날짜는 '가장 최근 확인일'을 뜻한다.

## 13. 수강생 전 과정 점검 (2026-11-05)

실제 크롬에서 실제 사이트의 블록 9개·실험실 9개·유형 7개·미션 17개·번역기 칩 15개·공통 규칙·챕터 레슨 4개를 끝까지 풀고, 금액 칸은 키보드로 직접 입력했다. 실제 Android·iPhone 기기 점검은 아니다(미결 과제 2번).

### 13-1. 고친 것 (문장 변경 없음)
| 문제 | 근거 | 수정 |
|---|---|---|
| 스킬 레슨 한 줄 정리의 `/이름`이 안 보임 | 흰 글자 + 밝은 `code` 배경, 대비 1.1. 챕터는 동등성 검사 대상 밖이라 못 잡음 | `.sum code` 색 지정 |
| 금액 칸을 고쳐도 미리보기와 지난 결과가 그대로 | 칸 9900, 미리보기 500, 결과 "500원에 팔렸어요"로 어긋남. 프로토타입에서 물려받은 동작 | 입력하면 미리보기 갱신, 지난 결과 삭제. 동등성 검사는 입력 직후만 비교 제외 |
| 뒤로가기를 누르면 사이트를 벗어남 | 화면 이동 때 방문 기록이 쌓이지 않음 | 화면 이동을 기록. 칩·다음 미션은 덮어씀. Next.js의 `__NA` 표시를 유지해 새로고침을 막음 |
| 블록 색 6개의 흰 글자 대비 부족 | ui 4.06, db 2.93, auth 3.28, ext 4.09, key 2.93, host 3.49 | 같은 색 계열에서 4.5 이상으로 조정 (ui #3478ad, db #a85f18, auth #2a7d6f, ext #c43c7a, key #8a6d10, host #3c7f2e). 프로토타입과 색이 달라짐 |
| 조립도 "필요 없음" 행이 읽기 어려움 | 행 전체 투명도 45%, 블록 이름 대비 2.64 | 투명도를 없애고 이유 문장은 `--muted`, 블록 배경은 #6f7672로. 범례 색 칸은 동등성 검사 대상이라 그대로 |
| 고른 블록의 작은 글자 대비 부족 | 노란 칸에서 3.98 | `.part.on em` 색 지정 |
| "(하얀 화면… 앱이 안 열려요)"가 흐림 | 대비 1.6 | 글자색을 `--muted`로 |
| 낱말 중간 줄바꿈 ("그 / 게 뭔지") | 첫 화면 제목 | `word-break:keep-all`, `overflow-wrap:break-word` |
| 검사 공백: 프로토타입에 없는 화면의 표시 문제 | 위 첫 번째 문제 | `tests/walkthrough.mjs` 추가, CI 포함 |

출처 kismock은 2026-11-05에 크롬으로 열어 "모의투자계좌의 경우 한국투자 홈페이지 혹은 MTS에서 모의투자 서비스 신청 후 발급받은 모의계좌번호로 API 신청을 하셔야 합니다."를 확인했다. 그 글의 마지막 편집일은 2022-11-01이다. 나머지 출처 53건은 프로그램 요청에 200으로 응답했다(내용 재대조는 아님).

### 13-2. 승인이 필요한 문장 (고치지 않음)
- 유형 '돌아가는 순서' 첫 줄의 "대시보드이(가)", "결제 붙이기이(가)". 받침에 따라 조사가 어색하다. 화면 코드 `TypeView`의 고정 문구.
- 챕터에 설명 없이 나오는 말: 프롬프트 인젝션, Grep, 셸 명령(Bash), mkdir, frontmatter, 컨테이너, VM, PR, 마크다운. 비개발자 대상인데 뜻을 풀어 주지 않는다. 뜻을 넣으려면 출처 대조가 필요하다.
- 바닥글 "교육용 프로토타입"과 화면 확인일. 확인일은 가장 최근 확인일을 뜻하며, 모든 출처를 그날 확인했다는 뜻이 아니다(12절).

### 13-3. 규칙을 정해야 하는 동작 (고치지 않음, 프로토타입과 같음)
- 같은 블록을 다시 열어 풀면 점수가 또 쌓인다. 첫 답만 셀지 정해야 한다.
- 이미 푼 블록을 다시 열면 설명이 잠겨, 복습하려면 다시 답해야 한다.
- 새로고침하면 진도 표시는 남지만 점수와 보던 위치는 사라진다.
- 탭을 옮기면 미션이 1번으로 돌아가고 고른 답이 사라진다.

## 14. 미결 과제 8·9 처리 (2026-11-06, 승인)

### 14-1. 조사 (8번 일부)
`components/views/TypeView.tsx` 유형 '돌아가는 순서' 첫 줄: "{이름}이(가) 한 번 일할 때 일어나는 일이에요." → "이 서비스가 한 번 일할 때 일어나는 일이에요." (승인 문안 그대로). 화면 코드의 고정 문구라 `INTENDED_CHANGES` 대상이 아니며, `tests/parity.mjs`가 유형 7개 이름으로 치환해 비교한다.

### 14-2. 점수와 복습 규칙 (9번)
- 문제마다 **첫 답만** 점수에 넣는다. 문제 키는 맞혀보기 `block:{id}`, 챕터 `chapter:{id}`, 미션 `mission:{유형}:{번호}`, 열쇠 실험실 `key:{번호}`. 전체 36문제(맞혀보기 9, 열쇠 6, 미션 17, 챕터 4).
- 첫 답(고른 번호, 정답 여부)을 localStorage `cs-answers`에 저장해 새로고침해도 점수가 남는다.
- 이미 푼 블록·챕터 레슨을 다시 열거나 뒤로가기로 돌아오면 고른 답을 되살려 설명과 실험실을 열어 둔다. 보기는 다시 누를 수 없다.
- 그대로 둔 것: 미션 탭을 옮기면 1번으로 돌아가는 동작, 실험실 상태(다시 열면 처음부터). 열쇠 실험실은 다시 풀 수 있지만 점수는 첫 답 그대로다.
- 점수를 처음으로 되돌리는 버튼은 없다(브라우저 저장 데이터를 지우면 초기화).
- 실험실과 미션을 다시 풀면 화면의 "맞아요/반대예요", "n개 중 n개 맞혔어요"는 새 답 기준으로 보이지만 점수는 첫 답 그대로다(연습은 자유, 점수는 첫 답).
- 저장 방어: 저장 직전에 다시 읽어 합쳐 다른 탭의 답을 지우지 않는다. 망가진 저장값과 지금 콘텐츠에 없는 문제의 기록은 버린다.
- 검사: `tests/parity.mjs`는 프로토타입과 일부러 달라진 3단계(이미 푼 블록 다시 열기, 새로고침, 새로고침 뒤 메뉴)를 비교에서 뺀다(비교 542 → 539회). `tests/walkthrough.mjs`가 다시 열어도 설명이 열려 있는지, 다시 풀어도 점수가 그대로인지, 문제 수 36, 새로고침 뒤 점수 유지를 검사한다.

### 14-3. 용어 풀이 (8번 나머지, 문안 승인 대기)
원문 11건을 2026-11-06에 내려받아 인용문이 글자 그대로 있는지 확인했다. 문안은 승인 후 반영한다.
- 기존 블록 always 설명 1의 "큰 컴퓨터 안을 나눠서 만든 가상의 컴퓨터예요"는 ec2 원문에 없는 비유다. 같은 단락에 '실제로는' 보충(9-1)이 이미 있다.

## 15. 용어 풀이 (2026-11-09, 승인)

챕터 "AI와 일하는 법"에 설명 없이 나오던 용어에 괄호 풀이를 넣었다. evidence에 넣은 고유 인용문 9개(그리고 frontmatter 풀이가 기대는 ccskills 구절 1개)를 이 날 원문에서 다시 내려받아, 일회용 대조 스크립트로 글자 그대로 있는 것을 확인했다. 각 단락의 `sources`·`evidence`에 연결했다. 독립 검토는 Bash·컨테이너·VM 풀이를 부분 일치로 봤다(interpreter·process를 '프로그램'으로 옮김, EC2 인스턴스 정의를 VM 풀이에 씀). 승인 문안 그대로 두었다.

| 위치 | 넣은 풀이 | 출처 |
|---|---|---|
| mcp "신뢰할 수 있는 서버만 연결해요", 번역기 "MCP 서버를 추가할게요" | 프롬프트 인젝션(공격자가 악성 글을 끼워 넣어 AI의 지시를 무시하거나 조작하려는 수법) | ccsec |
| mcp "MCP 서버가 주는 것" | PR(바꾼 코드를 프로젝트에 합치자는 제안) | ghpr |
| skill "SKILL.md는 어떻게 생겼나" | 마크다운(구조가 있는 문서를 일반 글자로 쓰는 형식) | commonmark |
| skill "내가 부를 때만 실행되게 할 수도 있어요" | frontmatter(위에서 본 설명 머리말) | 같은 레슨 앞 단락(ccskills) |
| perm "읽기만 하는 건…" 표 | Grep(파일 안에서 글자 패턴 찾기), 셸 명령(Bash: 명령을 읽어 실행하는 프로그램) | man7grep, man7bash |
| perm "권한 모드" 표 | mkdir(폴더 만들기), mv(파일 옮기기·이름 바꾸기) | man7mkdir, man7mv |
| perm "bypassPermissions는…", 번역기 "권한을 bypass 모드로 바꿀게요" | 컨테이너(실행에 필요한 파일을 갖추고 다른 것과 떨어져 돌아가는 프로그램)나 VM(가상 서버, '24시간 컴퓨터' 블록 참고) | dockerctr, ec2 |

- 출처 8건 추가(ccsec, ghpr, commonmark, man7grep, man7bash, man7mkdir, man7mv, dockerctr). checkedAt 2026-11-09. 출처 62건.
- 화면 확인일은 가장 최근 checkedAt 규칙에 따라 2026-11-09로 바뀌었다(12절과 같은 뜻: 가장 최근 확인일).
- 챕터는 프로토타입에 없어 `verify-port`·`parity` 대상이 아니다. 화면 표시는 `test:walk`가 검사한다.

## 16. 챕터 2 "만든 다음에 터지는 것들" — 레슨 1 "CPU 탓? 먼저 메모리" (2026-11-09, 승인)

- 배경: 사용자 요청(2026-11-09)으로 SNS·커뮤니티·검색과 사용자 프로젝트 운영 문서를 조사했다. 웹 자료는 보안·요금 사고가 많았고, CPU·메모리·디스크 같은 운영 문제는 사용자 프로젝트 기록에서 나왔다. 사용자 승인: 실제 사고 기록은 프로젝트 이름을 빼고 "운영 기록"으로 표시, 순서는 메모리 → DB → 쌓이는 기록.
- 구조: 챕터를 여러 개 둘 수 있게 했다(`lib/content.ts` CHAPTERS, 상태 `ch`). 홈 6번 메뉴. 설명 단락에 화면 부품(`widget`, `components/widgets`)을 붙일 수 있다. 첫 부품은 메모리 시뮬레이션(`memory-sim`).
- 출처 5건 추가: rhswap(Red Hat 스왑 공간), kmm(커널 메모리 관리 개념, OOM killer), systemdres(MemoryMax=), man7free, man7uptime. 인용문은 이 날 원문에서 글자 그대로 확인했다. Red Hat 문서는 프로그램 접근을 막는 경우가 있어 브라우저와 같은 요청으로 받았다.
- `noSource`에 "운영 기록"을 추가했다(실제 사례 단락 2곳). 화면에는 "출처 없음 · 운영 기록"으로 보인다.
- 초안 단계에서 바로잡은 것: 원문의 "6분 54초"는 점검 작업의 원래 소요 시간이고 테스트와 겹친 구간을 뜻한다. "금방 끝나던 작업이 7분 걸렸다"는 해석은 틀려서 고쳤다. "봇이 로그 없이 꺼지면 OOM 의심"은 운영 기록(커널 OOM 기록 없음)과 맞지 않아 넣지 않았다.
- 시뮬레이션은 운영 기록의 실측(봇 425MB일 때 여유 210MB, 스왑 2,047MB 중 596MB, 테스트 약 190MB)을 기준으로 한 단순 계산이며, 화면에 그렇게 적었다.
- 독립 검토 반영(2026-11-09)
  - "상한이 서버 메모리보다 크면 먼저 바닥난다"는 systemd 원문에 없는 추론이라 뺐다. 운영 기록 자체의 판단("상한 역할을 못 한다")은 운영 기록 단락의 표로 옮겼다.
  - "6분 54초"는 다음 날 같은 작업을 잰 값이라는 단서를 넣었다. 190MB는 "테스트 프로그램의 메모리"로 고쳤다.
  - uptime 풀이를 원문("using the CPU or waiting to use the CPU")에 맞췄다.
  - "고친 방법"은 실제 코드 반영을 확인했다(quant-bot 커밋 bdb88b6, `jobs.py`의 평일 07:01 `os._exit(1)`, watchdog 5분 주기·900초 임계). 효과는 기록이 없어 쓰지 않았고, 원인을 없애는 방법이 아니라는 점을 적었다.
  - 시뮬레이터: "스왑을 더 쓰지 않아도 돼요"를 "지금 계산으로는 여유 N MB"로 낮췄다. 기준값 425MB가 눈금에 오도록 5MB 단위로 바꿨고, 나올 수 없는 강제 종료 분기는 부족 문구에 합쳤다. 958MB를 넘으면 막대를 줄이고 넘침을 표시한다.

## 17. 챕터 2 레슨 2 "DB가 느려지는 이유"·레슨 3 "쌓이기만 하는 기록" (2026-11-09, 문안 승인 대기)

- 출처 11건 추가(sbselect, pgindex, pgindexintro, lint0005, lint0006, pgvacuum, journald, logrotate, man7df, man7du, sqlitevac). 인용문 21개를 이 날 원문에서 글자 그대로 확인했다. Supabase JS 문서는 브라우저와 같은 요청일 때만 본문 전체가 와서, 그렇게 받아 확인했다.
- 원문에 없어 쓰지 않은 것: "디스크가 가득 차면 쓰기가 실패한다"는 일반 문장(errno 페이지는 ENOSPC 정의만 있음, 운영 기록으로만 씀), "반복문 대신 일괄 조회하라"는 공식 권고(운영 기록과 시뮬레이션으로만 보여 줌), logrotate의 `maxage` 문장(원문 위치 불일치로 `rotate count` 정의를 씀).
- 운영 기록(프로젝트 이름은 빼고 표시)은 원본 문서와 대조했다: 47종목 단건 조회 약 329번·11.7초 → 7번·1.1초, 1,000행에서 잘리는 조회 3곳, DB 784MB → 215MB, 삭제·VACUUM은 운영자 수동이고 VACUUM FULL은 하지 않음, 20초 간격 기록 하루 약 100MB·디스크 72%·약 3주, 2주 뒤 그 표가 DB의 91%(171MB)·읽는 코드 없음, logrotate 설정 줄바꿈 문제로 20일 미회전·로그 866MB·디스크 82%, 로그 2.9GB → 208MB, 디스크 79%·캐시 9.9GB → 45%·85% 경보, 백업 118 → 33개, 스냅샷 9월분 ₩3,114(부가세 별도)·스왑 재기록 70일 114GB. Supabase 점검 결과(서비스 A·B)는 2026-11-09에 점검 도구를 읽기만 해서 얻은 값이다.
- 화면 부품 2개: `nplus1-sim`(종목 수에 따라 따로 묻기와 묶어 묻기 시간 비교, 운영 기록으로 1회 요청 시간을 나눈 단순 계산), `disk-fill`(사용률·하루 증가량으로 가득 차는 날 계산, 디스크 크기는 예시).
