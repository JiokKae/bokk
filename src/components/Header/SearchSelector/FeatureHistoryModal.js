import { useMemo, useState } from "react";
import { Badge, Modal } from "react-bootstrap";
import { FEATURE_HISTORY_CATEGORIES } from "../../../constants/featureHistory";

const TWO_WEEKS_MS = 14 * 24 * 60 * 60 * 1000;

function isDateNew(dateStr, nowMs) {
	const time = new Date(dateStr.replace(/\./g, "-")).getTime();
	return nowMs - time <= TWO_WEEKS_MS;
}

// 기본 노출 개수: 최신 릴리즈 일자의 항목들(1~6개)을 온전히 기본 노출하고, 이전 날짜의 내역은 '더보기'로 제공
function getInitialVisibleCount(updates) {
	if (updates.length <= 5) return updates.length;
	const latestDate = updates[0]?.date;
	const sameDateCount = updates.filter((u) => u.date === latestDate).length;
	if (sameDateCount >= 1 && sameDateCount <= 6) return sameDateCount;
	return 5;
}

export default function FeatureHistoryModal() {
	const [show, setShow] = useState(false);

	// Sort categories by the latest update date inside each category (descending)!
	const sortedCategories = useMemo(() => {
		return [...FEATURE_HISTORY_CATEGORIES].sort((a, b) => {
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
							const now = Date.now();
							const hasNew = category.updates.some((u) => isDateNew(u.date, now));

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
													const isSubNew = isDateNew(sub.date, now);
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
