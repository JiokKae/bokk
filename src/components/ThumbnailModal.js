import { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import InputGroup from "react-bootstrap/InputGroup";
import Form from "react-bootstrap/Form";
import styles from "./ThumbnailModal.module.css";

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
	/**
	 * @link https://stackoverflow.com/questions/5830387/how-do-i-find-all-youtube-video-ids-in-a-string-using-a-regex/6901180#6901180
	 * @param {string} text
	 */
	function getYouTubeId(text) {
		if (text === null) return "";
		var regex =
			/https?:\/\/(?:[0-9A-Z-]+\.)?(?:youtu\.be\/|youtube(?:-nocookie)?\.com\S*?[^\w\s-])([\w-]{11})(?=[^\w-]|$)(?![?=&+%\w.-]*(?:['"][^<>]*>|<\/a>))[?=&+%\w.-]*/gi;
		return text.replace(regex, "$1");
	}
	const [thumbnailId, SetThumbnailId] = useState("");
	const [show, setShow] = useState(false);
	const handleClose = () => setShow(false);
	const handleShow = () => setShow(true);

	const onClick = () => {
		SetThumbnailId(getYouTubeId(document.getElementById("urlInput").value));
		document.getElementById("urlInput").value = "";
	};
	return (
		<>
			<Button
				className={`${styles.btnLg} ${styles.bgcYoutube} mt-2`}
				onClick={handleShow}>
				유튜브 Thumbnail 크게 보기
			</Button>
			<Modal show={show} onHide={handleClose}>
				<Modal.Header closeButton>
					<Modal.Title>유튜브 Thumbnail 크게 보기</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<YoutubeThumbnail youtubeId={thumbnailId} />
				</Modal.Body>
				<Modal.Footer>
					<InputGroup className="mb-3">
						<Form.Control
							id="urlInput"
							placeholder="https://youtu.be/..."
							aria-label="input Youtube video link"
							aria-describedby="basic-addon2"
							required
						/>
						<Button
							variant="outline-secondary"
							id="button-addon2"
							onClick={onClick}>
							입력
						</Button>
					</InputGroup>
				</Modal.Footer>
			</Modal>
		</>
	);
}
