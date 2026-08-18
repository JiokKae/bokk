import { useQuery } from "@apollo/client";
import { useEffect, useMemo, useRef, useState } from "react";
import { CloseButton } from "react-bootstrap";
import YouTube from "react-youtube";
import { ME, MY_VIDEO_ITEMS } from "../../../../constants/querys";
import Controller from "./Controller";
import YoutubePlayer from "./YoutubePlayer";
import YoutubeVideoAdder from "./YoutubeVideoAdder";
import YoutubeVideoItem from "./YoutubeVideoItem";

function shuffle(array) {
	var m = array.length,
		t,
		i;

	while (m) {
		i = Math.floor(Math.random() * m--);

		t = array[m];
		array[m] = array[i];
		array[i] = t;
	}
	return array;
}

export default function YoutubeOffcanvas() {
	const { data: meData, loading } = useQuery(ME);
	const autoPlay = Boolean(meData?.me?.config?.videoAutoPlay);
	const { data: myVideoData } = useQuery(MY_VIDEO_ITEMS);
	const videoItems = useMemo(
		() => myVideoData?.myVideoItems || [],
		[myVideoData]
	);

	const DEFAULT_WIDTH = 500;
	const MIN_WINDOW_WIDTH_FOR_EXPAND = 1000;

	const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
	const [isPlaying, setIsPlaying] = useState(false);
	const [isRandom, setIsRandom] = useState(false);
	const [isRepeatOne, setIsRepeatOne] = useState(false);
	const [hasStarted, setHasStarted] = useState(false);
	const [player, setPlayer] = useState(null);
	const hasAutoPlayedRef = useRef(false);

	const [offcanvasWidth, setOffcanvasWidth] = useState(DEFAULT_WIDTH);
	const [isDragging, setIsDragging] = useState(false);
	const [windowWidth, setWindowWidth] = useState(
		typeof window !== "undefined" ? window.innerWidth : 1200
	);

	useEffect(() => {
		const handleResize = () => {
			const currentWinWidth = window.innerWidth;
			setWindowWidth(currentWinWidth);
			setOffcanvasWidth((prev) =>
				Math.min(prev, Math.max(DEFAULT_WIDTH, currentWinWidth - 20))
			);
		};
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	const canExpand = windowWidth >= MIN_WINDOW_WIDTH_FOR_EXPAND;
	const maxExpandWidth = Math.min(1000, windowWidth - 40);
	const isExpanded = offcanvasWidth > DEFAULT_WIDTH + 50;

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
					prev > DEFAULT_WIDTH + 50 ? DEFAULT_WIDTH : maxExpandWidth
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

	const randomIndexes = useMemo(
		() => shuffle(videoItems.map((_, index) => index)),
		[videoItems]
	);

	function onReady(event) {
		setPlayer(event.target);
		if (autoPlay && !hasAutoPlayedRef.current) {
			try {
				event.target.playVideo();
			} catch (e) {}
		}
	}

	useEffect(() => {
		if (!autoPlay || !player || typeof player.playVideo !== "function" || hasAutoPlayedRef.current) return;

		// 1. 플레이어와 autoPlay 설정이 준비되면 백그라운드 재생 시도
		try {
			player.playVideo();
		} catch (e) {}

		// 2. 브라우저의 소리 있는 자동재생 차단 정책(Autoplay Policy) 대응:
		// 사용자가 페이지 내 어디든 처음 클릭/터치하는 순간 즉각 백그라운드 재생 트리거
		const handleFirstInteraction = () => {
			if (player && typeof player.playVideo === "function") {
				try {
					player.playVideo();
				} catch (e) {}
			}
			window.removeEventListener("click", handleFirstInteraction);
			window.removeEventListener("keydown", handleFirstInteraction);
			window.removeEventListener("touchstart", handleFirstInteraction);
		};

		window.addEventListener("click", handleFirstInteraction, { once: true });
		window.addEventListener("keydown", handleFirstInteraction, { once: true });
		window.addEventListener("touchstart", handleFirstInteraction, { once: true });

		return () => {
			window.removeEventListener("click", handleFirstInteraction);
			window.removeEventListener("keydown", handleFirstInteraction);
			window.removeEventListener("touchstart", handleFirstInteraction);
		};
	}, [autoPlay, player]);

	function playVideo(index) {
		setCurrentVideoIndex(index);
		if (player) {
			player.loadVideoById({ videoId: videoItems[index]?.video?.id });
			player.playVideo();
		}
		const scrollQueue = document.getElementById("scroll_queue");
		const itemElem = getVideoItem(index);
		if (scrollQueue && itemElem) {
			scrollQueue.scrollTop = itemElem.offsetTop - scrollQueue.offsetTop;
		}
	}

	function onStateChange(event) {
		if (event.data === YouTube.PlayerState.ENDED) {
			setIsPlaying(false);
			if (isRepeatOne) {
				playVideo(currentVideoIndex);
			} else {
				playVideo(getNextVideoIndex(currentVideoIndex));
			}
		} else if (event.data === YouTube.PlayerState.PLAYING) {
			hasAutoPlayedRef.current = true;
			setHasStarted(true);
			setIsPlaying(true);
		} else if (event.data === YouTube.PlayerState.PAUSED) {
			setIsPlaying(false);
		}
	}
	function onError(event) {
		setIsPlaying(false);
		// 삭제된 영상 등으로 에러 발생 시 무한 루프 폭주를 막기 위해 1.5초 후 다음 곡 재생
		setTimeout(() => {
			playVideo(getNextVideoIndex(currentVideoIndex));
		}, 1500);
	}

	function getRelativeVideoIndex(currentIndex, changeValue) {
		function mod(n, m) {
			return ((n % m) + m) % m;
		}
		if (isRandom === true) {
			return randomIndexes[
				mod(
					randomIndexes.findIndex((item) => item === currentIndex) +
						changeValue,
					randomIndexes.length
				)
			];
		}
		return mod(currentIndex + changeValue, randomIndexes.length);
	}

	function getPreviousVideoIndex(currentIndex) {
		return getRelativeVideoIndex(currentIndex, -1);
	}

	function getNextVideoIndex(currentIndex) {
		return getRelativeVideoIndex(currentIndex, 1);
	}
	function getVideoItem(index) {
		return document.getElementById("videoItem" + index);
	}

	const currentTitle = videoItems[currentVideoIndex]?.video?.title || "";
	const showTicker = isPlaying && Boolean(currentTitle);
	const showAutoPlayNotice = !isPlaying && autoPlay && !hasStarted;
	const showBadge = showTicker || showAutoPlayNotice;

	return (
		<>
			<div className="d-flex align-items-center flex-shrink-1" style={{ minWidth: 0 }}>
				<a
					data-bs-toggle="offcanvas"
					href="#offcanvasYoutubeQueue"
					role="button"
					aria-controls="offcanvasYoutubeQueue"
					onMouseDown={(e) => e.preventDefault()}
					className="text-decoration-none flex-shrink-1"
					title={
						showTicker
							? `재생 중: ${currentTitle}`
							: showAutoPlayNotice
							? "자동 재생 켜짐: 화면 터치/조작 시 자동 재생됩니다"
							: "유튜브 재생 목록"
					}
					style={{
						maxWidth: showBadge ? "min(200px, calc(100vw - 230px))" : "0px",
						opacity: showBadge ? 1 : 0,
						marginRight: showBadge ? "8px" : "0px",
						transformOrigin: "right center",
						transition: "max-width 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.35s ease, margin-right 0.4s ease",
						overflow: "hidden",
						whiteSpace: "nowrap",
						display: "inline-block",
						verticalAlign: "middle",
						pointerEvents: showBadge ? "auto" : "none",
						userSelect: "none",
						minWidth: 0,
					}}
				>
					{showTicker ? (
						<div
							className="d-flex align-items-center px-2 py-1 rounded-pill shadow-sm"
							style={{
								backgroundColor: "#fff0f3",
								border: "1px solid #ffccd5",
								fontSize: "12px",
								color: "#d90429",
								overflow: "hidden",
							}}
						>
							<span
								className="spinner-grow spinner-grow-sm text-danger me-1 flex-shrink-0"
								style={{ width: "7px", height: "7px" }}
							/>
							<div className="overflow-hidden position-relative w-100">
								<style>{`
									@keyframes youtubeTicker {
										0% { transform: translateX(0%); }
										100% { transform: translateX(-50%); }
									}
									.animate-youtube-ticker {
										display: inline-block;
										white-space: nowrap;
										animation: youtubeTicker 12s linear infinite;
									}
								`}</style>
								<div className="animate-youtube-ticker">
									{currentTitle} &nbsp;&nbsp;🎵&nbsp;&nbsp; {currentTitle} &nbsp;&nbsp;🎵&nbsp;&nbsp;
								</div>
							</div>
						</div>
					) : showAutoPlayNotice ? (
						<div
							className="d-flex align-items-center px-2 py-1 rounded-pill shadow-sm"
							style={{
								backgroundColor: "#e0f2fe",
								border: "1px solid #bae6fd",
								fontSize: "11px",
								color: "#0369a1",
								overflow: "hidden",
								whiteSpace: "nowrap",
								fontWeight: 500,
							}}
						>
							<span
								className="spinner-grow spinner-grow-sm text-info me-1 flex-shrink-0"
								style={{ width: "6px", height: "6px" }}
							/>
							<span className="text-truncate">
								조작 시 자동 재생 🎵
							</span>
						</div>
					) : null}
				</a>

				<a
					data-bs-toggle="offcanvas"
					href="#offcanvasYoutubeQueue"
					role="button"
					aria-controls="offcanvasYoutubeQueue"
					onMouseDown={(e) => e.preventDefault()}
					style={{ userSelect: "none" }}
					className="flex-shrink-0"
				>
					<img
						src={`${process.env.REACT_APP_BOKK_IMG}/YouTube-icon.png`}
						alt="유튜브 재생 목록"
					/>
				</a>
			</div>
			<div
				className="offcanvas offcanvas-end shadow-lg"
				id="offcanvasYoutubeQueue"
				aria-labelledby="offcanvasYoutubeQueue"
				tabIndex="-1"
				style={{
					width: `${Math.min(offcanvasWidth, windowWidth)}px`,
					maxWidth: "100vw",
					transition: isDragging
						? "none"
						: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
					overflow: "visible",
				}}>
				{canExpand && (
					<button
						type="button"
						onMouseDown={handleDragStart}
						onTouchStart={handleDragStart}
						title={
							isExpanded
								? "기본 크기로 축소 (클릭 또는 오른쪽으로 드래그)"
								: "대화면으로 확장 (클릭 또는 왼쪽으로 드래그)"
						}
						className="d-flex flex-column align-items-center justify-content-center border"
						style={{
							position: "absolute",
							left: "-28px",
							top: "50%",
							transform: "translateY(-50%)",
							width: "28px",
							height: "76px",
							borderRadius: "10px 0 0 10px",
							backgroundColor: isDragging ? "#e9ecef" : "#ffffff",
							borderColor: "#dee2e6",
							borderRight: "none",
							cursor: "ew-resize",
							zIndex: 1060,
							padding: 0,
							outline: "none",
							userSelect: "none",
							color: "#495057",
							transition: "background-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease",
							boxShadow: isDragging
								? "-4px 0 12px rgba(6, 153, 249, 0.25)"
								: "-3px 0 8px rgba(0, 0, 0, 0.12)",
						}}
					>
						<span
							style={{
								fontSize: "14px",
								fontWeight: "bold",
								letterSpacing: "-2px",
								marginLeft: "-2px",
								lineHeight: 1,
								color: isExpanded ? "#057ecf" : "#6c757d",
								pointerEvents: "none",
							}}
						>
							{isExpanded ? ">>" : "<<"}
						</span>
					</button>
				)}

				{isDragging && (
					<div
						style={{
							position: "fixed",
							top: 0,
							left: 0,
							right: 0,
							bottom: 0,
							zIndex: 99999,
							cursor: "ew-resize",
						}}
					/>
				)}
				<div className="offcanvas-header">
					<h5 className="offcanvas-title" id="offcanvasYoutubeQueue">
						유튜브 재생 목록
					</h5>
					<CloseButton data-bs-dismiss="offcanvas" />
				</div>
				<div className="offcanvas-body">
					<div id="youtube_video_queue">
						{loading === false && videoItems.length > 0 ? (
							<>
								<YoutubePlayer
									className="ratio ratio-16x9 mb-2"
									firstVideoId={videoItems[0].video.id}
									autoPlay={autoPlay}
									onReady={onReady}
									onStateChange={onStateChange}
									onError={onError}
								/>
								<Controller
									isPlaying={isPlaying}
									autoPlay={autoPlay}
									player={player}
									onNextPlay={() =>
										playVideo(
											getNextVideoIndex(currentVideoIndex)
										)
									}
									onPreviousPlay={() =>
										playVideo(
											getPreviousVideoIndex(
												currentVideoIndex
											)
										)
									}
									onRandomPlay={() => setIsRandom(!isRandom)}
									isRandom={isRandom}
									onRepeatOnePlay={() =>
										setIsRepeatOne(!isRepeatOne)
									}
									isRepeatOne={isRepeatOne}
								/>
							</>
						) : null}

						<YoutubeVideoAdder />
						<div
							id="scroll_queue"
							className="overflow-auto"
							style={{ height: "400px" }}>
							<div className="list-group">
								{videoItems.map(
									(
										{ video: { id, title, length } },
										index
									) => (
										<YoutubeVideoItem
											key={index}
											index={index}
											currentVideoIndex={
												currentVideoIndex
											}
											onClick={() => playVideo(index)}
											id={id}
											title={title}
											length={length}
										/>
									)
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
