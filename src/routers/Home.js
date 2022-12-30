import { useQuery } from "@apollo/client";
import { useState } from "react";
import { Link } from "react-router-dom";
import AddWeblinkModal from "../components/Weblink/AddWeblinkModal";
import ThumbnailModal from "../components/Weblink/ThumbnailModal";
import Weblink from "../components/Weblink/Weblink";
import { BUILTIN_WEBLINKS, ME, OWN_WEBLINKS } from "../constants/querys";
import { BOKK_IMG } from "../constants/urls";
import styles from "./Home.module.css";

export default function Home() {
	const [builtinWeblinks, setBuiltinWeblinks] = useState([]);
	useQuery(BUILTIN_WEBLINKS, {
		onCompleted: (data) => {
			setBuiltinWeblinks(data.builtinWeblinks.weblinks);
		},
	});
	const { data: ownWeblinksData } = useQuery(OWN_WEBLINKS);
	const { data: isLoginData } = useQuery(ME);
	return (
		<>
			<div className={styles.weblinkRow}>
				{builtinWeblinks.map(
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
				{ownWeblinksData?.ownWeblinks.map(
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
				{isLoginData?.me === null ? (
					<Link to="/signin/">
						<button className="btn-dot m-1">+</button>
					</Link>
				) : (
					<AddWeblinkModal />
				)}
			</div>
			<div className={styles.weblinkRow}>
				<a
					href="https://www.naver.com/"
					target="_blank"
					rel="noopener noreferrer">
					<img src={`${BOKK_IMG}/NAVER.png`} />
				</a>
				<a
					className={`${styles.bgcNaver} ${styles.logoBtn}`}
					href="https://comic.naver.com/webtoon/weekdayList.nhn"
					target="_blank"
					rel="noopener noreferrer">
					웹툰
				</a>
				<a
					className={`${styles.bgcNaver} ${styles.logoBtn}`}
					href="https://mail.naver.com/"
					target="_blank"
					rel="noopener noreferrer">
					메일
				</a>
			</div>

			<div className={styles.weblinkRow}>
				<a
					href="https://www.daum.net"
					target="_blank"
					rel="noopener noreferrer">
					<img src={`${BOKK_IMG}/DAUM.png`} />
				</a>
				<a
					className={`${styles.bgcDaum} ${styles.logoBtn}`}
					href="http://webtoon.daum.net/"
					target="_blank"
					rel="noopener noreferrer">
					웹툰
				</a>
			</div>
			<div>
				<ThumbnailModal />
			</div>
		</>
	);
}
