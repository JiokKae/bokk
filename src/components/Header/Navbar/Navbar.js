import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useMutation, useQuery } from "@apollo/client";
import { ChevronDown, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
	ME,
	QUERIES_AFFECTED_BY_SIGN,
	SIGNOUT,
} from "../../../constants/querys";

function GuestMenu({ onNavigate }) {
	return (
		<ul className="m-0 flex list-none flex-col p-0 md:flex-row md:items-center">
			<li>
				<Link
					to="/signin/"
					onClick={onNavigate}
					className="block rounded-md px-2.5 py-2 text-[15px] font-medium text-white/85 no-underline transition-colors hover:bg-white/10 hover:text-white"
				>
					로그인
				</Link>
			</li>
		</ul>
	);
}

function UserMenu({ menuItems, onNavigate }) {
	const { data } = useQuery(ME);
	const [signout] = useMutation(SIGNOUT, {
		refetchQueries: QUERIES_AFFECTED_BY_SIGN,
	});
	const [dropdownOpen, setDropdownOpen] = useState(false);
	const dropdownRef = useRef(null);

	useEffect(() => {
		if (!dropdownOpen) return;
		const handleClickOutside = (e) => {
			if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
				setDropdownOpen(false);
			}
		};
		const handleKeyDown = (e) => {
			if (e.key === "Escape") {
				setDropdownOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		document.addEventListener("keydown", handleKeyDown);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [dropdownOpen]);

	return (
		<div className="flex flex-col gap-1 md:flex-row md:items-center md:gap-3">
			<span className="px-2.5 py-1.5 text-sm text-white/80 md:px-0 md:py-0">
				{data?.me?.name}님 환영합니다
			</span>
			<div ref={dropdownRef} className="relative">
				<button
					type="button"
					aria-expanded={dropdownOpen}
					aria-haspopup="menu"
					onClick={() => setDropdownOpen((prev) => !prev)}
					className="inline-flex cursor-pointer items-center gap-1 rounded-md border-0 bg-transparent px-2.5 py-2 text-[15px] font-medium text-white/90 transition-colors hover:bg-white/10 hover:text-white"
				>
					<span>{data?.me?.name}</span>
					<ChevronDown
						className={cn(
							"size-4 transition-transform duration-150",
							dropdownOpen && "rotate-180"
						)}
					/>
				</button>

				{dropdownOpen && (
					<div
						role="menu"
						className="mt-1 min-w-44 rounded-xl border-[1px] border-solid border-zinc-200 bg-white py-1.5 shadow-lg md:absolute md:top-full md:right-0 md:z-[1030]"
					>
						{menuItems?.map(({ url, name }) => (
							<Link
								key={url}
								to={url}
								role="menuitem"
								onClick={() => {
									setDropdownOpen(false);
									onNavigate?.();
								}}
								className="block px-3.5 py-2 text-sm text-zinc-800 no-underline transition-colors hover:bg-bokk-subtle hover:text-bokk-dark"
							>
								{name}
							</Link>
						))}
						<div className="my-1 border-0 border-t border-solid border-zinc-100" />
						<button
							type="button"
							role="menuitem"
							className="block w-full cursor-pointer border-0 bg-transparent px-3.5 py-2 text-left text-sm text-zinc-700 transition-colors hover:bg-red-50 hover:text-red-600"
							onClick={() => {
								setDropdownOpen(false);
								onNavigate?.();
								signout();
							}}
						>
							로그아웃
						</button>
					</div>
				)}
			</div>
		</div>
	);
}

function NavItem({ name, url, onNavigate }) {
	const location = useLocation();
	const isActive = location.pathname === url;

	return (
		<li>
			<Link
				to={url}
				onClick={onNavigate}
				className={cn(
					"block rounded-md px-2.5 py-2 text-[15px] no-underline transition-colors hover:bg-white/10 hover:text-white",
					isActive ? "font-bold text-white" : "font-normal text-white/85"
				)}
			>
				{name}
			</Link>
		</li>
	);
}

export default function Navbar({ items }) {
	const { data, loading } = useQuery(ME);
	const location = useLocation();
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

	useEffect(() => {
		setMobileMenuOpen(false);
	}, [location.pathname]);

	const isUser = () => !loading && data?.me;

	return (
		<nav className="sticky top-0 z-[1020] bg-bokk-dark text-white shadow-xs">
			<div className="container">
				<div className="flex min-h-14 items-center justify-between gap-4 py-1.5">
					<div className="flex items-center gap-4">
						<Link
							to="/"
							className="text-xl font-bold tracking-tight text-white no-underline hover:text-white/95"
						>
							볶음밥
						</Link>

						<ul className="m-0 hidden list-none items-center gap-1 p-0 md:flex">
							{items?.nav?.map(({ url, name, options }) =>
								options?.userOnly && !isUser() ? null : (
									<NavItem key={url} name={name} url={url} />
								)
							)}
						</ul>
					</div>

					<div className="hidden md:block">
						{loading ? null : data?.me ? (
							<UserMenu menuItems={items?.menu} />
						) : (
							<GuestMenu />
						)}
					</div>

					<button
						type="button"
						aria-label="메뉴 열기"
						aria-expanded={mobileMenuOpen}
						onClick={() => setMobileMenuOpen((prev) => !prev)}
						className="inline-flex size-9 cursor-pointer items-center justify-center rounded-md border-[1px] border-solid border-white/25 bg-transparent text-white transition-colors hover:bg-white/10 md:hidden"
					>
						{mobileMenuOpen ? (
							<X className="size-5" />
						) : (
							<Menu className="size-5" />
						)}
					</button>
				</div>

				{mobileMenuOpen && (
					<div className="border-0 border-t border-solid border-white/15 pb-3 pt-2 md:hidden">
						<ul className="m-0 flex list-none flex-col gap-0.5 p-0">
							{items?.nav?.map(({ url, name, options }) =>
								options?.userOnly && !isUser() ? null : (
									<NavItem
										key={url}
										name={name}
										url={url}
										onNavigate={() => setMobileMenuOpen(false)}
									/>
								)
							)}
						</ul>
						<div className="mt-2 border-0 border-t border-solid border-white/15 pt-2">
							{loading ? null : data?.me ? (
								<UserMenu
									menuItems={items?.menu}
									onNavigate={() => setMobileMenuOpen(false)}
								/>
							) : (
								<GuestMenu
									onNavigate={() => setMobileMenuOpen(false)}
								/>
							)}
						</div>
					</div>
				)}
			</div>
		</nav>
	);
}
