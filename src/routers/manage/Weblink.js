import { useMutation, useQuery } from "@apollo/client";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, GripVertical } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import AddWeblinkModal from "../../components/Weblink/AddWeblinkModal";
import UpdateWeblinkModal from "../../components/Weblink/UpdateWeblinkModal";
import Weblink from "../../components/Weblink/Weblink";
import WeblinkGroupManageModal from "../../components/Weblink/WeblinkGroupManageModal";
import {
	BUILTIN_WEBLINKS,
	DELETE_WEBLINK,
	ME,
	MY_WEBLINK_GROUPS,
	OWN_WEBLINKS,
	TOGGLE_BUILTIN_WEBLINK,
} from "../../constants/querys";
import useWeblinkDnD from "../../hooks/useWeblinkDnD";
import {
	WEBLINK_GROUP_ID,
	hasDynamicDateToken,
	isUntaggedWeblink,
} from "../../utils/weblinkUtil";

function WeblinkManageItem({
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
			className={cn(
				"select-none list-none bg-white px-3.5 py-2.5 transition-opacity duration-150",
				index !== 0 && "border-0 border-t border-solid border-zinc-100",
				isDragging && "bg-bokk-subtle/50 opacity-40"
			)}
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
		>
			<div className="flex flex-wrap items-center justify-between gap-2.5">
				<div className="flex min-w-0 flex-1 items-center gap-2.5">
					<span
						className={cn(
							"inline-flex shrink-0 items-center text-zinc-400 hover:text-zinc-600",
							isAllowDrag ? "cursor-grabbing" : "cursor-grab"
						)}
						onMouseDown={() => setIsAllowDrag(true)}
						onMouseUp={() => setIsAllowDrag(false)}
						onTouchStart={() => setIsAllowDrag(true)}
						onTouchEnd={() => setIsAllowDrag(false)}
						title="드래그하여 순서 및 그룹 변경"
					>
						<GripVertical className="size-5" />
					</span>
					<div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
						<Weblink
							name={name}
							url={url}
							color={color}
							backgroundColor={backgroundColor}
						/>
						{isDynamic && (
							<Badge
								variant="subtle"
								title={`동적 날짜 포맷 적용됨 (원본 이름: ${name} / 원본 URL: ${url})`}
							>
								동적 날짜
							</Badge>
						)}
					</div>
				</div>

				<div className="flex shrink-0 items-center gap-1.5">
					<UpdateWeblinkModal
						weblink={{ id, name, url, color, backgroundColor, groupId }}
					/>
					<Button variant="destructive" size="sm" onClick={onRemove}>
						삭제
					</Button>
				</div>
			</div>
		</li>
	);
}

function BuiltinWeblinkManageItem({
	index,
	weblink: { id, name, url, color, backgroundColor },
	isHidden,
	onToggleHide,
	disabled,
}) {
	return (
		<li
			className={cn(
				"select-none list-none bg-white px-3.5 py-2.5 transition-opacity duration-150",
				index !== 0 && "border-0 border-t border-solid border-zinc-100"
			)}
		>
			<div className="flex flex-wrap items-center justify-between gap-2.5">
				<div className="flex min-w-0 flex-1 items-center gap-2.5">
					<span className="invisible inline-flex shrink-0 items-center">
						<GripVertical className="size-5" />
					</span>
					<div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
						<Weblink
							name={name}
							url={url}
							color={color}
							backgroundColor={backgroundColor}
							style={isHidden ? { opacity: "0.4" } : undefined}
						/>
						{isHidden && <Badge variant="secondary">숨김</Badge>}
					</div>
				</div>

				<div className="flex shrink-0 items-center gap-1.5">
					<Button
						variant={isHidden ? "default" : "outline"}
						size="sm"
						className="gap-1.5"
						onClick={() => onToggleHide(id)}
						disabled={disabled}
					>
						{isHidden ? (
							<>
								<Eye className="size-3.5" />
								<span>보이기</span>
							</>
						) : (
							<>
								<EyeOff className="size-3.5" />
								<span>숨기기</span>
							</>
						)}
					</Button>
				</div>
			</div>
		</li>
	);
}

