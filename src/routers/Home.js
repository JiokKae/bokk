import { useQuery } from "@apollo/client";
import { Link } from "react-router-dom";
import ThumbnailModal from "../components/ThumbnailModal";
import Weblink from "../components/Weblink";
import { GET_BUILTIN_WEBLINK } from "../querys";
import styles from "./Home.module.css";

export default function Home() {
	const { data, loading } = useQuery(GET_BUILTIN_WEBLINK);
	return (
		<div id="web_link" className="m-4">
			<div className={styles.weblinkRow}>
				{data?.builtinWeblinks.map(
					({ id, name, url, color, backgroundColor }) => (
						<Weblink
							key={id}
							name={name}
							url={url}
							color={color}
							backgroundColor={backgroundColor}
						/>
					)
				)}
			</div>
			<div className={styles.weblinkRow}>
				<Link to="/signin/">
					<button className={`btn ${styles.btnDot} btn_dot m-1`}>
						+
					</button>
				</Link>
			</div>
			<div className={styles.weblinkRow}>
				<a href="https://www.naver.com/" target="_blank">
					<img src="https://jiokkae.com/볶음밥/img/NAVER.png" />
				</a>
				<a
					className={`${styles.bgcNaver} ${styles.logoBtn}`}
					href="https://comic.naver.com/webtoon/weekdayList.nhn"
					target="_blank">
					웹툰
				</a>
				<a
					className={`${styles.bgcNaver} ${styles.logoBtn}`}
					href="https://mail.naver.com/"
					target="_blank">
					메일
				</a>
			</div>

			<div className={styles.weblinkRow}>
				<a href="https://www.daum.net" target="_blank">
					<img src="https://jiokkae.com/볶음밥/img\DAUM.png" />
				</a>
				<a
					className={`${styles.bgcDaum} ${styles.logoBtn}`}
					href="http://webtoon.daum.net/"
					target="_blank">
					웹툰
				</a>
			</div>
			<div>
				<ThumbnailModal />
			</div>
		</div>
	);
}
