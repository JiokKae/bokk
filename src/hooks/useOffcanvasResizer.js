import { useEffect, useState } from "react";

const DEFAULT_WIDTH = 500;
const MIN_WINDOW_WIDTH_FOR_EXPAND = 576;
const MAX_EXPAND_CAP = 1000;

export default function useOffcanvasResizer() {
	const [offcanvasWidth, setOffcanvasWidth] = useState(DEFAULT_WIDTH);
	const [isDragging, setIsDragging] = useState(false);
	const [windowWidth, setWindowWidth] = useState(
		typeof window !== "undefined" ? window.innerWidth : 1200
	);

	useEffect(() => {
		const handleResize = () => {
			const currentWinWidth = window.innerWidth;
			setWindowWidth(currentWinWidth);
			if (currentWinWidth < MIN_WINDOW_WIDTH_FOR_EXPAND) {
				setOffcanvasWidth(DEFAULT_WIDTH);
			} else {
				const currentMaxWidth = Math.min(MAX_EXPAND_CAP, currentWinWidth - 40);
				setOffcanvasWidth((prev) =>
					Math.min(prev, Math.max(DEFAULT_WIDTH, currentMaxWidth))
				);
			}
		};
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	const canExpand = windowWidth >= MIN_WINDOW_WIDTH_FOR_EXPAND;
	const maxExpandWidth = Math.min(MAX_EXPAND_CAP, windowWidth - 40);
	const isExpanded = offcanvasWidth > DEFAULT_WIDTH;

	const handleDragStart = (e) => {
		e.preventDefault();
		e.stopPropagation();

		const startX = e.type.includes("touch") ? e.touches[0].clientX : e.clientX;
		const startWidth = offcanvasWidth;
		let moved = false;

		setIsDragging(true);

		const handleMove = (moveEvent) => {
			const currentX = moveEvent.type.includes("touch")
				? moveEvent.touches[0].clientX
				: moveEvent.clientX;
			const dx = startX - currentX;
			if (Math.abs(dx) > 3) {
				moved = true;
			}
			const targetWidth = Math.max(
				DEFAULT_WIDTH,
				Math.min(maxExpandWidth, startWidth + dx)
			);
			setOffcanvasWidth(targetWidth);
		};

		const handleEnd = () => {
			setIsDragging(false);
			if (!moved) {
				// 클릭(단순 탭) 시 기본 크기 ↔ 최대 확장 크기 토글
				setOffcanvasWidth((prev) =>
					prev > DEFAULT_WIDTH ? DEFAULT_WIDTH : maxExpandWidth
				);
			}
			window.removeEventListener("mousemove", handleMove);
			window.removeEventListener("mouseup", handleEnd);
			window.removeEventListener("touchmove", handleMove);
			window.removeEventListener("touchend", handleEnd);
		};

		window.addEventListener("mousemove", handleMove);
		window.addEventListener("mouseup", handleEnd);
		window.addEventListener("touchmove", handleMove, { passive: false });
		window.addEventListener("touchend", handleEnd);
	};

	return {
		offcanvasWidth,
		isDragging,
		windowWidth,
		canExpand,
		isExpanded,
		handleDragStart,
	};
}
