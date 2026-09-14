import { useMemo, useState } from "react";
import { Badge, Modal } from "react-bootstrap";

const initialCategories = [
	{
		id: "weblink",
		mainTitle: "내 웹링크 관리 & 커스텀",
		updates: [
			{
				date: "2026.09.15",
				isNew: true,
				tag: "개선",
				title: "모바일 화면 최적화 및 비로그인 접근 보호",
				description:
					"스마트폰 환경에서는 불필요한 탭 열기 방지를 위해 '모두 열기' 버튼을 자동으로 숨겨 화면을 깔끔하게 유지하고, 웹링크 관리 기능은 로그인한 상태에서만 안전하게 사용할 수 있도록 보호했습니다.",
			},
			{
				date: "2026.09.15",
				isNew: true,
				tag: "추가",
				title: "홈 화면에서 바로 웹링크 순서 및 그룹 변경",
				description:
					"관리 페이지로 이동하지 않아도 메인 화면에서 '순서·그룹 변경'을 켜고, 마우스로 링크를 끌어다 놓아 순서를 바꾸거나 다른 그룹으로 바로 옮길 수 있습니다.",
			},
			{
				date: "2026.09.15",
				isNew: true,
				tag: "추가",
				title: "웹링크 그룹(폴더) 생성 및 순서 정리",
				description:
					"자주 가는 사이트들을 업무, 공부, 쇼핑 등 원하는 그룹으로 묶어 깔끔하게 정리하고, 기본 링크와 미분류 링크도 원하는 순서대로 자유롭게 배치할 수 있습니다.",
			},
			{
				date: "2026.09.15",
				isNew: true,
				tag: "추가",
				title: "그룹 링크 한 번에 모두 열기",
				description:
					"그룹에 담긴 링크들을 일일이 누를 필요 없이 '모두 열기' 버튼 하나로 한 번에 열 수 있습니다. Shift 키를 누른 채 클릭하면 새로운 창으로 시원하게 열립니다.",
			},
			{
				date: "2026.09.15",
				isNew: true,
				tag: "추가",
				title: "웹링크 관리 페이지에서 간편한 그룹별 정리",
				description:
					"웹링크 관리 화면에서도 내 링크들이 그룹별로 깔끔하게 나뉘어 표시되며, 마우스로 끌어서 다른 그룹으로 쉽게 옮기거나 순서를 바꿀 수 있습니다.",
			},
			{
				date: "2026.08.14",
				isNew: false,
				tag: "수정",
				title: "기본 웹링크 표시 상태 즉시 반영",
				description:
					"로그인이나 로그아웃을 했을 때 기본 웹링크 켜짐/꺼짐 상태가 화면에 바로 나타나도록 개선했습니다.",
			},
			{
				date: "2026.08.13",
				isNew: false,
				tag: "추가",
				title: "새 웹링크 추가 위치 자동 지정",
				description:
					"메인 화면에서 링크를 추가하면 목록 맨 뒤에, 관리 페이지에서 추가하면 맨 앞에 보기 좋게 배치됩니다.",
			},
			{
				date: "2026.08.12",
				isNew: false,
				tag: "개선",
				title: "내 웹링크 순서 변경 (드래그 앤 드롭)",
				description: "마우스로 끌어서 원하는 위치로 웹링크 순서를 손쉽게 바꿀 수 있습니다.",
			},
			{
				date: "2022.11.15",
				isNew: false,
				tag: "추가",
				title: "등록된 웹링크 수정 기능",
				description: "이미 등록한 나만의 웹링크의 이름, 주소(URL), 배경 색상 편집 기능 지원",
			},
			{
				date: "2018.05.04",
				isNew: false,
				tag: "추가",
				title: "나만의 웹링크 커스텀 등록",
				description: "개인화된 웹링크 등록 및 UI 색상 커스터마이징 시스템 최초 구축",
			},
		],
	},
	{
		id: "youtube",
		mainTitle: "유튜브 연속 재생 플레이어",
		updates: [
			{
				date: "2026.09.14",
				isNew: true,
				tag: "추가",
				title: "플레이리스트 생성 및 한 곡 다중 담기",
				description: "원하는 이름으로 재생 목록을 자유롭게 만들고, 영상마다 여러 개의 플레이리스트를 골라 담아 취향대로 분류해 들을 수 있습니다.",
			},
			{
				date: "2026.09.14",
				isNew: true,
				tag: "추가",
				title: "8자리 코드로 플레이리스트 공유 및 가져오기",
				description: "8자리 고유 공유코드로 내가 만든 플레이리스트를 친구와 공유하거나, 다른 사람의 플레이리스트를 내 보관함에 바로 복사해 올 수 있습니다.",
			},
			{
				date: "2026.09.14",
				isNew: true,
				tag: "추가",
				title: "끊김 없는 플레이리스트 둘러보기 & 라이브 이퀄라이저",
				description: "음악을 듣는 도중 다른 플레이리스트를 자유롭게 둘러보아도 노래가 멈추지 않으며, 현재 재생 중인 목록에는 실시간 이퀄라이저가 표시됩니다.",
			},
			{
				date: "2026.09.14",
				isNew: true,
				tag: "개선",
				title: "재생 목록 창 크기 조절 편의성 향상",
				description: "브라우저 창을 좁게 쓰거나 화면을 분할해 사용할 때도 창 크기 조절 손잡이가 사라지지 않고 항상 편리하게 넓힐 수 있습니다.",
			},
			{
				date: "2026.08.18",
				isNew: false,
				tag: "추가",
				title: "유튜브 대화면 확장 및 내장형 도트 핸들 리사이저",
				description: "오프캔버스 좌측 도트 핸들을 통해 너비를 최대 2배(1000px)까지 자유롭게 드래그/원클릭 확장 지원",
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
				date: "2018.12.28",
				isNew: false,
				tag: "추가",
				title: "유튜브 백그라운드 연속 재생 플레이어",
				description: "커스텀 재생 목록 등록 및 백그라운드 영상 연속 재생 플레이어 최초 도입",
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
				date: "2018.11.21",
				isNew: false,
				tag: "추가",
				title: "포털 통합 검색 (네이버 / 구글)",
				description: "주요 포털(네이버, 구글) 간 탭 전환형 통합 검색 인터페이스 구축",
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
				date: "2022.12.15",
				isNew: false,
				tag: "개선",
				title: "게시판 미디어(이미지/영상) 첨부 지원",
				description: "게시글 작성 시 이미지(WebP) 첨부 및 유튜브 영상 임베드 기능 도입",
			},
			{
				date: "2018.05.06",
				isNew: false,
				tag: "추가",
				title: "자유 게시판 및 소통",
				description: "사용자 간 자유로운 의견 교환을 위한 실시간 게시판 및 댓글 시스템 최초 오픈",
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
	const [expandedCategoryIds, setExpandedCategoryIds] = useState({});

	const toggleCategory = (id) => {
		setOpenCategoryIds((prev) => ({
			...prev,
			[id]: !prev[id],
		}));
	};

	const toggleExpandCategory = (id) => {
		setExpandedCategoryIds((prev) => ({
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
							const isExpanded = Boolean(expandedCategoryIds[category.id]);
							const latestUpdate = category.updates[0];
							
							// 2주(14일) 이내인지 판별
							const TWO_WEEKS_MS = 14 * 24 * 60 * 60 * 1000;
							const now = new Date().getTime();
							const isDateNew = (dateStr) => {
								const time = new Date(dateStr.replace(/\./g, "-")).getTime();
								return now - time <= TWO_WEEKS_MS;
							};

							const hasNew = category.updates.some((u) => isDateNew(u.date));

							// 기본 노출 개수: 최신 릴리즈 일자의 항목들(1~6개)을 온전히 기본 노출하고, 이전 날짜의 내역은 '더보기'로 제공
							const getInitialVisibleCount = (updates) => {
								if (updates.length <= 5) return updates.length;
								const latestDate = updates[0]?.date;
								const sameDateCount = updates.filter((u) => u.date === latestDate).length;
								if (sameDateCount >= 1 && sameDateCount <= 6) return sameDateCount;
								return 5;
							};

							const visibleCount = getInitialVisibleCount(category.updates);
							const hasMore = category.updates.length > visibleCount;
							const displayedUpdates = isExpanded ? category.updates : category.updates.slice(0, visibleCount);
							const hiddenCount = category.updates.length - visibleCount;

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
											maxHeight: isOpen ? (isExpanded ? "3000px" : "800px") : "0px",
											opacity: isOpen ? 1 : 0,
											transition: "max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease",
											overflow: "hidden",
											backgroundColor: "#ffffff",
										}}
									>
										<div className="card-body py-2 px-3">
											<div className="d-flex flex-column">
												{displayedUpdates.map((sub, idx) => {
													const isSubNew = isDateNew(sub.date);
													return (
													<div
														key={idx}
														className={`py-2 ${idx !== displayedUpdates.length - 1 ? "border-bottom" : ""}`}
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

											{hasMore && (
												<div className="pt-2 pb-1 text-center">
													<button
														type="button"
														className="btn btn-sm w-100 py-1.5 d-flex align-items-center justify-content-center gap-1.5 user-select-none"
														style={{
															fontSize: "12px",
															fontWeight: 500,
															borderRadius: "8px",
															backgroundColor: isExpanded ? "#f1f5f9" : "#f8fafc",
															border: "1px solid #e2e8f0",
															color: "#475569",
															transition: "all 0.2s ease",
														}}
														onMouseEnter={(e) => {
															e.currentTarget.style.backgroundColor = "#edf2f7";
															e.currentTarget.style.borderColor = "#cbd5e1";
															e.currentTarget.style.color = "#1e293b";
														}}
														onMouseLeave={(e) => {
															e.currentTarget.style.backgroundColor = isExpanded ? "#f1f5f9" : "#f8fafc";
															e.currentTarget.style.borderColor = "#e2e8f0";
															e.currentTarget.style.color = "#475569";
														}}
														onClick={(e) => {
															e.stopPropagation();
															toggleExpandCategory(category.id);
														}}
													>
														{isExpanded ? (
															<>
																<span style={{ fontSize: "10px", color: "#64748b" }}>▲</span>
																<span>이전 업데이트 접기</span>
															</>
														) : (
															<>
																<span style={{ fontSize: "10px", color: "#0699f9" }}>▼</span>
																<span>이전 업데이트 {hiddenCount}개 더보기</span>
															</>
														)}
													</button>
												</div>
											)}
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
