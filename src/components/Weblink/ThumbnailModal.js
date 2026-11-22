import { useEffect, useRef, useState } from "react";
import { Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import styles from "./ThumbnailModal.module.css";
import { RESOLUTION, thumbnailUrl, videoId } from "../../utils/youtubeUtil";

function YoutubeThumbnail({ youtubeId }) {
	const [imgUrl, setImgUrl] = useState("");

	useEffect(() => {
		if (youtubeId) {
			setImgUrl(thumbnailUrl(youtubeId, RESOLUTION.MAX));
		}
	}, [youtubeId]);

	return youtubeId === "" ? (
		<img
			src={`${process.env.REACT_APP_BOKK_IMG}/youtube_share_link.png`}
			alt="유튜브 공유 설명"
			className="mx-auto block max-w-full rounded-lg"
		/>
	) : (
		<a
			href={imgUrl || thumbnailUrl(youtubeId, RESOLUTION.MAX)}
			target="_blank"
			rel="noopener noreferrer"
			className="block overflow-hidden rounded-lg"
		>
			<img
				src={imgUrl || thumbnailUrl(youtubeId, RESOLUTION.MAX)}
				alt="섬네일"
				className="mx-auto block max-w-full rounded-lg"
				onLoad={(e) => {
					if (e.target.naturalWidth === 120 && e.target.naturalHeight === 90) {
						setImgUrl(thumbnailUrl(youtubeId, "hq"));
					}
				}}
				onError={() => {
					setImgUrl(thumbnailUrl(youtubeId, "hq"));
				}}
			/>
		</a>
	);
}

export default function ThumbnailModal() {
	const [thumbnailId, setThumbnailId] = useState("");
	const [open, setOpen] = useState(false);
	const urlInput = useRef();

	const handleApply = (e) => {
		e?.preventDefault();
		const value = urlInput.current?.value || "";
		setThumbnailId(videoId(value));
		if (urlInput.current) {
			urlInput.current.value = "";
		}
	};

	return (
		<>
			<button
				type="button"
				className={`btn ${styles.btnLg} ${styles.bgcYoutube} mt-2`}
				onClick={() => setOpen(true)}
			>
				유튜브 Thumbnail 크게 보기
			</button>

			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className="max-w-3xl gap-0 overflow-hidden p-0">
					<DialogHeader className="rounded-t-xl border-0 border-b border-solid border-zinc-200 bg-white px-5 py-3.5">
						<div className="flex items-center gap-2.5">
							<span className="inline-flex size-8 items-center justify-center rounded-lg bg-red-50 text-red-500">
								<ImageIcon className="size-4" />
							</span>
							<div>
								<DialogTitle className="text-lg font-bold text-zinc-900">
									유튜브 Thumbnail 크게 보기
								</DialogTitle>
								<DialogDescription className="sr-only">
									유튜브 영상 주소를 입력해 고화질 썸네일을 크게 확인합니다.
								</DialogDescription>
							</div>
						</div>
					</DialogHeader>

					<div className="max-h-[70vh] overflow-y-auto bg-zinc-50 px-5 py-4 text-center">
						<YoutubeThumbnail youtubeId={thumbnailId} />
					</div>

					<DialogFooter className="rounded-b-xl border-0 border-t border-solid border-zinc-200 bg-white px-5 py-3.5">
						<form
							onSubmit={handleApply}
							className="flex w-full items-center gap-2"
						>
							<Input
								ref={urlInput}
								placeholder="https://youtu.be/..."
								aria-label="input Youtube video url"
								required
							/>
							<Button type="submit" className="shrink-0">
								입력
							</Button>
						</form>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
