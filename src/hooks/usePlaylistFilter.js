import { useCallback, useEffect, useMemo, useState } from "react";
import {
	PLAYLIST_FILTER,
	filterVideosByPlaylist,
	getPlaylistVideoCount,
	getUntaggedVideoCount,
	resolvePlaylistMeta,
} from "../utils/playlistUtil";

export { PLAYLIST_FILTER };

export default function usePlaylistFilter(videoItems = [], playlists = []) {
	const [selectedPlaylistId, setSelectedPlaylistId] = useState(
		PLAYLIST_FILTER.ALL
	);

	const displayedVideoItems = useMemo(
		() => filterVideosByPlaylist(videoItems, playlists, selectedPlaylistId),
		[videoItems, playlists, selectedPlaylistId]
	);

	// 현재 선택된 플레이리스트가 삭제되어 목록에 없으면 자동으로 '전체'로 복구
	useEffect(() => {
		if (
			selectedPlaylistId === PLAYLIST_FILTER.ALL ||
			selectedPlaylistId === PLAYLIST_FILTER.UNTAGGED
		) {
			return;
		}
		const targetId = Number(selectedPlaylistId);
		const exists = playlists.some((p) => p.id === targetId);
		if (!exists) {
			setSelectedPlaylistId(PLAYLIST_FILTER.ALL);
		}
	}, [playlists, selectedPlaylistId]);

	const untaggedCount = useMemo(
		() => getUntaggedVideoCount(videoItems),
		[videoItems]
	);

	const getPlaylistCount = useCallback(
		(playlistId) => getPlaylistVideoCount(videoItems, playlistId),
		[videoItems]
	);

	const selectedPlaylistInfo = useMemo(
		() => resolvePlaylistMeta(selectedPlaylistId, videoItems, playlists),
		[selectedPlaylistId, videoItems, playlists]
	);

	return {
		selectedPlaylistId,
		setSelectedPlaylistId,
		displayedVideoItems,
		untaggedCount,
		getPlaylistCount,
		selectedPlaylistInfo,
	};
}
