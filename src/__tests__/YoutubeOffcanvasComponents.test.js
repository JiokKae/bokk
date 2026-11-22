import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import YoutubeHeaderTrigger from "../components/Header/SearchSelector/YoutubeOffcanvas/YoutubeHeaderTrigger";
import YoutubeQueueList from "../components/Header/SearchSelector/YoutubeOffcanvas/YoutubeQueueList";
import { PLAYLIST_FILTER } from "../utils/playlistUtil";

describe("YoutubeHeaderTrigger", () => {
	it("shows playing ticker when playing with title", () => {
		render(
			<YoutubeHeaderTrigger
				isPlaying
				autoPlay={false}
				hasStarted
				currentTitle="테스트 노래"
				playingPlaylistName="노동요"
			/>
		);

		expect(
			screen.getByTitle("재생 중: [노동요] 테스트 노래")
		).toBeInTheDocument();
		expect(screen.getByText(/테스트 노래/)).toBeInTheDocument();
	});

	it("shows autoPlay notice when autoPlay is enabled before playback starts", () => {
		render(
			<YoutubeHeaderTrigger
				isPlaying={false}
				autoPlay
				hasStarted={false}
				currentTitle=""
				playingPlaylistName="전체"
			/>
		);

		expect(screen.getByText("조작 시 자동 재생")).toBeInTheDocument();
	});
});

describe("YoutubeQueueList", () => {
	it("renders empty custom playlist state and triggers onResetToAll", () => {
		const onResetToAll = vi.fn();
		render(
			<YoutubeQueueList
				displayedVideoItems={[]}
				totalVideoCount={3}
				selectedPlaylistId={1}
				onResetToAll={onResetToAll}
				currentVideoIndex={0}
				effectivePlayingVideoId=""
				onSelectVideo={vi.fn()}
				onOpenTagModal={vi.fn()}
			/>
		);

		expect(
			screen.getByText("이 플레이리스트에 담긴 영상이 없습니다.")
		).toBeInTheDocument();
		fireEvent.click(screen.getByText("전체 목록에서 곡 담으러 가기 ➔"));
		expect(onResetToAll).toHaveBeenCalledTimes(1);
	});

	it("renders video items and triggers selection and tag modal callbacks", () => {
		const onSelectVideo = vi.fn();
		const onOpenTagModal = vi.fn();
		const items = [
			{
				id: 10,
				video: { id: "dQw4w9WgXcQ", title: "샘플 영상", length: 212 },
				playlists: [{ id: 1, name: "노동요" }],
			},
		];

		render(
			<YoutubeQueueList
				displayedVideoItems={items}
				totalVideoCount={1}
				selectedPlaylistId={PLAYLIST_FILTER.ALL}
				onResetToAll={vi.fn()}
				currentVideoIndex={0}
				effectivePlayingVideoId="dQw4w9WgXcQ"
				onSelectVideo={onSelectVideo}
				onOpenTagModal={onOpenTagModal}
			/>
		);

		expect(screen.getByText("샘플 영상")).toBeInTheDocument();
		fireEvent.click(screen.getByText("담김 1"));
		expect(onOpenTagModal).toHaveBeenCalledWith(items[0]);
		expect(onSelectVideo).not.toHaveBeenCalled();

		fireEvent.click(screen.getByText("샘플 영상"));
		expect(onSelectVideo).toHaveBeenCalledWith(items[0], 0);
	});
});
