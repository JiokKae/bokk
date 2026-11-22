import { useEffect, useMemo, useRef, useState } from "react";
import YouTube from "react-youtube";
import { PLAYLIST_FILTER } from "./usePlaylistFilter";
import { resolvePlaylistMeta } from "../utils/playlistUtil";

function shuffle(array) {
	let m = array.length;
	while (m) {
		const i = Math.floor(Math.random() * m--);
		const t = array[m];
		array[m] = array[i];
		array[i] = t;
	}
	return array;
}

export default function useYoutubePlayerController({
	videoItems,
	playlists,
	autoPlay,
	selectedPlaylistId,
	setSelectedPlaylistId,
	displayedVideoItems,
}) {
	const [playingPlaylistId, setPlayingPlaylistId] = useState(
		PLAYLIST_FILTER.ALL
	);
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
		window.addEventListener("touchstart", handleFirstInteraction, {
			once: true,
		});

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
					randomIndexes.findIndex((item) => item === currentIndex) +
						changeValue,
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

	return {
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
		initialVideoId: initialVideoIdRef.current,
		currentQueue,
		effectivePlayingVideoId,
		currentTitle,
		onReady,
		onStateChange,
		onError,
		handleNextPlay,
		handlePreviousPlay,
		handleSelectVideo,
	};
}
