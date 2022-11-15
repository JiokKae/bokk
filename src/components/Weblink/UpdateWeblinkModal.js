import { useMutation } from "@apollo/client";
import { useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { OWN_WEBLINKS, UPDATE_WEBLINK } from "../../constants/querys";
import WeblinkForm from "./WeblinkForm";

export default function UpdateWeblinkModal({ weblink }) {
	const [show, setShow] = useState(false);
	const [name, setName] = useState(weblink.name);
	const [url, setUrl] = useState(weblink.url);
	const [color, setColor] = useState(weblink.color);
	const [backgroundColor, setBackgroundColor] = useState(
		weblink.backgroundColor
	);
	const isChange = () => {
		if (name !== weblink.name) return true;
		if (url !== weblink.url) return true;
		if (color !== weblink.color) return true;
		if (backgroundColor !== weblink.backgroundColor) return true;
		return false;
	};

	const [updateWeblink] = useMutation(UPDATE_WEBLINK, {
		refetchQueries: [{ query: OWN_WEBLINKS }],
	});

	const onSubmit = () => {
		setShow(false);
		if (isChange() === false) {
			return;
		}
		updateWeblink({
			variables: {
				input: {
					id: weblink.id,
					name,
					url,
					color,
					backgroundColor,
				},
			},
		});
	};
	return (
		<>
			<button className="btn btn-secondary" onClick={() => setShow(true)}>
				수정
			</button>
			<Modal show={show} onHide={() => setShow(false)}>
				<Modal.Header closeButton>
					<Modal.Title as="h5">웹링크 수정</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<WeblinkForm
						id="updateWeblinkForm"
						onSubmit={onSubmit}
						name={name}
						setName={setName}
						url={url}
						setUrl={setUrl}
						color={color}
						setColor={setColor}
						backgroundColor={backgroundColor}
						setBackgroundColor={setBackgroundColor}
					/>
				</Modal.Body>
				<Modal.Footer>
					<Button
						form="updateWeblinkForm"
						type="submit"
						variant="primary">
						수정
					</Button>
				</Modal.Footer>
			</Modal>
		</>
	);
}
