import { Link, useLocation } from "react-router-dom";
import styles from "./Navbar.module.css";
import { useMutation, useQuery } from "@apollo/client";
import { ME, QUERIES_AFFECTED_BY_SIGN, SIGNOUT } from "../../../querys";

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

function UserMenu({ menuItems }) {
	const { data } = useQuery(ME);
	const [signout] = useMutation(SIGNOUT, {
		refetchQueries: QUERIES_AFFECTED_BY_SIGN,
	});

	return (
		<>
			<span className="navbar-text">{data?.me?.name}님 환영합니다</span>
			<ul className="navbar-nav">
				<li className="nav-item dropdown">
					<a
						className={`nav-link dropdown-toggle ${styles.btn}`}
						data-bs-toggle="dropdown"
						href="#">
						{data?.me?.name}
						<b className="caret"></b>
					</a>
					<div
						className="dropdown-menu dropdown-menu-right"
						aria-labelledby="navbarDropdown">
						{menuItems?.map(({ url, name }) => (
							<Link key={url} to={url} className="dropdown-item">
								{name}
							</Link>
						))}
						<div className="dropdown-divider"></div>
						<a
							className="dropdown-item pointer"
							onClick={() => {
								signout();
							}}>
							로그아웃
						</a>
					</div>
				</li>
			</ul>
		</>
	);
}

export default function Navbar({ items }) {
	const { data, loading } = useQuery(ME);
	const location = useLocation();

	return (
		<nav
			className={`navbar navbar-expand-md sticky-top navbar-dark ${styles.nav}`}>
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
						{items?.nav?.map(({ url, name }) => (
							<li
								className={`nav-item pointer ${
									location.pathname === url
										? styles.active
										: ""
								}`}
								key={url}>
								<Link
									to={url}
									className={`nav-link ${styles.navlink} ${styles.btn}`}>
									{name}
								</Link>
							</li>
						))}
					</ul>
					{loading ? null : data?.me ? (
						<UserMenu menuItems={items?.menu} />
					) : (
						<GuestMenu />
					)}
				</div>
			</div>
		</nav>
	);
}
