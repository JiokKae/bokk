import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import IMESafeEditor from "../components/MessageBoard/IMESafeEditor";
import {
	calculateResizedDimensions,
	convertYoutubeIframesToOembed,
} from "../utils/imageCompressor";

describe("imageCompressor helpers", () => {
	it("resizes landscape, portrait, and keeps smaller images unchanged", () => {
		expect(calculateResizedDimensions(4000, 2000, 1000)).toEqual({
			width: 1000,
			height: 500,
		});
		expect(calculateResizedDimensions(1000, 2000, 1000)).toEqual({
			width: 500,
			height: 1000,
		});
		expect(calculateResizedDimensions(800, 600, 1080)).toEqual({
			width: 800,
			height: 600,
		});
	});

	it("converts YouTube embed iframes to oembed tags while preserving wrapper", () => {
		const html =
			'<div class="ratio ratio-16x9"><iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ?rel=0"></iframe></div><p>hello</p>';
		const converted = convertYoutubeIframesToOembed(html);
		expect(converted).toContain(
			'<oembed url="https://www.youtube.com/watch?v=dQw4w9WgXcQ"></oembed>'
		);
		expect(converted).toContain('class="ratio ratio-16x9"');
		expect(converted).not.toContain("<iframe");
	});
});

describe("IMESafeEditor", () => {
	it("renders toolbar buttons and exposes getData/setData via onReady", () => {
		let editorApi = null;
		const onReady = vi.fn((api) => {
			editorApi = api;
		});

		render(<IMESafeEditor onReady={onReady} placeholder="내용 입력" />);

		expect(screen.getByTitle("굵게 (Bold)")).toBeInTheDocument();
		expect(screen.getByTitle("이미지 업로드")).toBeInTheDocument();
		expect(screen.getByTitle("유튜브 동영상 삽입")).toBeInTheDocument();
		expect(onReady).toHaveBeenCalledTimes(1);

		editorApi.setData("<p>테스트</p>");
		expect(editorApi.getData()).toBe("<p>테스트</p>");
	});
});
