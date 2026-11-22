import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import PlaylistFilterDropdown from "../components/Header/SearchSelector/YoutubeOffcanvas/PlaylistFilterDropdown";
import { PLAYLIST_FILTER } from "../utils/playlistUtil";

describe("PlaylistFilterDropdown", () => {
	const playlists = [
		{ id: 1, name: "노동요" },
		{ id: 2, name: "운동용" },
	];

	it("renders selected playlist name/count and triggers onSelectPlaylist on item click", async () => {
		const onSelect = vi.fn();
		render(
			<PlaylistFilterDropdown
				selectedPlaylistId={PLAYLIST_FILTER.ALL}
				onSelectPlaylist={onSelect}
				selectedPlaylistInfo={{ name: "전체", count: 5 }}
				totalCount={5}
				untaggedCount={2}
				playlists={playlists}
				getPlaylistCount={(id) => (id === 1 ? 3 : 1)}
				hasStarted
				playingPlaylistId={1}
				isPlaying
			/>
		);

		const toggle = screen.getByRole("button", { name: /전체/ });
		expect(toggle).toHaveTextContent("5");

		await act(async () => {
			fireEvent.click(toggle);
		});
		const targetItem = await screen.findByRole("button", { name: /노동요/ });
		await act(async () => {
			fireEvent.click(targetItem);
		});
		expect(onSelect).toHaveBeenCalledWith(1);
	});
});
