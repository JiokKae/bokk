import { useRef, useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import InputGroup from "react-bootstrap/InputGroup";
import Form from "react-bootstrap/Form";
import styles from "./ThumbnailModal.module.css";
import { videoId } from "../../utils/youtubeUtil";

function YoutubeThumbnail({ youtubeId }) {
	var fullURL = `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;
	return youtubeId === "" ? (
		<img src="https://jiokkae.com/볶음밥/img/youtube_share_link.png" />
	) : (
		<a href={fullURL} target="_blank">
			<img src={fullURL} />
		</a>
	);
}

export default function ThumbnailModal() {
	const [thumbnailId, setThumbnailId] = useState("");
	const [show, setShow] = useState(false);
	const handleClose = () => setShow(false);
	const handleShow = () => setShow(true);
	const urlInput = useRef();

	const onClick = () => {
		setThumbnailId(videoId(urlInput.current.value));
		urlInput.current.value = "";
	};
	return (
		<>
			<Button
				className={`${styles.btnLg} ${styles.bgcYoutube} mt-2`}
				onClick={handleShow}>
				유튜브 Thumbnail 크게 보기
			</Button>
			<Modal size="lg" show={show} onHide={handleClose}>
				<Modal.Header closeButton>
					<Modal.Title as="h5">
						유튜브 Thumbnail 크게 보기
					</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<YoutubeThumbnail youtubeId={thumbnailId} />
				</Modal.Body>
				<Modal.Footer>
					<InputGroup className="mb-3">
						<Form.Control
							ref={urlInput}
							placeholder="https://youtu.be/..."
							aria-label="input Youtube video url"
							required
						/>
						<Button variant="outline-secondary" onClick={onClick}>
							입력
						</Button>
					</InputGroup>
				</Modal.Footer>
			</Modal>
		</>
	);
}
