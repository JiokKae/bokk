import { useMutation, useQuery } from "@apollo/client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import AddWeblinkModal from "../../components/Weblink/AddWeblinkModal";
import UpdateWeblinkModal from "../../components/Weblink/UpdateWeblinkModal";
import Weblink from "../../components/Weblink/Weblink";
import WeblinkGroupManageModal from "../../components/Weblink/WeblinkGroupManageModal";
import {
	DELETE_WEBLINK,
	ME,
	MY_WEBLINK_GROUPS,
	OWN_WEBLINKS,
	REORDER_WEBLINKS,
	SET_WEBLINK_GROUP,
} from "../../constants/querys";

function WeblinkManageItem({
	className,
	index,
	weblink: { id, name, url, color, backgroundColor, groupId },
	onDragStart,
	onDragEnter,
	onDragOver,
	onDragEnd,
	isDragging,
}) {
	const [isAllowDrag, setIsAllowDrag] = useState(false);

	useEffect(() => {
		if (!isDragging) {
			setIsAllowDrag(false);
		}
	}, [isDragging]);

	const [deleteWeblink] = useMutation(DELETE_WEBLINK, {
		onCompleted: ({ deleteWeblink }) => {
			if (deleteWeblink === false) {
				alert("웹 링크를 제거하는데 실패했습니다");
				return;
			}
		},
		refetchQueries: [{ query: OWN_WEBLINKS }, { query: MY_WEBLINK_GROUPS }],
	});

	const onRemove = () => {
		if (window.confirm("정말 제거하시겠습니까?") === false) {
			return;
		}
		deleteWeblink({ variables: { weblinkId: id } });
	};

	return (
		<li
			className={`${className} ${isDragging ? "shadow-sm bg-light" : ""}`}
			draggable={isAllowDrag}
			onDragStart={(e) => {
				if (!isAllowDrag) {
					e.preventDefault();
					return;
				}
				onDragStart(e);
			}}
			onDragEnter={(e) => onDragEnter(e, index)}
			onDragOver={onDragOver}
			onDragEnd={(e) => {
				setIsAllowDrag(false);
				onDragEnd(e);
			}}
			style={{
				opacity: isDragging ? 0.35 : 1,
				transition: "opacity 0.15s ease",
				userSelect: "none",
			}}
		>
			<div className="row align-items-center">
				<div className="col-12 col-sm-6 d-flex align-items-center">
					<span
						className="me-3 text-secondary user-select-none fs-4"
						style={{
							cursor: isAllowDrag ? "grabbing" : "grab",
							lineHeight: 1,
						}}
						onMouseDown={() => setIsAllowDrag(true)}
						onMouseUp={() => setIsAllowDrag(false)}
						onTouchStart={() => setIsAllowDrag(true)}
						onTouchEnd={() => setIsAllowDrag(false)}
						title="드래그하여 순서 및 그룹 변경"
					>
						☰
					</span>
					<div className="flex-grow-1">
						<Weblink
							name={name}
							url={url}
							color={color}
							backgroundColor={backgroundColor}
						/>
					</div>
				</div>
				<div className="col-auto">
					<UpdateWeblinkModal
						weblink={{ id, name, url, color, backgroundColor, groupId }}
					/>
				</div>
				<div className="col-auto">
					<button className="btn btn-danger" onClick={onRemove}>
						삭제
					</button>
				</div>
			</div>
		</li>
	);
}

