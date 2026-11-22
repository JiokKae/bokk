import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Navbar from "../components/Header/Navbar/Navbar";

const mockUseQuery = vi.fn();
const mockSignout = vi.fn();

vi.mock("@apollo/client", async () => {
	const actual = await vi.importActual("@apollo/client");
	return {
		...actual,
		useQuery: (...args) => mockUseQuery(...args),
		useMutation: () => [mockSignout, { loading: false }],
	};
});

const NAV_ITEMS = {
	nav: [
		{ name: "웹 링크", url: "/" },
		{ name: "전적 검색", url: "/gameRecordSearch/" },
		{ name: "게시판", url: "/messageboard/" },
		{ name: "다운로드", url: "/download/", options: { userOnly: true } },
	],
	menu: [
		{ name: "관리", url: "/manage/" },
		{ name: "비밀번호 변경", url: "/changePassword/" },
	],
};

describe("Navbar", () => {
	beforeEach(() => {
		mockUseQuery.mockReset();
		mockSignout.mockReset();
	});

	it("renders guest menu and hides userOnly nav items when logged out", () => {
		mockUseQuery.mockReturnValue({ data: { me: null }, loading: false });

		render(
			<MemoryRouter initialEntries={["/"]}>
				<Navbar items={NAV_ITEMS} />
			</MemoryRouter>
		);

		expect(screen.getByText("볶음밥")).toBeInTheDocument();
		expect(screen.getByText("웹 링크")).toBeInTheDocument();
		expect(screen.getByText("게시판")).toBeInTheDocument();
		expect(screen.queryByText("다운로드")).not.toBeInTheDocument();
		expect(screen.getByText("로그인")).toBeInTheDocument();
	});

	it("opens and closes user dropdown on click, Escape, outside click, and triggers signout", () => {
		mockUseQuery.mockReturnValue({
			data: { me: { id: 1, name: "테스터" } },
			loading: false,
		});

		render(
			<MemoryRouter initialEntries={["/"]}>
				<Navbar items={NAV_ITEMS} />
			</MemoryRouter>
		);

		expect(screen.getByText("다운로드")).toBeInTheDocument();
		expect(screen.getByText("테스터님 환영합니다")).toBeInTheDocument();

		const userBtn = screen.getByRole("button", { name: /테스터/ });
		expect(userBtn).toHaveAttribute("aria-expanded", "false");

		// Open dropdown
		fireEvent.click(userBtn);
		expect(userBtn).toHaveAttribute("aria-expanded", "true");
		expect(screen.getByRole("menuitem", { name: "관리" })).toBeInTheDocument();
		expect(
			screen.getByRole("menuitem", { name: "비밀번호 변경" })
		).toBeInTheDocument();

		// Close on Escape
		fireEvent.keyDown(document, { key: "Escape" });
		expect(screen.queryByRole("menu")).not.toBeInTheDocument();

		// Re-open and close on outside click
		fireEvent.click(userBtn);
		expect(screen.getByRole("menu")).toBeInTheDocument();
		fireEvent.mouseDown(document.body);
		expect(screen.queryByRole("menu")).not.toBeInTheDocument();

		// Re-open and click signout
		fireEvent.click(userBtn);
		fireEvent.click(screen.getByRole("menuitem", { name: "로그아웃" }));
		expect(mockSignout).toHaveBeenCalledTimes(1);
		expect(screen.queryByRole("menu")).not.toBeInTheDocument();
	});

	it("toggles mobile hamburger menu on click", () => {
		mockUseQuery.mockReturnValue({ data: { me: null }, loading: false });

		render(
			<MemoryRouter initialEntries={["/"]}>
				<Navbar items={NAV_ITEMS} />
			</MemoryRouter>
		);

		const toggleBtn = screen.getByRole("button", { name: "메뉴 열기" });
		expect(toggleBtn).toHaveAttribute("aria-expanded", "false");

		fireEvent.click(toggleBtn);
		expect(toggleBtn).toHaveAttribute("aria-expanded", "true");
		// Mobile menu duplicates nav items while open
		expect(screen.getAllByText("웹 링크").length).toBe(2);

		fireEvent.click(toggleBtn);
		expect(toggleBtn).toHaveAttribute("aria-expanded", "false");
		expect(screen.getAllByText("웹 링크").length).toBe(1);
	});
});
