import styles from "./Weblink.module.css";

export default function Weblink({ name, url, color, backgroundColor }) {
	return (
		<a
			href={url}
			target="_blank"
			className={`btn ${styles.btnMd} m-1`}
			style={{ color, backgroundColor }}>
			{name}
		</a>
	);
}
