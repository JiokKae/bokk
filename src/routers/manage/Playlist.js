import { useMutation, useQuery } from "@apollo/client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, CloseButton, Dropdown } from "react-bootstrap";
import PlaylistManageModal from "../../components/Header/SearchSelector/YoutubeOffcanvas/PlaylistManageModal";
import VideoPlaylistTagModal from "../../components/Header/SearchSelector/YoutubeOffcanvas/VideoPlaylistTagModal";
import YoutubeVideoAdder from "../../components/Header/SearchSelector/YoutubeOffcanvas/YoutubeVideoAdder";
import styles from "../../components/Header/SearchSelector/YoutubeOffcanvas/YoutubeOffcanvas.module.css";
import {
	DELETE_VIDEO_ITEM,
	MY_PLAYLISTS,
	MY_VIDEO_ITEMS,
} from "../../constants/querys";
import { RESOLUTION, secondToDate, thumbnailUrl } from "../../utils/youtubeUtil";

function VideoItem({
	itemId,
	youtubeId,
	title,
	length,
	playlists = [],
	onOpenTagModal,
}) {
	const [deleteVideoItem] = useMutation(DELETE_VIDEO_ITEM, {
		onCompleted: ({ deleteVideoItem }) => {
			if (deleteVideoItem === false) {
				alert("영상을 제거하는데 실패했습니다.");
				return;
			}
		},
		refetchQueries: [{ query: MY_VIDEO_ITEMS }, { query: MY_PLAYLISTS }],
	});

	const onClickDelete = () => {
		if (window.confirm("영상을 재생 목록에서 제거하시겠습니까?") === false) {
			return;
		}
		deleteVideoItem({ variables: { itemId } });
	};

	return (
		<div className="list-group-item py-2">
			<div className="row align-items-center flex-nowrap">
				<div className="col-auto flex-shrink-0">
					<div
						style={{
							width: "104px",
							height: "58px",
							borderRadius: "6px",
							overflow: "hidden",
							backgroundColor: "#000",
							border: "1px solid rgba(0, 0, 0, 0.08)",
							boxShadow: "0 1px 3px rgba(0, 0, 0, 0.06)",
						}}
					>
						<img
							className="w-100 h-100"
							src={thumbnailUrl(youtubeId, RESOLUTION.MQ)}
							alt={title}
							loading="lazy"
							style={{
								objectFit: "cover",
								transform: "translateZ(0)",
								backfaceVisibility: "hidden",
							}}
							onLoad={(e) => {
								// 유튜브는 없는 썸네일(404) 요청 시 120x90 더미 이미지를 성공 상태로 반환하므로 감지하여 폴백
								if (e.target.naturalWidth === 120 && e.target.naturalHeight === 90) {
									const fallbackUrl = thumbnailUrl(youtubeId, "hq");
									if (e.target.src !== fallbackUrl) {
										e.target.src = fallbackUrl;
									}
								}
							}}
							onError={(e) => {
								const fallbackUrl = thumbnailUrl(youtubeId, "hq");
								if (e.target.src !== fallbackUrl) {
									e.target.src = fallbackUrl;
								}
							}}
						/>
					</div>
				</div>
				<div className="col" style={{ minWidth: 0 }}>
					<p className="mb-1 text-truncate fw-medium" title={title}>
						{title}
					</p>
					<div className="d-flex align-items-center gap-2 flex-wrap">
						<small className="text-muted">{secondToDate(length)}</small>
						<button
							type="button"
							className={`btn btn-sm py-0 px-1.5 border ${
								playlists.length > 0 ? "text-primary fw-medium" : "text-muted"
							}`}
							style={{
								fontSize: "11px",
								borderRadius: "4px",
								backgroundColor: playlists.length > 0 ? "#e7f5ff" : "#f8f9fa",
								borderColor: playlists.length > 0 ? "#d0ebff" : "#dee2e6",
							}}
							title="플레이리스트에 담기 / 변경"
							onClick={onOpenTagModal}
						>
							{playlists.length > 0 ? `담김 ${playlists.length}` : "+ 담기"}
						</button>
					</div>
					{playlists.length > 0 && (
						<div className="d-flex flex-wrap gap-1 mt-1">
							{playlists.map((p) => (
								<span
									key={p.id}
									className="badge bg-light text-secondary border"
									style={{ fontSize: "11px", fontWeight: "normal" }}
								>
									#{p.name}
								</span>
							))}
						</div>
					)}
				</div>
				<div className="col-auto">
					<CloseButton onClick={onClickDelete} title="영상 삭제" />
				</div>
			</div>
		</div>
	);
}