export default function MyWeblink() {
	const navigate = useNavigate();
	const { data: meData, loading: meLoading } = useQuery(ME);
	const { data } = useQuery(OWN_WEBLINKS);
	const { data: groupData } = useQuery(MY_WEBLINK_GROUPS);

	const [weblinks, setWeblinks] = useState([]);
	const [draggedInfo, setDraggedInfo] = useState(null);
	const [hoverTargetGroup, setHoverTargetGroup] = useState(null);
	const [showGroupModal, setShowGroupModal] = useState(false);

	const draggedInfoRef = useRef(draggedInfo);
	draggedInfoRef.current = draggedInfo;
	const weblinksRef = useRef(weblinks);
	weblinksRef.current = weblinks;

	const groups = groupData?.myWeblinkGroups || [];
	const userGroups = groups.filter((g) => g.id > 0);

	const [setWeblinkGroup] = useMutation(SET_WEBLINK_GROUP);
	const [reorderWeblinks] = useMutation(REORDER_WEBLINKS);

	// 비로그인 사용자 로그인 페이지로 리다이렉트
	useEffect(() => {
		if (!meLoading && !meData?.me) {
			navigate("/signin/");
		}
	}, [meData, meLoading, navigate]);

	useEffect(() => {
		if (data?.ownWeblinks) {
			setWeblinks(data.ownWeblinks);
		}
	}, [data]);

	const handleDragStart = (weblink) => {
		setDraggedInfo({
			id: weblink.id,
			originGroupId: weblink.groupId ?? null,
		});
	};

	const handleItemDragEnter = (e, targetGroupId, targetIndex) => {
		e.preventDefault();
		if (!draggedInfoRef.current) return;

		const draggedItem = weblinks.find((w) => w.id === draggedInfoRef.current.id);
		if (!draggedItem) return;

		const normTargetGroupId =
			targetGroupId === "untagged" ? null : Number(targetGroupId);

		// 대상 그룹의 아이템들 (드래그 중인 아이템 제외)
		const targetGroupItems = weblinks.filter(
			(w) =>
				(targetGroupId === "untagged"
					? !w.groupId || !groups.some((g) => g.id === w.groupId)
					: w.groupId === normTargetGroupId) && w.id !== draggedItem.id
		);

		// 대상 위치에 소속 그룹이 갱신된 드래그 아이템 삽입
		const updatedItem = { ...draggedItem, groupId: normTargetGroupId };
		targetGroupItems.splice(targetIndex, 0, updatedItem);

		// 모든 그룹 순서대로 weblinks 재구성
		const newWeblinks = [];
		groups.forEach((g) => {
			if (g.id === normTargetGroupId) {
				newWeblinks.push(...targetGroupItems);
			} else {
				newWeblinks.push(
					...weblinks.filter(
						(w) => w.groupId === g.id && w.id !== draggedItem.id
					)
				);
			}
		});

		if (normTargetGroupId === null) {
			newWeblinks.push(...targetGroupItems);
		} else {
			newWeblinks.push(
				...weblinks.filter(
					(w) =>
						(!w.groupId || !groups.some((g) => g.id === w.groupId)) &&
						w.id !== draggedItem.id
				)
			);
		}

		setWeblinks(newWeblinks);
		setHoverTargetGroup(targetGroupId);
	};

	const handleEmptyGroupDragEnter = (e, targetGroupId) => {
		e.preventDefault();
		if (!draggedInfoRef.current) return;

		const draggedItem = weblinks.find((w) => w.id === draggedInfoRef.current.id);
		if (!draggedItem) return;

		const normTargetGroupId =
			targetGroupId === "untagged" ? null : Number(targetGroupId);
		if (draggedItem.groupId === normTargetGroupId) return;

		const updatedItem = { ...draggedItem, groupId: normTargetGroupId };

		const newWeblinks = [];
		groups.forEach((g) => {
			if (g.id === normTargetGroupId) {
				newWeblinks.push(updatedItem);
			} else {
				newWeblinks.push(
					...weblinks.filter(
						(w) => w.groupId === g.id && w.id !== draggedItem.id
					)
				);
			}
		});

		if (normTargetGroupId === null) {
			newWeblinks.push(updatedItem);
		} else {
			newWeblinks.push(
				...weblinks.filter(
					(w) =>
						(!w.groupId || !groups.some((g) => g.id === w.groupId)) &&
						w.id !== draggedItem.id
				)
			);
		}

		setWeblinks(newWeblinks);
		setHoverTargetGroup(targetGroupId);
	};

	const handleDragOver = (e) => {
		e.preventDefault();
		e.dataTransfer.dropEffect = "move";
	};

	const handleDragEnd = useCallback(() => {
		const currentInfo = draggedInfoRef.current;
		// 1. UI 상태 즉각 초기화 (투명도 즉시 100% 복원, 테두리 하이라이트 즉시 해제)
		setDraggedInfo(null);
		setHoverTargetGroup(null);

		if (!currentInfo) return;

		const currentLinks = weblinksRef.current;
		const finalItem = currentLinks.find((w) => w.id === currentInfo.id);
		if (!finalItem) return;

		const originGid = currentInfo.originGroupId;
		const finalGid = finalItem.groupId ?? null;

		// 2. 비동기 백엔드 동기화 (UI는 이미 정상 복원된 상태)
		(async () => {
			if (originGid !== finalGid) {
				try {
					await setWeblinkGroup({
						variables: {
							weblinkId: finalItem.id,
							groupId: finalGid,
						},
					});
				} catch (err) {
					console.error("Failed to set weblink group:", err);
				}
			}

			const allIds = currentLinks.map((w) => w.id);
			try {
				await reorderWeblinks({
					variables: { weblinkIds: allIds },
					refetchQueries: [
						{ query: OWN_WEBLINKS },
						{ query: MY_WEBLINK_GROUPS },
					],
				});
			} catch (err) {
				console.error("Failed to reorder weblinks:", err);
			}
		})();
	}, [setWeblinkGroup, reorderWeblinks]);

	const handleDrop = (e) => {
		e.preventDefault();
		handleDragEnd();
	};

	// 드래그 중 브라우저 밖으로 마우스가 튀거나 윈도우 레벨에서 드래그가 종료될 때 안전망
	useEffect(() => {
		const handleGlobalDragEnd = () => {
			if (draggedInfoRef.current) {
				handleDragEnd();
			}
		};
		window.addEventListener("dragend", handleGlobalDragEnd);
		return () => {
			window.removeEventListener("dragend", handleGlobalDragEnd);
		};
	}, [handleDragEnd]);

	if (!meLoading && !meData?.me) {
		return null;
	}

	// 그룹이 없는 기본 화면
	if (userGroups.length === 0) {
		return (
			<>
				<div className="d-flex align-items-center justify-content-between mb-3">
					<h4 className="mb-0 fw-bold">내 웹링크 관리</h4>
					<Button
						variant="outline-primary"
						size="sm"
						onClick={() => setShowGroupModal(true)}
					>
						⚙️ 그룹 관리
					</Button>
				</div>

				<ul
					className="list-group list-group-flush border rounded-3 overflow-hidden"
					onDragOver={handleDragOver}
					onDrop={handleDrop}
				>
					<li className="list-group-item bg-light">
						<div className="row align-items-center">
							<div className="col-12 col-sm-6 d-flex align-items-center">
								<span
									className="me-3 fs-4 user-select-none"
									style={{ visibility: "hidden", lineHeight: 1 }}
								>
									☰
								</span>
								<div>
									<AddWeblinkModal position="first" />
								</div>
							</div>
						</div>
					</li>
					{weblinks.map((weblink, index) => (
						<WeblinkManageItem
							className="list-group-item"
							key={weblink.id}
							index={index}
							weblink={weblink}
							onDragStart={() => handleDragStart(weblink)}
							onDragEnter={(e, idx) => handleItemDragEnter(e, "untagged", idx)}
							onDragOver={handleDragOver}
							onDragEnd={handleDragEnd}
							isDragging={draggedInfo?.id === weblink.id}
						/>
					))}
				</ul>

				<WeblinkGroupManageModal
					show={showGroupModal}
					onHide={() => setShowGroupModal(false)}
				/>
			</>
		);
	}

	// 그룹이 존재하는 경우: 그룹별 섹션 분리 렌더링
	const untaggedLinks = weblinks.filter(
		(w) => !w.groupId || !userGroups.some((g) => g.id === w.groupId)
	);

	return (
		<>
			<div className="d-flex align-items-center justify-content-between mb-3">
				<div>
					<h4 className="mb-0 fw-bold">내 웹링크 관리</h4>
					<small className="text-muted">
						☰ 핸들을 드래그하여 순서를 바꾸거나 다른 그룹으로 이동할 수 있습니다.
					</small>
				</div>
				<Button
					variant="outline-primary"
					size="sm"
					onClick={() => setShowGroupModal(true)}
				>
					⚙️ 그룹 관리
				</Button>
			</div>

			{/* 각 그룹별 섹션 */}
			{userGroups.map((group) => {
				const groupLinks = weblinks.filter((w) => w.groupId === group.id);
				const isHovered = hoverTargetGroup === group.id;

				return (
					<div key={group.id} className="mb-4">
						<div className="d-flex align-items-center justify-content-between mb-2 pb-1 border-bottom">
							<div className="d-flex align-items-center gap-2">
								<span className="fw-bold fs-5">{group.name}</span>
								<span
									className="badge rounded-pill bg-light text-secondary border"
									style={{ fontSize: "11px", fontWeight: 500 }}
								>
									{groupLinks.length}
								</span>
							</div>
							<div>
								<AddWeblinkModal position="first" defaultGroupId={group.id} />
							</div>
						</div>

						<ul
							className={`list-group list-group-flush border rounded-3 overflow-hidden ${
								isHovered && draggedInfo ? "border-primary" : ""
							}`}
							onDragOver={handleDragOver}
							onDrop={handleDrop}
							onDragEnter={(e) => {
								if (groupLinks.length === 0) {
									handleEmptyGroupDragEnter(e, group.id);
								}
							}}
							style={{
								transition: "border-color 0.2s ease",
							}}
						>
							{groupLinks.length === 0 ? (
								<li
									className={`list-group-item text-center py-3 bg-white ${
										isHovered ? "bg-light" : ""
									}`}
									onDragOver={handleDragOver}
									onDrop={handleDrop}
									onDragEnter={(e) => handleEmptyGroupDragEnter(e, group.id)}
									style={{
										borderStyle: draggedInfo ? "dashed" : "solid",
										borderWidth: draggedInfo ? "2px" : "1px",
										borderColor: isHovered ? "#4dabf7" : undefined,
									}}
								>
									<small
										className={
											draggedInfo ? "text-primary fw-bold" : "text-muted"
										}
									>
										{draggedInfo
											? "⬇ 여기에 드롭하여 이 그룹으로 이동"
											: "이 그룹에 등록된 웹링크가 없습니다. 우측 상단 '+' 버튼으로 추가하거나 링크를 드래그해오세요."}
									</small>
								</li>
							) : (
								groupLinks.map((weblink, index) => (
									<WeblinkManageItem
										className="list-group-item"
										key={weblink.id}
										index={index}
										weblink={weblink}
										onDragStart={() => handleDragStart(weblink)}
										onDragEnter={(e, idx) =>
											handleItemDragEnter(e, group.id, idx)
										}
										onDragOver={handleDragOver}
										onDragEnd={handleDragEnd}
										isDragging={draggedInfo?.id === weblink.id}
									/>
								))
							)}
						</ul>
					</div>
				);
			})}

			{/* 미분류 웹링크 섹션 */}
			<div className="mb-4">
				<div className="d-flex align-items-center justify-content-between mb-2 pb-1 border-bottom">
					<div className="d-flex align-items-center gap-2">
						<span className="fw-bold fs-5 text-secondary">미분류</span>
						<span
							className="badge rounded-pill bg-light text-secondary border"
							style={{ fontSize: "11px", fontWeight: 500 }}
						>
							{untaggedLinks.length}
						</span>
					</div>
					<div>
						<AddWeblinkModal position="first" defaultGroupId={null} />
					</div>
				</div>

				<ul
					className={`list-group list-group-flush border rounded-3 overflow-hidden ${
						hoverTargetGroup === "untagged" && draggedInfo
							? "border-primary"
							: ""
					}`}
					onDragOver={handleDragOver}
					onDrop={handleDrop}
					onDragEnter={(e) => {
						if (untaggedLinks.length === 0) {
							handleEmptyGroupDragEnter(e, "untagged");
						}
					}}
					style={{
						transition: "border-color 0.2s ease",
					}}
				>
					{untaggedLinks.length === 0 ? (
						<li
							className={`list-group-item text-center py-3 bg-white ${
								hoverTargetGroup === "untagged" ? "bg-light" : ""
							}`}
							onDragOver={handleDragOver}
							onDrop={handleDrop}
							onDragEnter={(e) => handleEmptyGroupDragEnter(e, "untagged")}
							style={{
								borderStyle: draggedInfo ? "dashed" : "solid",
								borderWidth: draggedInfo ? "2px" : "1px",
								borderColor:
									hoverTargetGroup === "untagged" ? "#4dabf7" : undefined,
							}}
						>
							<small
								className={
									draggedInfo ? "text-primary fw-bold" : "text-muted"
								}
							>
								{draggedInfo
									? "⬇ 여기에 드롭하여 미분류로 이동"
									: "미분류 웹링크가 없습니다."}
							</small>
						</li>
					) : (
						untaggedLinks.map((weblink, index) => (
							<WeblinkManageItem
								className="list-group-item"
								key={weblink.id}
								index={index}
								weblink={weblink}
								onDragStart={() => handleDragStart(weblink)}
								onDragEnter={(e, idx) =>
									handleItemDragEnter(e, "untagged", idx)
								}
								onDragOver={handleDragOver}
								onDragEnd={handleDragEnd}
								isDragging={draggedInfo?.id === weblink.id}
							/>
						))
					)}
				</ul>
			</div>

			<WeblinkGroupManageModal
				show={showGroupModal}
				onHide={() => setShowGroupModal(false)}
			/>
		</>
	);
}

