import { useMemo, useState } from "react";
import { Badge, Modal } from "react-bootstrap";

const initialCategories = [
	{
		id: "weblink",
		mainTitle: "내 웹링크 관리 & 커스텀",
		updates: [
			{
				date: "2026.08.14",
				isNew: true,
				tag: "수정",
				title: "기본 웹링크 캐시 반응성 버그 수정",
				description: "로그인 및 로그아웃 시 기본 웹링크 토글 상태가 즉각적으로 반영되도록 동기화 개선",
			},
			{
				date: "2026.08.13",
				isNew: true,
				tag: "추가",
				title: "웹링크 추가 위치 지정 옵션",
				description: "웹링크 생성 시 진입 경로에 따른 위치(최상단/최하단) 자동화 및 옵션 지원",
			},
			{
				date: "2026.08.12",
				isNew: false,
				tag: "개선",
				title: "내 웹링크 순서 변경 (드래그 앤 드롭)",
				description: "드래그 앤 드롭 방식을 통한 직관적인 웹링크 순서 변경 인터페이스 도입",
			},
			{
				date: "2022.11.11",
				isNew: false,
				tag: "추가",
				title: "나만의 웹링크 커스텀 등록",
				description: "개인화된 웹링크 등록 및 UI 색상 커스터마이징 시스템 구축",
			},
		],
	},
	{
		id: "youtube",
		mainTitle: "유튜브 연속 재생 플레이어",
		updates: [
			{
				date: "2026.08.18",
				isNew: true,
				tag: "추가",
				title: "유튜브 대화면 확장 및 드래그 리사이징 핸들 (<<)",
				description: "오프캔버스 좌측 플랫 버튼을 통해 너비를 최대 2배(1000px)까지 자유롭게 드래그/원클릭 확장 지원",
			},
			{
				date: "2026.08.17",
				isNew: true,
				tag: "수정",
				title: "유튜브 자동 재생(AutoPlay) 상태 동기화 및 실행 오류 수정",
				description: "브라우저 정책 호환을 위한 조작 시 자동 재생 안내 뱃지 추가 및 설정 동기화 최적화",
			},
			{
				date: "2026.08.17",
				isNew: true,
				tag: "추가",
				title: "유튜브 한곡 반복 재생 (Single Loop)",
				description: "유튜브 컨트롤러에 한곡 반복 버튼을 추가하여 현재 곡 연속 재생 지원",
			},
			{
				date: "2026.08.17",
				isNew: true,
				tag: "개선",
				title: "재생 불가/삭제 영상 자동 건너뛰기",
				description: "삭제되거나 국가 제한 등으로 재생이 불가능한 영상 감지 시 자동으로 다음 곡 재생",
			},
			{
				date: "2026.08.14",
				isNew: true,
				tag: "개선",
				title: "모바일 헤더 유튜브 버튼 UI 최적화",
				description: "좁은 모바일 화면에서 아이콘 잘림 및 줄바꿈을 방지하고 유동적 티커 너비 적용",
			},
			{
				date: "2026.08.12",
				isNew: true,
				tag: "추가",
				title: "유튜브 실시간 재생 제목 스크롤 티커",
				description: "백그라운드 재생 상태를 직관적으로 확인할 수 있는 상단 스크롤 티커 UI 적용",
			},
			{
				date: "2022.11.09",
				isNew: false,
				tag: "추가",
				title: "유튜브 백그라운드 연속 재생",
				description: "커스텀 재생 목록 생성 및 백그라운드 영상 연속 재생 환경 구축",
			},
		],
	},
	{
		id: "search",
		mainTitle: "포털 & 전적 통합 검색",
		updates: [
			{
				date: "2026.08.17",
				isNew: true,
				tag: "개선",
				title: "OP.GG 전적 검색 방식 최신화",
				description: "OP.GG 최신 검색 라우팅 구조(q, region=kr) 적용 및 빠른 소환사 이동 링크 최신화",
			},
			{
				date: "2022.11.04",
				isNew: false,
				tag: "추가",
				title: "포털 통합 검색 (네이버 / 구글)",
				description: "주요 포털(네이버, 구글) 간 탭 전환형 통합 검색 인터페이스 제공",
			},
		],
	},
	{
		id: "board",
		mainTitle: "자유 게시판 & 소통",
		updates: [
			{
				date: "2026.08.14",
				isNew: true,
				tag: "수정",
				title: "게시판 에디터 미디어 첨부 및 업로드 로직 개편",
				description: "미리보기 지연 시간 최소화 및 모바일 다중 고해상도 이미지 업로드 시 발생하는 메모리 초과(OOM) 오류 원천 차단",
			},
			{
				date: "2026.08.12",
				isNew: false,
				tag: "개선",
				title: "모바일 전용 한글 호환 에디터 엔진 구축",
				description: "네이티브 조합 엔진 탑재를 통한 모바일 환경(천지인 등) 한글 자모 분리 현상 해결",
			},
			{
				date: "2022.11.04",
				isNew: false,
				tag: "추가",
				title: "자유 게시판 및 소통",
				description: "사용자 간 소통을 위한 실시간 게시판, 댓글 및 추천 시스템 도입",
			},
		],
	},
];

