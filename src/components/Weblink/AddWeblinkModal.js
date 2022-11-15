import { useMutation } from "@apollo/client";
import { useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { ADD_WEBLINK, OWN_WEBLINKS } from "../../querys";
import WeblinkForm from "./WeblinkForm";

export default function AddWeblinkModal() {
	const [show, setShow] = useState(false);
	const [name, setName] = useState("");
	const [url, setUrl] = useState("");
	const [color, setColor] = useState("#FFFFFF");
	const [backgroundColor, setBackgroundColor] = useState("#1EA1F7");
	const [addWeblink] = useMutation(ADD_WEBLINK, {
		refetchQueries: [{ query: OWN_WEBLINKS }],
	});
	const onSubmit = () => {
		addWeblink({
			variables: {
				input: {
					name,
					url,
					color,
					backgroundColor,
				},
			},
		});
		setShow(false);
	};
	return (
		<>
			<button className="btn-dot m-1" onClick={() => setShow(true)}>
				+
			</button>
			<Modal show={show} onHide={() => setShow(false)}>
				<Modal.Header closeButton>
					<Modal.Title as="h5">웹 링크 추가</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<WeblinkForm
						id="addWeblinkForm"
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
						form="addWeblinkForm"
						type="submit"
						variant="primary">
						추가
					</Button>
				</Modal.Footer>
			</Modal>
		</>
	);
}
