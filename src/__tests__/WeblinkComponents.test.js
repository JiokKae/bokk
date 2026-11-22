import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import WeblinkForm from "../components/Weblink/WeblinkForm";
import WeblinkGroupCard from "../components/Weblink/WeblinkGroupCard";

const dummyStyles = new Proxy({}, { get: (_, prop) => String(prop) });

describe("WeblinkGroupCard", () => {
	const sampleLinks = [
		{ id: 1, name: "구글", url: "https://google.com", color: "#fff", backgroundColor: "#000" },
		{ id: 2, name: "네이버", url: "https://naver.com", color: "#fff", backgroundColor: "#03c75a" },
	];

	it("renders group title, links, and triggers onOpenAll", () => {
		const onOpenAll = vi.fn((e) => e.preventDefault());
		render(
			<WeblinkGroupCard
				styles={dummyStyles}
				title="업무"
				badgeTitle="그룹: 업무"
				links={sampleLinks}
				targetGroupId={1}
				onOpenAll={onOpenAll}
			/>
		);

		expect(screen.getByText("업무")).toBeInTheDocument();
		expect(screen.getByText("구글")).toBeInTheDocument();
		expect(screen.getByText("네이버")).toBeInTheDocument();

		const openAllLink = screen.getByText("↗ 모두 열기");
		fireEvent.click(openAllLink);
		expect(onOpenAll).toHaveBeenCalledTimes(1);
	});

	it("shows Shift open-all label and empty drop zone when reordering", () => {
		render(
			<WeblinkGroupCard
				styles={dummyStyles}
				title="빈그룹"
				badgeTitle="그룹: 빈그룹"
				links={[]}
				targetGroupId={2}
				isReordering
				isShiftPressed
				canReorderGroup
				canReorderLinks
				emptyDropText="⬇ 여기에 드롭하여 이 그룹으로 이동"
				onOpenAll={vi.fn()}
			/>
		);

		expect(screen.getByText("☰")).toBeInTheDocument();
		expect(screen.getByText("⬇ 여기에 드롭하여 이 그룹으로 이동")).toBeInTheDocument();
	});
});

describe("WeblinkForm", () => {
	it("calls onChange with field name and value when inputs change", () => {
		const onChange = vi.fn();
		const onSubmit = vi.fn();
		render(
			<WeblinkForm
				id="testForm"
				onSubmit={onSubmit}
				values={{
					name: "기존이름",
					url: "https://example.com/{YYYY}",
					color: "#ffffff",
					backgroundColor: "#000000",
					groupId: "",
				}}
				onChange={onChange}
				groups={[
					{ id: 0, name: "bokk" },
					{ id: 1, name: "개발" },
					{ id: -1, name: "미분류" },
				]}
			/>
		);

		fireEvent.change(screen.getByLabelText("이름"), { target: { value: "새이름" } });
		expect(onChange).toHaveBeenCalledWith("name", "새이름");

		fireEvent.change(screen.getByLabelText("소속 그룹"), { target: { value: "1" } });
		expect(onChange).toHaveBeenCalledWith("groupId", "1");

		// Dynamic URL preview is visible because url contains {YYYY}
		expect(screen.getByText("적용 URL:")).toBeInTheDocument();
	});

	it("inserts dynamic date token into active field when token button is clicked", () => {
		const onChange = vi.fn();
		render(
			<WeblinkForm
				id="tokenForm"
				onSubmit={vi.fn()}
				values={{
					name: "출석",
					url: "https://example.com/",
					color: "#ffffff",
					backgroundColor: "#000000",
					groupId: "",
				}}
				onChange={onChange}
				groups={[]}
			/>
		);

		fireEvent.click(screen.getByText("동적 날짜 포맷"));
		fireEvent.click(screen.getByText("{YYYY}"));
		expect(onChange).toHaveBeenCalledWith("url", "https://example.com/{YYYY}");
	});
});
