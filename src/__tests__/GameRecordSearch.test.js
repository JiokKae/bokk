import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import GameRecordSearch from "../routers/GameRecordSearch";

describe("GameRecordSearch", () => {
	it("renders all 6 provider tabs and switches active panel on click", () => {
		render(<GameRecordSearch />);

		expect(screen.getByRole("button", { name: "OP.GG" })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "FOW.KR" })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "YOUR.GG" })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "DAK.GG" })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "LOLCHESS.GG" })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "LOAWA" })).toBeInTheDocument();

		// Default tab is OP.GG
		expect(screen.getByPlaceholderText("소환사명, 소환사명, ...")).toBeInTheDocument();

		// Switch to DAK.GG
		fireEvent.click(screen.getByRole("button", { name: "DAK.GG" }));
		expect(
			screen.getByPlaceholderText("배틀그라운드 닉네임을 입력하세요")
		).toBeInTheDocument();
		expect(screen.getByRole("link", { name: "JiokKae" })).toHaveAttribute(
			"href",
			"https://dak.gg/profile/JiokKae"
		);

		// Switch to LOAWA
		fireEvent.click(screen.getByRole("button", { name: "LOAWA" }));
		expect(
			screen.getByPlaceholderText("검색할 캐릭터명을 입력")
		).toBeInTheDocument();
		expect(screen.getByRole("link", { name: "핵폐기물" })).toHaveAttribute(
			"href",
			"https://loawa.com/char/핵폐기물"
		);
	});
});
