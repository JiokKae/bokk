import { useMutation, useQuery } from "@apollo/client";
import { useMemo, useState } from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
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
	index,
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
		<div
			className={cn(
				"px-3.5 py-2.5 transition-colors hover:bg-zinc-50/70",
				index !== 0 && "border-0 border-t border-solid border-zinc-100"
			)}
		>
			<div className="flex flex-nowrap items-center gap-3">
				<div className="shrink-0">
					<div className="h-[58px] w-[104px] overflow-hidden rounded-md border-[1px] border-solid border-black/10 bg-black shadow-xs">
						<img
							className="h-full w-full object-cover"
							src={thumbnailUrl(youtubeId, RESOLUTION.MQ)}
							alt={title}
							loading="lazy"
							style={{
								transform: "translateZ(0)",
								backfaceVisibility: "hidden",
							}}
							onLoad={(e) => handleYoutubeThumbnailLoad(e, youtubeId)}
							onError={(e) => handleYoutubeThumbnailError(e, youtubeId)}
						/>
					</div>
				</div>

				<div className="min-w-0 flex-1">
					<p
						className="m-0 mb-1 truncate text-sm font-semibold text-zinc-900"
						title={title}
					>
						{title}
					</p>
					<div className="flex flex-wrap items-center gap-2">
						<span className="text-xs text-zinc-500">
							{secondToDate(length)}
						</span>
						<button
							type="button"
							className={cn(
								"inline-flex cursor-pointer items-center rounded border-[1px] border-solid px-1.5 py-0.5 text-[11px] transition-colors",
								playlists.length > 0
									? "border-bokk-border bg-bokk-subtle font-semibold text-bokk-dark hover:bg-bokk-border/40"
									: "border-zinc-200 bg-zinc-50 text-zinc-600 hover:bg-zinc-100"
							)}
							title="플레이리스트에 담기 / 변경"
							onClick={onOpenTagModal}
						>
							{playlists.length > 0 ? `담김 ${playlists.length}` : "+ 담기"}
						</button>
					</div>
					{playlists.length > 0 && (
						<div className="mt-1.5 flex flex-wrap gap-1">
							{playlists.map((p) => (
								<Badge
									key={p.id}
									variant="secondary"
									className="font-normal text-zinc-600"
								>
									#{p.name}
								</Badge>
							))}
						</div>
					)}
				</div>

				<div className="shrink-0">
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
		<div className="flex flex-col gap-3">
			<div className="flex items-center justify-between gap-2">
				<h4 className="m-0 text-xl font-bold text-zinc-900">재생 목록 관리</h4>
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

			<div className="flex items-center gap-2">
				<PlaylistFilterDropdown
					toggleId="manage-playlist-dropdown"
					className="w-full"
					selectedPlaylistId={selectedPlaylistId}
					onSelectPlaylist={setSelectedPlaylistId}
					selectedPlaylistInfo={selectedPlaylistInfo}
					totalCount={videoItems.length}
					untaggedCount={untaggedCount}
					playlists={playlists}
					getPlaylistCount={getPlaylistCount}
				/>
			</div>

			<div className="overflow-hidden rounded-xl border-[1px] border-solid border-zinc-200 bg-white">
				{displayedVideoItems.length === 0 ? (
					<div className="py-12 text-center text-zinc-500">
						<div className="mb-2 text-3xl">📭</div>
						<p className="m-0 text-sm">
							{selectedPlaylistId === PLAYLIST_FILTER.UNTAGGED
								? "미분류 영상이 없습니다."
								: "선택한 플레이리스트에 등록된 영상이 없습니다."}
						</p>
					</div>
				) : (
					displayedVideoItems.map((item, index) => (
						<VideoItem
							key={item.id}
							index={index}
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
		</div>
	);
}
