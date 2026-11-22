import { getResolvedWeblinkUrl } from "../../utils/weblinkUtil";
import AddWeblinkModal from "./AddWeblinkModal";
import Weblink from "./Weblink";

export default function WeblinkGroupCard({
	styles,
	title,
	badgeTitle,
	links,
	targetGroupId,
	isUntagged = false,
	isReordering = false,
	isShiftPressed = false,
	canReorderGroup = false,
	canReorderLinks = false,
	showAddModal = false,
	defaultGroupId = null,
	emptyDropText = "⬇ 여기에 드롭하여 이 그룹으로 이동",
	isHovered = false,
	draggedInfo = null,
	onOpenAll,
	onGroupDragStart,
	onGroupDragEnter,
	onGroupDragEnd,
	onLinkDragStart,
	onLinkDragEnter,
	onEmptyGroupDragEnter,
	onDragOver,
	onLinkDragEnd,
}) {
	const containerClass = isUntagged
		? styles.groupContainerUntagged
		: styles.groupContainer;
	const badgeClass = isUntagged ? styles.groupBadgeUntagged : styles.groupBadge;

	return (
		<span
			className={`${containerClass} ${
				isReordering && (canReorderGroup || canReorderLinks)
					? styles.reorderActiveGroup
					: ""
			} ${isHovered && draggedInfo ? styles.groupDragOver : ""}`}
			onDragOver={canReorderLinks ? onDragOver : undefined}
			onDrop={
				canReorderLinks
					? (e) => {
							e.preventDefault();
							onLinkDragEnd?.();
					  }
					: undefined
			}
		>
			<div
				className={styles.groupHeaderLine}
				draggable={canReorderGroup && isReordering}
				onDragStart={canReorderGroup ? onGroupDragStart : undefined}
				onDragEnter={canReorderGroup ? onGroupDragEnter : undefined}
				onDragOver={canReorderGroup ? onDragOver : undefined}
				onDragEnd={canReorderGroup ? onGroupDragEnd : undefined}
				style={{
					cursor: canReorderGroup && isReordering ? "grab" : undefined,
				}}
			>
				{canReorderGroup && isReordering && (
					<span
						className={styles.groupDragHandle}
						title="드래그하여 그룹 순서 변경"
					>
						☰
					</span>
				)}
				<span className={badgeClass} title={badgeTitle}>
					{title}
				</span>
				{links.length > 0 && (
					<a
						href={getResolvedWeblinkUrl(links[0]?.url)}
						target="_blank"
						rel="noopener noreferrer"
						className={
							isShiftPressed ? styles.openAllBtnShift : styles.openAllBtn
						}
						onClick={(e) => onOpenAll(e, links)}
						title="클릭: 새 탭으로 모두 열기 | Shift+클릭: 새 창으로 모두 열기"
					>
						{isShiftPressed ? "⧉ 새 창으로 모두 열기" : "↗ 모두 열기"}
					</a>
				)}
			</div>

			<div
				className={styles.groupContent}
				onDragEnter={
					canReorderLinks
						? (e) => {
								if (links.length === 0) {
									onEmptyGroupDragEnter?.(e, targetGroupId);
								}
						  }
						: undefined
				}
			>
				{canReorderLinks && links.length === 0 && isReordering ? (
					<span
						className={styles.emptyGroupDropZone}
						onDragEnter={(e) => onEmptyGroupDragEnter?.(e, targetGroupId)}
					>
						{emptyDropText}
					</span>
				) : (
					links.map((weblink, itemIndex) => {
						if (!canReorderLinks) {
							return (
								<Weblink
									key={weblink.id}
									name={weblink.name}
									url={weblink.url}
									color={weblink.color}
									backgroundColor={weblink.backgroundColor}
								/>
							);
						}

						const isDraggingThis = draggedInfo?.id === weblink.id;
						return (
							<span
								key={weblink.id}
								className={`${styles.linkDragWrapper} ${
									isDraggingThis ? styles.linkDragWrapperDragging : ""
								} ${isReordering ? styles.linkDragWrapperReorder : ""}`}
								draggable={isReordering}
								onDragStart={(e) => onLinkDragStart?.(e, weblink)}
								onDragEnter={(e) =>
									onLinkDragEnter?.(e, targetGroupId, itemIndex)
								}
								onDragOver={onDragOver}
								onDragEnd={onLinkDragEnd}
								title={
									isReordering ? "드래그하여 순서 및 그룹 변경" : undefined
								}
							>
								<Weblink
									name={weblink.name}
									url={isReordering ? "#" : weblink.url}
									color={weblink.color}
									backgroundColor={weblink.backgroundColor}
									onClick={
										isReordering
											? (e) => {
													e.preventDefault();
													e.stopPropagation();
											  }
											: undefined
									}
									style={
										isReordering
											? { pointerEvents: "none", cursor: "grab" }
											: undefined
									}
								/>
							</span>
						);
					})
				)}
				{showAddModal && <AddWeblinkModal defaultGroupId={defaultGroupId} />}
			</div>
		</span>
	);
}
