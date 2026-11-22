import { describe, expect, it } from "vitest";
import { GAME_SEARCH_PROVIDERS } from "../constants/gameSearchProviders";
import {
	PLAYLIST_FILTER,
	filterVideosByPlaylist,
	getPlaylistVideoCount,
	getUntaggedVideoCount,
	resolvePlaylistMeta,
} from "../utils/playlistUtil";
import {
	WEBLINK_GROUP_ID,
	formatWeblinkDynamicText,
	getResolvedWeblinkUrl,
	hasDynamicDateToken,
	isUntaggedWeblink,
	normalizeTargetGroupId,
	reorderWeblinksAcrossGroups,
} from "../utils/weblinkUtil";
import {
	extractYoutubeVideoId,
	secondToDate,
	thumbnailUrl,
} from "../utils/youtubeUtil";

describe("weblinkUtil", () => {
	it("normalizes target group IDs", () => {
		expect(normalizeTargetGroupId("untagged")).toBeNull();
		expect(normalizeTargetGroupId(-1)).toBeNull();
		expect(normalizeTargetGroupId(null)).toBeNull();
		expect(normalizeTargetGroupId("12")).toBe(12);
	});

	it("identifies untagged and orphaned weblinks", () => {
		const groups = [
			{ id: WEBLINK_GROUP_ID.BUILTIN, name: "bokk" },
			{ id: 1, name: "업무" },
			{ id: WEBLINK_GROUP_ID.UNTAGGED, name: "미분류" },
		];
		expect(isUntaggedWeblink({ id: 10, groupId: null }, groups)).toBe(true);
		expect(isUntaggedWeblink({ id: 11, groupId: 999 }, groups)).toBe(true);
		expect(isUntaggedWeblink({ id: 12, groupId: 1 }, groups)).toBe(false);
	});

	it("reorders weblinks within and across groups including empty groups", () => {
		const groups = [
			{ id: 1, name: "업무" },
			{ id: 2, name: "빈그룹" },
			{ id: -1, name: "미분류" },
		];
		const links = [
			{ id: 10, groupId: 1 },
			{ id: 11, groupId: 1 },
			{ id: 20, groupId: null },
		];

		const reordered = reorderWeblinksAcrossGroups(links, groups, 10, 1, 1);
		expect(reordered.map((w) => w.id)).toEqual([11, 10, 20]);

		const movedToEmpty = reorderWeblinksAcrossGroups(links, groups, 10, 2, null);
		expect(movedToEmpty.find((w) => w.id === 10).groupId).toBe(2);

		expect(reorderWeblinksAcrossGroups(links, groups, 20, "untagged", null)).toBeNull();
	});

	it("formats dynamic date tokens", () => {
		const fixedDate = new Date(2026, 10, 5);
		expect(hasDynamicDateToken("출석 {YYYY}-{MM}-{DD}")).toBe(true);
		expect(formatWeblinkDynamicText("{YYYY}/{YY}/{MM}/{M}/{DD}/{D}", fixedDate)).toBe(
			"2026/26/11/11/05/5"
		);
		expect(getResolvedWeblinkUrl("example.com/{YYYY}{MM}", fixedDate)).toBe(
			"https://example.com/202611"
		);
	});
});

describe("playlistUtil & youtubeUtil", () => {
	const playlists = [
		{ id: 1, name: "노동요" },
		{ id: 2, name: "잔잔한 곡" },
	];
	const videos = [
		{ id: 101, video: { id: "aaaaaaaaaaa" }, playlists: [{ id: 1, name: "노동요" }] },
		{ id: 102, video: { id: "bbbbbbbbbbb" }, playlists: [{ id: 1 }, { id: 2 }] },
		{ id: 103, video: { id: "ccccccccccc" }, playlists: [] },
	];

	it("filters videos and computes counts/metadata accurately", () => {
		expect(filterVideosByPlaylist(videos, playlists, PLAYLIST_FILTER.ALL)).toHaveLength(3);
		expect(filterVideosByPlaylist(videos, playlists, PLAYLIST_FILTER.UNTAGGED).map((v) => v.id)).toEqual([103]);
		expect(filterVideosByPlaylist(videos, playlists, 1).map((v) => v.id)).toEqual([101, 102]);
		expect(filterVideosByPlaylist(videos, playlists, 999)).toHaveLength(3);

		expect(getUntaggedVideoCount(videos)).toBe(1);
		expect(getPlaylistVideoCount(videos, 1)).toBe(2);
		expect(resolvePlaylistMeta(1, videos, playlists)).toEqual({ id: 1, name: "노동요", count: 2 });
	});

	it("parses YouTube video IDs and formats durations", () => {
		expect(extractYoutubeVideoId("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
		expect(extractYoutubeVideoId("https://youtu.be/dQw4w9WgXcQ?t=10")).toBe("dQw4w9WgXcQ");
		expect(extractYoutubeVideoId("https://www.youtube.com/shorts/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
		expect(extractYoutubeVideoId("https://example.com")).toBe("");
		expect(secondToDate(125)).toBe("02:05");
		expect(thumbnailUrl("dQw4w9WgXcQ", "mq")).toBe("https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg");
	});
});

describe("gameSearchProviders", () => {
	it("contains all 6 providers with valid profile URLs", () => {
		expect(GAME_SEARCH_PROVIDERS.map((p) => p.name)).toEqual([
			"opgg",
			"fowkr",
			"yourgg",
			"dakgg",
			"llchgg",
			"loawa",
		]);
		const byName = Object.fromEntries(GAME_SEARCH_PROVIDERS.map((p) => [p.name, p]));
		expect(byName.opgg.getProfileUrl("테스트 유저")).toContain("region=kr");
		expect(byName.loawa.getProfileUrl("핵폐기물")).toBe("https://loawa.com/char/핵폐기물");
	});
});
