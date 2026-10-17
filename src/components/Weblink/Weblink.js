import { formatWeblinkDynamicText } from "../../utils/weblinkUtil";
import styles from "./Weblink.module.css";

export default function Weblink({
	name,
	url,
	color,
	backgroundColor,
	style,
	onClick,
}) {
	const resolvedName = formatWeblinkDynamicText(name);
	const resolvedUrl =
		!url || url === "#" ? url : formatWeblinkDynamicText(url);

	if (onClick) {
		return (
			<button
				type="button"
				className={`btn ${styles.btnMd} m-1`}
				style={{ color, backgroundColor, ...style }}
				onClick={onClick}>
				{resolvedName === "" ? "웹 링크" : resolvedName}
			</button>
		);
	}

	return (
		<a
			href={resolvedUrl}
			target="_blank"
			rel="noopener noreferrer"
			className={`btn ${styles.btnMd} m-1`}
			style={{ color, backgroundColor, ...style }}>
			{resolvedName === "" ? "웹 링크" : resolvedName}
		</a>
	);
}
