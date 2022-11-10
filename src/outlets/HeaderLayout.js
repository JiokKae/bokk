import { Outlet } from "react-router-dom";
import SearchSelector from "../components/Header/SearchSelector/SearchSelector";
import Navbar from "../components/Header/Navbar/Navbar";
import styles from "./HeaderLayout.module.css";

export default function HeaderLayout({ items, searchSelector }) {
	return (
		<div>
			<Navbar items={items} />
			<div className="container">
				{searchSelector ? (
					<div className={styles.header}>
						<SearchSelector />
					</div>
				) : null}
				<div className="m-4">
					<Outlet />
				</div>
			</div>
		</div>
	);
}
