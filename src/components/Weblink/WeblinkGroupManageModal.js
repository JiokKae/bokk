import { useMutation, useQuery } from "@apollo/client";
import { useEffect, useState } from "react";
import { Folder, FolderOpen, GripVertical } from "lucide-react";
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
	BUILTIN_WEBLINKS,
	CREATE_WEBLINK_GROUP,
	DELETE_WEBLINK_GROUP,
	MY_WEBLINK_GROUPS,
	OWN_WEBLINKS,
	REORDER_WEBLINK_GROUPS,
	UPDATE_WEBLINK_GROUP,
} from "../../constants/querys";
import { WEBLINK_GROUP_ID, isUntaggedWeblink } from "../../utils/weblinkUtil";

export default function WeblinkGroupManageModal({ show, onHide }) {
	const [newGroupName, setNewGroupName] = useState("");
	const [editingId, setEditingId] = useState(null);
	const [editingName, setEditingName] = useState("");
	const [draggedIndex, setDraggedIndex] = useState(null);
	const [isAllowDrag, setIsAllowDrag] = useState(false);

	const { data: groupData } = useQuery(MY_WEBLINK_GROUPS);
	const { data: weblinksData } = useQuery(OWN_WEBLINKS);
	const { data: builtinData } = useQuery(BUILTIN_WEBLINKS);

	const [groups, setGroups] = useState([]);

	useEffect(() => {
		if (groupData?.myWeblinkGroups) {
			setGroups(groupData.myWeblinkGroups);
		}
	}, [groupData]);

	const weblinks = weblinksData?.ownWeblinks || [];
	const builtinWeblinks = builtinData?.builtinWeblinks?.weblinks || [];

	const [createWeblinkGroup, { loading: creating }] = useMutation(CREATE_WEBLINK_GROUP, {
		onCompleted: () => {
			setNewGroupName("");
		},
		onError: (err) => {
			alert(err.message || "웹링크 그룹 생성에 실패했습니다.");
		},
		refetchQueries: [{ query: MY_WEBLINK_GROUPS }, { query: OWN_WEBLINKS }],
	});

	const [updateWeblinkGroup, { loading: updating }] = useMutation(UPDATE_WEBLINK_GROUP, {
		onCompleted: () => {
			setEditingId(null);
			setEditingName("");
		},
		onError: (err) => {
			alert(err.message || "웹링크 그룹 수정에 실패했습니다.");
		},
		refetchQueries: [{ query: MY_WEBLINK_GROUPS }, { query: OWN_WEBLINKS }],
	});

	const [deleteWeblinkGroup, { loading: deleting }] = useMutation(DELETE_WEBLINK_GROUP, {
		onError: (err) => {
			alert(err.message || "웹링크 그룹 삭제에 실패했습니다.");
		},
		refetchQueries: [{ query: MY_WEBLINK_GROUPS }, { query: OWN_WEBLINKS }],
	});

	const [reorderWeblinkGroups] = useMutation(REORDER_WEBLINK_GROUPS, {
		refetchQueries: [{ query: MY_WEBLINK_GROUPS }],
	});

	const handleCreate = (e) => {
		e.preventDefault();
		const trimmed = newGroupName.trim();
		if (!trimmed) return;
		createWeblinkGroup({ variables: { name: trimmed } });
	};

	const handleStartEdit = (group) => {
		setEditingId(group.id);
		setEditingName(group.name);
	};

	const handleCancelEdit = () => {
		setEditingId(null);
		setEditingName("");
	};

	const handleSaveEdit = (groupId) => {
		const trimmed = editingName.trim();
		if (!trimmed) {
			alert("그룹 이름을 입력해주세요.");
			return;
		}
		updateWeblinkGroup({ variables: { id: groupId, name: trimmed } });
	};

	const handleDelete = (groupId, groupName) => {
		if (
			window.confirm(
				`'${groupName}' 그룹을 삭제하시겠습니까?\n소속된 웹링크는 미분류 상태로 안전하게 보존됩니다.`
			) === false
		) {
			return;
		}
		deleteWeblinkGroup({ variables: { groupId } });
	};

	// 드래그 앤 드롭 핸들러
	const handleDragStart = (e, index) => {
		setDraggedIndex(index);
		e.dataTransfer.effectAllowed = "move";
	};

	const handleDragEnter = (e, targetIndex) => {
		e.preventDefault();
		if (draggedIndex === null || draggedIndex === targetIndex) return;

		const newGroups = [...groups];
		const draggedItem = newGroups[draggedIndex];
		newGroups.splice(draggedIndex, 1);
		newGroups.splice(targetIndex, 0, draggedItem);

		setDraggedIndex(targetIndex);
		setGroups(newGroups);
	};

	const handleDragOver = (e) => {
		e.preventDefault();
		e.dataTransfer.dropEffect = "move";
	};

	const handleDragEnd = () => {
		if (draggedIndex !== null && groups.length > 0) {
			const ids = groups.map((g) => g.id);
			reorderWeblinkGroups({ variables: { groupIds: ids } });
		}
		setDraggedIndex(null);
		setIsAllowDrag(false);
	};

	const getGroupCount = (groupId) => {
		if (groupId === WEBLINK_GROUP_ID.BUILTIN) {
			return builtinWeblinks.length;
		}
		if (groupId === WEBLINK_GROUP_ID.UNTAGGED) {
			return weblinks.filter((w) => isUntaggedWeblink(w, groups)).length;
		}
		return weblinks.filter((w) => w.groupId === groupId).length;
	};

	return (
		<Dialog open={Boolean(show)} onOpenChange={(nextOpen) => { if (!nextOpen) onHide?.(); }}>
			<DialogContent
				className="max-w-lg gap-0 overflow-hidden p-0"
				onInteractOutside={(e) => e.preventDefault()}
			>
				<DialogHeader className="rounded-t-xl border-0 border-b border-solid border-zinc-200 bg-white px-5 py-3.5">
					<div className="flex items-center gap-2.5">
						<span className="inline-flex size-8 items-center justify-center rounded-lg bg-bokk-subtle text-bokk-dark">
							<Folder className="size-4" />
						</span>
						<div>
							<DialogTitle className="text-lg font-bold text-zinc-900">
								웹링크 그룹 관리
							</DialogTitle>
							<DialogDescription className="sr-only">
								웹링크 그룹을 생성, 수정, 삭제하거나 드래그하여 순서를 변경합니다.
							</DialogDescription>
						</div>
					</div>
				</DialogHeader>

				<div className="max-h-[70vh] overflow-y-auto bg-white px-5 py-4">
					{/* 새 그룹 만들기 */}
					<div className="mb-4 rounded-xl border-[1px] border-solid border-zinc-200 bg-zinc-50 p-3.5">
						<div className="mb-2 text-[13.5px] font-semibold text-zinc-700">
							새 웹링크 그룹 생성
						</div>
						<form onSubmit={handleCreate} className="flex items-center gap-2">
							<Input
								type="text"
								placeholder="그룹 이름 입력 (예: 업무, 개발, 쇼핑)"
								value={newGroupName}
								maxLength={30}
								onChange={(e) => setNewGroupName(e.target.value)}
								disabled={creating}
							/>
							<Button
								type="submit"
								size="sm"
								className="h-9 shrink-0 px-3.5 text-[13px]"
								disabled={creating || !newGroupName.trim()}
							>
								{creating ? "생성 중..." : "+ 추가"}
							</Button>
						</form>
					</div>

					{/* 그룹 목록 헤더 */}
					<div className="mb-2 flex items-center justify-between px-0.5">
						<span className="text-[13.5px] font-semibold text-zinc-700">
							내 그룹 목록 ({groups.length})
						</span>
						{groups.length > 1 && (
							<span className="text-xs text-zinc-500">
								핸들을 드래그하여 순서 변경
							</span>
						)}
					</div>

					{groups.length === 0 ? (
						<div className="flex flex-col items-center justify-center gap-1.5 rounded-xl border-[1px] border-solid border-zinc-200 bg-zinc-50/60 py-8 text-center text-zinc-500">
							<FolderOpen className="size-6 text-zinc-400" />
							<span className="text-sm">생성된 웹링크 그룹이 없습니다.</span>
						</div>
					) : (
						<div className="overflow-hidden rounded-xl border-[1px] border-solid border-zinc-200 bg-white">
							{groups.map((group, index) => {
								const isEditing = editingId === group.id;
								const isSpecial = group.id <= 0;
								const isBuiltin = group.id === 0;
								const isUntagged = group.id === -1;
								const count = getGroupCount(group.id);
								const isDragging = draggedIndex === index;

								return (
									<div
										key={group.id}
										className={cn(
											"select-none px-3 py-2.5 transition-all duration-150",
											index !== 0 && "border-0 border-t border-solid border-zinc-100",
											isDragging && "bg-bokk-subtle/50 opacity-60"
										)}
										draggable={isAllowDrag && !isEditing}
										onDragStart={(e) => {
											if (!isAllowDrag) {
												e.preventDefault();
												return;
											}
											handleDragStart(e, index);
										}}
										onDragEnter={(e) => handleDragEnter(e, index)}
										onDragOver={handleDragOver}
										onDragEnd={handleDragEnd}
									>
										{isEditing ? (
											<div className="flex items-center gap-1.5">
												<Input
													type="text"
													className="h-8 text-sm"
													value={editingName}
													maxLength={30}
													autoFocus
													onChange={(e) => setEditingName(e.target.value)}
													onKeyDown={(e) => {
														if (e.key === "Enter") {
															e.preventDefault();
															handleSaveEdit(group.id);
														} else if (e.key === "Escape") {
															handleCancelEdit();
														}
													}}
													disabled={updating}
												/>
												<Button
													size="sm"
													className="h-8 shrink-0 px-3"
													onClick={() => handleSaveEdit(group.id)}
													disabled={updating}
												>
													저장
												</Button>
												<Button
													size="sm"
													variant="outline"
													className="h-8 shrink-0 px-2.5"
													onClick={handleCancelEdit}
													disabled={updating}
												>
													취소
												</Button>
											</div>
										) : (
											<div className="flex items-center justify-between gap-2">
												<div className="flex min-w-0 items-center gap-2">
													<span
														className="inline-flex shrink-0 cursor-grab items-center text-zinc-400 hover:text-zinc-600"
														onMouseDown={() => setIsAllowDrag(true)}
														onMouseUp={() => setIsAllowDrag(false)}
														onTouchStart={() => setIsAllowDrag(true)}
														onTouchEnd={() => setIsAllowDrag(false)}
														title="드래그하여 순서 변경"
													>
														<GripVertical className="size-4" />
													</span>
													<span
														className="truncate text-sm font-medium text-zinc-900"
														title={group.name}
													>
														{group.name}
													</span>
													{isBuiltin && (
														<Badge variant="subtle" className="shrink-0">
															기본
														</Badge>
													)}
													{isUntagged && (
														<Badge variant="secondary" className="shrink-0">
															미분류
														</Badge>
													)}
													<Badge variant="outline" className="shrink-0 text-zinc-500">
														{count}
													</Badge>
												</div>

												<div className="flex shrink-0 items-center gap-1.5">
													{!isSpecial ? (
														<>
															<Button
																size="sm"
																variant="outline"
																className="h-7 px-2.5 text-xs"
																onClick={() => handleStartEdit(group)}
															>
																수정
															</Button>
															<Button
																size="sm"
																variant="outline"
																className="h-7 border-red-200 px-2.5 text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
																onClick={() => handleDelete(group.id, group.name)}
																disabled={deleting}
															>
																삭제
															</Button>
														</>
													) : (
														<span className="px-1.5 text-xs text-zinc-400">
															{isBuiltin ? "기본 그룹" : "시스템 그룹"}
														</span>
													)}
												</div>
											</div>
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
