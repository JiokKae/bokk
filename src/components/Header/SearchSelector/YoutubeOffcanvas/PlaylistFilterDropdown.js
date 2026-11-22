import { Dropdown } from "react-bootstrap";
import { PLAYLIST_FILTER } from "../../../../utils/playlistUtil";
import EqualizerIcon from "./EqualizerIcon";
import styles from "./YoutubeOffcanvas.module.css";

function PlaylistDropdownOption({
	label,
	count,
	isSelected,
	isPlayingThis = false,
	isPlaying = false,
	onClick,
}) {
	return (
		<Dropdown.Item
			as="button"
			type="button"
			className={`d-flex align-items-center justify-content-between ${styles.dropdownItem} ${
				isPlayingThis ? styles.playingItem : ""
			}`}
			style={{
				fontWeight: isSelected ? "700" : undefined,
			}}
			onClick={onClick}
		>
			<div
				className="d-flex align-items-center text-truncate me-2"
				style={{ minWidth: 0 }}
			>
				{isSelected && (
					<span
						className="text-primary me-2 fw-bold"
						style={{ fontSize: "12px" }}
					>
						✓
					</span>
				)}
				<span className="text-truncate">{label}</span>
			</div>
			<div className="d-flex align-items-center gap-2 flex-shrink-0">
				{isPlayingThis && (
					<EqualizerIcon
						isPlaying={isPlaying}
						height="11px"
						title={isPlaying ? "재생 중" : "일시정지됨"}
					/>
				)}
				<span
					className={`badge rounded-pill flex-shrink-0 ${
						isPlayingThis
							? "bg-primary-subtle text-primary border-primary-subtle"
							: "bg-light text-secondary border"
					}`}
					style={{ fontSize: "11px" }}
				>
					{count}
				</span>
			</div>
		</Dropdown.Item>
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
	const isSelectedPlaying =
		hasStarted &&
		playingPlaylistId !== null &&
		String(selectedPlaylistId) === String(playingPlaylistId);

	return (
		<Dropdown className={className} style={{ minWidth: 0 }}>
			<Dropdown.Toggle
				variant="light"
				id={toggleId}
				className={`w-100 d-flex align-items-center justify-content-between text-start fw-medium shadow-none ${styles.playlistDropdownToggle}`}
			>
				<span className="text-truncate me-2">{selectedPlaylistInfo.name}</span>
				<div className="d-flex align-items-center gap-1.5 ms-auto me-1 flex-shrink-0">
					{isSelectedPlaying && (
						<EqualizerIcon
							isPlaying={isPlaying}
							height="11px"
							className="me-1"
							title={isPlaying ? "재생 중" : "일시정지됨"}
						/>
					)}
					<span
						className={`badge rounded-pill flex-shrink-0 ${
							isSelectedPlaying
								? "bg-primary-subtle text-primary border-primary-subtle"
								: "bg-light text-secondary border"
						}`}
						style={{ fontSize: "11px", fontWeight: 500 }}
					>
						{selectedPlaylistInfo.count}
					</span>
				</div>
			</Dropdown.Toggle>

			<Dropdown.Menu className={`w-100 ${styles.playlistDropdownMenu}`}>
				<PlaylistDropdownOption
					label="전체"
					count={totalCount}
					isSelected={selectedPlaylistId === PLAYLIST_FILTER.ALL}
					isPlayingThis={
						hasStarted && playingPlaylistId === PLAYLIST_FILTER.ALL
					}
					isPlaying={isPlaying}
					onClick={() => onSelectPlaylist(PLAYLIST_FILTER.ALL)}
				/>
				<PlaylistDropdownOption
					label="미분류"
					count={untaggedCount}
					isSelected={selectedPlaylistId === PLAYLIST_FILTER.UNTAGGED}
					isPlayingThis={
						hasStarted && playingPlaylistId === PLAYLIST_FILTER.UNTAGGED
					}
					isPlaying={isPlaying}
					onClick={() => onSelectPlaylist(PLAYLIST_FILTER.UNTAGGED)}
				/>

				{playlists.length > 0 && <Dropdown.Divider className="my-1" />}

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
						onClick={() => onSelectPlaylist(pl.id)}
					/>
				))}
			</Dropdown.Menu>
		</Dropdown>
	);
}
