import styles from "./Weblink.module.css";

export default function Weblink({
	name,
	url,
	color,
	backgroundColor,
	style,
	onClick,
}) {
	return (
		<a
			href={onClick ? undefined : url}
			target="_blank"
			rel="noopener noreferrer"
			className={`btn ${styles.btnMd} m-1`}
			style={{ color, backgroundColor, ...style }}
			onClick={onClick}>
			{name === "" ? "웹 링크" : name}
		</a>
	);
}
