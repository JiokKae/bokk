import { useQuery } from "@apollo/client";
import { useState } from "react";
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
			setAutoPlay(data.me.config.videoAutoPlay);
		},
	});
	useQuery(MY_VIDEO_ITEMS, {
		onCompleted: (data) => {
			setVideoItems(data.myVideoItems);
			setRandomIndexes(
				shuffle(data.myVideoItems.map((_, index) => index))
			);
		},
	});

	const [autoPlay, setAutoPlay] = useState(false);
	const [videoItems, setVideoItems] = useState([]);
	const [randomIndexes, setRandomIndexes] = useState([]);
	const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
	const [isPlaying, setIsPlaying] = useState(false);
	const [isRandom, setIsRandom] = useState(false);
	const [player, setPlayer] = useState(null);

	function onReady(event) {
		setPlayer(event.target);
	}

	function playVideo(index) {
		setCurrentVideoIndex(index);
		player.loadVideoById({ videoId: videoItems[index].video.id });
		player.playVideo();
		document.getElementById("scroll_queue").scrollTop =
			getVideoItem(index).offsetTop -
			document.getElementById("scroll_queue").offsetTop;
	}

	function onStateChange(event) {
		if (event.data == YouTube.PlayerState.ENDED) {
			setIsPlaying(!isPlaying);
			playVideo(getNextVideoIndex(currentVideoIndex));
		}
		if (
			event.data == YouTube.PlayerState.PLAYING ||
			event.data == YouTube.PlayerState.PAUSED
		) {
			setIsPlaying(!isPlaying);
		}
	}
	function getRelativeVideoIndex(currentIndex, changeValue) {
		function mod(n, m) {
			return ((n % m) + m) % m;
		}
		if (isRandom == true) {
			return randomIndexes[
				mod(
					randomIndexes.findIndex((item) => item == currentIndex) +
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

	return (
		<>
			<a
				data-bs-toggle="offcanvas"
				href="#offcanvasYoutubeQueue"
				role="button"
				aria-controls="offcanvasYoutubeQueue">
				<img
					src="https://jiokkae.com/볶음밥/img/YouTube-icon.png"
					alt="유튜브 재생 목록"
				/>
			</a>
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
