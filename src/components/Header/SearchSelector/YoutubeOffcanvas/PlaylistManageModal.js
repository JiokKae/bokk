import { useMutation } from "@apollo/client";
import { useState } from "react";
import { Check, ListMusic, Share2 } from "lucide-react";
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
	DELETE_PLAYLIST,
	IMPORT_PLAYLIST,
	MY_PLAYLISTS,
	MY_VIDEO_ITEMS,
	UPDATE_PLAYLIST,
} from "../../../../constants/querys";

export default function PlaylistManageModal({
	show,
	onHide,
	playlists = [],
	videoItems = [],
	onDeletePlaylist,
}) {
	const [newPlaylistName, setNewPlaylistName] = useState("");
	const [importCode, setImportCode] = useState("");
	const [copiedCodeId, setCopiedCodeId] = useState(null);
	const [editingId, setEditingId] = useState(null);
	const [editingName, setEditingName] = useState("");

	const [createPlaylist, { loading: creating }] = useMutation(CREATE_PLAYLIST, {
		onCompleted: () => {
			setNewPlaylistName("");
		},
		onError: (err) => {
			alert(err.message || "플레이리스트 생성에 실패했습니다.");
		},
		refetchQueries: [{ query: MY_PLAYLISTS }, { query: MY_VIDEO_ITEMS }],
	});

	const [importPlaylist, { loading: importing }] = useMutation(IMPORT_PLAYLIST, {
		onCompleted: (data) => {
			setImportCode("");
			const importedName = data?.importPlaylist?.name || "플레이리스트";
			alert(`'${importedName}' 플레이리스트를 성공적으로 가져왔습니다!`);
		},
		onError: (err) => {
			alert(err.message || "플레이리스트 가져오기에 실패했습니다. 공유코드를 확인해주세요.");
		},
		refetchQueries: [{ query: MY_PLAYLISTS }, { query: MY_VIDEO_ITEMS }],
	});

	const [updatePlaylist, { loading: updating }] = useMutation(UPDATE_PLAYLIST, {
		onCompleted: () => {
			setEditingId(null);
			setEditingName("");
		},
		onError: (err) => {
			alert(err.message || "플레이리스트 수정에 실패했습니다.");
		},
		refetchQueries: [{ query: MY_PLAYLISTS }, { query: MY_VIDEO_ITEMS }],
	});

	const [deletePlaylist, { loading: deleting }] = useMutation(DELETE_PLAYLIST, {
		onError: (err) => {
			alert(err.message || "플레이리스트 삭제에 실패했습니다.");
		},
		refetchQueries: [{ query: MY_PLAYLISTS }, { query: MY_VIDEO_ITEMS }],
	});

	const handleCreate = (e) => {
		e.preventDefault();
		const trimmed = newPlaylistName.trim();
		if (!trimmed) return;
		createPlaylist({ variables: { name: trimmed } });
	};

	const isValidImportCode = /^[A-Z0-9]{8}$/.test(importCode.trim().toUpperCase());

	const handleImport = (e) => {
		e.preventDefault();
		const trimmed = importCode.trim().toUpperCase();

		if (!trimmed) {
			alert("8자리 공유코드를 입력해주세요.");
			return;
		}

		if (!/^[A-Z0-9]{8}$/.test(trimmed)) {
			alert("공유코드는 8자리 영문과 숫자로 구성되어야 합니다. (예: 7Y4R9TWK)");
			return;
		}

		importPlaylist({ variables: { shareCode: trimmed } });
	};

	const handleCopyShareCode = (playlist) => {
		if (!playlist.shareCode) return;
		const code = playlist.shareCode;
		if (navigator?.clipboard?.writeText) {
			navigator.clipboard
				.writeText(code)
				.then(() => {
					setCopiedCodeId(playlist.id);
					setTimeout(() => setCopiedCodeId(null), 2000);
				})
				.catch(() => {
					fallbackCopy(code, playlist.id);
				});
		} else {
			fallbackCopy(code, playlist.id);
		}
	};

	const fallbackCopy = (code, playlistId) => {
		const textarea = document.createElement("textarea");
		textarea.value = code;
		textarea.style.position = "fixed";
		textarea.style.opacity = "0";
		document.body.appendChild(textarea);
		textarea.select();
		try {
			document.execCommand("copy");
			setCopiedCodeId(playlistId);
			setTimeout(() => setCopiedCodeId(null), 2000);
		} catch (e) {
			alert(`공유코드: ${code}`);
		}
		document.body.removeChild(textarea);
	};

	const handleStartEdit = (playlist) => {
		setEditingId(playlist.id);
		setEditingName(playlist.name);
	};

	const handleSaveEdit = (id) => {
		const trimmed = editingName.trim();
		if (!trimmed) return;
		updatePlaylist({ variables: { id, name: trimmed } });
	};

	const handleDelete = (playlist) => {
		if (
			window.confirm(
				`'${playlist.name}' 플레이리스트를 삭제하시겠습니까?\n(등록된 영상은 삭제되지 않고 유지됩니다)`
			)
		) {
			deletePlaylist({ variables: { id: playlist.id } });
			onDeletePlaylist?.(playlist.id);
		}
	};

	return (
		<Dialog
			open={Boolean(show)}
			onOpenChange={(nextOpen) => {
				if (!nextOpen) onHide?.();
			}}
		>
			<DialogContent className="max-w-lg gap-0 overflow-hidden p-0">
				<DialogHeader className="rounded-t-xl border-0 border-b border-solid border-zinc-200 bg-white px-5 py-3.5">
					<div className="flex items-center gap-2.5">
						<span className="inline-flex size-8 items-center justify-center rounded-lg bg-bokk-subtle text-bokk-dark">
							<ListMusic className="size-4" />
						</span>
						<div>
							<DialogTitle className="text-lg font-bold text-zinc-900">
								플레이리스트 관리
							</DialogTitle>
							<DialogDescription className="sr-only">
								새 플레이리스트 생성, 8자리 공유코드 가져오기 및 내 플레이리스트를 관리합니다.
							</DialogDescription>
						</div>
					</div>
				</DialogHeader>

				<div className="max-h-[70vh] overflow-y-auto bg-white px-5 py-4">
					{/* 신규 플레이리스트 등록 폼 */}
					<form onSubmit={handleCreate} className="mb-3.5">
						<label className="mb-1.5 block text-[13.5px] font-semibold text-zinc-700">
							새 플레이리스트 만들기
						</label>
						<div className="flex items-center gap-2">
							<Input
								placeholder="플레이리스트 이름 (예: 신나는 음악, 노동요)"
								value={newPlaylistName}
								maxLength={30}
								onChange={(e) => setNewPlaylistName(e.target.value)}
								onClick={(e) => e.target.focus()}
								disabled={creating}
							/>
							<Button
								type="submit"
								size="sm"
								className="h-9 shrink-0 px-3.5 text-[13px]"
								disabled={creating || !newPlaylistName.trim()}
							>
								{creating ? "생성 중..." : "+ 추가"}
							</Button>
						</div>
					</form>

					{/* 공유코드로 플레이리스트 가져오기 폼 */}
					<form onSubmit={handleImport} className="mb-4">
						<label className="mb-1.5 block text-[13.5px] font-semibold text-zinc-700">
							공유코드로 플레이리스트 가져오기
						</label>
						<div className="flex items-center gap-2">
							<Input
								placeholder="8자리 공유코드 입력 (예: 7Y4R9TWK)"
								value={importCode}
								maxLength={8}
								autoComplete="off"
								spellCheck={false}
								onChange={(e) => {
									const val = e.target.value
										.toUpperCase()
										.replace(/[^A-Z0-9]/g, "")
										.slice(0, 8);
									setImportCode(val);
								}}
								onClick={(e) => e.target.focus()}
								disabled={importing}
							/>
							<Button
								type="submit"
								size="sm"
								variant="outline"
								className="h-9 shrink-0 border-bokk-border bg-bokk-subtle/70 px-3.5 text-[13px] text-bokk-dark hover:bg-bokk-subtle"
								disabled={importing || !isValidImportCode}
							>
								{importing ? "가져오는 중..." : "가져오기"}
							</Button>
						</div>
					</form>

					<div className="mb-3.5 border-0 border-t border-solid border-zinc-200" />

					{/* 플레이리스트 목록 헤더 */}
					<div className="mb-2 flex items-center justify-between px-0.5">
						<span className="text-[13.5px] font-semibold text-zinc-700">
							내 플레이리스트
						</span>
						<Badge variant="subtle">{playlists.length}개</Badge>
					</div>

					{playlists.length === 0 ? (
						<div className="rounded-xl border-[1px] border-solid border-zinc-200 bg-zinc-50/70 py-8 text-center text-sm leading-relaxed text-zinc-500">
							등록된 플레이리스트가 없습니다.
							<br />
							새로운 플레이리스트를 만들거나 공유코드로 가져와보세요!
						</div>
					) : (
						<div className="max-h-72 overflow-y-auto rounded-xl border-[1px] border-solid border-zinc-200 bg-white">
							{playlists.map((pl, index) => {
								const songCount =
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
										className={cn(
											"flex items-center justify-between gap-2 px-3.5 py-2.5",
											index !== 0 &&
												"border-0 border-t border-solid border-zinc-100"
										)}
									>
										{editingId === pl.id ? (
											<div className="flex w-full items-center gap-1.5">
												<Input
													className="h-8 text-sm"
													value={editingName}
													maxLength={30}
													onChange={(e) => setEditingName(e.target.value)}
													onClick={(e) => e.target.focus()}
													autoFocus
													onKeyDown={(e) => {
														if (e.key === "Enter") {
															e.preventDefault();
															handleSaveEdit(pl.id);
														} else if (e.key === "Escape") {
															setEditingId(null);
														}
													}}
												/>
												<Button
													size="sm"
													className="h-8 shrink-0 px-3"
													onClick={() => handleSaveEdit(pl.id)}
													disabled={updating || !editingName.trim()}
												>
													저장
												</Button>
												<Button
													variant="outline"
													size="sm"
													className="h-8 shrink-0 px-2.5"
													onClick={() => setEditingId(null)}
												>
													취소
												</Button>
											</div>
										) : (
											<>
												<div className="min-w-0 flex-1">
													<div
														className="truncate text-sm font-semibold text-zinc-900"
														title={pl.name}
													>
														{pl.name}
													</div>
													<div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-zinc-500">
														<span>{songCount}곡</span>
														{pl.shareCode && (
															<>
																<span className="text-zinc-300">·</span>
																<span>공유코드:</span>
																<code className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-zinc-700">
																	{pl.shareCode}
																</code>
															</>
														)}
													</div>
												</div>

												<div className="flex shrink-0 items-center gap-1.5">
													{pl.shareCode && (
														<Button
															size="sm"
															variant="outline"
															className={cn(
																"h-7 px-2 text-xs",
																copiedCodeId === pl.id
																	? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-700"
																	: "border-bokk-border bg-bokk-subtle/50 text-bokk-dark hover:bg-bokk-subtle"
															)}
															title="공유코드 클립보드 복사"
															onClick={() => handleCopyShareCode(pl)}
														>
															{copiedCodeId === pl.id ? (
																<>
																	<Check className="size-3" />
																	<span>복사됨</span>
																</>
															) : (
																<>
																	<Share2 className="size-3" />
																	<span>공유</span>
																</>
															)}
														</Button>
													)}
													<Button
														size="sm"
														variant="outline"
														className="h-7 px-2.5 text-xs"
														onClick={() => handleStartEdit(pl)}
													>
														수정
													</Button>
													<Button
														size="sm"
														variant="outline"
														className="h-7 border-red-200 px-2.5 text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
														onClick={() => handleDelete(pl)}
														disabled={deleting}
													>
														삭제
													</Button>
												</div>
											</>
										)}
									</div>
								);
							})}
						</div>
					)}
				</div>

				<DialogFooter className="flex-row justify-end rounded-b-xl border-0 border-t border-solid border-zinc-200 bg-zinc-100/80 px-5 py-3">
					<Button variant="outline" size="sm" onClick={onHide}>
						닫기
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
