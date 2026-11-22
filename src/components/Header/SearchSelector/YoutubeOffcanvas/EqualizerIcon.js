import styles from "./YoutubeOffcanvas.module.css";

export default function EqualizerIcon({
	isPlaying = true,
	height,
	className = "",
	title,
}) {
	return (
		<div
			className={`${styles.equalizer} ${!isPlaying ? styles.paused : ""} ${className}`.trim()}
			style={height ? { height } : undefined}
			title={title}
		>
			<span className={`${styles.equalizerBar} ${styles.bar1}`} />
			<span className={`${styles.equalizerBar} ${styles.bar2}`} />
			<span className={`${styles.equalizerBar} ${styles.bar3}`} />
		</div>
	);
}
