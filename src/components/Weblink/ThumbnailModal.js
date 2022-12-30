import { useRef, useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import InputGroup from "react-bootstrap/InputGroup";
import Form from "react-bootstrap/Form";
import styles from "./ThumbnailModal.module.css";
import { RESOLUTION, thumbnailUrl, videoId } from "../../utils/youtubeUtil";
import { BOKK_IMG } from "../../constants/urls";

function YoutubeThumbnail({ youtubeId }) {
	return youtubeId === "" ? (
		<img src={`${BOKK_IMG}/youtube_share_link.png`} />
	) : (
		<a
			href={thumbnailUrl(youtubeId, RESOLUTION.MAX)}
			target="_blank"
			rel="noopener noreferrer">
			<img src={thumbnailUrl(youtubeId, RESOLUTION.MAX)} />
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
