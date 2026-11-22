import { cn } from "@/lib/utils";
import {
	RESOLUTION,
	handleYoutubeThumbnailError,
	handleYoutubeThumbnailLoad,
	secondToDate,
	thumbnailUrl,
} from "../../../../utils/youtubeUtil";
import styles from "./YoutubeVideoItem.module.css";

export default function YoutubeVideoItem({
	index,
	currentVideoIndex,
	isCurrentPlaying,
	onClick,
	id,
	title,
	length,
	playlists = [],
	onOpenTagModal,
}) {
	const isHighlighted =
		typeof isCurrentPlaying === "boolean"
			? isCurrentPlaying
			: index === currentVideoIndex;

	const maxVisibleTags = 2;
	const visibleTags = playlists.slice(0, maxVisibleTags);
	const remainingCount = playlists.length - maxVisibleTags;

	return (
		<div
			id={`videoItem${index}`}
			role="button"
			tabIndex={0}
			className={cn(
				"w-full cursor-pointer px-3 py-2 text-left transition-colors hover:bg-zinc-50",
				index !== 0 && "border-0 border-t border-solid border-zinc-100",
				styles.videoItem,
				isHighlighted && styles.activeItem
			)}
			onClick={onClick}
			onKeyDown={(e) => {
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					onClick?.();
				}
			}}
		>
			<div className="flex flex-nowrap items-center gap-2.5">
				<div className="shrink-0">
					<div className={styles.thumbnailWrapper}>
						<img
							className={styles.thumbnailImg}
							src={thumbnailUrl(id, RESOLUTION.MQ)}
							alt={title}
							loading="lazy"
							onLoad={(e) => handleYoutubeThumbnailLoad(e, id)}
							onError={(e) => handleYoutubeThumbnailError(e, id)}
						/>
					</div>
				</div>

				<div className="min-w-0 flex-1">
					<p
						className={cn(
							"m-0 mb-1 truncate font-medium text-zinc-900",
							styles.videoTitle
						)}
						title={title}
					>
						{title}
					</p>
					<div className="flex flex-wrap items-center justify-between gap-1">
						<span className="text-[11px] text-zinc-500">
							{secondToDate(length)}
						</span>
						{onOpenTagModal && (
							<button
								type="button"
								className={cn(
									"inline-flex h-[22px] cursor-pointer items-center rounded-full border-[1px] border-solid px-2 text-[11px] transition-colors",
									playlists.length > 0
										? "border-bokk-border bg-bokk-subtle font-semibold text-bokk-dark hover:bg-bokk-border/40"
										: "border-zinc-200 bg-zinc-50 text-zinc-600 hover:bg-zinc-100"
								)}
								title="플레이리스트에 담기 / 변경"
								onClick={(e) => {
									e.stopPropagation();
									onOpenTagModal();
								}}
							>
								{playlists.length > 0 ? `담김 ${playlists.length}` : "+ 담기"}
							</button>
						)}
					</div>
					{playlists.length > 0 && (
						<div className={styles.tagContainer}>
							{visibleTags.map((p) => (
								<span
									key={p.id}
									className={styles.tagBadge}
									title={`플레이리스트: ${p.name}`}
								>
									#{p.name}
								</span>
							))}
							{remainingCount > 0 && (
								<span
									className={styles.tagMoreBadge}
									title={`${remainingCount}개의 플레이리스트가 더 있습니다`}
								>
									+{remainingCount}
								</span>
							)}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
