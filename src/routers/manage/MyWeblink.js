import { useMutation, useQuery } from "@apollo/client";
import { useEffect, useState } from "react";
import UpdateWeblinkModal from "../../components/Weblink/UpdateWeblinkModal";
import Weblink from "../../components/Weblink/Weblink";
import { DELETE_WEBLINK, OWN_WEBLINKS, REORDER_WEBLINKS } from "../../constants/querys";

function WeblinkManageItem({
	className,
	index,
	weblink: { id, name, url, color, backgroundColor },
	onDragStart,
	onDragEnter,
	onDragOver,
	onDragEnd,
	isDragging,
}) {
	const [isAllowDrag, setIsAllowDrag] = useState(false);

	const [deleteWeblink] = useMutation(DELETE_WEBLINK, {
		onCompleted: ({ deleteWeblink }) => {
			if (deleteWeblink === false) {
				alert("웹 링크를 제거하는데 실패했습니다");
				return;
			}
		},
		refetchQueries: [{ query: OWN_WEBLINKS }],
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
				onDragStart(e, index);
			}}
			onDragEnter={(e) => onDragEnter(e, index)}
			onDragOver={onDragOver}
			onDragEnd={(e) => {
				setIsAllowDrag(false);
				onDragEnd(e);
			}}
			style={{
				opacity: isDragging ? 0.4 : 1,
				transition: "all 0.2s ease-in-out",
				userSelect: "none",
			}}
		>
			<div className="row align-items-center">
				<div className="col-12 col-sm-6 d-flex align-items-center">
					<span
						className="me-3 text-secondary user-select-none fs-4"
						style={{ cursor: "grab", lineHeight: 1 }}
						onMouseDown={() => setIsAllowDrag(true)}
						onMouseUp={() => setIsAllowDrag(false)}
						onTouchStart={() => setIsAllowDrag(true)}
						onTouchEnd={() => setIsAllowDrag(false)}
						title="드래그하여 순서 변경"
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
						weblink={{ id, name, url, color, backgroundColor }}
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
	const { data } = useQuery(OWN_WEBLINKS);
	const [weblinks, setWeblinks] = useState([]);
	const [draggedIndex, setDraggedIndex] = useState(null);

	const [reorderWeblinks] = useMutation(REORDER_WEBLINKS, {
		refetchQueries: [{ query: OWN_WEBLINKS }],
	});

	useEffect(() => {
		if (data?.ownWeblinks) {
			setWeblinks(data.ownWeblinks);
		}
	}, [data]);

	const handleDragStart = (e, index) => {
		setDraggedIndex(index);
		e.dataTransfer.effectAllowed = "move";
	};

	const handleDragEnter = (e, targetIndex) => {
		e.preventDefault();
		if (draggedIndex === null || draggedIndex === targetIndex) return;

		const newWeblinks = [...weblinks];
		const draggedItem = newWeblinks[draggedIndex];

		newWeblinks.splice(draggedIndex, 1);
		newWeblinks.splice(targetIndex, 0, draggedItem);

		setDraggedIndex(targetIndex);
		setWeblinks(newWeblinks);
	};

	const handleDragOver = (e) => {
		e.preventDefault();
		e.dataTransfer.dropEffect = "move";
	};

	const handleDragEnd = () => {
		if (draggedIndex !== null && weblinks.length > 0) {
			const ids = weblinks.map((item) => item.id);
			reorderWeblinks({ variables: { weblinkIds: ids } });
		}
		setDraggedIndex(null);
	};

	return (
		<ul className="list-group list-group-flush">
			{weblinks.map((weblink, index) => (
				<WeblinkManageItem
					className="list-group-item"
					key={weblink.id}
					index={index}
					weblink={weblink}
					onDragStart={handleDragStart}
					onDragEnter={handleDragEnter}
					onDragOver={handleDragOver}
					onDragEnd={handleDragEnd}
					isDragging={draggedIndex === index}
				/>
			))}
		</ul>
	);
}
