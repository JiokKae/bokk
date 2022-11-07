import { useQuery } from "@apollo/client";
import { useState } from "react";
import { CloseButton } from "react-bootstrap";
import YouTube from "react-youtube";
import { ME, OWN_YOUTUBE_VIDEOS } from "../../../../querys";
import Controller from "./Controller";
import YoutubePlayer from "./YoutubePlayer";
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
	useQuery(ME, {
		onCompleted: (data) => {
			if (data?.me?.config.videoAutoPlay) {
				setAutoPlay(true);
			}
		},
	});
	const { data } = useQuery(OWN_YOUTUBE_VIDEOS, {
		onCompleted: (data) => {
			setVideos(data?.ownYoutubeVideos);
			setRandomIndexes(
				shuffle(data?.ownYoutubeVideos.map((_, index) => index))
			);
		},
	});

	const [autoPlay, setAutoPlay] = useState(false);
	const [videos, setVideos] = useState([]);
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
		player.loadVideoById({ videoId: videos[index].id });
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
						{videos.length > 0 ? (
							<>
								<YoutubePlayer
									className="ratio ratio-16x9 mb-2"
									firstVideoId={videos[0].id}
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

						{/*TODO: API 추가 */}
						<form
							method="post"
							action="/볶음밥/youtube_process.php">
							<div className="input-group mb-2">
								<input
									type="url"
									className="form-control"
									name="add_address"
									placeholder="https://youtu.be/example"
									required
								/>
								<input
									type="submit"
									className="btn btn-outline-secondary"
									value="추가"
								/>
							</div>
						</form>
						<div
							id="scroll_queue"
							className="overflow-auto"
							style={{ height: "400px" }}>
							<div className="list-group">
								{data?.ownYoutubeVideos?.map(
									({ id, title, length }, index) => (
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
