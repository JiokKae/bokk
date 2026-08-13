import { useMemo, useState } from "react";
import { Badge, Modal } from "react-bootstrap";

const initialCategories = [
	{
		id: "weblink",
		mainTitle: "내 웹링크 관리 & 커스텀",
		updates: [
			{
				date: "2026.08.13",
				isNew: true,
				tag: "기능 추가",
				title: "웹링크 추가 위치 지정 옵션",
				description: "웹링크 추가 시 위치 선택 지원 (관리: 맨 위 / 메인: 맨 끝)",
			},
			{
				date: "2026.08.12",
				isNew: false,
				tag: "기능 개선",
				title: "내 웹링크 순서 변경 (드래그 앤 드롭)",
				description: "삼단줄(☰) 드래그로 간편하게 웹링크 순서 변경",
			},
			{
				date: "2026.01.10",
				isNew: false,
				tag: "기능 추가",
				title: "나만의 웹링크 커스텀 등록",
				description: "웹링크 이름, URL, 배경색 및 글자색 커스텀 등록",
			},
		],
	},
	{
		id: "youtube",
		mainTitle: "유튜브 연속 재생 플레이어",
		updates: [
			{
				date: "2026.08.12",
				isNew: true,
				tag: "기능 추가",
				title: "유튜브 실시간 재생 제목 스크롤 티커",
				description: "재생 중인 영상 제목이 가로 스크롤과 함께 헤더에 실시간 표출",
			},
			{
				date: "2026.01.05",
				isNew: false,
				tag: "기능 추가",
				title: "유튜브 백그라운드 연속 재생",
				description: "재생 목록 구성 및 백그라운드 연속 재생 지원",
			},
		],
	},
	{
		id: "search",
		mainTitle: "포털 통합 검색",
		updates: [
			{
				date: "2026.01.01",
				isNew: false,
				tag: "기능 추가",
				title: "포털 통합 검색 (네이버 / 구글)",
				description: "네이버 및 구글 원클릭 탭 전환 통합 검색",
			},
		],
	},
	{
		id: "board",
		mainTitle: "자유 게시판 & 소통",
		updates: [
			{
				date: "2026.08.13",
				isNew: true,
				tag: "버그 픽스",
				title: "모바일 이미지 업로드 전면 개선 및 버그 수정",
				description: "사진 첨부 체감 속도 최적화 및 모바일 기기에서 여러 장의 고해상도 사진 연속 업로드 시 브라우저가 뻗는 현상(메모리 초과) 완벽 해결",
			},
			{
				date: "2026.08.12",
				isNew: false,
				tag: "기능 개선",
				title: "모바일 전용 한글 호환 에디터 엔진 구축",
				description: "모바일 환경(천지인 키보드 등)에서 글자가 자음/모음 단위로 분리되는 고질적인 현상을 해결한 네이티브 한글 조합 에디터 탑재",
			},
			{
				date: "2026.01.01",
				isNew: false,
				tag: "기능 추가",
				title: "자유 게시판 및 소통",
				description: "게시글 작성, 댓글 및 좋아요 기능 제공",
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
				<Modal.Footer className="py-2 px-3 bg-light border-top d-flex justify-content-between align-items-center">
					<small className="text-muted" style={{ fontSize: "12px" }}>
						볶음밥 유틸리티 서비스
					</small>
					<small className="text-muted" style={{ fontSize: "12px" }}>
						Release Notes
					</small>
				</Modal.Footer>
			</Modal>
		</>
	);
}
