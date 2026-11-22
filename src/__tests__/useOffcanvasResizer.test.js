import { act, renderHook } from "@testing-library/react";
import useOffcanvasResizer from "../hooks/useOffcanvasResizer";

describe("useOffcanvasResizer", () => {
	const setWindowWidth = (width) => {
		Object.defineProperty(window, "innerWidth", {
			writable: true,
			configurable: true,
			value: width,
		});
		window.dispatchEvent(new Event("resize"));
	};

	beforeEach(() => {
		setWindowWidth(1200);
	});

	test("toggles between default width and max width on simple click", () => {
		const { result } = renderHook(() => useOffcanvasResizer());

		expect(result.current.offcanvasWidth).toBe(500);
		expect(result.current.canExpand).toBe(true);
		expect(result.current.isExpanded).toBe(false);

		act(() => {
			result.current.handleDragStart({
				type: "mousedown",
				clientX: 700,
				preventDefault: vi.fn(),
				stopPropagation: vi.fn(),
			});
			window.dispatchEvent(new MouseEvent("mouseup", { clientX: 700 }));
		});

		expect(result.current.offcanvasWidth).toBe(1000);
		expect(result.current.isExpanded).toBe(true);

		act(() => {
			result.current.handleDragStart({
				type: "mousedown",
				clientX: 200,
				preventDefault: vi.fn(),
				stopPropagation: vi.fn(),
			});
			window.dispatchEvent(new MouseEvent("mouseup", { clientX: 200 }));
		});

		expect(result.current.offcanvasWidth).toBe(500);
		expect(result.current.isExpanded).toBe(false);
	});

	test("clamps dragged width within [500, maxExpandWidth] and disables expand on narrow screens", () => {
		const { result } = renderHook(() => useOffcanvasResizer());

		act(() => {
			result.current.handleDragStart({
				type: "mousedown",
				clientX: 700,
				preventDefault: vi.fn(),
				stopPropagation: vi.fn(),
			});
			window.dispatchEvent(new MouseEvent("mousemove", { clientX: 500 }));
			window.dispatchEvent(new MouseEvent("mouseup", { clientX: 500 }));
		});

		expect(result.current.offcanvasWidth).toBe(700);

		act(() => {
			setWindowWidth(480);
		});

		expect(result.current.canExpand).toBe(false);
		expect(result.current.offcanvasWidth).toBe(500);
	});
});
