export const PLAYLIST_FILTER = {
	ALL: "ALL",
	UNTAGGED: "UNTAGGED",
};

export function isUntaggedVideo(item) {
	return !item?.playlists || item.playlists.length === 0;
}

export function getUntaggedVideoCount(videoItems = []) {
	return videoItems.filter(isUntaggedVideo).length;
}

export function getPlaylistVideoCount(videoItems = [], playlistId) {
	const targetId = Number(playlistId);
	return videoItems.filter(
		(item) => item.playlists && item.playlists.some((p) => p.id === targetId)
	).length;
}

export function filterVideosByPlaylist(
	videoItems = [],
	playlists = [],
	selectedPlaylistId = PLAYLIST_FILTER.ALL
) {
	if (selectedPlaylistId === PLAYLIST_FILTER.ALL) {
		return videoItems;
	}
	if (selectedPlaylistId === PLAYLIST_FILTER.UNTAGGED) {
		return videoItems.filter(isUntaggedVideo);
	}
	const targetId = Number(selectedPlaylistId);
	const exists = playlists.some((p) => p.id === targetId);
	if (!exists) {
		return videoItems;
	}
	return videoItems.filter(
		(item) => item.playlists && item.playlists.some((p) => p.id === targetId)
	);
}

export function resolvePlaylistMeta(
	playlistId,
	videoItems = [],
	playlists = []
) {
	if (playlistId === PLAYLIST_FILTER.ALL) {
		return { id: PLAYLIST_FILTER.ALL, name: "전체", count: videoItems.length };
	}
	if (playlistId === PLAYLIST_FILTER.UNTAGGED) {
		return {
			id: PLAYLIST_FILTER.UNTAGGED,
			name: "미분류",
			count: getUntaggedVideoCount(videoItems),
		};
	}
	const targetId = Number(playlistId);
	const pl = playlists.find((p) => p.id === targetId);
	if (pl) {
		return {
			id: targetId,
			name: pl.name,
			count: getPlaylistVideoCount(videoItems, targetId),
		};
	}
	return { id: PLAYLIST_FILTER.ALL, name: "전체", count: videoItems.length };
}
