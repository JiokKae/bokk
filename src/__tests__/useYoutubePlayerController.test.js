import { act, renderHook } from "@testing-library/react";
import { PLAYLIST_FILTER } from "../hooks/usePlaylistFilter";
import useYoutubePlayerController from "../hooks/useYoutubePlayerController";

vi.mock("react-youtube", () => ({
	default: {
		PlayerState: {
			ENDED: 0,
			PLAYING: 1,
			PAUSED: 2,
		},
	},
}));

const sampleVideos = [
	{ id: 1, video: { id: "vidA", title: "Track A" }, playlistIds: [10] },
	{ id: 2, video: { id: "vidB", title: "Track B" }, playlistIds: [10] },
	{ id: 3, video: { id: "vidC", title: "Track C" }, playlistIds: [] },
];

const samplePlaylists = [{ id: 10, name: "Chill" }];

describe("useYoutubePlayerController", () => {
	test("selects video, navigates next/previous with wrap-around, and calls player API", () => {
		const setSelectedPlaylistId = vi.fn();
		const mockPlayer = {
			loadVideoById: vi.fn(),
			playVideo: vi.fn(),
		};

		const { result } = renderHook(() =>
			useYoutubePlayerController({
				videoItems: sampleVideos,
				playlists: samplePlaylists,
				autoPlay: false,
				selectedPlaylistId: PLAYLIST_FILTER.ALL,
				setSelectedPlaylistId,
				displayedVideoItems: sampleVideos,
			})
		);

		act(() => {
			result.current.onReady({ target: mockPlayer });
		});

		act(() => {
			result.current.handleSelectVideo(sampleVideos[0], 0);
		});
		expect(result.current.effectivePlayingVideoId).toBe("vidA");
		expect(result.current.currentTitle).toBe("Track A");
		expect(mockPlayer.loadVideoById).toHaveBeenCalledWith({ videoId: "vidA" });

		act(() => {
			result.current.handleNextPlay();
		});
		expect(result.current.effectivePlayingVideoId).toBe("vidB");

		act(() => {
			result.current.handlePreviousPlay();
		});
		expect(result.current.effectivePlayingVideoId).toBe("vidA");

		act(() => {
			result.current.handlePreviousPlay();
		});
		expect(result.current.effectivePlayingVideoId).toBe("vidC");
	});

	test("handles PLAYING and ENDED state transitions including repeat-one mode", () => {
		const mockPlayer = {
			loadVideoById: vi.fn(),
			playVideo: vi.fn(),
		};

		const { result } = renderHook(() =>
			useYoutubePlayerController({
				videoItems: sampleVideos,
				playlists: samplePlaylists,
				autoPlay: false,
				selectedPlaylistId: PLAYLIST_FILTER.ALL,
				setSelectedPlaylistId: vi.fn(),
				displayedVideoItems: sampleVideos,
			})
		);

		act(() => {
			result.current.onReady({ target: mockPlayer });
			result.current.onStateChange({ data: 1 }); // PLAYING
		});
		expect(result.current.isPlaying).toBe(true);
		expect(result.current.hasStarted).toBe(true);

		act(() => {
			result.current.setIsRepeatOne(true);
		});
		act(() => {
			result.current.onStateChange({ data: 0 }); // ENDED -> stays on index 0
		});
		expect(result.current.effectivePlayingVideoId).toBe("vidA");

		act(() => {
			result.current.setIsRepeatOne(false);
		});
		act(() => {
			result.current.onStateChange({ data: 0 }); // ENDED -> advances to index 1
		});
		expect(result.current.effectivePlayingVideoId).toBe("vidB");
	});

	test("resets playingPlaylistId to ALL if the active playlist is removed", () => {
		const { result, rerender } = renderHook(
			({ playlists }) =>
				useYoutubePlayerController({
					videoItems: sampleVideos,
					playlists,
					autoPlay: false,
					selectedPlaylistId: 10,
					setSelectedPlaylistId: vi.fn(),
					displayedVideoItems: sampleVideos.slice(0, 2),
				}),
			{ initialProps: { playlists: samplePlaylists } }
		);

		act(() => {
			result.current.handleSelectVideo(sampleVideos[0], 0);
		});
		expect(result.current.playingPlaylistId).toBe(10);

		rerender({ playlists: [] });
		expect(result.current.playingPlaylistId).toBe(PLAYLIST_FILTER.ALL);
	});
});
