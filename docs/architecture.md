# 구조 (architecture)

마지막 확인 2026-11-10 (main `2b00d81` 기준). 코드에서 확인한 것만 적었다.

## 한눈에

- **서버가 없는 정적 사이트**다. `next build`가 `out/` 폴더에 HTML·JS·CSS를 만들고, Vercel이 그 파일을 그대로 내보낸다.
- DB, 로그인, API 호출이 없다. `app/`, `components/`, `lib/`에 `fetch`, 주기 실행(`setInterval`), 환경변수(`process.env`) 사용이 없다(2026-11-10 grep 확인).
- 바깥으로 나가는 요청은 **Google Fonts**(글꼴 목록 `fonts.googleapis.com`, 글꼴 파일 `fonts.gstatic.com`)뿐이다(`app/layout.tsx`).
- 사용자의 진도는 **그 브라우저의 localStorage**에만 남는다([db-schema.md](db-schema.md)).

## 데이터 흐름

```
content/*.json ──▶ lib/content.ts ──▶ components/views/*  (화면)
                        │
content/game/*.json ─▶ lib/game.ts ──▶ components/game/*  (지도·배지·목표·보스)
                        │
              lib/store.ts  ◀──▶  브라우저 localStorage (cs-* 5개 키)
```

- `lib/content.ts`: 콘텐츠 JSON을 가져와 `BLOCKS`, `TYPES`, `CHAPTERS`, `LESSONS`, `PHRASES`, `SOURCES`로 묶는다. 레슨 id가 겹치면 빌드에서 멈춘다.
- `lib/store.ts`: 화면 상태(어느 화면·어느 레슨)와 진도 기록을 가진 작은 저장소. React 밖에 두고 `useSyncExternalStore`로 화면을 다시 그린다. 화면 이동은 `go()`, 뒤로가기는 `history` 상태로 처리한다.
- `lib/game.ts`: 기록에서 경험치·레벨·배지·지도 칸 상태를 **계산만** 한다(따로 저장하지 않음). 규칙 숫자와 문구는 `content/game/*.json`.
- `components/Classroom.tsx`: 화면 전체. `VIEWS` 표에서 지금 화면을 골라 그린다.

## 화면

| 화면(view) | 파일 | 내용 |
|---|---|---|
| home | `views/Home.tsx` + `game/QuestMap.tsx` | 학습 지도(지역 4, 칸 31), 메뉴 6개 |
| lesson | `views/Lesson.tsx` | 블록 레슨 9개(맞혀보기 → 설명 → 실험실) |
| pick, type | `views/Pick.tsx`, `TypeView.tsx` | 서비스 유형 7개(조립도·흐름·미션) |
| words, rules | `views/Words.tsx`, `Rules.tsx` | AI 말 번역기, 공통 규칙 |
| chapter | `views/Chapter.tsx` | 챕터 레슨 12개. 단락의 `widget`이 화면 부품을 붙인다 |
| me | `views/Me.tsx` | 레벨·배지·진도 파일 저장/불러오기 |
| review, card, ask | `views/Review.tsx`, `Card.tsx`, `Ask.tsx` | 복습함, 안전 수칙 카드(PNG), 질문 꾸러미 |
| boss | `views/Boss.tsx` | 챕터 보스 "승인할까요?" |

## 검사 장치 (추측 금지를 장치로 지킨다)

빌드 전(`prebuild`)에 차례로 돈다. 하나라도 실패하면 빌드가 멈춘다.

| 스크립트 | 막는 것 |
|---|---|
| `scripts/check-sources.mjs` | 출처 칸이 있는 콘텐츠에 출처가 없음, 없는 출처 id, 형식이 틀린 출처, **자주 바뀌는 출처(volatile)를 90일 넘게 재확인 안 함**, 화면의 확인일이 최신 `checkedAt`과 다름 |
| `scripts/check-game.mjs` | 레벨 기준 순서, 배지·목표·보스 규칙의 실수(없는 사건·챕터 id, 보스 문제 수, 마지막 레벨이 얻을 수 있는 최대 경험치보다 큼), 질문 표 줄 수 |
| `scripts/verify-port.mjs` | 프로토타입에서 옮긴 문장이 승인 없이 바뀜(승인된 변경은 `INTENDED_CHANGES`에 등록) |

빌드 뒤 검사(CI `check`에 포함):

| 검사 | 내용 |
|---|---|
| `tests/parity.mjs` | 프로토타입 v4와 새 앱을 같은 순서로 조작해 화면 구조·글자를 비교(77 시나리오, 539회). 새 요소는 `data-new`로 제외 |
| `tests/walkthrough.mjs` | 휴대폰(375px)·다크 설정·데스크톱(1280px)에서 전 과정을 끝까지 풀며 글자 대비 4.5, 가로 넘침, 잘못된 글자, 링크, 점수·경험치·배지·진도 파일·복습함·수칙 카드·질문 꾸러미·목표·보스를 확인 |

측정 도구(읽기 전용): `scripts/perf-audit.mjs`(메모리·속도·저장소 크기), `scripts/measure-text.mjs`(글 분량).

## CI와 배포

- `.github/workflows/check.yml`: main 푸시와 PR에서 `npm ci → build → playwright 설치 → test:parity → test:walk`. Node 22. 같은 PR에 새 커밋이 오면 앞선 검사는 멈춘다.
- Vercel: main에 합쳐지면 운영 배포, 브랜치마다 미리보기 배포. 프로젝트 설정의 Node 버전은 26.x(2026-11-10 Vercel 조회).
- Node 버전이 세 곳에서 다르다(CI 22, 운영자 PC 24.14.0, Vercel 26.x). 이 차이로 생긴 문제는 기록에 없다.

## 2단계(아직 안 함)

로그인·기기 간 진도 저장은 원래 기획안 6·7장(Supabase)에 설계만 있다. 시작 조건과 나이 정책은 [plan-v2-game.md](plan-v2-game.md) 8장.
