import { useQuery } from "@apollo/client";
import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ME, MY_PLAYLISTS, MY_VIDEO_ITEMS } from "../../../../constants/querys";
import useOffcanvasResizer from "../../../../hooks/useOffcanvasResizer";
import usePlaylistFilter, { PLAYLIST_FILTER } from "../../../../hooks/usePlaylistFilter";
import useYoutubePlayerController from "../../../../hooks/useYoutubePlayerController";
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

	const [isOpen, setIsOpen] = useState(false);
	const [showPlaylistManageModal, setShowPlaylistManageModal] = useState(false);
	const [selectedVideoForTag, setSelectedVideoForTag] = useState(null);

	const {
		playingPlaylistId,
		setPlayingPlaylistId,
		playingPlaylistInfo,
		currentVideoIndex,
		isPlaying,
		isRandom,
		setIsRandom,
		isRepeatOne,
		setIsRepeatOne,
		hasStarted,
		player,
		initialVideoId,
		currentQueue,
		effectivePlayingVideoId,
		currentTitle,
		onReady,
		onStateChange,
		onError,
		handleNextPlay,
		handlePreviousPlay,
		handleSelectVideo,
	} = useYoutubePlayerController({
		videoItems,
		playlists,
		autoPlay,
		selectedPlaylistId,
		setSelectedPlaylistId,
		displayedVideoItems,
	});

	// Escape 키로 오프캔버스 닫기 (하위 모달이 열려 있을 때는 모달이 먼저 처리)
	useEffect(() => {
		if (!isOpen) return;

		const prevOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";

		const handleKeyDown = (e) => {
			if (
				e.key === "Escape" &&
				!showPlaylistManageModal &&
				!selectedVideoForTag
			) {
				setIsOpen(false);
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		return () => {
			document.body.style.overflow = prevOverflow;
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [isOpen, showPlaylistManageModal, selectedVideoForTag]);

	return (
		<>
			<YoutubeHeaderTrigger
				isPlaying={isPlaying}
				autoPlay={autoPlay}
				hasStarted={hasStarted}
				currentTitle={currentTitle}
				playingPlaylistName={playingPlaylistInfo.name}
				onOpen={() => setIsOpen(true)}
			/>

			{/* 백드롭 */}
			<div
				aria-hidden={!isOpen}
				onClick={() => setIsOpen(false)}
				className={`fixed inset-0 z-[1040] bg-black/45 transition-opacity duration-300 ${
					isOpen
						? "pointer-events-auto opacity-100"
						: "pointer-events-none opacity-0"
				}`}
			/>

			<div
				className={`fixed top-0 right-0 bottom-0 z-[1045] flex flex-col border-0 border-l border-solid border-zinc-200 bg-white shadow-2xl ${
					isOpen ? "translate-x-0" : "translate-x-full pointer-events-none"
				}`}
				id="offcanvasYoutubeQueue"
				role="dialog"
				aria-modal={isOpen}
				aria-hidden={!isOpen}
				aria-labelledby="offcanvasYoutubeQueueTitle"
				tabIndex="-1"
				style={{
					width:
						windowWidth < 500
							? "100vw"
							: `${Math.min(offcanvasWidth, windowWidth)}px`,
					maxWidth: "100vw",
					transition: isDragging
						? "none"
						: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
					overflow: "visible",
				}}
			>
				{isOpen && canExpand && (
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

				<div className="flex h-14 shrink-0 items-center justify-between border-0 border-b border-solid border-zinc-200 bg-white px-4">
					<h5
						className="m-0 text-base font-bold text-zinc-900"
						id="offcanvasYoutubeQueueTitle"
					>
						유튜브 재생 목록
					</h5>
					<button
						type="button"
						onClick={() => setIsOpen(false)}
						aria-label="닫기"
						className="ml-auto inline-flex size-8 cursor-pointer items-center justify-center rounded-md border-0 bg-transparent text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
					>
						<X className="size-4" />
					</button>
				</div>

				<div
					className="flex flex-1 flex-col overflow-hidden p-3.5"
					style={{ minHeight: 0 }}
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
											initialVideoId || videoItems[0]?.video?.id
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
										variant="outline"
										size="sm"
										className="h-[38px] shrink-0 rounded-lg px-2.5 text-[12.5px] whitespace-nowrap"
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
