import { RESOLUTION, secondToDate, thumbnailUrl } from "../../../../utils/youtubeUtil";
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
			className={`list-group-item list-group-item-action pointer w-100 text-start py-2 ${
				styles.videoItem
			} ${isHighlighted ? styles.activeItem : ""}`}
			onClick={onClick}
			onKeyDown={(e) => {
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					onClick?.();
				}
			}}
		>
			<div className="row gx-2 align-items-center flex-nowrap">
				<div className="col-auto flex-shrink-0">
					<div className={styles.thumbnailWrapper}>
						<img
							className={styles.thumbnailImg}
							src={thumbnailUrl(id, RESOLUTION.MAX)}
							alt={title}
							loading="lazy"
							onError={(e) => {
								const fallbackUrl = thumbnailUrl(id, RESOLUTION.MQ);
								if (e.target.src !== fallbackUrl) {
									e.target.src = fallbackUrl;
								}
							}}
						/>
					</div>
				</div>
				<div className="col" style={{ minWidth: 0 }}>
					<p
						className={`mb-1 text-truncate fw-medium ${styles.videoTitle}`}
						title={title}
					>
						{title}
					</p>
					<div className="d-flex align-items-center justify-content-between flex-wrap gap-1">
						<small className="text-muted" style={{ fontSize: "11px" }}>
							{secondToDate(length)}
						</small>
						{onOpenTagModal && (
							<button
								type="button"
								className={`btn btn-sm border py-0 px-2 text-decoration-none d-inline-flex align-items-center ${
									playlists.length > 0
										? "text-primary fw-semibold"
										: "text-secondary"
								}`}
								style={{
									fontSize: "11px",
									height: "22px",
									borderRadius: "11px",
									backgroundColor: playlists.length > 0 ? "#e7f5ff" : "#f8f9fa",
									borderColor: playlists.length > 0 ? "#d0ebff" : "#dee2e6",
								}}
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

