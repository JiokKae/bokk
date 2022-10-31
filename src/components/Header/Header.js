import SearchSelector from "./SearchSelector/SearchSelector";
import styles from "./Header.module.css";
import Navbar from "./Navbar/Navbar";

const NAV_ITEMS = [
	{ name: "웹 링크", url: "" },
	{ name: "전적 검색", url: "gameRecordSearch/" },
	{ name: "게시판", url: "messageboard/" },
	{ name: "다운로드", url: "download/" },
];
export default function Header() {
	return (
		<div>
			<Navbar items={NAV_ITEMS} />
			<div className="container">
				<div className={styles.header}>
					<SearchSelector />
				</div>
			</div>
		</div>
	);
}
