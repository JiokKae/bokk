import EqualizerIcon from "./EqualizerIcon";
import styles from "./YoutubeOffcanvas.module.css";

export default function YoutubeHeaderTrigger({
	isPlaying,
	autoPlay,
	hasStarted,
	currentTitle,
	playingPlaylistName,
}) {
	const showTicker = isPlaying && Boolean(currentTitle);
	const showAutoPlayNotice = !isPlaying && autoPlay && !hasStarted;
	const showBadge = showTicker || showAutoPlayNotice;

	return (
		<div
			className="d-flex align-items-center flex-shrink-1"
			style={{ minWidth: 0 }}
		>
			<a
				data-bs-toggle="offcanvas"
				href="#offcanvasYoutubeQueue"
				role="button"
				aria-controls="offcanvasYoutubeQueue"
				onMouseDown={(e) => e.preventDefault()}
				className="text-decoration-none flex-shrink-1"
				title={
					showTicker
						? `재생 중: [${playingPlaylistName}] ${currentTitle}`
						: showAutoPlayNotice
						? "자동 재생 켜짐: 화면 터치/조작 시 자동 재생됩니다"
						: "유튜브 재생 목록"
				}
				style={{
					maxWidth: showBadge ? "min(200px, calc(100vw - 230px))" : "0px",
					opacity: showBadge ? 1 : 0,
					marginRight: showBadge ? "8px" : "0px",
					transformOrigin: "right center",
					transition:
						"max-width 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.35s ease, margin-right 0.4s ease",
					overflow: "hidden",
					whiteSpace: "nowrap",
					display: "inline-block",
					verticalAlign: "middle",
					pointerEvents: showBadge ? "auto" : "none",
					userSelect: "none",
					minWidth: 0,
				}}
			>
				{showTicker ? (
					<div className={styles.headerTickerBadge}>
						<EqualizerIcon isPlaying />
						<div className={styles.tickerMarqueeWrapper}>
							<div className={styles.tickerMarquee}>
								{currentTitle} &nbsp;·&nbsp; {currentTitle} &nbsp;·&nbsp;
							</div>
						</div>
					</div>
				) : showAutoPlayNotice ? (
					<div className={styles.tickerNoticeBadge}>
						<span
							className="spinner-grow spinner-grow-sm text-primary me-1 flex-shrink-0"
							style={{ width: "6px", height: "6px" }}
						/>
						<span className="text-truncate">조작 시 자동 재생</span>
					</div>
				) : null}
			</a>

			<a
				data-bs-toggle="offcanvas"
				href="#offcanvasYoutubeQueue"
				role="button"
				aria-controls="offcanvasYoutubeQueue"
				onMouseDown={(e) => e.preventDefault()}
				style={{ userSelect: "none" }}
				className="flex-shrink-0"
			>
				<img
					src={`${process.env.REACT_APP_BOKK_IMG}/YouTube-icon.png`}
					alt="유튜브 재생 목록"
				/>
			</a>
		</div>
	);
}
