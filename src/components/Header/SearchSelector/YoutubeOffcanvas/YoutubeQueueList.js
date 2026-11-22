import { cn } from "@/lib/utils";
import { PLAYLIST_FILTER } from "../../../../utils/playlistUtil";
import styles from "./YoutubeOffcanvas.module.css";
import YoutubeVideoItem from "./YoutubeVideoItem";

export default function YoutubeQueueList({
	displayedVideoItems,
	totalVideoCount,
	selectedPlaylistId,
	onResetToAll,
	currentVideoIndex,
	effectivePlayingVideoId,
	onSelectVideo,
	onOpenTagModal,
}) {
	return (
		<div
			id="scroll_queue"
			className={cn("min-h-0 flex-1 overflow-auto", styles.queueContainer)}
			style={{ WebkitOverflowScrolling: "touch" }}
		>
			<div className="overflow-hidden rounded-xl border-[1px] border-solid border-zinc-200 bg-white">
				{displayedVideoItems.length === 0 ? (
					<div className="px-4 py-10 text-center text-zinc-500">
						<div className="mb-2 text-2xl">📭</div>
						<p className="m-0 mb-1 text-[13.5px] font-medium text-zinc-700">
							{selectedPlaylistId === PLAYLIST_FILTER.UNTAGGED
								? "미분류 영상이 없습니다."
								: totalVideoCount === 0
								? "재생 목록에 등록된 영상이 없습니다."
								: "이 플레이리스트에 담긴 영상이 없습니다."}
						</p>
						<span className="block text-xs text-zinc-500">
							{totalVideoCount === 0
								? "상단 입력창에 유튜브 영상 주소를 입력하여 추가해보세요!"
								: selectedPlaylistId === PLAYLIST_FILTER.UNTAGGED
								? "모든 영상이 플레이리스트에 정리되어 있습니다."
								: "전체 목록에서 영상 우측의 '+ 담기' 버튼으로 이 플레이리스트에 곡을 담아보세요!"}
						</span>
						{selectedPlaylistId !== PLAYLIST_FILTER.ALL &&
							totalVideoCount > 0 && (
								<div className="mt-3.5">
									<button
										type="button"
										className="inline-flex cursor-pointer items-center rounded-lg border-[1px] border-solid border-bokk-border bg-bokk-subtle/70 px-3 py-1.5 text-xs font-semibold text-bokk-dark shadow-xs transition-colors hover:bg-bokk-subtle"
										onClick={onResetToAll}
									>
										전체 목록에서 곡 담으러 가기 ➔
									</button>
								</div>
							)}
					</div>
				) : (
					displayedVideoItems.map((item, index) => (
						<YoutubeVideoItem
							key={item.id}
							index={index}
							currentVideoIndex={currentVideoIndex}
							isCurrentPlaying={item.video.id === effectivePlayingVideoId}
							onClick={() => onSelectVideo(item, index)}
							id={item.video.id}
							title={item.video.title}
							length={item.video.length}
							playlists={item.playlists || []}
							onOpenTagModal={() => onOpenTagModal(item)}
						/>
					))
				)}
			</div>
		</div>
	);
}
