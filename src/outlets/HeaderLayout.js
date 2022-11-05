import { Outlet } from "react-router-dom";
import SearchSelector from "../components/Header/SearchSelector/SearchSelector";
import Navbar from "../components/Header/Navbar/Navbar";
import styles from "./HeaderLayout.module.css";

export default function HeaderLayout() {
	const NAV_ITEMS = [
		{ name: "웹 링크", url: "" },
		{ name: "전적 검색", url: "gameRecordSearch/" },
		{ name: "게시판", url: "messageboard/" },
		{ name: "다운로드", url: "download/" },
	];
	return (
		<div>
			<Navbar items={NAV_ITEMS} />
			<div className="container">
				<div className={styles.header}>
					<SearchSelector />
				</div>
				<div className="m-4">
					<Outlet />
				</div>
			</div>
		</div>
	);
}
