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
			className={`overflow-auto flex-grow-1 ${styles.queueContainer}`}
			style={{
				minHeight: 0,
				WebkitOverflowScrolling: "touch",
			}}
		>
			<div className="list-group">
				{displayedVideoItems.length === 0 ? (
					<div className="text-center text-muted py-5 px-3">
						<div className="fs-4 mb-2">📭</div>
						<p className="mb-1 fw-medium" style={{ fontSize: "13px" }}>
							{selectedPlaylistId === PLAYLIST_FILTER.UNTAGGED
								? "미분류 영상이 없습니다."
								: totalVideoCount === 0
								? "재생 목록에 등록된 영상이 없습니다."
								: "이 플레이리스트에 담긴 영상이 없습니다."}
						</p>
						<small
							className="text-secondary d-block"
							style={{ fontSize: "11px" }}
						>
							{totalVideoCount === 0
								? "상단 입력창에 유튜브 영상 주소를 입력하여 추가해보세요!"
								: selectedPlaylistId === PLAYLIST_FILTER.UNTAGGED
								? "모든 영상이 플레이리스트에 정리되어 있습니다."
								: "전체 목록에서 영상 우측의 '+ 담기' 버튼으로 이 플레이리스트에 곡을 담아보세요!"}
						</small>
						{selectedPlaylistId !== PLAYLIST_FILTER.ALL &&
							totalVideoCount > 0 && (
								<div className="mt-3">
									<button
										type="button"
										className="btn btn-sm btn-light border px-3 py-1.5 text-primary fw-medium shadow-sm"
										style={{
											fontSize: "12px",
											borderRadius: "6px",
											backgroundColor: "#f0f7ff",
											borderColor: "#b6e0fe",
										}}
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
