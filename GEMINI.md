# 볶음밥 (Bokk) 프론트엔드 프로젝트 컨텍스트

이 문서는 볶음밥(Bokk) 프론트엔드(`D:\GitHub\bokk`)의 구조, 기술 스택, 도메인별 핵심 스펙 및 코딩 컨벤션을 정의하는 최상위 컨텍스트 문서입니다.

- **서비스 URL**: [https://bokk.jiokkae.com/](https://bokk.jiokkae.com/)
- **전체 업데이트 및 기능 변경 이력**: [`./docs/CHANGELOG.md`](./docs/CHANGELOG.md)

---

## 1. 기술 스택 (Tech Stack)

- **Core**: React 18 (`v18.2.0`), React Router DOM v6 (`BrowserRouter`, `Routes`, `Outlet`)
- **API & State**: Apollo Client v3 (`@apollo/client`), GraphQL (`src/constants/querys.js`, `src/client.js`)
- **UI & Styling**: CSS Modules (`*.module.css`), React Bootstrap, Styled Components
- **Media & Editor**: `react-youtube`, 자체 구축 한글 조합 호환 `IMESafeEditor` (`PostMessageForm.js`)

---

## 2. 디렉토리 구조

- `src/components/`: 헤더, 검색, 웹링크, 유튜브 오프캔버스, 모달 등 재사용 UI 컴포넌트
- `src/routers/`: 각 페이지 라우트 컴포넌트 (`Home.js`, `Messageboard.js`, `manage/MyWeblink.js`, `manage/Playlist.js` 등)
- `src/outlets/`: 중첩 라우팅 레이아웃 (`HeaderLayout.js`, `SignLayout.js`)
- `src/constants/`: GraphQL 쿼리/뮤테이션(`querys.js`), 프래그먼트, 상수 정의
- `src/utils/`: 동적 날짜 치환(`weblinkUtil.js`) 등 공통 유틸리티
- `docs/`: 세부 업데이트 히스토리([`./docs/CHANGELOG.md`](./docs/CHANGELOG.md))

---

## 3. 도메인별 핵심 아키텍처 요약

1. **웹링크 & 그룹 관리 (`Home.js`, `MyWeblink.js`, `WeblinkGroupManageModal.js`, `weblinkUtil.js`)**:
   - 사용자 커스텀 그룹(`id > 0`), 빌트인 그룹(`bokk`, `id: 0`), 미분류 그룹(`미분류`, `id: -1`)을 통합 정렬(`seq`)하며, 메인 화면과 관리 페이지 양쪽에서 드래그 앤 드롭(순서 및 소속 그룹 변경)을 지원합니다.
   - 그룹 헤더의 `[↗ 모두 열기]` (Shift+클릭 시 새 창 일괄 열기, 모바일/터치 기기에서는 자동 숨김) 및 이름/URL 내 동적 날짜 템플릿(`{YYYY}`, `{YY}`, `{MM}`, `{M}`, `{DD}`, `{D}`) 실시간 치환을 지원합니다.
2. **유튜브 플레이어 & 다중 플레이리스트 (`YoutubeOffcanvas.js`, `PlaylistManageModal.js`, `VideoPlaylistTagModal.js`)**:
   - **탐색(View)과 재생 큐(Active Queue) 분리**: 드롭다운으로 다른 플레이리스트를 둘러보아도 현재 재생 중인 음악이 끊기지 않으며, 실시간 오디오 이퀄라이저(`ılı`)와 헤더 티커로 상태를 표시합니다.
   - 한 곡 다중 플레이리스트 담기(N:M 매핑), 8자리 고유 공유코드 기반 플레이리스트 공유 및 가져오기(복사 생성), 좌측 도트 핸들 드래그 리사이저(500px~1000px)를 제공합니다.
3. **자유 게시판 & 에디터 (`Messageboard.js`, `PostMessageForm.js`)**:
   - 모바일 한글 IME 자모 분리 방지 에디터(`IMESafeEditor`), EXIF 정방향 회전 및 WebP 업로드, 백엔드 XSS 필터(`<iframe>` 차단) 호환을 위한 `<oembed>` 자동 치환 전송 구조를 사용합니다.
4. **업데이트 노트 (`FeatureHistoryModal.js`)**:
   - 작성일 기준 14일 이내 항목 자동 `NEW` 뱃지 부여, 카테고리별 최신순 정렬 및 `이전 업데이트 더보기` 접기/펼치기 토글을 지원합니다.

---

## 4. 핵심 작업 규칙 및 컨벤션

1. **커밋 및 배포 제어 (필수)**:
   - 코드 수정 후 AI가 임의로 `git commit`, `git push`, `npm run deploy`를 실행하지 않으며, 반드시 **사용자의 명시적인 지시가 있을 때만** 수행합니다.
2. **GraphQL 및 인증 상태 동기화**:
   - 모든 GraphQL 쿼리/뮤테이션은 `src/constants/querys.js`에서 관리하며, 로그인/로그아웃 시 갱신이 필요한 쿼리는 `QUERIES_AFFECTED_BY_SIGN`에 포함합니다.
   - `useQuery` 결과를 불필요하게 `useState`에 복사하지 않고 캐시 데이터를 직접 참조하여 반응성을 유지합니다.
3. **문서 분리 및 이력 관리**:
   - 신규 기능 추가나 버그 수정 이력은 본 문서를 비대화시키지 않고 [`./docs/CHANGELOG.md`](./docs/CHANGELOG.md)에 기록합니다.
