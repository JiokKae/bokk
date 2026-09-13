import { useMutation } from "@apollo/client";
import { useEffect, useRef, useState } from "react";
import { Button, Form, InputGroup, ListGroup, Modal } from "react-bootstrap";
import {
	CREATE_PLAYLIST,
	MY_PLAYLISTS,
	MY_VIDEO_ITEMS,
	SET_VIDEO_PLAYLISTS,
} from "../../../../constants/querys";
import styles from "./VideoPlaylistTagModal.module.css";

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

	// 모달 오픈 시 오프캔버스의 포커스 트랩을 일시 해제하여 모달 인풋에 정상 포커스 가능하도록 처리
	useEffect(() => {
		if (!show) return;

		const offcanvasElem = document.getElementById("offcanvasYoutubeQueue");
		let bsOffcanvas = null;
		if (window.bootstrap?.Offcanvas && offcanvasElem) {
			bsOffcanvas = window.bootstrap.Offcanvas.getInstance(offcanvasElem);
			if (bsOffcanvas?._focustrap) {
				bsOffcanvas._focustrap.deactivate();
			}
		}

		return () => {
			if (bsOffcanvas?._focustrap && bsOffcanvas._isShown) {
				bsOffcanvas._focustrap.activate();
			}
		};
	}, [show]);

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
				// PC 환경에서 연속 입력을 위해 인풋 포커스 유지
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
		<Modal
			show={show}
			onHide={onHide}
			centered
			dialogClassName={styles.modalDialog}
			enforceFocus={false}
			restoreFocus={false}
			onKeyDown={handleModalKeyDown}
		>
			<Modal.Header closeButton>
				<Modal.Title className="fs-6 fw-bold">
					📑 플레이리스트에 담기
				</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				{videoItem && (
					<div className="mb-3">
						<div
							className="fw-semibold text-truncate small mb-1"
							title={videoItem.video?.title}
						>
							{videoItem.video?.title}
						</div>
						<div className="text-muted" style={{ fontSize: "12px" }}>
							이 곡을 담을 플레이리스트를 선택하세요 (복수 선택 가능)
						</div>
					</div>
				)}

				{/* 플레이리스트 체크박스 목록 */}
				{playlists.length === 0 ? (
					<div className="text-center text-muted py-3 small">
						등록된 플레이리스트가 없습니다.<br />
						아래에서 새 플레이리스트를 만들어보세요!
					</div>
				) : (
					<ListGroup
						variant="flush"
						className={`border rounded mb-3 ${styles.listContainer}`}
					>
						{playlists.map((pl) => {
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
								<ListGroup.Item
									key={pl.id}
									action
									as="div"
									role="checkbox"
									aria-checked={isChecked}
									tabIndex={0}
									className={`d-flex align-items-center justify-content-between px-3 py-2 user-select-none ${styles.playlistRow} ${
										isChecked ? styles.checkedRow : ""
									}`}
									onClick={() => handleToggle(pl.id)}
									onKeyDown={(e) => {
										if (e.key === " " || e.key === "Enter") {
											e.preventDefault();
											handleToggle(pl.id);
										}
									}}
								>
									<div
										className="d-flex align-items-center text-truncate me-2"
										style={{ pointerEvents: "none" }}
									>
										<input
											type="checkbox"
											className="form-check-input mt-0 me-2 pointer"
											checked={isChecked}
											readOnly
											tabIndex={-1}
										/>
										<span
											className={`text-truncate ${
												isChecked ? "fw-semibold text-primary" : ""
											}`}
											style={{ fontSize: "14px" }}
										>
											{pl.name}
										</span>
									</div>
									<span
										className={`badge border flex-shrink-0 ${
											isChecked
												? "bg-primary-subtle text-primary border-primary-subtle"
												: "bg-light text-secondary"
										}`}
										style={{ fontSize: "10.5px", pointerEvents: "none" }}
									>
										{count}곡
									</span>
								</ListGroup.Item>
							);
						})}
					</ListGroup>
				)}

				{/* 빠른 새 플레이리스트 추가 */}
				<Form onSubmit={handleQuickCreate}>
					<InputGroup size="sm">
						<Form.Control
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
							variant="primary"
							className={styles.createBtn}
							type="submit"
							disabled={creating || !newPlaylistName.trim()}
						>
							{creating ? "..." : "+ 추가"}
						</Button>
					</InputGroup>
				</Form>
			</Modal.Body>
			<Modal.Footer className="d-flex justify-content-between align-items-center py-2 px-3">
				<button
					type="button"
					className={styles.cancelBtn}
					onClick={onHide}
				>
					취소
				</button>
				<button
					type="button"
					className={styles.saveBtn}
					onClick={handleSave}
					disabled={saving}
					title="저장 (단축키: Ctrl + Enter)"
				>
					{saving ? "저장 중..." : "담기 완료"}
				</button>
			</Modal.Footer>
		</Modal>
	);
}