function BuiltinWeblinkManageSection({
	links,
	hidedIds,
	onToggleHide,
	toggling,
}) {
	if (links.length === 0) return null;

	return (
		<div className="mb-6">
			<div className="mb-2 flex items-center justify-between border-0 border-b border-solid border-zinc-200 pb-1.5">
				<div className="flex items-center gap-2">
					<span className="text-lg font-bold text-zinc-900">bokk</span>
					<Badge variant="subtle">기본</Badge>
					<Badge variant="secondary">{links.length}</Badge>
				</div>
				<span className="text-xs text-zinc-500">
					숨김 버튼으로 홈 화면 노출 여부를 전환할 수 있습니다.
				</span>
			</div>

			<ul className="m-0 overflow-hidden rounded-xl border-[1px] border-solid border-zinc-200 bg-white p-0">
				{links.map((weblink, index) => (
					<BuiltinWeblinkManageItem
						key={weblink.id}
						index={index}
						weblink={weblink}
						isHidden={hidedIds.includes(weblink.id)}
						onToggleHide={onToggleHide}
						disabled={toggling}
					/>
				))}
			</ul>
		</div>
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
		<div className="mb-6">
			<div className="mb-2 flex items-center justify-between border-0 border-b border-solid border-zinc-200 pb-1.5">
				<div className="flex items-center gap-2">
					<span className={cn("text-lg font-bold text-zinc-900", titleClassName)}>
						{title}
					</span>
					<Badge variant="secondary">{links.length}</Badge>
				</div>
				<div>
					<AddWeblinkModal position="first" defaultGroupId={defaultGroupId} />
				</div>
			</div>

			<ul
				className={cn(
					"m-0 overflow-hidden rounded-xl border-[1px] border-solid bg-white p-0 transition-colors duration-200",
					isHovered && draggedInfo
						? "border-bokk ring-2 ring-bokk/20"
						: "border-zinc-200"
				)}
				onDragOver={onDragOver}
				onDrop={onDrop}
				onDragEnter={(e) => {
					if (links.length === 0) {
						onEmptyGroupDragEnter(e, groupKey);
					}
				}}
			>
				{links.length === 0 ? (
					<li
						className={cn(
							"list-none py-6 text-center transition-colors",
							isHovered ? "bg-bokk-subtle/50" : "bg-white"
						)}
						onDragOver={onDragOver}
						onDrop={onDrop}
						onDragEnter={(e) => onEmptyGroupDragEnter(e, groupKey)}
					>
						<span
							className={cn(
								"text-sm",
								draggedInfo
									? "font-semibold text-bokk-dark"
									: "text-zinc-500"
							)}
						>
							{draggedInfo ? dropText : emptyText}
						</span>
					</li>
				) : (
					links.map((weblink, index) => (
						<WeblinkManageItem
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

export default function WeblinkManage() {
	const navigate = useNavigate();
	const { data: meData, loading: meLoading } = useQuery(ME);
	const { data } = useQuery(OWN_WEBLINKS);
	const { data: groupData } = useQuery(MY_WEBLINK_GROUPS);
	const { data: builtinData, refetch: refetchBuiltin } = useQuery(
		BUILTIN_WEBLINKS,
		{
			variables: { input: { hided: true } },
		}
	);

	const [toggleBuiltinWeblink, { loading: togglingBuiltin }] = useMutation(
		TOGGLE_BUILTIN_WEBLINK,
		{
			onCompleted: ({ toggleBuiltinWeblink }) => {
				if (toggleBuiltinWeblink) {
					refetchBuiltin();
					return;
				}
				alert("기본 웹 링크를 토글하는데 실패했습니다.");
			},
			refetchQueries: [{ query: BUILTIN_WEBLINKS }],
		}
	);

	const [weblinks, setWeblinks] = useState([]);
	const [showGroupModal, setShowGroupModal] = useState(false);

	const groups = groupData?.myWeblinkGroups || [];
	const userGroups = groups.filter((g) => g.id > 0);
	const builtinWeblinks = builtinData?.builtinWeblinks?.weblinks || [];
	const hidedIds = builtinData?.builtinWeblinks?.hidedIds || [];

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

	const handleToggleBuiltin = (weblinkId) => {
		toggleBuiltinWeblink({ variables: { weblinkId } });
	};

	if (!meLoading && !meData?.me) {
		return null;
	}

	const untaggedLinks = weblinks.filter((w) => isUntaggedWeblink(w, userGroups));

	// 사용자가 설정한 그룹 순서(seq)를 그대로 반영 (커스텀 그룹 + bokk + 미분류)
	const displayGroups =
		groups.length > 0
			? groups
			: [
					{ id: WEBLINK_GROUP_ID.UNTAGGED, name: "미분류", seq: 0 },
					{ id: WEBLINK_GROUP_ID.BUILTIN, name: "bokk", seq: 1 },
			  ];

	return (
		<>
			<div className="mb-5 flex flex-wrap items-center justify-between gap-2">
				<div>
					<h4 className="m-0 text-xl font-bold text-zinc-900">웹링크 관리</h4>
					<span className="text-xs text-zinc-500">
						핸들을 드래그하여 순서를 바꾸거나 다른 그룹으로 이동할 수 있습니다.
					</span>
				</div>
				<Button
					variant="outline"
					size="sm"
					className="border-bokk-border text-bokk-dark hover:bg-bokk-subtle"
					onClick={() => setShowGroupModal(true)}
				>
					⚙️ 그룹 관리
				</Button>
			</div>

			{displayGroups.map((group) => {
				if (group.id === WEBLINK_GROUP_ID.BUILTIN) {
					return (
						<BuiltinWeblinkManageSection
							key="builtin-bokk"
							links={builtinWeblinks}
							hidedIds={hidedIds}
							onToggleHide={handleToggleBuiltin}
							toggling={togglingBuiltin}
						/>
					);
				}

				if (group.id === WEBLINK_GROUP_ID.UNTAGGED) {
					return (
						<WeblinkManageSection
							key="untagged"
							title="미분류"
							titleClassName="text-zinc-500"
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
					);
				}

				return (
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
				);
			})}

			<WeblinkGroupManageModal
				show={showGroupModal}
				onHide={() => setShowGroupModal(false)}
			/>
		</>
	);
}
