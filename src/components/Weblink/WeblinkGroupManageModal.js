import { useMutation, useQuery } from "@apollo/client";
import { useEffect, useState } from "react";
import { Button, Form, InputGroup, ListGroup, Modal } from "react-bootstrap";
import {
	BUILTIN_WEBLINKS,
	CREATE_WEBLINK_GROUP,
	DELETE_WEBLINK_GROUP,
	MY_WEBLINK_GROUPS,
	OWN_WEBLINKS,
	REORDER_WEBLINK_GROUPS,
	UPDATE_WEBLINK_GROUP,
} from "../../constants/querys";

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
		if (groupId === 0) {
			return builtinWeblinks.length;
		}
		if (groupId === -1) {
			return weblinks.filter(
				(w) => !w.groupId || !groups.some((g) => g.id === w.groupId && g.id > 0)
			).length;
		}
		return weblinks.filter((w) => w.groupId === groupId).length;
	};

	return (
		<Modal show={show} onHide={onHide} centered backdrop="static">
			<Modal.Header closeButton>
				<Modal.Title as="h5" className="fw-bold">
					📁 웹링크 그룹 관리
				</Modal.Title>
			</Modal.Header>
			<Modal.Body className="p-3">
				{/* 새 그룹 만들기 */}
				<div className="mb-4 p-3 bg-light rounded-3 border">
					<div className="fw-semibold small text-secondary mb-2">
						새 웹링크 그룹 생성
					</div>
					<Form onSubmit={handleCreate}>
						<InputGroup size="sm">
							<Form.Control
								type="text"
								placeholder="그룹 이름 입력 (예: 업무, 개발, 쇼핑)"
								value={newGroupName}
								maxLength={30}
								onChange={(e) => setNewGroupName(e.target.value)}
								disabled={creating}
							/>
							<Button
								variant="primary"
								type="submit"
								disabled={creating || !newGroupName.trim()}
							>
								{creating ? "생성 중..." : "+ 추가"}
							</Button>
						</InputGroup>
					</Form>
				</div>

				{/* 그룹 목록 */}
				<div className="d-flex align-items-center justify-content-between mb-2 px-1">
					<span className="fw-semibold small text-secondary">
						내 그룹 목록 ({groups.length})
					</span>
					{groups.length > 1 && (
						<small className="text-muted" style={{ fontSize: "11px" }}>
							☰ 핸들을 드래그하여 순서 변경
						</small>
					)}
				</div>

				{groups.length === 0 ? (
					<div className="text-center text-muted py-4 border rounded-3 bg-white">
						<div className="fs-4 mb-1">📂</div>
						<small>생성된 웹링크 그룹이 없습니다.</small>
					</div>
				) : (
					<ListGroup
						variant="flush"
						className="border rounded-3 overflow-hidden bg-white"
					>
						{groups.map((group, index) => {
							const isEditing = editingId === group.id;
							const isSpecial = group.id <= 0;
							const isBuiltin = group.id === 0;
							const isUntagged = group.id === -1;
							const count = getGroupCount(group.id);
							const isDragging = draggedIndex === index;

							return (
								<ListGroup.Item
									key={group.id}
									className={`p-2.5 ${isDragging ? "bg-light opacity-50 shadow-sm" : ""}`}
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
									style={{
										userSelect: "none",
										transition: "all 0.15s ease",
									}}
								>
									{isEditing ? (
										<div className="d-flex align-items-center gap-1.5">
											<Form.Control
												size="sm"
												type="text"
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
												variant="success"
												className="py-1 px-2.5 text-nowrap"
												onClick={() => handleSaveEdit(group.id)}
												disabled={updating}
											>
												저장
											</Button>
											<Button
												size="sm"
												variant="outline-secondary"
												className="py-1 px-2 text-nowrap"
												onClick={handleCancelEdit}
												disabled={updating}
											>
												취소
											</Button>
										</div>
									) : (
										<div className="d-flex align-items-center justify-content-between">
											<div
												className="d-flex align-items-center text-truncate me-2"
												style={{ minWidth: 0 }}
											>
												<span
													className="me-2 text-secondary user-select-none"
													style={{
														cursor: "grab",
														fontSize: "16px",
														lineHeight: 1,
													}}
													onMouseDown={() => setIsAllowDrag(true)}
													onMouseUp={() => setIsAllowDrag(false)}
													onTouchStart={() => setIsAllowDrag(true)}
													onTouchEnd={() => setIsAllowDrag(false)}
													title="드래그하여 순서 변경"
												>
													☰
												</span>
												<span
													className="text-truncate fw-medium"
													title={group.name}
												>
													{group.name}
												</span>
												{isBuiltin && (
													<span
														className="badge rounded-pill bg-light text-primary border border-primary-subtle ms-2 flex-shrink-0"
														style={{ fontSize: "10px", fontWeight: 600 }}
													>
														기본
													</span>
												)}
												{isUntagged && (
													<span
														className="badge rounded-pill bg-light text-secondary border ms-2 flex-shrink-0"
														style={{ fontSize: "10px", fontWeight: 600 }}
													>
														미분류
													</span>
												)}
												<span
													className="badge rounded-pill bg-light text-secondary border ms-2 flex-shrink-0"
													style={{ fontSize: "11px", fontWeight: 500 }}
												>
													{count}
												</span>
											</div>
											<div className="d-flex align-items-center gap-1 flex-shrink-0">
												{!isSpecial ? (
													<>
														<Button
															size="sm"
															variant="outline-secondary"
															className="py-0 px-2"
															style={{ fontSize: "12px", height: "26px" }}
															onClick={() => handleStartEdit(group)}
														>
															수정
														</Button>
														<Button
															size="sm"
															variant="outline-danger"
															className="py-0 px-2"
															style={{ fontSize: "12px", height: "26px" }}
															onClick={() => handleDelete(group.id, group.name)}
															disabled={deleting}
														>
															삭제
														</Button>
													</>
												) : (
													<small
														className="text-muted px-2 user-select-none"
														style={{ fontSize: "11px" }}
													>
														{isBuiltin ? "기본 그룹" : "시스템 그룹"}
													</small>
												)}
											</div>
										</div>
									)}
								</ListGroup.Item>
							);
						})}
					</ListGroup>
				)}
			</Modal.Body>
			<Modal.Footer className="py-2">
				<Button variant="secondary" size="sm" onClick={onHide}>
					닫기
				</Button>
			</Modal.Footer>
		</Modal>
	);
}
