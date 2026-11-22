import { act, fireEvent, render, screen } from "@testing-library/react";
import FeatureHistoryModal from "../components/Header/SearchSelector/FeatureHistoryModal";

describe("FeatureHistoryModal", () => {
	test("opens modal on trigger click, renders categories, and toggles more/collapse", async () => {
		render(<FeatureHistoryModal />);

		const triggerBtn = screen.getByTitle("기능 추가 내역");
		await act(async () => {
			fireEvent.click(triggerBtn);
		});

		expect(screen.getByText("Release Note")).toBeInTheDocument();
		expect(screen.getByText("내 웹링크 관리 & 커스텀")).toBeInTheDocument();
		expect(screen.getByText("유튜브 연속 재생 플레이어")).toBeInTheDocument();

		const expandButtons = screen.getAllByRole("button", {
			name: /이전 업데이트 \d+개 더보기/,
		});
		expect(expandButtons.length).toBeGreaterThan(0);

		await act(async () => {
			fireEvent.click(expandButtons[0]);
		});

		expect(
			screen.getByRole("button", { name: /이전 업데이트 접기/ })
		).toBeInTheDocument();
	});
});