export default function Playlist() {
	const { data: videoData } = useQuery(MY_VIDEO_ITEMS);
	const { data: playlistData } = useQuery(MY_PLAYLISTS);

	const videoItems = useMemo(
		() => videoData?.myVideoItems || [],
		[videoData]
	);
	const playlists = useMemo(
		() => playlistData?.myPlaylists || [],
		[playlistData]
	);

	const [selectedPlaylistId, setSelectedPlaylistId] = useState("ALL");
	const [showPlaylistManageModal, setShowPlaylistManageModal] = useState(false);
	const [selectedVideoForTag, setSelectedVideoForTag] = useState(null);

	const displayedVideoItems = useMemo(() => {
		if (selectedPlaylistId === "ALL") {
			return videoItems;
		}
		if (selectedPlaylistId === "UNTAGGED") {
			return videoItems.filter(
				(item) => !item.playlists || item.playlists.length === 0
			);
		}
		const targetId = Number(selectedPlaylistId);
		const exists = playlists.some((p) => p.id === targetId);
		if (!exists) {
			return videoItems;
		}
		return videoItems.filter(
			(item) => item.playlists && item.playlists.some((p) => p.id === targetId)
		);
	}, [videoItems, selectedPlaylistId, playlists]);

	// 현재 선택된 플레이리스트가 삭제되어 목록에 없으면 자동으로 '전체'로 복구
	useEffect(() => {
		if (selectedPlaylistId === "ALL" || selectedPlaylistId === "UNTAGGED") return;
		const targetId = Number(selectedPlaylistId);
		const exists = playlists.some((p) => p.id === targetId);
		if (!exists) {
			setSelectedPlaylistId("ALL");
		}
	}, [playlists, selectedPlaylistId]);

	const untaggedCount = useMemo(
		() =>
			videoItems.filter(
				(item) => !item.playlists || item.playlists.length === 0
			).length,
		[videoItems]
	);

	const getPlaylistCount = useCallback(
		(playlistId) => {
			return videoItems.filter(
				(item) => item.playlists && item.playlists.some((p) => p.id === playlistId)
			).length;
		},
		[videoItems]
	);

	// 현재 선택된 플레이리스트 정보 (이름 및 곡 수)
	const selectedPlaylistInfo = useMemo(() => {
		if (selectedPlaylistId === "ALL") {
			return { name: "전체", count: videoItems.length };
		}
		if (selectedPlaylistId === "UNTAGGED") {
			return { name: "미분류", count: untaggedCount };
		}
		const targetId = Number(selectedPlaylistId);
		const pl = playlists.find((p) => p.id === targetId);
		if (pl) {
			return { name: pl.name, count: getPlaylistCount(targetId) };
		}
		return { name: "전체", count: videoItems.length };
	}, [selectedPlaylistId, videoItems.length, untaggedCount, playlists, getPlaylistCount]);

	return (
		<>
			<div className="d-flex align-items-center justify-content-between mb-3">
				<h4 className="mb-0 fw-bold">재생 목록 관리</h4>
				<Button
					variant="outline-primary"
					size="sm"
					onClick={() => setShowPlaylistManageModal(true)}
				>
					⚙️ 플레이리스트 관리
				</Button>
			</div>

			<YoutubeVideoAdder />

			{/* 플레이리스트 필터 셀렉터 */}
			<div className="d-flex align-items-center gap-2 mb-3">
				<Dropdown className="w-100" style={{ minWidth: 0 }}>
					<Dropdown.Toggle
						variant="light"
						id="manage-playlist-dropdown"
						className={`w-100 d-flex align-items-center justify-content-between text-start fw-medium shadow-none ${styles.playlistDropdownToggle}`}
					>
						<span className="text-truncate me-2">
							{selectedPlaylistInfo.name}
						</span>
						<span
							className="badge rounded-pill bg-light text-secondary border flex-shrink-0 ms-auto me-1.5"
							style={{ fontSize: "11px", fontWeight: 500 }}
						>
							{selectedPlaylistInfo.count}
						</span>
					</Dropdown.Toggle>

					<Dropdown.Menu className={`w-100 ${styles.playlistDropdownMenu}`}>
						<Dropdown.Item
							as="button"
							type="button"
							className={`d-flex align-items-center justify-content-between ${styles.dropdownItem}`}
							style={{
								fontWeight: selectedPlaylistId === "ALL" ? "700" : undefined,
							}}
							onClick={() => setSelectedPlaylistId("ALL")}
						>
							<div className="d-flex align-items-center text-truncate me-2" style={{ minWidth: 0 }}>
								{selectedPlaylistId === "ALL" && (
									<span className="text-primary me-2 fw-bold" style={{ fontSize: "12px" }}>
										✓
									</span>
								)}
								<span className="text-truncate">전체</span>
							</div>
							<span
								className="badge rounded-pill bg-light text-secondary border flex-shrink-0"
								style={{ fontSize: "11px" }}
							>
								{videoItems.length}
							</span>
						</Dropdown.Item>

						<Dropdown.Item
							as="button"
							type="button"
							className={`d-flex align-items-center justify-content-between ${styles.dropdownItem}`}
							style={{
								fontWeight: selectedPlaylistId === "UNTAGGED" ? "700" : undefined,
							}}
							onClick={() => setSelectedPlaylistId("UNTAGGED")}
						>
							<div className="d-flex align-items-center text-truncate me-2" style={{ minWidth: 0 }}>
								{selectedPlaylistId === "UNTAGGED" && (
									<span className="text-primary me-2 fw-bold" style={{ fontSize: "12px" }}>
										✓
									</span>
								)}
								<span className="text-truncate">미분류</span>
							</div>
							<span
								className="badge rounded-pill bg-light text-secondary border flex-shrink-0"
								style={{ fontSize: "11px" }}
							>
								{untaggedCount}
							</span>
						</Dropdown.Item>

						{playlists.length > 0 && <Dropdown.Divider className="my-1" />}

						{playlists.map((pl) => {
							const isSelectedThis = String(selectedPlaylistId) === String(pl.id);
							return (
								<Dropdown.Item
									key={pl.id}
									as="button"
									type="button"
									className={`d-flex align-items-center justify-content-between ${styles.dropdownItem}`}
									style={{
										fontWeight: isSelectedThis ? "700" : undefined,
									}}
									onClick={() => setSelectedPlaylistId(pl.id)}
								>
									<div className="d-flex align-items-center text-truncate me-2" style={{ minWidth: 0 }}>
										{isSelectedThis && (
											<span className="text-primary me-2 fw-bold" style={{ fontSize: "12px" }}>
												✓
											</span>
										)}
										<span className="text-truncate">{pl.name}</span>
									</div>
									<span
										className="badge rounded-pill bg-light text-secondary border flex-shrink-0"
										style={{ fontSize: "11px" }}
									>
										{getPlaylistCount(pl.id)}
									</span>
								</Dropdown.Item>
							);
						})}
					</Dropdown.Menu>
				</Dropdown>
			</div>

			<div className="list-group">
				{displayedVideoItems.length === 0 ? (
					<div className="text-center text-muted py-5 border rounded">
						<div className="fs-3 mb-2">📭</div>
						<p className="mb-1">
							{selectedPlaylistId === "UNTAGGED"
								? "미분류 영상이 없습니다."
								: "선택한 플레이리스트에 등록된 영상이 없습니다."}
						</p>
					</div>
				) : (
					displayedVideoItems.map((item) => (
						<VideoItem
							key={item.id}
							itemId={item.id}
							youtubeId={item.video.id}
							title={item.video.title}
							length={item.video.length}
							playlists={item.playlists || []}
							onOpenTagModal={() => setSelectedVideoForTag(item)}
						/>
					))
				)}
			</div>

			<PlaylistManageModal
				show={showPlaylistManageModal}
				onHide={() => setShowPlaylistManageModal(false)}
				playlists={playlists}
				videoItems={videoItems}
				onDeletePlaylist={(deletedId) => {
					if (Number(selectedPlaylistId) === Number(deletedId)) {
						setSelectedPlaylistId("ALL");
					}
				}}
			/>

			<VideoPlaylistTagModal
				show={Boolean(selectedVideoForTag)}
				onHide={() => setSelectedVideoForTag(null)}
				videoItem={selectedVideoForTag}
				playlists={playlists}
				videoItems={videoItems}
			/>
		</>
	);
}
