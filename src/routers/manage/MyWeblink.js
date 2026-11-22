import { useMutation, useQuery } from "@apollo/client";
import { useEffect, useState } from "react";
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
} from "../../constants/querys";
import useWeblinkDnD from "../../hooks/useWeblinkDnD";
import {
	hasDynamicDateToken,
	isUntaggedWeblink,
} from "../../utils/weblinkUtil";

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
	const isDynamic = hasDynamicDateToken(name) || hasDynamicDateToken(url);

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
					<div className="flex-grow-1 d-flex align-items-center flex-wrap gap-1">
						<Weblink
							name={name}
							url={url}
							color={color}
							backgroundColor={backgroundColor}
						/>
						{isDynamic && (
							<span
								className="badge rounded-pill bg-light text-primary border border-primary-subtle"
								style={{ fontSize: "12.5px", fontWeight: 500 }}
								title={`동적 날짜 포맷 적용됨 (원본 이름: ${name} / 원본 URL: ${url})`}
							>
								동적 날짜
							</span>
						)}
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

function WeblinkManageSection({
	title,
	titleClassName = "",
	groupKey,
	defaultGroupId,
	links,
	emptyText,
	dropText,
	draggedInfo,
	isHovered,
	onDragStart,
	onItemDragEnter,
	onEmptyGroupDragEnter,
	onDragOver,
	onDrop,
	onDragEnd,
}) {
	return (
		<div className="mb-4">
			<div className="d-flex align-items-center justify-content-between mb-2 pb-1 border-bottom">
				<div className="d-flex align-items-center gap-2">
					<span className={`fw-bold fs-5 ${titleClassName}`}>{title}</span>
					<span
						className="badge rounded-pill bg-light text-secondary border"
						style={{ fontSize: "11px", fontWeight: 500 }}
					>
						{links.length}
					</span>
				</div>
				<div>
					<AddWeblinkModal position="first" defaultGroupId={defaultGroupId} />
				</div>
			</div>

			<ul
				className={`list-group list-group-flush border rounded-3 overflow-hidden ${
					isHovered && draggedInfo ? "border-primary" : ""
				}`}
				onDragOver={onDragOver}
				onDrop={onDrop}
				onDragEnter={(e) => {
					if (links.length === 0) {
						onEmptyGroupDragEnter(e, groupKey);
					}
				}}
				style={{
					transition: "border-color 0.2s ease",
				}}
			>
				{links.length === 0 ? (
					<li
						className={`list-group-item text-center py-3 bg-white ${
							isHovered ? "bg-light" : ""
						}`}
						onDragOver={onDragOver}
						onDrop={onDrop}
						onDragEnter={(e) => onEmptyGroupDragEnter(e, groupKey)}
						style={{
							borderStyle: draggedInfo ? "dashed" : "solid",
							borderWidth: draggedInfo ? "2px" : "1px",
							borderColor: isHovered ? "#4dabf7" : undefined,
						}}
					>
						<small
							className={draggedInfo ? "text-primary fw-bold" : "text-muted"}
						>
							{draggedInfo ? dropText : emptyText}
						</small>
					</li>
				) : (
					links.map((weblink, index) => (
						<WeblinkManageItem
							className="list-group-item"
							key={weblink.id}
							index={index}
							weblink={weblink}
							onDragStart={() => onDragStart(weblink)}
							onDragEnter={(e, idx) => onItemDragEnter(e, groupKey, idx)}
							onDragOver={onDragOver}
							onDragEnd={onDragEnd}
							isDragging={draggedInfo?.id === weblink.id}
						/>
					))
				)}
			</ul>
		</div>
	);
}

export default function MyWeblink() {
	const navigate = useNavigate();
	const { data: meData, loading: meLoading } = useQuery(ME);
	const { data } = useQuery(OWN_WEBLINKS);
	const { data: groupData } = useQuery(MY_WEBLINK_GROUPS);

	const [weblinks, setWeblinks] = useState([]);
	const [showGroupModal, setShowGroupModal] = useState(false);

	const groups = groupData?.myWeblinkGroups || [];
	const userGroups = groups.filter((g) => g.id > 0);

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

	const {
		draggedInfo,
		hoverTargetGroup,
		handleLinkDragStart,
		handleLinkDragEnter: handleItemDragEnter,
		handleEmptyGroupDragEnter,
		handleDragOver,
		handleLinkDragEnd: handleDragEnd,
	} = useWeblinkDnD({
		weblinks,
		setWeblinks,
		groups,
		enabled: true,
	});

	const handleDragStart = (weblink) => handleLinkDragStart(null, weblink);

	const handleDrop = (e) => {
		e.preventDefault();
		handleDragEnd();
	};

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
	const untaggedLinks = weblinks.filter((w) => isUntaggedWeblink(w, userGroups));

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
			{userGroups.map((group) => (
				<WeblinkManageSection
					key={group.id}
					title={group.name}
					groupKey={group.id}
					defaultGroupId={group.id}
					links={weblinks.filter((w) => w.groupId === group.id)}
					emptyText="이 그룹에 등록된 웹링크가 없습니다. 우측 상단 '+' 버튼으로 추가하거나 링크를 드래그해오세요."
					dropText="⬇ 여기에 드롭하여 이 그룹으로 이동"
					draggedInfo={draggedInfo}
					isHovered={hoverTargetGroup === group.id}
					onDragStart={handleDragStart}
					onItemDragEnter={handleItemDragEnter}
					onEmptyGroupDragEnter={handleEmptyGroupDragEnter}
					onDragOver={handleDragOver}
					onDrop={handleDrop}
					onDragEnd={handleDragEnd}
				/>
			))}

			{/* 미분류 웹링크 섹션 */}
			<WeblinkManageSection
				title="미분류"
				titleClassName="text-secondary"
				groupKey="untagged"
				defaultGroupId={null}
				links={untaggedLinks}
				emptyText="미분류 웹링크가 없습니다."
				dropText="⬇ 여기에 드롭하여 미분류로 이동"
				draggedInfo={draggedInfo}
				isHovered={hoverTargetGroup === "untagged"}
				onDragStart={handleDragStart}
				onItemDragEnter={handleItemDragEnter}
				onEmptyGroupDragEnter={handleEmptyGroupDragEnter}
				onDragOver={handleDragOver}
				onDrop={handleDrop}
				onDragEnd={handleDragEnd}
			/>

			<WeblinkGroupManageModal
				show={showGroupModal}
				onHide={() => setShowGroupModal(false)}
			/>
		</>
	);
}

