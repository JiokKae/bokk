import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { PLAYLIST_FILTER } from "../../../../utils/playlistUtil";
import EqualizerIcon from "./EqualizerIcon";

function PlaylistDropdownOption({
	label,
	count,
	isSelected,
	isPlayingThis = false,
	isPlaying = false,
	onClick,
}) {
	return (
		<button
			type="button"
			className={cn(
				"flex w-full cursor-pointer items-center justify-between gap-2 border-0 bg-transparent px-3 py-2 text-left text-sm transition-colors",
				isPlayingThis
					? "bg-bokk-subtle/70 text-bokk-dark hover:bg-bokk-subtle"
					: "text-zinc-800 hover:bg-zinc-100",
				isSelected && "font-bold"
			)}
			onClick={onClick}
		>
			<div className="flex min-w-0 items-center gap-2">
				{isSelected && (
					<Check className="size-3.5 shrink-0 stroke-[2.5] text-bokk" />
				)}
				<span className="truncate">{label}</span>
			</div>
			<div className="flex shrink-0 items-center gap-2">
				{isPlayingThis && (
					<EqualizerIcon
						isPlaying={isPlaying}
						height="11px"
						title={isPlaying ? "재생 중" : "일시정지됨"}
					/>
				)}
				<Badge
					variant={isPlayingThis ? "subtle" : "secondary"}
					className="shrink-0"
				>
					{count}
				</Badge>
			</div>
		</button>
	);
}

export default function PlaylistFilterDropdown({
	toggleId = "playlist-dropdown-toggle",
	className = "flex-grow-1",
	selectedPlaylistId,
	onSelectPlaylist,
	selectedPlaylistInfo,
	totalCount,
	untaggedCount,
	playlists = [],
	getPlaylistCount,
	hasStarted = false,
	playingPlaylistId = null,
	isPlaying = false,
}) {
	const [open, setOpen] = useState(false);
	const containerRef = useRef(null);

	useEffect(() => {
		if (!open) return;

		const handleClickOutside = (e) => {
			if (containerRef.current && !containerRef.current.contains(e.target)) {
				setOpen(false);
			}
		};
		const handleKeyDown = (e) => {
			if (e.key === "Escape") {
				setOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		document.addEventListener("keydown", handleKeyDown);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [open]);

	const isSelectedPlaying =
		hasStarted &&
		playingPlaylistId !== null &&
		String(selectedPlaylistId) === String(playingPlaylistId);

	const handleSelect = (id) => {
		onSelectPlaylist(id);
		setOpen(false);
	};

	return (
		<div
			ref={containerRef}
			className={cn("relative min-w-0", className)}
		>
			<button
				type="button"
				id={toggleId}
				aria-expanded={open}
				aria-haspopup="listbox"
				onClick={() => setOpen((prev) => !prev)}
				className={cn(
					"flex h-[38px] w-full cursor-pointer items-center justify-between gap-2 rounded-lg border-[1px] border-solid bg-white px-3 text-left text-sm font-medium text-zinc-900 shadow-xs transition-colors",
					open
						? "border-bokk ring-2 ring-bokk/20"
						: "border-zinc-300 hover:border-zinc-400"
				)}
			>
				<span className="truncate">{selectedPlaylistInfo.name}</span>
				<div className="ml-auto flex shrink-0 items-center gap-1.5">
					{isSelectedPlaying && (
						<EqualizerIcon
							isPlaying={isPlaying}
							height="11px"
							title={isPlaying ? "재생 중" : "일시정지됨"}
						/>
					)}
					<Badge
						variant={isSelectedPlaying ? "subtle" : "secondary"}
						className="shrink-0"
					>
						{selectedPlaylistInfo.count}
					</Badge>
					<ChevronDown
						className={cn(
							"size-4 text-zinc-500 transition-transform duration-150",
							open && "rotate-180 text-bokk"
						)}
					/>
				</div>
			</button>

			{open && (
				<div
					role="listbox"
					className="absolute top-full right-0 left-0 z-[1060] mt-1.5 max-h-72 overflow-y-auto rounded-xl border-[1px] border-solid border-zinc-200 bg-white py-1 shadow-lg"
				>
					<PlaylistDropdownOption
						label="전체"
						count={totalCount}
						isSelected={selectedPlaylistId === PLAYLIST_FILTER.ALL}
						isPlayingThis={
							hasStarted && playingPlaylistId === PLAYLIST_FILTER.ALL
						}
						isPlaying={isPlaying}
						onClick={() => handleSelect(PLAYLIST_FILTER.ALL)}
					/>
					<PlaylistDropdownOption
						label="미분류"
						count={untaggedCount}
						isSelected={selectedPlaylistId === PLAYLIST_FILTER.UNTAGGED}
						isPlayingThis={
							hasStarted && playingPlaylistId === PLAYLIST_FILTER.UNTAGGED
						}
						isPlaying={isPlaying}
						onClick={() => handleSelect(PLAYLIST_FILTER.UNTAGGED)}
					/>

					{playlists.length > 0 && (
						<div className="my-1 border-0 border-t border-solid border-zinc-100" />
					)}

					{playlists.map((pl) => (
						<PlaylistDropdownOption
							key={pl.id}
							label={pl.name}
							count={getPlaylistCount(pl.id)}
							isSelected={String(selectedPlaylistId) === String(pl.id)}
							isPlayingThis={
								hasStarted &&
								playingPlaylistId !== null &&
								String(playingPlaylistId) === String(pl.id)
							}
							isPlaying={isPlaying}
							onClick={() => handleSelect(pl.id)}
						/>
					))}
				</div>
			)}
		</div>
	);
}