export default function FeatureHistoryModal() {
	const [show, setShow] = useState(false);

	// Sort categories by the latest update date inside each category (descending)!
	const sortedCategories = useMemo(() => {
		return [...initialCategories].sort((a, b) => {
			const latestA = Math.max(...a.updates.map((u) => new Date(u.date.replace(/\./g, "-")).getTime() || 0));
			const latestB = Math.max(...b.updates.map((u) => new Date(u.date.replace(/\./g, "-")).getTime() || 0));
			return latestB - latestA;
		});
	}, []);

	// Default open the most recently updated category
	const [openCategoryIds, setOpenCategoryIds] = useState({ [sortedCategories[0].id]: true });

	const toggleCategory = (id) => {
		setOpenCategoryIds((prev) => ({
			...prev,
			[id]: !prev[id],
		}));
	};

	return (
		<>
			<button
				className="btn btn-light border d-flex align-items-center justify-content-center p-1 shadow-sm user-select-none"
				style={{ width: "32px", height: "32px", borderRadius: "8px", cursor: "pointer", userSelect: "none" }}
				onClick={() => setShow(true)}
				onMouseDown={(e) => e.preventDefault()}
				title="기능 추가 내역"
			>
				📋
			</button>

			<Modal show={show} onHide={() => setShow(false)} centered size="lg">
				<Modal.Header closeButton>
					<Modal.Title as="h5">기능 추가 내역</Modal.Title>
				</Modal.Header>
				<Modal.Body
					className="always-scrollbar"
					style={{
						maxHeight: "70vh",
						overflowY: "scroll",
						overflowX: "hidden",
						backgroundColor: "#f8f9fa",
						padding: "16px 20px 16px 16px",
					}}
				>
					<style>{`
						.always-scrollbar::-webkit-scrollbar {
							width: 8px !important;
						}
						.always-scrollbar::-webkit-scrollbar-thumb {
							background-color: #94a3b8 !important;
							border-radius: 4px !important;
						}
						.always-scrollbar::-webkit-scrollbar-thumb:hover {
							background-color: #64748b !important;
						}
						.always-scrollbar::-webkit-scrollbar-track {
							background-color: #e2e8f0 !important;
							border-radius: 4px !important;
						}
					`}</style>
					<div className="d-flex flex-column gap-2">
						{sortedCategories.map((category) => {
							const isOpen = Boolean(openCategoryIds[category.id]);
							const latestUpdate = category.updates[0];
							
							// 2주(14일) 이내인지 판별
							const TWO_WEEKS_MS = 14 * 24 * 60 * 60 * 1000;
							const now = new Date().getTime();
							const isDateNew = (dateStr) => {
								const time = new Date(dateStr.replace(/\./g, "-")).getTime();
								return now - time <= TWO_WEEKS_MS;
							};

							const hasNew = category.updates.some((u) => isDateNew(u.date));

							return (
								<div
									key={category.id}
									className={`card border overflow-hidden ${isOpen ? "shadow-sm" : ""}`}
									style={{
										borderRadius: "10px",
										borderColor: isOpen ? "#b6e0fe" : "#e0e0e0",
										transition: "all 0.3s ease",
									}}
								>
									{/* Main Feature Category Header */}
									<div
										className="card-header d-flex justify-content-between align-items-center py-3 px-3 user-select-none"
										onClick={() => toggleCategory(category.id)}
										onMouseDown={(e) => e.preventDefault()}
										style={{
											cursor: "pointer",
											backgroundColor: isOpen ? "#ffffff" : "#f1f3f5",
											borderBottom: isOpen ? "1px solid #e9ecef" : "none",
											transition: "background-color 0.3s ease",
										}}
									>
										<div className="d-flex align-items-center gap-2">
											<h6 className={`mb-0 fw-bold ${isOpen ? "text-dark" : "text-secondary"}`}>
												{category.mainTitle}
											</h6>
											{hasNew && (
												<Badge bg="primary" className="ms-2 px-2 py-1" style={{ fontSize: "11px" }}>
													NEW
												</Badge>
											)}
										</div>
										<div className="d-flex align-items-center gap-2 text-secondary small">
											<small className={isOpen ? "text-muted" : "text-secondary"} style={{ opacity: isOpen ? 1 : 0.8 }}>
												{latestUpdate?.date}
											</small>
											<span
												style={{
													fontSize: "10px",
													display: "inline-block",
													transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
													transition: "transform 0.3s ease",
													color: isOpen ? "#0699f9" : "#6c757d",
												}}
											>
												▼
											</span>
										</div>
									</div>

									{/* Sub-features Accordion / Foldable Content with Smooth Animation */}
									<div
										style={{
											maxHeight: isOpen ? "500px" : "0px",
											opacity: isOpen ? 1 : 0,
											transition: "max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.35s ease",
											overflow: "hidden",
											backgroundColor: "#ffffff",
										}}
									>
										<div className="card-body py-2 px-3">
											<div className="d-flex flex-column">
												{category.updates.map((sub, idx) => {
													const isSubNew = isDateNew(sub.date);
													return (
													<div
														key={idx}
														className={`py-2 ${idx !== category.updates.length - 1 ? "border-bottom" : ""}`}
													>
														<div className="d-flex justify-content-between align-items-center mb-1">
															<div className="d-flex align-items-center gap-2">
																<Badge
																	bg={isSubNew ? "primary" : "light"}
																	text={isSubNew ? "white" : "dark"}
																	className="px-2 py-1 border"
																	style={{ fontSize: "11px" }}
																>
																	{sub.tag || (isSubNew ? "신규" : "업데이트")}
																</Badge>
																<span className="fw-bold small">{sub.title}</span>
															</div>
															<small className="text-muted ms-2">{sub.date}</small>
														</div>
														<p
															className="mb-0 text-secondary small ps-1 mt-1"
															style={{ whiteSpace: "pre-line", wordBreak: "break-word", overflowWrap: "break-word" }}
														>
															{sub.description}
														</p>
													</div>
													);
												})}
											</div>
										</div>
									</div>
								</div>
							);
						})}
					</div>
				</Modal.Body>
				<Modal.Footer className="bg-light border-0 py-2 justify-content-end px-3">
					<span className="text-secondary small">Release Note</span>
				</Modal.Footer>
			</Modal>
		</>
	);
}
