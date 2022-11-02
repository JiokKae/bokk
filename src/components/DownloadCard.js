import styles from "./DownloadCard.module.css";

export default function DownloadCard({ href, date, size }) {
	const formatSize = (bytes, decimals = 2) => {
		const size = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
		const factor = Math.floor((bytes.toString().length - 1) / 3);

		return `${(bytes / Math.pow(1024, factor)).toFixed(decimals)}${
			size[factor]
		}`;
	};
	return (
		<div className="col-lg-4 mb-4">
			<div className="card">
				<div className="card-body">
					<a href={href} download>
						<h5
							className={`card-title ${styles.singleLine}`}
							title={href.match(/[^\/]*$/)}>
							{href.match(/[^\/]*$/)}
						</h5>
					</a>
					<div className={styles.details}>
						<div>
							<div>업로드된 날짜</div>
							<div className={styles.bold}>{date}</div>
						</div>
						<div>
							<div>파일 크기</div>
							<div className={styles.bold}>
								{formatSize(size)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
