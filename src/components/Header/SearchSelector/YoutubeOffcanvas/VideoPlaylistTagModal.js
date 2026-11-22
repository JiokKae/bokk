import { useMutation } from "@apollo/client";
import { useEffect, useRef, useState } from "react";
import { Check, ListPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
import { cn } from "@/lib/utils";
import {
	CREATE_PLAYLIST,
	MY_PLAYLISTS,
	MY_VIDEO_ITEMS,
	SET_VIDEO_PLAYLISTS,
} from "../../../../constants/querys";
import useOffcanvasFocusTrapBypass from "../../../../hooks/useOffcanvasFocusTrapBypass";

export default function VideoPlaylistTagModal({
	show,
	onHide,
	videoItem,
	playlists = [],
	videoItems = [],
}) {
	const [selectedIds, setSelectedIds] = useState([]);
	const [newPlaylistName, setNewPlaylistName] = useState("");
	const inputRef = useRef(null);

	useOffcanvasFocusTrapBypass(show);

	// 플레이리스트가 0개인 경우 바로 인풋에 포커스
	useEffect(() => {
		if (show && playlists.length === 0) {
			setTimeout(() => {
				inputRef.current?.focus();
			}, 100);
		}
	}, [show, playlists.length]);

	useEffect(() => {
		if (videoItem?.playlists) {
			setSelectedIds(videoItem.playlists.map((p) => p.id));
		} else {
			setSelectedIds([]);
		}
	}, [videoItem]);

	const [setVideoPlaylists, { loading: saving }] = useMutation(
		SET_VIDEO_PLAYLISTS,
		{
			onCompleted: () => {
				onHide();
			},
			onError: (err) => {
				alert(err.message || "플레이리스트 저장에 실패했습니다.");
			},
			refetchQueries: [{ query: MY_VIDEO_ITEMS }, { query: MY_PLAYLISTS }],
		}
	);

	const [createPlaylist, { loading: creating }] = useMutation(CREATE_PLAYLIST, {
		onCompleted: (data) => {
			if (data?.createPlaylist?.id) {
				const newId = data.createPlaylist.id;
				setSelectedIds((prev) => [...prev, newId]);
				setNewPlaylistName("");
				setTimeout(() => {
					inputRef.current?.focus();
				}, 50);
			}
		},
		onError: (err) => {
			alert(err.message || "플레이리스트 생성에 실패했습니다.");
		},
		refetchQueries: [{ query: MY_PLAYLISTS }, { query: MY_VIDEO_ITEMS }],
	});

	const handleToggle = (id) => {
		setSelectedIds((prev) =>
			prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
		);
	};

	const handleQuickCreate = (e) => {
		e.preventDefault();
		const trimmed = newPlaylistName.trim();
		if (!trimmed) return;
		createPlaylist({ variables: { name: trimmed } });
	};

	const handleSave = () => {
		if (!videoItem?.id) return;
		setVideoPlaylists({
			variables: {
				queueItemId: videoItem.id,
				playlistIds: selectedIds,
			},
		});
	};

	// PC 키보드 단축키: Ctrl + Enter 또는 Cmd + Enter로 빠른 저장
	const handleModalKeyDown = (e) => {
		if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
			e.preventDefault();
			handleSave();
		}
	};

	return (
		<Dialog
			open={Boolean(show)}
			onOpenChange={(nextOpen) => {
				if (!nextOpen) onHide?.();
			}}
		>
			<DialogContent
				className="max-w-md gap-0 overflow-hidden p-0"
				onKeyDown={handleModalKeyDown}
			>
				<DialogHeader className="rounded-t-xl border-0 border-b border-solid border-zinc-200 bg-white px-5 py-3.5">
					<div className="flex items-center gap-2.5">
						<span className="inline-flex size-8 items-center justify-center rounded-lg bg-bokk-subtle text-bokk-dark">
							<ListPlus className="size-4" />
						</span>
						<div>
							<DialogTitle className="text-lg font-bold text-zinc-900">
								플레이리스트에 담기
							</DialogTitle>
							<DialogDescription className="sr-only">
								선택한 곡을 담을 플레이리스트를 복수 선택하거나 새로 추가합니다.
							</DialogDescription>
						</div>
					</div>
				</DialogHeader>

				<div className="max-h-[70vh] overflow-y-auto bg-white px-5 py-4">
					{videoItem && (
						<div className="mb-3.5">
							<div
								className="mb-1 truncate text-sm font-semibold text-zinc-900"
								title={videoItem.video?.title}
							>
								{videoItem.video?.title}
							</div>
							<div className="text-xs text-zinc-500">
								이 곡을 담을 플레이리스트를 선택하세요 (복수 선택 가능)
							</div>
						</div>
					)}

					{/* 플레이리스트 체크박스 목록 */}
					{playlists.length === 0 ? (
						<div className="mb-3.5 rounded-xl border-[1px] border-solid border-zinc-200 bg-zinc-50/70 py-6 text-center text-sm leading-relaxed text-zinc-500">
							등록된 플레이리스트가 없습니다.
							<br />
							아래에서 새 플레이리스트를 만들어보세요!
						</div>
					) : (
						<div className="mb-3.5 max-h-60 overflow-y-auto rounded-xl border-[1px] border-solid border-zinc-200 bg-white">
							{playlists.map((pl, index) => {
								const isChecked = selectedIds.includes(pl.id);
								const count =
									videoItems && videoItems.length > 0
										? videoItems.filter(
												(item) =>
													item.playlists &&
													item.playlists.some((p) => p.id === pl.id)
										  ).length
										: pl.videoCount || 0;

								return (
									<div
										key={pl.id}
										role="checkbox"
										aria-checked={isChecked}
										tabIndex={0}
										className={cn(
											"flex cursor-pointer select-none items-center justify-between gap-2 px-3.5 py-2.5 transition-colors",
											index !== 0 &&
												"border-0 border-t border-solid border-zinc-100",
											isChecked
												? "bg-bokk-subtle/60"
												: "hover:bg-zinc-50"
										)}
										onClick={() => handleToggle(pl.id)}
										onKeyDown={(e) => {
											if (e.key === " " || e.key === "Enter") {
												e.preventDefault();
												handleToggle(pl.id);
											}
										}}
									>
										<div className="pointer-events-none flex min-w-0 items-center gap-2.5">
											<span
												className={cn(
													"inline-flex size-4 shrink-0 items-center justify-center rounded border-[1px] border-solid transition-colors",
													isChecked
														? "border-bokk bg-bokk text-white"
														: "border-zinc-300 bg-white"
												)}
											>
												{isChecked && <Check className="size-3 stroke-[3]" />}
											</span>
											<span
												className={cn(
													"truncate text-sm",
													isChecked
														? "font-semibold text-bokk-dark"
														: "text-zinc-800"
												)}
											>
												{pl.name}
											</span>
										</div>
										<Badge
											variant={isChecked ? "subtle" : "secondary"}
											className="pointer-events-none shrink-0"
										>
											{count}곡
										</Badge>
									</div>
								);
							})}
						</div>
					)}

					{/* 빠른 새 플레이리스트 추가 */}
					<form onSubmit={handleQuickCreate} className="flex items-center gap-2">
						<Input
							ref={inputRef}
							placeholder="새 플레이리스트 즉시 추가..."
							value={newPlaylistName}
							maxLength={30}
							autoComplete="off"
							onChange={(e) => setNewPlaylistName(e.target.value)}
							onClick={(e) => e.target.focus()}
							onKeyDown={(e) => {
								if (e.key === "Enter") {
									e.preventDefault();
									handleQuickCreate(e);
								}
							}}
							disabled={creating}
						/>
						<Button
							type="submit"
							size="sm"
							className="h-9 shrink-0 px-3 text-[13px]"
							disabled={creating || !newPlaylistName.trim()}
						>
							{creating ? "..." : "+ 추가"}
						</Button>
					</form>
				</div>

				<DialogFooter className="flex-row items-center justify-between rounded-b-xl border-0 border-t border-solid border-zinc-200 bg-zinc-100/80 px-5 py-3">
					<Button variant="outline" size="sm" onClick={onHide}>
						취소
					</Button>
					<Button
						size="sm"
						onClick={handleSave}
						disabled={saving}
						title="저장 (단축키: Ctrl + Enter)"
					>
						{saving ? "저장 중..." : "담기 완료"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
