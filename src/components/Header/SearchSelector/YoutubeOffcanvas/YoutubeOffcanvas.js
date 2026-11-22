import { useQuery } from "@apollo/client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button, CloseButton } from "react-bootstrap";
import YouTube from "react-youtube";
import { ME, MY_PLAYLISTS, MY_VIDEO_ITEMS } from "../../../../constants/querys";
import useOffcanvasResizer from "../../../../hooks/useOffcanvasResizer";
import usePlaylistFilter, { PLAYLIST_FILTER } from "../../../../hooks/usePlaylistFilter";
import { resolvePlaylistMeta } from "../../../../utils/playlistUtil";
import Controller from "./Controller";
import EqualizerIcon from "./EqualizerIcon";
import PlaylistFilterDropdown from "./PlaylistFilterDropdown";
import PlaylistManageModal from "./PlaylistManageModal";
import VideoPlaylistTagModal from "./VideoPlaylistTagModal";
import YoutubeHeaderTrigger from "./YoutubeHeaderTrigger";
import styles from "./YoutubeOffcanvas.module.css";
import YoutubePlayer from "./YoutubePlayer";
import YoutubeQueueList from "./YoutubeQueueList";
import YoutubeVideoAdder from "./YoutubeVideoAdder";

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

	const {
		selectedPlaylistId,
		setSelectedPlaylistId,
		displayedVideoItems,
		untaggedCount,
		getPlaylistCount,
		selectedPlaylistInfo,
	} = usePlaylistFilter(videoItems, playlists);

	const {
		offcanvasWidth,
		isDragging,
		windowWidth,
		canExpand,
		isExpanded,
		handleDragStart,
	} = useOffcanvasResizer();

	// 현재 재생 중인 플레이리스트 ID
	const [playingPlaylistId, setPlayingPlaylistId] = useState(PLAYLIST_FILTER.ALL);
	const [showPlaylistManageModal, setShowPlaylistManageModal] = useState(false);
	const [selectedVideoForTag, setSelectedVideoForTag] = useState(null);

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

	// 실제로 재생 및 컨트롤러가 순회하는 활성 재생 큐
	const currentQueue = useMemo(
		() => (activeQueue && activeQueue.length > 0 ? activeQueue : videoItems),
		[activeQueue, videoItems]
	);

	// 현재 재생 중인 실제 비디오 ID
	const effectivePlayingVideoId =
		currentVideoId ||
		currentQueue[currentVideoIndex]?.video?.id ||
		videoItems[0]?.video?.id ||
		"";

	// 현재 재생 중인 플레이리스트 메타 정보 (이름)
	const playingPlaylistInfo = useMemo(
		() => resolvePlaylistMeta(playingPlaylistId, videoItems, playlists),
		[playingPlaylistId, videoItems, playlists]
	);

	// 재생 중인 플레이리스트가 삭제되어 목록에 없으면 자동으로 '전체'로 복구
	useEffect(() => {
		if (
			playingPlaylistId !== PLAYLIST_FILTER.ALL &&
			playingPlaylistId !== PLAYLIST_FILTER.UNTAGGED
		) {
			const targetId = Number(playingPlaylistId);
			const exists = playlists.some((p) => p.id === targetId);
			if (!exists) {
				setPlayingPlaylistId(PLAYLIST_FILTER.ALL);
			}
		}
	}, [playlists, playingPlaylistId]);

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
		if (
			!autoPlay ||
			!player ||
			typeof player.playVideo !== "function" ||
			hasAutoPlayedRef.current
		) {
			return;
		}

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
				const itemElem = document.getElementById("videoItem" + displayedIndex);
				if (scrollQueue && itemElem) {
					scrollQueue.scrollTop = itemElem.offsetTop - scrollQueue.offsetTop;
				}
			}
		}, 50);
	}

	function getRelativeVideoIndex(currentIndex, changeValue) {
		const mod = (n, m) => ((n % m) + m) % m;
		if (currentQueue.length === 0) return 0;
		if (isRandom === true) {
			return randomIndexes[
				mod(
					randomIndexes.findIndex((item) => item === currentIndex) + changeValue,
					randomIndexes.length
				)
			];
		}
		return mod(currentIndex + changeValue, currentQueue.length);
	}

	const getPreviousVideoIndex = (idx) => getRelativeVideoIndex(idx, -1);
	const getNextVideoIndex = (idx) => getRelativeVideoIndex(idx, 1);

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

	function onError() {
		setIsPlaying(false);
		// 삭제된 영상 등으로 에러 발생 시 무한 루프 폭주를 막기 위해 1.5초 후 다음 곡 재생
		setTimeout(() => {
			playVideoFromQueue(getNextVideoIndex(currentVideoIndex));
		}, 1500);
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

	return (
		<>
			<YoutubeHeaderTrigger
				isPlaying={isPlaying}
				autoPlay={autoPlay}
				hasStarted={hasStarted}
				currentTitle={currentTitle}
				playingPlaylistName={playingPlaylistInfo.name}
			/>

			<div
				className="offcanvas offcanvas-end shadow-lg"
				id="offcanvasYoutubeQueue"
				aria-labelledby="offcanvasYoutubeQueue"
				tabIndex="-1"
				style={{
					width:
						windowWidth < 500
							? "100vw"
							: `${Math.min(offcanvasWidth, windowWidth)}px`,
					maxWidth: "100vw",
					transition: isDragging
						? "none"
						: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
					overflow: "visible",
				}}
			>
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

				<div
					className="offcanvas-body d-flex flex-column p-3"
					style={{ height: "calc(100% - 56px)", overflow: "hidden" }}
				>
					<div
						id="youtube_video_queue"
						className="d-flex flex-column h-100"
						style={{ minHeight: 0 }}
					>
						<div className="flex-shrink-0">
							{loading === false &&
							(videoItems.length > 0 || currentQueue.length > 0) ? (
								<div className={styles.playerWrapper}>
									<YoutubePlayer
										className="ratio ratio-16x9 mb-2"
										firstVideoId={
											initialVideoIdRef.current || videoItems[0]?.video?.id
										}
										autoPlay={autoPlay}
										onReady={onReady}
										onStateChange={onStateChange}
										onError={onError}
									/>
								</div>
							) : null}

							{/* 플레이리스트 선택 & 컨트롤러 바 */}
							<div className={styles.controlBar}>
								<div className={styles.selectorGroup}>
									<PlaylistFilterDropdown
										toggleId="playlist-dropdown-toggle"
										className="flex-grow-1"
										selectedPlaylistId={selectedPlaylistId}
										onSelectPlaylist={setSelectedPlaylistId}
										selectedPlaylistInfo={selectedPlaylistInfo}
										totalCount={videoItems.length}
										untaggedCount={untaggedCount}
										playlists={playlists}
										getPlaylistCount={getPlaylistCount}
										hasStarted={hasStarted}
										playingPlaylistId={playingPlaylistId}
										isPlaying={isPlaying}
									/>
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

								{loading === false &&
								(videoItems.length > 0 || currentQueue.length > 0) ? (
									<div className={styles.controllerWrapper}>
										<Controller
											isPlaying={isPlaying}
											autoPlay={autoPlay}
											player={player}
											onNextPlay={handleNextPlay}
											onPreviousPlay={handlePreviousPlay}
											onRandomPlay={() => setIsRandom(!isRandom)}
											isRandom={isRandom}
											onRepeatOnePlay={() => setIsRepeatOne(!isRepeatOne)}
											isRepeatOne={isRepeatOne}
										/>
									</div>
								) : null}
							</div>

							{/* 다른 플레이리스트 탐색 중일 때 현재 재생 중인 플레이리스트 안내 및 원클릭 복귀 바 */}
							{hasStarted &&
								String(selectedPlaylistId) !== String(playingPlaylistId) && (
									<div className={styles.returnBanner}>
										<div className={styles.returnBannerLeft}>
											<EqualizerIcon isPlaying={isPlaying} height="12px" />
											<span className={styles.returnLabel}>
												{isPlaying ? "재생 중" : "일시정지"}
											</span>
											<span className={styles.returnDivider} />
											<span
												className={styles.returnPlaylistName}
												title={playingPlaylistInfo.name}
											>
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

						<YoutubeQueueList
							displayedVideoItems={displayedVideoItems}
							totalVideoCount={videoItems.length}
							selectedPlaylistId={selectedPlaylistId}
							onResetToAll={() => setSelectedPlaylistId(PLAYLIST_FILTER.ALL)}
							currentVideoIndex={currentVideoIndex}
							effectivePlayingVideoId={effectivePlayingVideoId}
							onSelectVideo={handleSelectVideo}
							onOpenTagModal={setSelectedVideoForTag}
						/>
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
						setSelectedPlaylistId(PLAYLIST_FILTER.ALL);
					}
					if (Number(playingPlaylistId) === Number(deletedId)) {
						setPlayingPlaylistId(PLAYLIST_FILTER.ALL);
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
