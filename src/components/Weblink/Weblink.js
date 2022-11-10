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
			className={`btn ${styles.btnMd} m-1`}
			style={{ color, backgroundColor, ...style }}
			onClick={onClick}>
			{name}
		</a>
	);
}
