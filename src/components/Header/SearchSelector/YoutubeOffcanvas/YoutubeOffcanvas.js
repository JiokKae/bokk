import { useQuery } from "@apollo/client";
import { useMemo, useState } from "react";
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
	const { data: meData, loading } = useQuery(ME, {
		onCompleted: (data) => {
			if (data?.me?.config) {
				setAutoPlay(data.me.config.videoAutoPlay);
			}
		},
	});
	const { data: myVideoData } = useQuery(MY_VIDEO_ITEMS);
	const videoItems = useMemo(
		() => myVideoData?.myVideoItems || [],
		[myVideoData]
	);

	const [autoPlay, setAutoPlay] = useState(false);
	const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
	const [isPlaying, setIsPlaying] = useState(false);
	const [isRandom, setIsRandom] = useState(false);
	const [isRepeatOne, setIsRepeatOne] = useState(false);
	const [player, setPlayer] = useState(null);

	const randomIndexes = useMemo(
		() => shuffle(videoItems.map((_, index) => index)),
		[videoItems]
	);

	function onReady(event) {
		setPlayer(event.target);
	}

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
					title={isPlaying && currentTitle ? `재생 중: ${currentTitle}` : "유튜브 재생 목록"}
					style={{
						maxWidth: isPlaying && currentTitle ? "min(200px, calc(100vw - 230px))" : "0px",
						opacity: isPlaying && currentTitle ? 1 : 0,
						marginRight: isPlaying && currentTitle ? "8px" : "0px",
						transformOrigin: "right center",
						transition: "max-width 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.35s ease, margin-right 0.4s ease",
						overflow: "hidden",
						whiteSpace: "nowrap",
						display: "inline-block",
						verticalAlign: "middle",
						pointerEvents: isPlaying && currentTitle ? "auto" : "none",
						userSelect: "none",
						minWidth: 0,
					}}
				>
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
				className="offcanvas offcanvas-end"
				id="offcanvasYoutubeQueue"
				aria-labelledby="offcanvasYoutubeQueue"
				tabIndex="-1"
				style={{ width: "500px" }}>
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
									autoPlay={meData.me.config.videoAutoPlay}
									onReady={onReady}
									onStateChange={onStateChange}
									onError={onError}
								/>
								<Controller
									isPlaying={isPlaying}
									autoPlay={autoPlay}
									setAutoPlay={setAutoPlay}
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
