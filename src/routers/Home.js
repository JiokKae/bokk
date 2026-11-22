import { useMutation, useQuery } from "@apollo/client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import ThumbnailModal from "../components/Weblink/ThumbnailModal";
import WeblinkGroupCard from "../components/Weblink/WeblinkGroupCard";
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

const POPUP_BLOCKED_MESSAGE =
	"브라우저에서 팝업이 차단되었습니다.\n주소창 우측 상단의 팝업 차단 아이콘을 클릭하여 '항상 허용'을 선택해주시면 모든 링크가 정상적으로 열립니다.";

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
		const startIndex = isShift ? 1 : 0;

		if (!isShift) {
			e.preventDefault();
			e.stopPropagation();
		}

		let blocked = false;
		for (let i = startIndex; i < links.length; i++) {
			const link = links[i];
			if (!link.url) continue;
			const win = window.open(getResolvedWeblinkUrl(link.url), "_blank");
			if (!win || win.closed || typeof win.closed === "undefined") {
				blocked = true;
			}
		}

		if (blocked) {
			alert(POPUP_BLOCKED_MESSAGE);
		}
	};

	const sharedCardProps = {
		styles,
		isReordering,
		isShiftPressed,
		draggedInfo,
		onOpenAll: handleOpenAll,
		onDragOver: handleDragOver,
		onLinkDragStart: handleLinkDragStart,
		onLinkDragEnter: handleLinkDragEnter,
		onEmptyGroupDragEnter: handleEmptyGroupDragEnter,
		onLinkDragEnd: handleLinkDragEnd,
	};

	const untaggedLinks = weblinks.filter((w) =>
		isUntaggedWeblink(w, displayGroups)
	);
	const isUntaggedHovered =
		hoverTargetGroup === WEBLINK_GROUP_ID.UNTAGGED ||
		hoverTargetGroup === "untagged";

	return (
		<>
			{/* 웹링크 구역 상단 툴바 (로그인 시에만 노출) */}
			{isLogin && (
				<div className={styles.weblinkToolbar}>
					{isReordering && (
						<span className={styles.reorderHelpText}>
							💡 웹링크를 드래그하여 순서나 그룹을 변경할 수 있습니다.
						</span>
					)}
					<div className="flex items-center gap-2">
						<Button
							variant={isReordering ? "default" : "outline"}
							size="sm"
							className={`${styles.toolbarBtn} ${
								isReordering
									? "bg-emerald-600 text-white hover:bg-emerald-700"
									: "border-bokk-border text-bokk-dark hover:bg-bokk-subtle"
							}`}
							onClick={() => setIsReordering((prev) => !prev)}
							title={
								isReordering
									? "변경 완료"
									: "현재 화면에서 드래그로 순서 및 그룹 변경"
							}
						>
							{isReordering ? "✓ 변경 완료" : "⇄ 순서·그룹 변경"}
						</Button>
						<Link
							to="/manage/weblink/"
							className={`inline-flex h-8 items-center justify-center rounded-md border border-solid border-zinc-300 bg-white px-3 text-xs font-medium text-zinc-700 no-underline shadow-xs transition-colors hover:bg-zinc-100 hover:text-zinc-900 ${styles.toolbarBtn}`}
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
					<WeblinkGroupCard
						{...sharedCardProps}
						title="bokk"
						badgeTitle="볶음밥 기본 웹링크"
						links={builtinWeblinks}
						targetGroupId={WEBLINK_GROUP_ID.BUILTIN}
					/>
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
							const groupDragHandlers = {
								canReorderGroup: true,
								onGroupDragStart: (e) => handleGroupDragStart(e, groupIndex),
								onGroupDragEnter: (e) => handleGroupDragEnter(e, groupIndex),
								onGroupDragEnd: handleGroupDragEnd,
							};

							if (group.id === WEBLINK_GROUP_ID.BUILTIN) {
								if (builtinWeblinks.length === 0) return null;
								return (
									<WeblinkGroupCard
										key="builtin-bokk"
										{...sharedCardProps}
										{...groupDragHandlers}
										title="bokk"
										badgeTitle="볶음밥 기본 웹링크"
										links={builtinWeblinks}
										targetGroupId={WEBLINK_GROUP_ID.BUILTIN}
									/>
								);
							}

							if (group.id === WEBLINK_GROUP_ID.UNTAGGED) {
								if (untaggedLinks.length === 0 && !isReordering) return null;
								return (
									<WeblinkGroupCard
										key="untagged"
										{...sharedCardProps}
										{...groupDragHandlers}
										title="미분류"
										badgeTitle="미분류 웹링크"
										links={untaggedLinks}
										targetGroupId={WEBLINK_GROUP_ID.UNTAGGED}
										isUntagged
										canReorderLinks
										showAddModal
										defaultGroupId={null}
										emptyDropText="⬇ 여기에 드롭하여 미분류로 이동"
										isHovered={isUntaggedHovered}
									/>
								);
							}

							const groupLinks = weblinks.filter((w) => w.groupId === group.id);
							return (
								<WeblinkGroupCard
									key={group.id}
									{...sharedCardProps}
									{...groupDragHandlers}
									title={group.name}
									badgeTitle={`그룹: ${group.name}`}
									links={groupLinks}
									targetGroupId={group.id}
									canReorderLinks
									showAddModal
									defaultGroupId={group.id}
									isHovered={hoverTargetGroup === group.id}
								/>
							);
						})}

						{/* 미분류 그룹 폴백 (그룹 목록에 id: -1이 없는 경우 대비) */}
						{!displayGroups.some((g) => g.id === WEBLINK_GROUP_ID.UNTAGGED) &&
							(untaggedLinks.length > 0 || isReordering) && (
								<WeblinkGroupCard
									key="untagged-fallback"
									{...sharedCardProps}
									title="미분류"
									badgeTitle="미분류 웹링크"
									links={untaggedLinks}
									targetGroupId={WEBLINK_GROUP_ID.UNTAGGED}
									isUntagged
									canReorderLinks
									showAddModal
									defaultGroupId={null}
									emptyDropText="⬇ 여기에 드롭하여 미분류로 이동"
									isHovered={isUntaggedHovered}
								/>
							)}
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
