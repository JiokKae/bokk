import EqualizerIcon from "./EqualizerIcon";
import styles from "./YoutubeOffcanvas.module.css";

export default function YoutubeHeaderTrigger({
	isPlaying,
	autoPlay,
	hasStarted,
	currentTitle,
	playingPlaylistName,
	onOpen,
}) {
	const showTicker = isPlaying && Boolean(currentTitle);
	const showAutoPlayNotice = !isPlaying && autoPlay && !hasStarted;
	const showBadge = showTicker || showAutoPlayNotice;

	const handleOpen = (e) => {
		e.preventDefault();
		onOpen?.();
	};

	return (
		<div className="flex min-w-0 shrink items-center">
			<button
				type="button"
				aria-controls="offcanvasYoutubeQueue"
				onClick={handleOpen}
				onMouseDown={(e) => e.preventDefault()}
				className="shrink cursor-pointer border-0 bg-transparent p-0 text-left"
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
						<span className="relative mr-1.5 inline-flex size-1.5 shrink-0">
							<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-bokk opacity-75" />
							<span className="relative inline-flex size-1.5 rounded-full bg-bokk" />
						</span>
						<span className="truncate">조작 시 자동 재생</span>
					</div>
				) : null}
			</button>

			<button
				type="button"
				aria-controls="offcanvasYoutubeQueue"
				aria-label="유튜브 재생 목록 열기"
				onClick={handleOpen}
				onMouseDown={(e) => e.preventDefault()}
				className="inline-flex shrink-0 cursor-pointer items-center border-0 bg-transparent p-0 select-none"
			>
				<img
					src={`${process.env.REACT_APP_BOKK_IMG}/YouTube-icon.png`}
					alt="유튜브 재생 목록"
				/>
			</button>
		</div>
	);
}
