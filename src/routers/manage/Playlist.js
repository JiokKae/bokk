import { useMutation, useQuery } from "@apollo/client";
import { useMemo, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import PlaylistFilterDropdown from "../../components/Header/SearchSelector/YoutubeOffcanvas/PlaylistFilterDropdown";
import PlaylistManageModal from "../../components/Header/SearchSelector/YoutubeOffcanvas/PlaylistManageModal";
import VideoPlaylistTagModal from "../../components/Header/SearchSelector/YoutubeOffcanvas/VideoPlaylistTagModal";
import YoutubeVideoAdder from "../../components/Header/SearchSelector/YoutubeOffcanvas/YoutubeVideoAdder";
import {
	DELETE_VIDEO_ITEM,
	MY_PLAYLISTS,
	MY_VIDEO_ITEMS,
} from "../../constants/querys";
import usePlaylistFilter, { PLAYLIST_FILTER } from "../../hooks/usePlaylistFilter";
import {
	RESOLUTION,
	handleYoutubeThumbnailError,
	handleYoutubeThumbnailLoad,
	secondToDate,
	thumbnailUrl,
} from "../../utils/youtubeUtil";

function VideoItem({
	itemId,
	youtubeId,
	title,
	length,
	playlists = [],
	onOpenTagModal,
}) {
	const [deleteVideoItem] = useMutation(DELETE_VIDEO_ITEM, {
		onCompleted: ({ deleteVideoItem }) => {
			if (deleteVideoItem === false) {
				alert("영상을 제거하는데 실패했습니다.");
				return;
			}
		},
		refetchQueries: [{ query: MY_VIDEO_ITEMS }, { query: MY_PLAYLISTS }],
	});

	const onClickDelete = () => {
		if (window.confirm("영상을 재생 목록에서 제거하시겠습니까?") === false) {
			return;
		}
		deleteVideoItem({ variables: { itemId } });
	};

	return (
		<div className="list-group-item py-2">
			<div className="row align-items-center flex-nowrap">
				<div className="col-auto flex-shrink-0">
					<div
						style={{
							width: "104px",
							height: "58px",
							borderRadius: "6px",
							overflow: "hidden",
							backgroundColor: "#000",
							border: "1px solid rgba(0, 0, 0, 0.08)",
							boxShadow: "0 1px 3px rgba(0, 0, 0, 0.06)",
						}}
					>
						<img
							className="w-100 h-100"
							src={thumbnailUrl(youtubeId, RESOLUTION.MQ)}
							alt={title}
							loading="lazy"
							style={{
								objectFit: "cover",
								transform: "translateZ(0)",
								backfaceVisibility: "hidden",
							}}
							onLoad={(e) => handleYoutubeThumbnailLoad(e, youtubeId)}
							onError={(e) => handleYoutubeThumbnailError(e, youtubeId)}
						/>
					</div>
				</div>
				<div className="col" style={{ minWidth: 0 }}>
					<p className="mb-1 text-truncate fw-medium" title={title}>
						{title}
					</p>
					<div className="d-flex align-items-center gap-2 flex-wrap">
						<small className="text-muted">{secondToDate(length)}</small>
						<button
							type="button"
							className={`btn btn-sm py-0 px-1.5 border ${
								playlists.length > 0 ? "text-primary fw-medium" : "text-muted"
							}`}
							style={{
								fontSize: "11px",
								borderRadius: "4px",
								backgroundColor: playlists.length > 0 ? "#e7f5ff" : "#f8f9fa",
								borderColor: playlists.length > 0 ? "#d0ebff" : "#dee2e6",
							}}
							title="플레이리스트에 담기 / 변경"
							onClick={onOpenTagModal}
						>
							{playlists.length > 0 ? `담김 ${playlists.length}` : "+ 담기"}
						</button>
					</div>
					{playlists.length > 0 && (
						<div className="d-flex flex-wrap gap-1 mt-1">
							{playlists.map((p) => (
								<span
									key={p.id}
									className="badge bg-light text-secondary border"
									style={{ fontSize: "11px", fontWeight: "normal" }}
								>
									#{p.name}
								</span>
							))}
						</div>
					)}
				</div>
				<div className="col-auto">
					<button
						type="button"
						onClick={onClickDelete}
						title="영상 삭제"
						aria-label="영상 삭제"
						className="inline-flex size-7 cursor-pointer items-center justify-center rounded-md border-0 bg-transparent text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-500"
					>
						<X className="size-4" />
					</button>
				</div>
			</div>
		</div>
	);
}

export default function Playlist() {
	const { data: videoData } = useQuery(MY_VIDEO_ITEMS);
	const { data: playlistData } = useQuery(MY_PLAYLISTS);

	const videoItems = useMemo(
		() => videoData?.myVideoItems || [],
		[videoData]
	);
	const playlists = useMemo(
		() => playlistData?.myPlaylists || [],
		[playlistData]
	);

	const {
		selectedPlaylistId,
		setSelectedPlaylistId,
		displayedVideoItems,
		untaggedCount,
		getPlaylistCount,
		selectedPlaylistInfo,
	} = usePlaylistFilter(videoItems, playlists);
	const [showPlaylistManageModal, setShowPlaylistManageModal] = useState(false);
	const [selectedVideoForTag, setSelectedVideoForTag] = useState(null);

	return (
		<>
			<div className="d-flex align-items-center justify-content-between mb-3">
				<h4 className="mb-0 fw-bold">재생 목록 관리</h4>
				<Button
					variant="outline"
					size="sm"
					className="border-bokk-border text-bokk-dark hover:bg-bokk-subtle"
					onClick={() => setShowPlaylistManageModal(true)}
				>
					⚙️ 플레이리스트 관리
				</Button>
			</div>

			<YoutubeVideoAdder />

			{/* 플레이리스트 필터 셀렉터 */}
			<div className="d-flex align-items-center gap-2 mb-3">
				<PlaylistFilterDropdown
					toggleId="manage-playlist-dropdown"
					className="w-100"
					selectedPlaylistId={selectedPlaylistId}
					onSelectPlaylist={setSelectedPlaylistId}
					selectedPlaylistInfo={selectedPlaylistInfo}
					totalCount={videoItems.length}
					untaggedCount={untaggedCount}
					playlists={playlists}
					getPlaylistCount={getPlaylistCount}
				/>
			</div>

			<div className="list-group">
				{displayedVideoItems.length === 0 ? (
					<div className="text-center text-muted py-5 border rounded">
						<div className="fs-3 mb-2">📭</div>
						<p className="mb-1">
							{selectedPlaylistId === PLAYLIST_FILTER.UNTAGGED
								? "미분류 영상이 없습니다."
								: "선택한 플레이리스트에 등록된 영상이 없습니다."}
						</p>
					</div>
				) : (
					displayedVideoItems.map((item) => (
						<VideoItem
							key={item.id}
							itemId={item.id}
							youtubeId={item.video.id}
							title={item.video.title}
							length={item.video.length}
							playlists={item.playlists || []}
							onOpenTagModal={() => setSelectedVideoForTag(item)}
						/>
					))
				)}
			</div>

			<PlaylistManageModal
				show={showPlaylistManageModal}
				onHide={() => setShowPlaylistManageModal(false)}
				playlists={playlists}
				videoItems={videoItems}
				onDeletePlaylist={(deletedId) => {
					if (Number(selectedPlaylistId) === Number(deletedId)) {
						setSelectedPlaylistId("ALL");
					}
				}}
			/>

			<VideoPlaylistTagModal
				show={Boolean(selectedVideoForTag)}
				onHide={() => setSelectedVideoForTag(null)}
				videoItem={selectedVideoForTag}
				playlists={playlists}
				videoItems={videoItems}
			/>
		</>
	);
}
