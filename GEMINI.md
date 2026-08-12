# 볶음밥 (Bokk) 프로젝트 컨텍스트

이 문서는 볶음밥(Bokk) 프로젝트의 구조와 기술 스택에 대한 핵심 정보를 담고 있으며, AI 에이전트가 코드를 작성하거나 수정할 때 기준이 되는 컨텍스트입니다.

## 1. 프로젝트 개요
**'볶음밥(Bokk)'**은 사용자가 자주 사용하는 기능들을 한곳에 모아둔 다목적 유틸리티 웹 어플리케이션입니다. 주요 포털 검색, 즐겨찾기(웹 링크) 관리, 유튜브 재생 목록 관리 및 백그라운드 재생, 게시판 등 개인화된 편의 기능을 제공합니다.

- **홈페이지:** [https://bokk.jiokkae.com/](https://bokk.jiokkae.com/)
- **주요 목적:** 접근성이 높은 웹 기반 개인 대시보드 및 편의 기능 모음

## 2. 사용된 기술 스택 (Tech Stack)

### Frontend Core
- **React (v18.2.0):** UI 컴포넌트 기반 렌더링
- **React Router DOM (v6):** SPA 라우팅 처리 (`BrowserRouter`, `Routes`, `Outlet` 활용)

### 상태 관리 & API 통신
- **Apollo Client (`@apollo/client` v3):** GraphQL 기반 서버 통신 및 로컬 캐싱 관리
- **GraphQL:** 서버와의 데이터 질의 및 조작

### 스타일링 & UI 라이브러리
- **CSS Modules (`*.module.css`) & App.css:** 기본 컴포넌트 스타일링
- **Styled Components:** CSS-in-JS 스타일링
- **React Bootstrap:** 주요 UI 프레임워크

### 주요 기능 라이브러리
- **React Youtube:** 유튜브 영상 플레이어 내장 및 제어
- **CKEditor 5 (`@ckeditor/ckeditor5-react`):** 리치 텍스트 에디터

## 3. 핵심 아키텍처 규칙

1. **라우팅:**
   - `App.js`에서 `react-router-dom`의 Outlet 기능을 활용하여 레이아웃(`HeaderLayout.js`, `SignLayout.js`) 기반으로 라우팅을 구성합니다.
2. **API 통신:**
   - 모든 서버 통신은 `Apollo Client`와 `GraphQL`을 사용합니다.
   - 쿼리와 뮤테이션은 `src/constants/querys.js`에 중앙 집중화되어 있습니다.
3. **접근 제어:**
   - 컴포넌트 내에서 `ME` 쿼리(GraphQL)를 사용하여 로그인 상태를 확인하고 UI 렌더링 및 기능 접근을 제어합니다.
4. **스타일링 컨벤션:**
   - 컴포넌트 스코프 스타일링이 필요한 경우 CSS Modules (`[ComponentName].module.css`)를 우선적으로 사용합니다.

## 4. 주요 디렉토리 구조
- `src/components/`: 재사용 가능한 UI 컴포넌트
- `src/routers/`: 각 라우트(페이지)에 해당하는 최상위 컴포넌트
- `src/outlets/`: 중첩 라우팅을 위한 레이아웃 컴포넌트
- `src/constants/`: GraphQL 쿼리(`querys.js`), 프래그먼트, URL 등 전역 상수

## 5. 주요 신규 기능 및 업데이트 이력

### 5.1 기능 추가 내역 모달 (`FeatureHistoryModal.js`)
- **위치**: 헤더 검색 선택 영역 마인크래프트 아이콘 왼쪽 (`SearchSelector.js`)
- **아코디언 폴딩 구조**: 메인 기능 카테고리별 독립적 Fold/Unfold 애니메이션 모달 UI
- **최신 갱신 자동 정렬**: 카테고리 내부 소기능 중 가장 최근 업데이트 날짜가 있는 카테고리가 최상단에 자동 배치
- **UI & 스크롤바 디테일**: 접힌 카테고리 딤드 배경(`#f1f3f5`), 슬림 고대비 항시 표시 스크롤바(`overflowY: scroll`), 간결한 단문 설명 및 닫기 버튼 없는 푸터 레이아웃

### 5.2 내 웹링크 드래그 앤 드롭 정렬 (`MyWeblink.js`)
- **내 웹링크 편집 화면**: 삼단줄(`☰`) 잡기 기반 실시간 드래그 앤 드롭 순서 변경 및 백엔드 DB 자동 연동

### 5.3 유튜브 재생 실시간 스크롤 티커 (`YoutubeOffcanvas.js`)
- **위치**: 헤더 유튜브 아이콘 왼쪽
- **내용**: 유튜브 영상 재생 시 현재 재생 중인 영상 제목이 펼쳐짐/접힘 애니메이션과 함께 가로 무한 스크롤되는 라이브 티커 제공

### 5.4 웹링크 추가 위치 지정 옵션 (`AddWeblinkModal.js`)
- **position 옵션**: GraphQL Mutation `addWeblink` 호출 시 `position` (`first` / `last`)을 지정하여 추가 위치 선택
- **관리 페이지**: 상단 `+` 버튼으로 추가 시 목록 맨 위(`position: "first"`)에 자동 배치
- **메인 페이지**: `+` 버튼으로 추가 시 목록 맨 끝(`position: "last"`)에 자동 배치



