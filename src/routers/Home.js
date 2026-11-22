import { useMutation, useQuery } from "@apollo/client";
import { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import AddWeblinkModal from "../components/Weblink/AddWeblinkModal";
import ThumbnailModal from "../components/Weblink/ThumbnailModal";
import Weblink from "../components/Weblink/Weblink";
import {
	BUILTIN_WEBLINKS,
	ME,
	MY_WEBLINK_GROUPS,
	OWN_WEBLINKS,
	REORDER_WEBLINK_GROUPS,
} from "../constants/querys";
import useWeblinkDnD from "../hooks/useWeblinkDnD";
import {
	WEBLINK_GROUP_ID,
	getResolvedWeblinkUrl,
	isUntaggedWeblink,
} from "../utils/weblinkUtil";
import styles from "./Home.module.css";

export default function Home() {
	const { data: builtinData } = useQuery(BUILTIN_WEBLINKS);
	const builtinWeblinks = builtinData?.builtinWeblinks?.weblinks || [];
	const { data: ownWeblinksData } = useQuery(OWN_WEBLINKS);
	const { data: groupData } = useQuery(MY_WEBLINK_GROUPS);
	const { data: isLoginData } = useQuery(ME);

	const [isShiftPressed, setIsShiftPressed] = useState(false);
	const [isReordering, setIsReordering] = useState(false);

	const isLogin = Boolean(isLoginData?.me);

	const [weblinks, setWeblinks] = useState(ownWeblinksData?.ownWeblinks || []);
	const [groups, setGroups] = useState(groupData?.myWeblinkGroups || []);
	const [draggedGroupIndex, setDraggedGroupIndex] = useState(null);

	const displayGroups =
		groups.length > 0
			? groups
			: [
					{ id: WEBLINK_GROUP_ID.BUILTIN, name: "bokk", seq: 0 },
					{ id: WEBLINK_GROUP_ID.UNTAGGED, name: "미분류", seq: 999 },
			  ];

	useEffect(() => {
		if (ownWeblinksData?.ownWeblinks) {
			setWeblinks(ownWeblinksData.ownWeblinks);
		} else if (!isLogin) {
			setWeblinks([]);
		}
	}, [ownWeblinksData, isLogin]);

	useEffect(() => {
		if (groupData?.myWeblinkGroups) {
			setGroups(groupData.myWeblinkGroups);
		} else if (!isLogin) {
			setGroups([]);
		}
	}, [groupData, isLogin]);

	const [reorderWeblinkGroups] = useMutation(REORDER_WEBLINK_GROUPS);

	const {
		draggedInfo,
		hoverTargetGroup,
		handleLinkDragStart,
		handleLinkDragEnter,
		handleEmptyGroupDragEnter,
		handleDragOver,
		handleLinkDragEnd,
	} = useWeblinkDnD({
		weblinks,
		setWeblinks,
		groups: displayGroups,
		enabled: isReordering,
	});

	// Shift 키 누름 상태 실시간 감지 (새 창 모드 시각적 피드백)
	useEffect(() => {
		const handleKeyDown = (e) => {
			if (e.key === "Shift") {
				setIsShiftPressed(true);
			}
		};
		const handleKeyUp = (e) => {
			if (e.key === "Shift") {
				setIsShiftPressed(false);
			}
		};
		const handleBlur = () => {
			setIsShiftPressed(false);
		};

		window.addEventListener("keydown", handleKeyDown);
		window.addEventListener("keyup", handleKeyUp);
		window.addEventListener("blur", handleBlur);

		return () => {
			window.removeEventListener("keydown", handleKeyDown);
			window.removeEventListener("keyup", handleKeyUp);
			window.removeEventListener("blur", handleBlur);
		};
	}, []);

	// 그룹 순서 변경 핸들러
	const handleGroupDragStart = (e, index) => {
		if (!isReordering) return;
		e.stopPropagation();
		setDraggedGroupIndex(index);
		e.dataTransfer.effectAllowed = "move";
		e.dataTransfer.setData("text/plain", `group-${displayGroups[index]?.id}`);
	};

	const handleGroupDragEnter = (e, targetIndex) => {
		e.preventDefault();
		if (draggedGroupIndex === null || draggedGroupIndex === targetIndex) return;
		const newGroups = [...displayGroups];
		const item = newGroups[draggedGroupIndex];
		newGroups.splice(draggedGroupIndex, 1);
		newGroups.splice(targetIndex, 0, item);
		setDraggedGroupIndex(targetIndex);
		setGroups(newGroups);
	};

	const handleGroupDragEnd = () => {
		if (draggedGroupIndex !== null && displayGroups.length > 0) {
			const ids = displayGroups.map((g) => g.id);
			reorderWeblinkGroups({
				variables: { groupIds: ids },
				refetchQueries: [{ query: MY_WEBLINK_GROUPS }],
			});
		}
		setDraggedGroupIndex(null);
	};

	// 모두 열기 핸들러 (Shift 누름 유무에 따라 새 탭 또는 표준 새 창 분기)
	const handleOpenAll = (e, links) => {
		if (!links || links.length === 0) {
			e.preventDefault();
			return;
		}

		const isShift = e.shiftKey || isShiftPressed;

		if (isShift) {
			if (links.length > 1) {
				let blocked = false;
				for (let i = 1; i < links.length; i++) {
					const link = links[i];
					if (!link.url) continue;
					const targetUrl = getResolvedWeblinkUrl(link.url);
					const win = window.open(targetUrl, "_blank");
					if (!win || win.closed || typeof win.closed === "undefined") {
						blocked = true;
					}
				}
				if (blocked) {
					alert(
						"브라우저에서 팝업이 차단되었습니다.\n주소창 우측 상단의 팝업 차단 아이콘을 클릭하여 '항상 허용'을 선택해주시면 모든 링크가 정상적으로 열립니다."
					);
				}
			}
		} else {
			e.preventDefault();
			e.stopPropagation();

			let blocked = false;
			links.forEach((link) => {
				if (!link.url) return;
				const targetUrl = getResolvedWeblinkUrl(link.url);
				const win = window.open(targetUrl, "_blank");
				if (!win || win.closed || typeof win.closed === "undefined") {
					blocked = true;
				}
			});

			if (blocked) {
				alert(
					"브라우저에서 팝업이 차단되었습니다.\n주소창 우측 상단의 팝업 차단 아이콘을 클릭하여 '항상 허용'을 선택해주시면 모든 링크가 정상적으로 열립니다."
				);
			}
		}
	};

	return (
		<>
			{/* 웹링크 구역 상단 툴바 (로그인 시에만 노출: 한줄 비우고 오른쪽에 순서/그룹변경 및 관리페이지 이동 버튼) */}
			{isLogin && (
				<div className={styles.weblinkToolbar}>
					{isReordering && (
						<span className={styles.reorderHelpText}>
							💡 웹링크를 드래그하여 순서나 그룹을 변경할 수 있습니다.
						</span>
					)}
					<div className="d-flex align-items-center gap-2">
						<Button
							variant={isReordering ? "success" : "outline-primary"}
							size="sm"
							className={styles.toolbarBtn}
							onClick={() => setIsReordering((prev) => !prev)}
							title={isReordering ? "변경 완료" : "현재 화면에서 드래그로 순서 및 그룹 변경"}
						>
							{isReordering ? "✓ 변경 완료" : "⇄ 순서·그룹 변경"}
						</Button>
						<Link
							to="/manage/myWeblink/"
							className={`btn btn-sm btn-outline-secondary ${styles.toolbarBtn}`}
							title="웹링크 관리 페이지로 이동"
						>
							⚙️ 웹링크 관리
						</Link>
					</div>
				</div>
			)}

			{/* 비로그인 방문자 빌트인 웹링크 */}
			{!isLogin && builtinWeblinks.length > 0 && (
				<div className={styles.weblinkRow}>
					<span className={styles.groupContainer}>
						<div className={styles.groupHeaderLine}>
							<span className={styles.groupBadge} title="볶음밥 기본 웹링크">
								bokk
							</span>
							<a
								href={getResolvedWeblinkUrl(builtinWeblinks[0]?.url)}
								target="_blank"
								rel="noopener noreferrer"
								className={
									isShiftPressed ? styles.openAllBtnShift : styles.openAllBtn
								}
								onClick={(e) => handleOpenAll(e, builtinWeblinks)}
								title="클릭: 새 탭으로 모두 열기 | Shift+클릭: 새 창으로 모두 열기"
							>
								{isShiftPressed ? "⧉ 새 창으로 모두 열기" : "↗ 모두 열기"}
							</a>
						</div>
						<div className={styles.groupContent}>
							{builtinWeblinks.map(
								({ id, name, url, color, backgroundColor }) => (
									<Weblink
										key={id}
										name={name}
										url={url}
										color={color}
										backgroundColor={backgroundColor}
									/>
								),
							)}
						</div>
					</span>
				</div>
			)}

			{/* 사용자 웹링크 그룹 목록 */}
			<div className={styles.weblinkRow}>
				{!isLogin ? (
					<Link to="/signin/">
						<button className="btn btn-dot m-1">+</button>
					</Link>
				) : (
					<>
						{displayGroups.map((group, groupIndex) => {
							if (group.id === 0) {
								if (builtinWeblinks.length === 0) return null;
								return (
									<span
										key="builtin-bokk"
										className={`${styles.groupContainer} ${
											isReordering ? styles.reorderActiveGroup : ""
										}`}
									>
										<div
											className={styles.groupHeaderLine}
											draggable={isReordering}
											onDragStart={(e) => handleGroupDragStart(e, groupIndex)}
											onDragEnter={(e) => handleGroupDragEnter(e, groupIndex)}
											onDragOver={handleDragOver}
											onDragEnd={handleGroupDragEnd}
											style={{ cursor: isReordering ? "grab" : undefined }}
										>
											{isReordering && (
												<span
													className={styles.groupDragHandle}
													title="드래그하여 그룹 순서 변경"
												>
													☰
												</span>
											)}
											<span className={styles.groupBadge} title="볶음밥 기본 웹링크">
												bokk
											</span>
											<a
												href={getResolvedWeblinkUrl(builtinWeblinks[0]?.url)}
												target="_blank"
												rel="noopener noreferrer"
												className={
													isShiftPressed ? styles.openAllBtnShift : styles.openAllBtn
												}
												onClick={(e) => handleOpenAll(e, builtinWeblinks)}
												title="클릭: 새 탭으로 모두 열기 | Shift+클릭: 새 창으로 모두 열기"
											>
												{isShiftPressed ? "⧉ 새 창으로 모두 열기" : "↗ 모두 열기"}
											</a>
										</div>
										<div className={styles.groupContent}>
											{builtinWeblinks.map(
												({ id, name, url, color, backgroundColor }) => (
													<Weblink
														key={id}
														name={name}
														url={url}
														color={color}
														backgroundColor={backgroundColor}
													/>
												),
											)}
										</div>
									</span>
								);
							}

							if (group.id === WEBLINK_GROUP_ID.UNTAGGED) {
								const untaggedLinks = weblinks.filter((w) =>
									isUntaggedWeblink(w, groups)
								);
								if (untaggedLinks.length === 0 && !isReordering) return null;
								const isHovered = hoverTargetGroup === -1 || hoverTargetGroup === "untagged";

								return (
									<span
										key="untagged"
										className={`${styles.groupContainerUntagged} ${
											isReordering ? styles.reorderActiveGroup : ""
										} ${isHovered && draggedInfo ? styles.groupDragOver : ""}`}
										onDragOver={handleDragOver}
										onDrop={(e) => {
											e.preventDefault();
											handleLinkDragEnd();
										}}
									>
										<div
											className={styles.groupHeaderLine}
											draggable={isReordering}
											onDragStart={(e) => handleGroupDragStart(e, groupIndex)}
											onDragEnter={(e) => handleGroupDragEnter(e, groupIndex)}
											onDragOver={handleDragOver}
											onDragEnd={handleGroupDragEnd}
											style={{ cursor: isReordering ? "grab" : undefined }}
										>
											{isReordering && (
												<span
													className={styles.groupDragHandle}
													title="드래그하여 그룹 순서 변경"
												>
													☰
												</span>
											)}
											<span className={styles.groupBadgeUntagged} title="미분류 웹링크">
												미분류
											</span>
											{untaggedLinks.length > 0 && (
												<a
													href={getResolvedWeblinkUrl(untaggedLinks[0]?.url)}
													target="_blank"
													rel="noopener noreferrer"
													className={
														isShiftPressed ? styles.openAllBtnShift : styles.openAllBtn
													}
													onClick={(e) => handleOpenAll(e, untaggedLinks)}
													title="클릭: 새 탭으로 모두 열기 | Shift+클릭: 새 창으로 모두 열기"
												>
													{isShiftPressed ? "⧉ 새 창으로 모두 열기" : "↗ 모두 열기"}
												</a>
											)}
										</div>
										<div
											className={styles.groupContent}
											onDragEnter={(e) => {
												if (untaggedLinks.length === 0) {
													handleEmptyGroupDragEnter(e, -1);
												}
											}}
										>
											{untaggedLinks.length === 0 && isReordering ? (
												<span
													className={styles.emptyGroupDropZone}
													onDragEnter={(e) => handleEmptyGroupDragEnter(e, -1)}
												>
													⬇ 여기에 드롭하여 미분류로 이동
												</span>
											) : (
												untaggedLinks.map((weblink, itemIndex) => {
													const isDraggingThis = draggedInfo?.id === weblink.id;
													return (
														<span
															key={weblink.id}
															className={`${styles.linkDragWrapper} ${
																isDraggingThis ? styles.linkDragWrapperDragging : ""
															} ${isReordering ? styles.linkDragWrapperReorder : ""}`}
															draggable={isReordering}
															onDragStart={(e) => handleLinkDragStart(e, weblink)}
															onDragEnter={(e) => handleLinkDragEnter(e, -1, itemIndex)}
															onDragOver={handleDragOver}
															onDragEnd={handleLinkDragEnd}
															title={isReordering ? "드래그하여 순서 및 그룹 변경" : undefined}
														>
															<Weblink
																name={weblink.name}
																url={isReordering ? "#" : weblink.url}
																color={weblink.color}
																backgroundColor={weblink.backgroundColor}
																onClick={
																	isReordering
																		? (e) => {
																				e.preventDefault();
																				e.stopPropagation();
																		  }
																		: undefined
																}
																style={
																	isReordering
																		? { pointerEvents: "none", cursor: "grab" }
																		: undefined
																}
															/>
														</span>
													);
												})
											)}
											<AddWeblinkModal defaultGroupId={null} />
										</div>
									</span>
								);
							}

							const groupLinks = weblinks.filter((w) => w.groupId === group.id);
							const isHovered = hoverTargetGroup === group.id;

							return (
								<span
									key={group.id}
									className={`${styles.groupContainer} ${
										isReordering ? styles.reorderActiveGroup : ""
									} ${isHovered && draggedInfo ? styles.groupDragOver : ""}`}
									onDragOver={handleDragOver}
									onDrop={(e) => {
										e.preventDefault();
										handleLinkDragEnd();
									}}
								>
									<div
										className={styles.groupHeaderLine}
										draggable={isReordering}
										onDragStart={(e) => handleGroupDragStart(e, groupIndex)}
										onDragEnter={(e) => handleGroupDragEnter(e, groupIndex)}
										onDragOver={handleDragOver}
										onDragEnd={handleGroupDragEnd}
										style={{ cursor: isReordering ? "grab" : undefined }}
									>
										{isReordering && (
											<span
												className={styles.groupDragHandle}
												title="드래그하여 그룹 순서 변경"
											>
												☰
											</span>
										)}
										<span className={styles.groupBadge} title={`그룹: ${group.name}`}>
											{group.name}
										</span>
										{groupLinks.length > 0 && (
											<a
												href={getResolvedWeblinkUrl(groupLinks[0]?.url)}
												target="_blank"
												rel="noopener noreferrer"
												className={
													isShiftPressed ? styles.openAllBtnShift : styles.openAllBtn
												}
												onClick={(e) => handleOpenAll(e, groupLinks)}
												title="클릭: 새 탭으로 모두 열기 | Shift+클릭: 새 창으로 모두 열기"
											>
												{isShiftPressed ? "⧉ 새 창으로 모두 열기" : "↗ 모두 열기"}
											</a>
										)}
									</div>
									<div
										className={styles.groupContent}
										onDragEnter={(e) => {
											if (groupLinks.length === 0) {
												handleEmptyGroupDragEnter(e, group.id);
											}
										}}
									>
										{groupLinks.length === 0 && isReordering ? (
											<span
												className={styles.emptyGroupDropZone}
												onDragEnter={(e) => handleEmptyGroupDragEnter(e, group.id)}
											>
												⬇ 여기에 드롭하여 이 그룹으로 이동
											</span>
										) : (
											groupLinks.map((weblink, itemIndex) => {
												const isDraggingThis = draggedInfo?.id === weblink.id;
												return (
													<span
														key={weblink.id}
														className={`${styles.linkDragWrapper} ${
															isDraggingThis ? styles.linkDragWrapperDragging : ""
														} ${isReordering ? styles.linkDragWrapperReorder : ""}`}
														draggable={isReordering}
														onDragStart={(e) => handleLinkDragStart(e, weblink)}
														onDragEnter={(e) => handleLinkDragEnter(e, group.id, itemIndex)}
														onDragOver={handleDragOver}
														onDragEnd={handleLinkDragEnd}
														title={isReordering ? "드래그하여 순서 및 그룹 변경" : undefined}
													>
														<Weblink
															name={weblink.name}
															url={isReordering ? "#" : weblink.url}
															color={weblink.color}
															backgroundColor={weblink.backgroundColor}
															onClick={
																isReordering
																	? (e) => {
																			e.preventDefault();
																			e.stopPropagation();
																	  }
																	: undefined
															}
															style={
																isReordering
																	? { pointerEvents: "none", cursor: "grab" }
																	: undefined
															}
														/>
													</span>
												);
											})
										)}
										<AddWeblinkModal defaultGroupId={group.id} />
									</div>
								</span>
							);
						})}

						{/* 미분류 그룹 폴백 (그룹 목록에 id: -1이 없는 경우 대비) */}
						{!displayGroups.some((g) => g.id === WEBLINK_GROUP_ID.UNTAGGED) &&
							(() => {
								const untaggedLinks = weblinks.filter((w) =>
									isUntaggedWeblink(w, displayGroups)
								);
								if (untaggedLinks.length === 0 && !isReordering) return null;
								const isHovered = hoverTargetGroup === -1 || hoverTargetGroup === "untagged";

								return (
									<span
										key="untagged-fallback"
										className={`${styles.groupContainerUntagged} ${
											isReordering ? styles.reorderActiveGroup : ""
										} ${isHovered && draggedInfo ? styles.groupDragOver : ""}`}
										onDragOver={handleDragOver}
										onDrop={(e) => {
											e.preventDefault();
											handleLinkDragEnd();
										}}
									>
										<div className={styles.groupHeaderLine}>
											<span className={styles.groupBadgeUntagged} title="미분류 웹링크">
												미분류
											</span>
											{untaggedLinks.length > 0 && (
												<a
													href={getResolvedWeblinkUrl(untaggedLinks[0]?.url)}
													target="_blank"
													rel="noopener noreferrer"
													className={
														isShiftPressed ? styles.openAllBtnShift : styles.openAllBtn
													}
													onClick={(e) => handleOpenAll(e, untaggedLinks)}
													title="클릭: 새 탭으로 모두 열기 | Shift+클릭: 새 창으로 모두 열기"
												>
													{isShiftPressed ? "⧉ 새 창으로 모두 열기" : "↗ 모두 열기"}
												</a>
											)}
										</div>
										<div
											className={styles.groupContent}
											onDragEnter={(e) => {
												if (untaggedLinks.length === 0) {
													handleEmptyGroupDragEnter(e, -1);
												}
											}}
										>
											{untaggedLinks.length === 0 && isReordering ? (
												<span
													className={styles.emptyGroupDropZone}
													onDragEnter={(e) => handleEmptyGroupDragEnter(e, -1)}
												>
													⬇ 여기에 드롭하여 미분류로 이동
												</span>
											) : (
												untaggedLinks.map((weblink, itemIndex) => {
													const isDraggingThis = draggedInfo?.id === weblink.id;
													return (
														<span
															key={weblink.id}
															className={`${styles.linkDragWrapper} ${
																isDraggingThis ? styles.linkDragWrapperDragging : ""
															} ${isReordering ? styles.linkDragWrapperReorder : ""}`}
															draggable={isReordering}
															onDragStart={(e) => handleLinkDragStart(e, weblink)}
															onDragEnter={(e) => handleLinkDragEnter(e, -1, itemIndex)}
															onDragOver={handleDragOver}
															onDragEnd={handleLinkDragEnd}
															title={isReordering ? "드래그하여 순서 및 그룹 변경" : undefined}
														>
															<Weblink
																name={weblink.name}
																url={isReordering ? "#" : weblink.url}
																color={weblink.color}
																backgroundColor={weblink.backgroundColor}
																onClick={
																	isReordering
																		? (e) => {
																				e.preventDefault();
																				e.stopPropagation();
																		  }
																		: undefined
																}
																style={
																	isReordering
																		? { pointerEvents: "none", cursor: "grab" }
																		: undefined
																}
															/>
														</span>
													);
												})
											)}
											<AddWeblinkModal defaultGroupId={null} />
										</div>
									</span>
								);
							})()}
					</>
				)}
			</div>
			<div className={styles.weblinkRow}>
				<a
					href="https://www.naver.com/"
					target="_blank"
					rel="noopener noreferrer">
					<img
						src={`${process.env.REACT_APP_BOKK_IMG}/NAVER.png`}
						alt="네이버"
					/>
				</a>
				<a
					className={`${styles.bgcNaver} ${styles.logoBtn}`}
					href="https://comic.naver.com/webtoon/weekdayList.nhn"
					target="_blank"
					rel="noopener noreferrer">
					웹툰
				</a>
				<a
					className={`${styles.bgcNaver} ${styles.logoBtn}`}
					href="https://mail.naver.com/"
					target="_blank"
					rel="noopener noreferrer">
					메일
				</a>
			</div>

			<div className={styles.weblinkRow}>
				<a
					href="https://www.daum.net"
					target="_blank"
					rel="noopener noreferrer">
					<img
						src={`${process.env.REACT_APP_BOKK_IMG}/DAUM.png`}
						alt="다음"
					/>
				</a>
				<a
					className={`${styles.bgcDaum} ${styles.logoBtn}`}
					href="https://webtoon.kakao.com/"
					target="_blank"
					rel="noopener noreferrer">
					웹툰
				</a>
			</div>
			<div>
				<ThumbnailModal />
			</div>
		</>
	);
}
