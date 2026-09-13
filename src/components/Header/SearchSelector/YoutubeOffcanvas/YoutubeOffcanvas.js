import { useQuery } from "@apollo/client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button, CloseButton, Dropdown } from "react-bootstrap";
import YouTube from "react-youtube";
import { ME, MY_PLAYLISTS, MY_VIDEO_ITEMS } from "../../../../constants/querys";
import Controller from "./Controller";
import YoutubePlayer from "./YoutubePlayer";
import YoutubeVideoAdder from "./YoutubeVideoAdder";
import YoutubeVideoItem from "./YoutubeVideoItem";
import PlaylistManageModal from "./PlaylistManageModal";
import VideoPlaylistTagModal from "./VideoPlaylistTagModal";
import styles from "./YoutubeOffcanvas.module.css";

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

	const { data: myPlaylistsData } = useQuery(MY_PLAYLISTS);
	const playlists = useMemo(
		() => myPlaylistsData?.myPlaylists || [],
		[myPlaylistsData]
	);

	const [selectedPlaylistId, setSelectedPlaylistId] = useState("ALL");
	// 현재 재생 중인 플레이리스트 ID
	const [playingPlaylistId, setPlayingPlaylistId] = useState("ALL");
	const [showPlaylistManageModal, setShowPlaylistManageModal] = useState(false);
	const [selectedVideoForTag, setSelectedVideoForTag] = useState(null);

	const DEFAULT_WIDTH = 500;
	const MIN_WINDOW_WIDTH_FOR_EXPAND = 576;

	const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
	const [isPlaying, setIsPlaying] = useState(false);
	const [isRandom, setIsRandom] = useState(false);
	const [isRepeatOne, setIsRepeatOne] = useState(false);
	const [hasStarted, setHasStarted] = useState(false);
	const [player, setPlayer] = useState(null);
	const hasAutoPlayedRef = useRef(false);

	// 재생 중인 큐(Queue). 사용자가 목록에서 특정 곡을 누를 때 해당 플레이리스트 목록으로 확정됨
	const [activeQueue, setActiveQueue] = useState(null);
	// 현재 실제로 재생 중인 유튜브 비디오 ID
	const [currentVideoId, setCurrentVideoId] = useState(null);
	// 최초 마운트 시 로드할 비디오 ID (이후 변경되지 않음)
	const initialVideoIdRef = useRef(null);
	if (!initialVideoIdRef.current && videoItems.length > 0) {
		initialVideoIdRef.current = videoItems[0].video.id;
	}

	// 1. 화면에 표시할 목록 (사용자가 선택한 플레이리스트에 따른 View)
	const displayedVideoItems = useMemo(() => {
		if (selectedPlaylistId === "ALL") {
			return videoItems;
		}
		if (selectedPlaylistId === "UNTAGGED") {
			return videoItems.filter(
				(item) => !item.playlists || item.playlists.length === 0
			);
		}
		const targetId = Number(selectedPlaylistId);
		const exists = playlists.some((p) => p.id === targetId);
		if (!exists) {
			return videoItems;
		}
		return videoItems.filter(
			(item) => item.playlists && item.playlists.some((p) => p.id === targetId)
		);
	}, [videoItems, selectedPlaylistId, playlists]);

	// 2. 실제로 재생 및 컨트롤러가 순회하는 활성 재생 큐
	const currentQueue = useMemo(
		() => (activeQueue && activeQueue.length > 0 ? activeQueue : videoItems),
		[activeQueue, videoItems]
	);

	// 3. 현재 재생 중인 실제 비디오 ID
	const effectivePlayingVideoId =
		currentVideoId ||
		currentQueue[currentVideoIndex]?.video?.id ||
		videoItems[0]?.video?.id ||
		"";

	// 현재 재생 중인 플레이리스트 메타 정보 (이름)
	const playingPlaylistInfo = useMemo(() => {
		if (playingPlaylistId === "ALL") {
			return { id: "ALL", name: "전체" };
		}
		if (playingPlaylistId === "UNTAGGED") {
			return { id: "UNTAGGED", name: "미분류" };
		}
		const targetId = Number(playingPlaylistId);
		const found = playlists.find((p) => p.id === targetId);
		if (found) {
			return { id: targetId, name: found.name };
		}
		return { id: "ALL", name: "전체" };
	}, [playingPlaylistId, playlists]);

	// 현재 선택된 플레이리스트 및 재생 중인 플레이리스트가 삭제되어 목록에 없으면 자동으로 '전체'로 복구
	useEffect(() => {
		if (selectedPlaylistId !== "ALL" && selectedPlaylistId !== "UNTAGGED") {
			const targetId = Number(selectedPlaylistId);
			const exists = playlists.some((p) => p.id === targetId);
			if (!exists) {
				setSelectedPlaylistId("ALL");
			}
		}
		if (playingPlaylistId !== "ALL" && playingPlaylistId !== "UNTAGGED") {
			const targetId = Number(playingPlaylistId);
			const exists = playlists.some((p) => p.id === targetId);
			if (!exists) {
				setPlayingPlaylistId("ALL");
			}
		}
	}, [playlists, selectedPlaylistId, playingPlaylistId]);

	const untaggedCount = useMemo(
		() =>
			videoItems.filter(
				(item) => !item.playlists || item.playlists.length === 0
			).length,
		[videoItems]
	);

	const getPlaylistCount = useCallback(
		(playlistId) => {
			return videoItems.filter(
				(item) => item.playlists && item.playlists.some((p) => p.id === playlistId)
			).length;
		},
		[videoItems]
	);

	// 현재 선택된 플레이리스트 정보 (이름 및 곡 수)
	const selectedPlaylistInfo = useMemo(() => {
		if (selectedPlaylistId === "ALL") {
			return { name: "전체", count: videoItems.length };
		}
		if (selectedPlaylistId === "UNTAGGED") {
			return { name: "미분류", count: untaggedCount };
		}
		const targetId = Number(selectedPlaylistId);
		const pl = playlists.find((p) => p.id === targetId);
		if (pl) {
			return { name: pl.name, count: getPlaylistCount(targetId) };
		}
		return { name: "전체", count: videoItems.length };
	}, [selectedPlaylistId, videoItems.length, untaggedCount, playlists, getPlaylistCount]);

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
				const currentMaxWidth = Math.min(1000, currentWinWidth - 40);
				setOffcanvasWidth((prev) =>
					Math.min(prev, Math.max(DEFAULT_WIDTH, currentMaxWidth))
				);
			}
		};
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	// Bootstrap Offcanvas가 열릴 때 모달 인풋 등의 포커스를 가로채지 못하도록 포커스 트랩 해제
	useEffect(() => {
		const offcanvasElem = document.getElementById("offcanvasYoutubeQueue");
		if (!offcanvasElem) return;

		const handleShown = () => {
			if (window.bootstrap?.Offcanvas) {
				const bsOffcanvas = window.bootstrap.Offcanvas.getInstance(offcanvasElem);
				if (bsOffcanvas?._focustrap) {
					bsOffcanvas._focustrap.deactivate();
				}
			}
		};

		offcanvasElem.addEventListener("shown.bs.offcanvas", handleShown);
		return () => {
			offcanvasElem.removeEventListener("shown.bs.offcanvas", handleShown);
		};
	}, []);

	const canExpand = windowWidth >= MIN_WINDOW_WIDTH_FOR_EXPAND;
	const maxExpandWidth = Math.min(1000, windowWidth - 40);
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

	const randomIndexes = useMemo(
		() => shuffle(currentQueue.map((_, index) => index)),
		[currentQueue]
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

	// 활성 재생 큐에서 특정 인덱스의 영상 재생
	function playVideoFromQueue(index, queue = currentQueue) {
		if (!queue[index]) return;
		setCurrentVideoIndex(index);
		const targetId = queue[index]?.video?.id;
		if (targetId) {
			setCurrentVideoId(targetId);
			if (player) {
				player.loadVideoById({ videoId: targetId });
				player.playVideo();
			}
		}
		// 현재 화면 목록에 해당 아이템이 있다면 스크롤 이동 (DOM 렌더링 이후 안전 스크롤)
		setTimeout(() => {
			const scrollQueue = document.getElementById("scroll_queue");
			const displayedIndex = displayedVideoItems.findIndex(
				(item) => item.video?.id === targetId
			);
			if (displayedIndex !== -1) {
				const itemElem = getVideoItem(displayedIndex);
				if (scrollQueue && itemElem) {
					scrollQueue.scrollTop = itemElem.offsetTop - scrollQueue.offsetTop;
				}
			}
		}, 50);
	}

	// 곡 이동 버튼 누를 때: 다른 플레이리스트를 보고 있다면 현재 재생 중인 플레이리스트로 화면 이동 후 곡 이동
	const handleNextPlay = () => {
		if (String(selectedPlaylistId) !== String(playingPlaylistId)) {
			setSelectedPlaylistId(playingPlaylistId);
		}
		playVideoFromQueue(getNextVideoIndex(currentVideoIndex));
	};

	const handlePreviousPlay = () => {
		if (String(selectedPlaylistId) !== String(playingPlaylistId)) {
			setSelectedPlaylistId(playingPlaylistId);
		}
		playVideoFromQueue(getPreviousVideoIndex(currentVideoIndex));
	};

	// 사용자가 화면 목록에서 영상을 직접 클릭했을 때 비로소 재생 큐를 해당 목록으로 확정하고 재생
	function handleSelectVideo(item, index) {
		setPlayingPlaylistId(selectedPlaylistId);
		setActiveQueue(displayedVideoItems);
		playVideoFromQueue(index, displayedVideoItems);
	}

	function onStateChange(event) {
		if (event.data === YouTube.PlayerState.ENDED) {
			setIsPlaying(false);
			if (isRepeatOne) {
				playVideoFromQueue(currentVideoIndex);
			} else {
				playVideoFromQueue(getNextVideoIndex(currentVideoIndex));
			}
		} else if (event.data === YouTube.PlayerState.PLAYING) {
			hasAutoPlayedRef.current = true;
			setHasStarted(true);
			setIsPlaying(true);
		} else {
			setIsPlaying(false);
		}
	}
	function onError(event) {
		setIsPlaying(false);
		// 삭제된 영상 등으로 에러 발생 시 무한 루프 폭주를 막기 위해 1.5초 후 다음 곡 재생
		setTimeout(() => {
			playVideoFromQueue(getNextVideoIndex(currentVideoIndex));
		}, 1500);
	}

	function getRelativeVideoIndex(currentIndex, changeValue) {
		function mod(n, m) {
			return ((n % m) + m) % m;
		}
		if (currentQueue.length === 0) return 0;
		if (isRandom === true) {
			return randomIndexes[
				mod(
					randomIndexes.findIndex((item) => item === currentIndex) +
						changeValue,
					randomIndexes.length
				)
			];
		}
		return mod(currentIndex + changeValue, currentQueue.length);
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

	const currentPlayingItem = useMemo(() => {
		if (effectivePlayingVideoId) {
			return (
				currentQueue.find((item) => item.video.id === effectivePlayingVideoId) ||
				videoItems.find((item) => item.video.id === effectivePlayingVideoId) ||
				null
			);
		}
		return currentQueue[currentVideoIndex] || videoItems[0] || null;
	}, [effectivePlayingVideoId, currentQueue, currentVideoIndex, videoItems]);

	const currentTitle = currentPlayingItem?.video?.title || "";
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
							? `재생 중: [${playingPlaylistInfo.name}] ${currentTitle}`
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
						<div className={styles.headerTickerBadge}>
							<div className={styles.equalizer}>
								<span className={`${styles.equalizerBar} ${styles.bar1}`} />
								<span className={`${styles.equalizerBar} ${styles.bar2}`} />
								<span className={`${styles.equalizerBar} ${styles.bar3}`} />
							</div>
							<div className={styles.tickerMarqueeWrapper}>
								<div className={styles.tickerMarquee}>
									{currentTitle} &nbsp;·&nbsp; {currentTitle} &nbsp;·&nbsp;
								</div>
							</div>
						</div>
					) : showAutoPlayNotice ? (
						<div className={styles.tickerNoticeBadge}>
							<span
								className="spinner-grow spinner-grow-sm text-primary me-1 flex-shrink-0"
								style={{ width: "6px", height: "6px" }}
							/>
							<span className="text-truncate">
								조작 시 자동 재생
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
					width: windowWidth < 500 ? "100vw" : `${Math.min(offcanvasWidth, windowWidth)}px`,
					maxWidth: "100vw",
					transition: isDragging
						? "none"
						: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
					overflow: "visible",
				}}>
				{canExpand && (
					<div
						role="separator"
						aria-orientation="vertical"
						onMouseDown={handleDragStart}
						onTouchStart={handleDragStart}
						title={
							isExpanded
								? "기본 크기로 축소 (클릭 또는 오른쪽으로 드래그)"
								: "대화면으로 확장 (클릭 또는 왼쪽으로 드래그)"
						}
						className={`${styles.resizer} ${
							isDragging ? styles.isDragging : ""
						}`}
					>
						<div className={styles.handleGrip}>
							<div className={styles.dots}>
								<span className={styles.dot} />
								<span className={styles.dot} />
								<span className={styles.dot} />
								<span className={styles.dot} />
								<span className={styles.dot} />
								<span className={styles.dot} />
							</div>
						</div>
					</div>
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
							cursor: "col-resize",
						}}
					/>
				)}
				<div className="offcanvas-header">
					<h5 className="offcanvas-title mb-0" id="offcanvasYoutubeQueue">
						유튜브 재생 목록
					</h5>
					<CloseButton data-bs-dismiss="offcanvas" />
				</div>
				<div className="offcanvas-body d-flex flex-column p-3" style={{ height: "calc(100% - 56px)", overflow: "hidden" }}>
					<div id="youtube_video_queue" className="d-flex flex-column h-100" style={{ minHeight: 0 }}>
						<div className="flex-shrink-0">
							{loading === false && (videoItems.length > 0 || currentQueue.length > 0) ? (
								<div className={styles.playerWrapper}>
									<YoutubePlayer
										className="ratio ratio-16x9 mb-2"
										firstVideoId={initialVideoIdRef.current || videoItems[0]?.video?.id}
										autoPlay={autoPlay}
										onReady={onReady}
										onStateChange={onStateChange}
										onError={onError}
									/>
								</div>
							) : null}

							{/* 플레이리스트 선택 & 컨트롤러 바 (모바일 스마트 2단 반응형) */}
							<div className={styles.controlBar}>
								<div className={styles.selectorGroup}>
									<Dropdown className="flex-grow-1" style={{ minWidth: 0 }}>
									<Dropdown.Toggle
										variant="light"
										id="playlist-dropdown-toggle"
										className={`w-100 d-flex align-items-center justify-content-between text-start fw-medium shadow-none ${styles.playlistDropdownToggle}`}
									>
										<span className="text-truncate me-2">
											{selectedPlaylistInfo.name}
										</span>
										<div className="d-flex align-items-center gap-1.5 ms-auto me-1 flex-shrink-0">
											{hasStarted && String(selectedPlaylistId) === String(playingPlaylistId) && (
												<div
													className={`${styles.equalizer} ${!isPlaying ? styles.paused : ""} me-1`}
													style={{ height: "11px" }}
													title={isPlaying ? "재생 중" : "일시정지됨"}
												>
													<span className={`${styles.equalizerBar} ${styles.bar1}`} />
													<span className={`${styles.equalizerBar} ${styles.bar2}`} />
													<span className={`${styles.equalizerBar} ${styles.bar3}`} />
												</div>
											)}
											<span
												className={`badge rounded-pill flex-shrink-0 ${
													hasStarted && String(selectedPlaylistId) === String(playingPlaylistId)
														? "bg-primary-subtle text-primary border-primary-subtle"
														: "bg-light text-secondary border"
												}`}
												style={{ fontSize: "11px", fontWeight: 500 }}
											>
												{selectedPlaylistInfo.count}
											</span>
										</div>
									</Dropdown.Toggle>

									<Dropdown.Menu className={`w-100 ${styles.playlistDropdownMenu}`}>
										{(() => {
											const isPlayingAll = hasStarted && playingPlaylistId === "ALL";
											return (
												<Dropdown.Item
													as="button"
													type="button"
													className={`d-flex align-items-center justify-content-between ${styles.dropdownItem} ${
														isPlayingAll ? styles.playingItem : ""
													}`}
													style={{
														fontWeight: selectedPlaylistId === "ALL" ? "700" : undefined,
													}}
													onClick={() => setSelectedPlaylistId("ALL")}
												>
													<div className="d-flex align-items-center text-truncate me-2" style={{ minWidth: 0 }}>
														{selectedPlaylistId === "ALL" && (
															<span className="text-primary me-2 fw-bold" style={{ fontSize: "12px" }}>
																✓
															</span>
														)}
														<span className="text-truncate">전체</span>
													</div>
													<div className="d-flex align-items-center gap-2 flex-shrink-0">
														{isPlayingAll && (
															<div
																className={`${styles.equalizer} ${!isPlaying ? styles.paused : ""}`}
																style={{ height: "11px" }}
																title={isPlaying ? "재생 중" : "일시정지됨"}
															>
																<span className={`${styles.equalizerBar} ${styles.bar1}`} />
																<span className={`${styles.equalizerBar} ${styles.bar2}`} />
																<span className={`${styles.equalizerBar} ${styles.bar3}`} />
															</div>
														)}
														<span
															className={`badge rounded-pill flex-shrink-0 ${
																isPlayingAll
																	? "bg-primary-subtle text-primary border-primary-subtle"
																	: "bg-light text-secondary border"
															}`}
															style={{ fontSize: "11px" }}
														>
															{videoItems.length}
														</span>
													</div>
												</Dropdown.Item>
											);
										})()}

										{(() => {
											const isPlayingUntagged = hasStarted && playingPlaylistId === "UNTAGGED";
											return (
												<Dropdown.Item
													as="button"
													type="button"
													className={`d-flex align-items-center justify-content-between ${styles.dropdownItem} ${
														isPlayingUntagged ? styles.playingItem : ""
													}`}
													style={{
														fontWeight: selectedPlaylistId === "UNTAGGED" ? "700" : undefined,
													}}
													onClick={() => setSelectedPlaylistId("UNTAGGED")}
												>
													<div className="d-flex align-items-center text-truncate me-2" style={{ minWidth: 0 }}>
														{selectedPlaylistId === "UNTAGGED" && (
															<span className="text-primary me-2 fw-bold" style={{ fontSize: "12px" }}>
																✓
															</span>
														)}
														<span className="text-truncate">미분류</span>
													</div>
													<div className="d-flex align-items-center gap-2 flex-shrink-0">
														{isPlayingUntagged && (
															<div
																className={`${styles.equalizer} ${!isPlaying ? styles.paused : ""}`}
																style={{ height: "11px" }}
																title={isPlaying ? "재생 중" : "일시정지됨"}
															>
																<span className={`${styles.equalizerBar} ${styles.bar1}`} />
																<span className={`${styles.equalizerBar} ${styles.bar2}`} />
																<span className={`${styles.equalizerBar} ${styles.bar3}`} />
															</div>
														)}
														<span
															className={`badge rounded-pill flex-shrink-0 ${
																isPlayingUntagged
																	? "bg-primary-subtle text-primary border-primary-subtle"
																	: "bg-light text-secondary border"
															}`}
															style={{ fontSize: "11px" }}
														>
															{untaggedCount}
														</span>
													</div>
												</Dropdown.Item>
											);
										})()}

										{playlists.length > 0 && <Dropdown.Divider className="my-1" />}

										{playlists.map((pl) => {
											const isPlayingThis = hasStarted && String(playingPlaylistId) === String(pl.id);
											const isSelectedThis = String(selectedPlaylistId) === String(pl.id);
											return (
												<Dropdown.Item
													key={pl.id}
													as="button"
													type="button"
													className={`d-flex align-items-center justify-content-between ${styles.dropdownItem} ${
														isPlayingThis ? styles.playingItem : ""
													}`}
													style={{
														fontWeight: isSelectedThis ? "700" : undefined,
													}}
													onClick={() => setSelectedPlaylistId(pl.id)}
												>
													<div className="d-flex align-items-center text-truncate me-2" style={{ minWidth: 0 }}>
														{isSelectedThis && (
															<span className="text-primary me-2 fw-bold" style={{ fontSize: "12px" }}>
																✓
															</span>
														)}
														<span className="text-truncate">{pl.name}</span>
													</div>
													<div className="d-flex align-items-center gap-2 flex-shrink-0">
														{isPlayingThis && (
															<div
																className={`${styles.equalizer} ${!isPlaying ? styles.paused : ""}`}
																style={{ height: "11px" }}
																title={isPlaying ? "재생 중" : "일시정지됨"}
															>
																<span className={`${styles.equalizerBar} ${styles.bar1}`} />
																<span className={`${styles.equalizerBar} ${styles.bar2}`} />
																<span className={`${styles.equalizerBar} ${styles.bar3}`} />
															</div>
														)}
														<span
															className={`badge rounded-pill flex-shrink-0 ${
																isPlayingThis
																	? "bg-primary-subtle text-primary border-primary-subtle"
																	: "bg-light text-secondary border"
															}`}
															style={{ fontSize: "11px" }}
														>
															{getPlaylistCount(pl.id)}
														</span>
													</div>
												</Dropdown.Item>
											);
										})}
									</Dropdown.Menu>
								</Dropdown>
								<Button
									variant="outline-secondary"
									size="sm"
									className="d-flex align-items-center justify-content-center flex-shrink-0"
									style={{
										fontSize: "12.5px",
										height: "38px",
										padding: "0 10px",
										whiteSpace: "nowrap",
										borderRadius: "6px",
									}}
									title="플레이리스트 추가 / 수정 / 삭제"
									onClick={() => setShowPlaylistManageModal(true)}
								>
									⚙️ 관리
								</Button>
							</div>

								{loading === false && (videoItems.length > 0 || currentQueue.length > 0) ? (
									<div className={styles.controllerWrapper}>
										<Controller
											isPlaying={isPlaying}
											autoPlay={autoPlay}
											player={player}
											onNextPlay={handleNextPlay}
											onPreviousPlay={handlePreviousPlay}
											onRandomPlay={() => setIsRandom(!isRandom)}
											isRandom={isRandom}
											onRepeatOnePlay={() =>
												setIsRepeatOne(!isRepeatOne)
											}
											isRepeatOne={isRepeatOne}
										/>
									</div>
								) : null}
							</div>

						{/* 다른 플레이리스트 탐색 중일 때 현재 재생 중인 플레이리스트 안내 및 원클릭 복귀 바 */}
						{hasStarted && String(selectedPlaylistId) !== String(playingPlaylistId) && (
							<div className={styles.returnBanner}>
								<div className={styles.returnBannerLeft}>
									<div
										className={`${styles.equalizer} ${!isPlaying ? styles.paused : ""}`}
										style={{ height: "12px" }}
									>
										<span className={`${styles.equalizerBar} ${styles.bar1}`} />
										<span className={`${styles.equalizerBar} ${styles.bar2}`} />
										<span className={`${styles.equalizerBar} ${styles.bar3}`} />
									</div>
									<span className={styles.returnLabel}>
										{isPlaying ? "재생 중" : "일시정지"}
									</span>
									<span className={styles.returnDivider} />
									<span className={styles.returnPlaylistName} title={playingPlaylistInfo.name}>
										{playingPlaylistInfo.name}
									</span>
								</div>
								<button
									type="button"
									className={styles.returnBtn}
									onClick={() => setSelectedPlaylistId(playingPlaylistId)}
									title="현재 재생 중인 플레이리스트 목록으로 즉시 이동"
								>
									<span>재생 목록 보기</span>
									<span style={{ fontSize: "11px" }}>➔</span>
								</button>
							</div>
						)}

							<YoutubeVideoAdder />
						</div>

						{/* 영상 큐 목록 (남은 화면 100% 동적 채움, 모바일 단일 스크롤 보장) */}
						<div
							id="scroll_queue"
							className={`overflow-auto flex-grow-1 ${styles.queueContainer}`}
							style={{
								minHeight: 0,
								WebkitOverflowScrolling: "touch",
							}}
						>
							<div className="list-group">
								{displayedVideoItems.length === 0 ? (
									<div className="text-center text-muted py-5 px-3">
										<div className="fs-4 mb-2">📭</div>
										<p className="mb-1 fw-medium" style={{ fontSize: "13px" }}>
											{selectedPlaylistId === "UNTAGGED"
												? "미분류 영상이 없습니다."
												: videoItems.length === 0
												? "재생 목록에 등록된 영상이 없습니다."
												: "이 플레이리스트에 담긴 영상이 없습니다."}
										</p>
										<small className="text-secondary d-block" style={{ fontSize: "11px" }}>
											{videoItems.length === 0
												? "상단 입력창에 유튜브 영상 주소를 입력하여 추가해보세요!"
												: selectedPlaylistId === "UNTAGGED"
												? "모든 영상이 플레이리스트에 정리되어 있습니다."
												: "전체 목록에서 영상 우측의 '+ 담기' 버튼으로 이 플레이리스트에 곡을 담아보세요!"}
										</small>
										{selectedPlaylistId !== "ALL" && videoItems.length > 0 && (
											<div className="mt-3">
												<button
													type="button"
													className="btn btn-sm btn-light border px-3 py-1.5 text-primary fw-medium shadow-sm"
													style={{
														fontSize: "12px",
														borderRadius: "6px",
														backgroundColor: "#f0f7ff",
														borderColor: "#b6e0fe",
													}}
													onClick={() => setSelectedPlaylistId("ALL")}
												>
													전체 목록에서 곡 담으러 가기 ➔
												</button>
											</div>
										)}
									</div>
								) : (
									displayedVideoItems.map(
										(item, index) => (
											<YoutubeVideoItem
												key={item.id}
												index={index}
												currentVideoIndex={
													currentVideoIndex
												}
												isCurrentPlaying={item.video.id === effectivePlayingVideoId}
												onClick={() => handleSelectVideo(item, index)}
												id={item.video.id}
												title={item.video.title}
												length={item.video.length}
												playlists={item.playlists || []}
												onOpenTagModal={() => setSelectedVideoForTag(item)}
											/>
										)
									)
								)}
							</div>
						</div>
					</div>
				</div>
			</div>

			<PlaylistManageModal
				show={showPlaylistManageModal}
				onHide={() => setShowPlaylistManageModal(false)}
				playlists={playlists}
				videoItems={videoItems}
				onDeletePlaylist={(deletedId) => {
					if (Number(selectedPlaylistId) === Number(deletedId)) {
						setSelectedPlaylistId("ALL");
					}
					if (Number(playingPlaylistId) === Number(deletedId)) {
						setPlayingPlaylistId("ALL");
					}
				}}
			/>

			<VideoPlaylistTagModal
				show={Boolean(selectedVideoForTag)}
				onHide={() => setSelectedVideoForTag(null)}
				videoItem={selectedVideoForTag}
				playlists={playlists}
				videoItems={videoItems}
			/>
		</>
	);
}
