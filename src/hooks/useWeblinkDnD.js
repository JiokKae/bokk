import { useMutation } from "@apollo/client";
import { useCallback, useEffect, useRef, useState } from "react";
import {
	MY_WEBLINK_GROUPS,
	OWN_WEBLINKS,
	REORDER_WEBLINKS,
	SET_WEBLINK_GROUP,
} from "../constants/querys";
import { reorderWeblinksAcrossGroups } from "../utils/weblinkUtil";

export default function useWeblinkDnD({
	weblinks,
	setWeblinks,
	groups,
	enabled = true,
}) {
	const [draggedInfo, setDraggedInfo] = useState(null);
	const [hoverTargetGroup, setHoverTargetGroup] = useState(null);

	const draggedInfoRef = useRef(draggedInfo);
	draggedInfoRef.current = draggedInfo;
	const weblinksRef = useRef(weblinks);
	weblinksRef.current = weblinks;
	const groupsRef = useRef(groups);
	groupsRef.current = groups;

	const [setWeblinkGroup] = useMutation(SET_WEBLINK_GROUP);
	const [reorderWeblinks] = useMutation(REORDER_WEBLINKS);

	const handleLinkDragStart = (e, weblink) => {
		if (!enabled) return;
		if (e) {
			e.stopPropagation();
			if (e.dataTransfer) {
				e.dataTransfer.effectAllowed = "move";
				e.dataTransfer.setData("text/plain", String(weblink.id));
			}
		}
		setDraggedInfo({
			id: weblink.id,
			originGroupId: weblink.groupId ?? null,
		});
	};

	const handleLinkDragEnter = (e, targetGroupId, targetIndex) => {
		e?.preventDefault?.();
		if (!draggedInfoRef.current) return;

		const newWeblinks = reorderWeblinksAcrossGroups(
			weblinksRef.current,
			groupsRef.current,
			draggedInfoRef.current.id,
			targetGroupId,
			targetIndex
		);
		if (!newWeblinks) return;

		setWeblinks(newWeblinks);
		setHoverTargetGroup(targetGroupId);
	};

	const handleEmptyGroupDragEnter = (e, targetGroupId) => {
		e?.preventDefault?.();
		if (!draggedInfoRef.current) return;

		const newWeblinks = reorderWeblinksAcrossGroups(
			weblinksRef.current,
			groupsRef.current,
			draggedInfoRef.current.id,
			targetGroupId,
			null
		);
		if (!newWeblinks) return;

		setWeblinks(newWeblinks);
		setHoverTargetGroup(targetGroupId);
	};

	const handleDragOver = (e) => {
		e.preventDefault();
		if (e.dataTransfer) {
			e.dataTransfer.dropEffect = "move";
		}
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

	// 전역 드래그 종료 안전망 + HTML5 드래그 시 상/하단 가장자리 자동 스크롤
	useEffect(() => {
		let rafId = null;
		let pointerY = null;

		const stepScroll = () => {
			if (!draggedInfoRef.current || pointerY === null) {
				rafId = null;
				return;
			}
			const threshold = 90;
			const maxSpeed = 18;
			const vh = window.innerHeight;
			let delta = 0;

			if (pointerY < threshold) {
				delta = -Math.ceil(((threshold - pointerY) / threshold) * maxSpeed);
			} else if (pointerY > vh - threshold) {
				delta = Math.ceil(((pointerY - (vh - threshold)) / threshold) * maxSpeed);
			}

			if (delta !== 0) {
				window.scrollBy(0, delta);
			}
			rafId = requestAnimationFrame(stepScroll);
		};

		const handleGlobalDragOver = (e) => {
			if (!draggedInfoRef.current) return;
			pointerY = e.clientY;
			if (!rafId) {
				rafId = requestAnimationFrame(stepScroll);
			}
		};

		const handleGlobalDragEnd = () => {
			pointerY = null;
			if (rafId) {
				cancelAnimationFrame(rafId);
				rafId = null;
			}
			if (draggedInfoRef.current) {
				handleLinkDragEnd();
			}
		};

		window.addEventListener("dragover", handleGlobalDragOver);
		window.addEventListener("dragend", handleGlobalDragEnd);
		return () => {
			if (rafId) cancelAnimationFrame(rafId);
			window.removeEventListener("dragover", handleGlobalDragOver);
			window.removeEventListener("dragend", handleGlobalDragEnd);
		};
	}, [handleLinkDragEnd]);

	return {
		draggedInfo,
		hoverTargetGroup,
		handleLinkDragStart,
		handleLinkDragEnter,
		handleEmptyGroupDragEnter,
		handleDragOver,
		handleLinkDragEnd,
	};
}
