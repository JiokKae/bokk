import { useMutation } from "@apollo/client";
import { useEffect, useState } from "react";
import { Button, Form, InputGroup, ListGroup, Modal } from "react-bootstrap";
import {
	CREATE_PLAYLIST,
	DELETE_PLAYLIST,
	IMPORT_PLAYLIST,
	MY_PLAYLISTS,
	MY_VIDEO_ITEMS,
	UPDATE_PLAYLIST,
} from "../../../../constants/querys";
import styles from "./PlaylistManageModal.module.css";

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

		// 1. 빈 값 검사
		if (!trimmed) {
			alert("8자리 공유코드를 입력해주세요.");
			return;
		}

		// 2. 8자리 영문/숫자 정규식 형식 검사
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
			navigator.clipboard.writeText(code).then(() => {
				setCopiedCodeId(playlist.id);
				setTimeout(() => setCopiedCodeId(null), 2000);
			}).catch(() => {
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
		<Modal
			show={show}
			onHide={onHide}
			centered
			dialogClassName={styles.modalDialog}
			enforceFocus={false}
			restoreFocus={false}
		>
			<Modal.Header closeButton>
				<Modal.Title className="fs-5 fw-bold">
					플레이리스트 관리
				</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				{/* 신규 플레이리스트 등록 폼 */}
				<Form onSubmit={handleCreate} className="mb-3">
					<Form.Label className={styles.formLabel}>
						새 플레이리스트 만들기
					</Form.Label>
					<InputGroup size="sm">
						<Form.Control
							placeholder="플레이리스트 이름 (예: 신나는 음악, 노동요)"
							value={newPlaylistName}
							maxLength={30}
							onChange={(e) => setNewPlaylistName(e.target.value)}
							onClick={(e) => e.target.focus()}
							disabled={creating}
						/>
						<Button
							type="submit"
							className={styles.primaryAddBtn}
							disabled={creating || !newPlaylistName.trim()}
						>
							{creating ? "생성 중..." : "+ 추가"}
						</Button>
					</InputGroup>
				</Form>

				{/* 공유코드로 플레이리스트 가져오기 폼 */}
				<Form onSubmit={handleImport} className="mb-3">
					<Form.Label className={styles.formLabel}>
						공유코드로 플레이리스트 가져오기
					</Form.Label>
					<InputGroup size="sm">
						<Form.Control
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
							className={styles.importBtn}
							disabled={importing || !isValidImportCode}
						>
							{importing ? "가져오는 중..." : "가져오기"}
						</Button>
					</InputGroup>
				</Form>

				<hr className="my-3 text-muted opacity-25" />

				{/* 플레이리스트 목록 헤더 */}
				<div className={styles.sectionHeader}>
					<span className={styles.sectionTitle}>
						내 플레이리스트
					</span>
					<span className={styles.songBadge}>
						{playlists.length}개
					</span>
				</div>

				{playlists.length === 0 ? (
					<div className="text-center text-muted py-4 small">
						등록된 플레이리스트가 없습니다.<br />
						새로운 플레이리스트를 만들거나 공유코드로 가져와보세요!
					</div>
				) : (
					<ListGroup
						variant="flush"
						className={styles.listContainer}
					>
						{playlists.map((pl) => (
							<ListGroup.Item
								key={pl.id}
								className={`d-flex justify-content-between align-items-center ${styles.playlistRow}`}
							>
								{editingId === pl.id ? (
									<InputGroup size="sm" className="me-2">
										<Form.Control
											value={editingName}
											maxLength={30}
											onChange={(e) =>
												setEditingName(e.target.value)
											}
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
											variant="primary"
											size="sm"
											onClick={() => handleSaveEdit(pl.id)}
											disabled={updating || !editingName.trim()}
										>
											저장
										</Button>
										<Button
											variant="outline-secondary"
											size="sm"
											onClick={() => setEditingId(null)}
										>
											취소
										</Button>
									</InputGroup>
								) : (
									<>
										<div className="me-3 flex-grow-1" style={{ minWidth: 0 }}>
											<div
												className={`text-truncate ${styles.playlistName}`}
												title={pl.name}
											>
												{pl.name}
											</div>
											<div className={styles.metaRow}>
												<span className={styles.songCount}>
													{videoItems && videoItems.length > 0
														? videoItems.filter(
																(item) =>
																	item.playlists &&
																	item.playlists.some((p) => p.id === pl.id)
														  ).length
														: pl.videoCount || 0}곡
												</span>
												{pl.shareCode && (
													<>
														<span className={styles.metaDot}>·</span>
														<span className={styles.shareCodeText}>공유코드:</span>
														<span className={styles.shareCodeChip}>{pl.shareCode}</span>
													</>
												)}
											</div>
										</div>
										<div className={styles.actionGroup}>
											{pl.shareCode && (
												<button
													type="button"
													className={copiedCodeId === pl.id ? styles.copiedBtn : styles.shareBtn}
													title="공유코드 클립보드 복사"
													onClick={() => handleCopyShareCode(pl)}
												>
													{copiedCodeId === pl.id ? "복사됨" : "공유"}
												</button>
											)}
											<button
												type="button"
												className={styles.editBtn}
												onClick={() => handleStartEdit(pl)}
											>
												수정
											</button>
											<button
												type="button"
												className={styles.deleteBtn}
												onClick={() => handleDelete(pl)}
												disabled={deleting}
											>
												삭제
											</button>
										</div>
									</>
								)}
							</ListGroup.Item>
						))}
					</ListGroup>
				)}
			</Modal.Body>
			<Modal.Footer className="py-2.5 px-3">
				<button
					type="button"
					className={styles.closeBtn}
					onClick={onHide}
				>
					닫기
				</button>
			</Modal.Footer>
		</Modal>
	);
}
