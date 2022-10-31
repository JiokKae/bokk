import { useState } from "react";
import { Link } from "react-router-dom";
import styles from "./Navbar.module.css";
import { gql, useQuery } from "@apollo/client";

const IS_LOGIN = gql`
	query Me {
		me {
			name
		}
	}
`;

function NavMenu() {
	function GuestMenu() {
		return (
			<ul className="navbar-nav">
				<li className="nav-item">
					<Link to="/signin/" className={`nav-link ${styles.btn}`}>
						로그인
					</Link>
				</li>
			</ul>
		);
	}

	function UserMenu({ nickname, options }) {
		return (
			<div>
				<span className="navbar-text">{nickname}님 환영합니다</span>
				<ul className="navbar-nav">
					<li className="nav-item dropdown">
						<a
							className={`nav-link dropdown-toggle ${styles.btn}`}
							data-bs-toggle="dropdown"
							href="#">
							{nickname}
							<b className="caret"></b>
						</a>
						<div
							className="dropdown-menu dropdown-menu-right"
							aria-labelledby="navbarDropdown">
							{options.weblinkManage ? null : (
								<a
									class="dropdown-item"
									href="/볶음밥/weblink_management.php">
									웹링크 관리
								</a>
							)}
							<a
								className="dropdown-item"
								href="/볶음밥/changePassword.php">
								비밀번호 변경
							</a>
							<div className="dropdown-divider"></div>
							<a
								className="dropdown-item"
								href="/볶음밥/signout.php">
								로그아웃
							</a>
						</div>
					</li>
				</ul>
			</div>
		);
	}

	const { data, loading } = useQuery(IS_LOGIN);
	console.log(data);
	return loading ? null : data?.me === null ? (
		<GuestMenu />
	) : (
		<UserMenu nickname={data?.me?.name} />
	);
}

export default function Navbar({ items }) {
	const [selectedTab, SetSelectedTab] = useState("");

	return (
		<nav className="navbar navbar-expand-md sticky-top navbar-dark">
			<div className="container">
				<Link to="/" className="navbar-brand">
					볶음밥
				</Link>
				<button
					className="navbar-toggler"
					type="button"
					data-bs-toggle="collapse"
					data-bs-target="#navbarSupportedContent"
					aria-controls="navbarSupportedContent"
					aria-expanded="false"
					aria-label="Toggle navigation">
					<span className="navbar-toggler-icon"></span>
				</button>
				<div
					className="collapse navbar-collapse"
					id="navbarSupportedContent">
					<ul className="navbar-nav me-auto">
						{items?.map((item) => (
							<li
								className={`nav-item pointer ${
									selectedTab === item.url
										? styles.active
										: ""
								}`}
								key={item.url}>
								<Link
									to={item.url}
									onClick={() => {
										SetSelectedTab(item.url);
									}}
									className={`nav-link ${styles.navlink} ${styles.btn}`}>
									{item.name}
								</Link>
							</li>
						))}
					</ul>
					<NavMenu />
				</div>
			</div>
		</nav>
	);
}
