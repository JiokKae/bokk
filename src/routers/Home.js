import { useMutation, useQuery } from "@apollo/client";
import { useCallback, useEffect, useRef, useState } from "react";
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
	REORDER_WEBLINKS,
	REORDER_WEBLINK_GROUPS,
	SET_WEBLINK_GROUP,
} from "../constants/querys";
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
	const [draggedInfo, setDraggedInfo] = useState(null);
	const [hoverTargetGroup, setHoverTargetGroup] = useState(null);
	const [draggedGroupIndex, setDraggedGroupIndex] = useState(null);

	const displayGroups =
		groups.length > 0
			? groups
			: [
					{ id: 0, name: "bokk", seq: 0 },
					{ id: -1, name: "미분류", seq: 999 },
			  ];

	const draggedInfoRef = useRef(draggedInfo);
	draggedInfoRef.current = draggedInfo;
	const weblinksRef = useRef(weblinks);
	weblinksRef.current = weblinks;
	const groupsRef = useRef(groups);
	groupsRef.current = displayGroups;

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

	const [setWeblinkGroup] = useMutation(SET_WEBLINK_GROUP);
	const [reorderWeblinks] = useMutation(REORDER_WEBLINKS);
	const [reorderWeblinkGroups] = useMutation(REORDER_WEBLINK_GROUPS);

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

	// 웹링크 드래그 앤 드롭 핸들러
	const handleLinkDragStart = (e, weblink) => {
		if (!isReordering) return;
		e.stopPropagation();
		setDraggedInfo({
			id: weblink.id,
			originGroupId: weblink.groupId ?? null,
		});
		e.dataTransfer.effectAllowed = "move";
		e.dataTransfer.setData("text/plain", String(weblink.id));
	};

	const handleLinkDragEnter = (e, targetGroupId, targetIndex) => {
		e.preventDefault();
		if (!draggedInfoRef.current) return;

		const draggedItem = weblinksRef.current.find(
			(w) => w.id === draggedInfoRef.current.id
		);
		if (!draggedItem) return;

		const normTargetGroupId =
			targetGroupId === "untagged" || targetGroupId === -1 ? null : Number(targetGroupId);

		const currentList = weblinksRef.current;
		const customGroups = groupsRef.current.filter((g) => g.id > 0);

		// 대상 그룹의 아이템들 (드래그 중인 아이템 제외)
		const targetGroupItems = currentList.filter(
			(w) =>
				(normTargetGroupId === null
					? !w.groupId || !customGroups.some((g) => g.id === w.groupId)
					: w.groupId === normTargetGroupId) && w.id !== draggedItem.id
		);

		// 대상 위치에 소속 그룹이 갱신된 드래그 아이템 삽입
		const updatedItem = { ...draggedItem, groupId: normTargetGroupId };
		targetGroupItems.splice(targetIndex, 0, updatedItem);

		// 모든 그룹 순서대로 weblinks 재구성
		const newWeblinks = [];
		groupsRef.current.forEach((g) => {
			if (g.id <= 0) return;
			if (g.id === normTargetGroupId) {
				newWeblinks.push(...targetGroupItems);
			} else {
				newWeblinks.push(
					...currentList.filter(
						(w) => w.groupId === g.id && w.id !== draggedItem.id
					)
				);
			}
		});

		if (normTargetGroupId === null) {
			newWeblinks.push(...targetGroupItems);
		} else {
			newWeblinks.push(
				...currentList.filter(
					(w) =>
						(!w.groupId || !customGroups.some((g) => g.id === w.groupId)) &&
						w.id !== draggedItem.id
				)
			);
		}

		setWeblinks(newWeblinks);
		setHoverTargetGroup(targetGroupId);
	};

	const handleEmptyGroupDragEnter = (e, targetGroupId) => {
		e.preventDefault();
		if (!draggedInfoRef.current) return;

		const draggedItem = weblinksRef.current.find(
			(w) => w.id === draggedInfoRef.current.id
		);
		if (!draggedItem) return;

		const normTargetGroupId =
			targetGroupId === "untagged" || targetGroupId === -1 ? null : Number(targetGroupId);
		if ((draggedItem.groupId ?? null) === normTargetGroupId) return;

		const currentList = weblinksRef.current;
		const customGroups = groupsRef.current.filter((g) => g.id > 0);
		const updatedItem = { ...draggedItem, groupId: normTargetGroupId };

		const newWeblinks = [];
		groupsRef.current.forEach((g) => {
			if (g.id <= 0) return;
			if (g.id === normTargetGroupId) {
				newWeblinks.push(updatedItem);
			} else {
				newWeblinks.push(
					...currentList.filter(
						(w) => w.groupId === g.id && w.id !== draggedItem.id
					)
				);
			}
		});

		if (normTargetGroupId === null) {
			newWeblinks.push(updatedItem);
		} else {
			newWeblinks.push(
				...currentList.filter(
					(w) =>
						(!w.groupId || !customGroups.some((g) => g.id === w.groupId)) &&
						w.id !== draggedItem.id
				)
			);
		}

		setWeblinks(newWeblinks);
		setHoverTargetGroup(targetGroupId);
	};

	const handleDragOver = (e) => {
		e.preventDefault();
		e.dataTransfer.dropEffect = "move";
	};

	const handleLinkDragEnd = useCallback(() => {
		const currentInfo = draggedInfoRef.current;
		setDraggedInfo(null);
		setHoverTargetGroup(null);

		if (!currentInfo) return;

		const currentLinks = weblinksRef.current;
		const finalItem = currentLinks.find((w) => w.id === currentInfo.id);
		if (!finalItem) return;

		const originGid = currentInfo.originGroupId;
		const finalGid = finalItem.groupId ?? null;

		(async () => {
			if (originGid !== finalGid) {
				try {
					await setWeblinkGroup({
						variables: {
							weblinkId: finalItem.id,
							groupId: finalGid,
						},
					});
				} catch (err) {
					console.error("Failed to set weblink group:", err);
				}
			}

			const allIds = currentLinks.map((w) => w.id);
			try {
				await reorderWeblinks({
					variables: { weblinkIds: allIds },
					refetchQueries: [
						{ query: OWN_WEBLINKS },
						{ query: MY_WEBLINK_GROUPS },
					],
				});
			} catch (err) {
				console.error("Failed to reorder weblinks:", err);
			}
		})();
	}, [setWeblinkGroup, reorderWeblinks]);

	// 전역 드래그 종료 안전망
	useEffect(() => {
		const handleGlobalDragEnd = () => {
			if (draggedInfoRef.current) {
				handleLinkDragEnd();
			}
		};
		window.addEventListener("dragend", handleGlobalDragEnd);
		return () => {
			window.removeEventListener("dragend", handleGlobalDragEnd);
		};
	}, [handleLinkDragEnd]);

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

	const getValidUrl = (url) => {
		if (!url) return "#";
		return /^https?:\/\//i.test(url) ? url : `https://${url}`;
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
					const targetUrl = getValidUrl(link.url);
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
				const targetUrl = getValidUrl(link.url);
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
								href={getValidUrl(builtinWeblinks[0]?.url)}
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
												href={getValidUrl(builtinWeblinks[0]?.url)}
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

							if (group.id === -1) {
								const untaggedLinks = weblinks.filter(
									(w) =>
										!w.groupId ||
										!groups.some((g) => g.id === w.groupId && g.id > 0)
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
													href={getValidUrl(untaggedLinks[0]?.url)}
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
												href={getValidUrl(groupLinks[0]?.url)}
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
						{!displayGroups.some((g) => g.id === -1) &&
							(() => {
								const untaggedLinks = weblinks.filter(
									(w) =>
										!w.groupId ||
										!displayGroups.some((g) => g.id === w.groupId && g.id > 0)
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
													href={getValidUrl(untaggedLinks[0]?.url)}
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
