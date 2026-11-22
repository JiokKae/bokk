import styles from "./DownloadCard.module.css";

export default function DownloadCard({ href, date, size }) {
	const formatSize = (bytes, decimals = 2) => {
		const units = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
		const factor = Math.floor((bytes.toString().length - 1) / 3);

		return `${(bytes / Math.pow(1024, factor)).toFixed(decimals)}${
			units[factor]
		}`;
	};
	const filename = href.match(/[^/]*$/)?.[0] || href;

	return (
		<div className="rounded-xl border border-solid border-zinc-200 bg-white p-4 shadow-xs transition-shadow hover:shadow-sm">
			<a
				href={href}
				download
				className="block text-bokk-dark no-underline hover:underline"
			>
				<h5
					className={`m-0 mb-3 text-base font-bold ${styles.singleLine}`}
					title={filename}
				>
					{filename}
				</h5>
			</a>
			<div className={styles.details}>
				<div>
					<div className="text-xs text-zinc-500">업로드된 날짜</div>
					<div className={`text-sm text-zinc-800 ${styles.bold}`}>{date}</div>
				</div>
				<div>
					<div className="text-xs text-zinc-500">파일 크기</div>
					<div className={`text-sm text-zinc-800 ${styles.bold}`}>
						{formatSize(size)}
					</div>
				</div>
			</div>
		</div>
	);
}
