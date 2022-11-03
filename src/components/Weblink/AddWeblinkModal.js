import { useMutation } from "@apollo/client";
import { useRef, useState } from "react";
import { Button, Col, Form, Modal, Row } from "react-bootstrap";
import { ADD_WEBLINK, OWN_WEBLINKS } from "../../querys";
import Weblink from "./Weblink";

export default function AddWeblinkModal() {
	const [show, setShow] = useState(false);
	const [name, setName] = useState("웹 링크");
	const [url, setUrl] = useState("");
	const [color, setColor] = useState("#FFFFFF");
	const [backgroundColor, setBackgroundColor] = useState("#1EA1F7");
	const [addWeblink] = useMutation(ADD_WEBLINK, {
		refetchQueries: [{ query: OWN_WEBLINKS }],
	});
	const form = useRef();
	const onSubmit = () => {
		if (form.current.checkValidity() === false) {
			form.current.requestSubmit();
			return;
		}
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
		form.current.reset();
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
					<Form className="row g-3" ref={form}>
						<Form.Group className="col-auto">
							<Form.Label htmlFor="name">이름</Form.Label>
							<Form.Control
								type="text"
								id="name"
								maxLength={10}
								pattern="[A-Za-z0-9ㄱ-힣 ]{1,10}"
								onInput={(e) => setName(e.target.value)}
								required
							/>
						</Form.Group>
						<Form.Group className="col-12">
							<Form.Label htmlFor="url">URL</Form.Label>
							<Form.Control
								type="url"
								id="url"
								placeholder="https://example.com"
								pattern="(http|https):\/\/[^'\s()]+"
								required
								onChange={(e) => setUrl(e.target.value)}
							/>
						</Form.Group>
						<Col>
							<Row>
								<Form.Group className="col-auto">
									<Form.Label htmlFor="color">
										글자 색상
									</Form.Label>
									<Form.Control
										type="color"
										id="color"
										onInput={(e) =>
											setColor(e.target.value)
										}
										defaultValue="#FFFFFF"></Form.Control>
								</Form.Group>
								<Form.Group className="col-auto">
									<Form.Label htmlFor="backgroundColor">
										배경 색상
									</Form.Label>
									<Form.Control
										type="color"
										id="backgroundColor"
										onInput={(e) =>
											setBackgroundColor(e.target.value)
										}
										defaultValue="#1EA1F7"></Form.Control>
								</Form.Group>
								<Col>
									<Form.Label>미리보기</Form.Label>
									<Weblink
										name={name}
										color={color}
										backgroundColor={backgroundColor}
									/>
								</Col>
							</Row>
						</Col>
					</Form>
				</Modal.Body>
				<Modal.Footer>
					<Button variant="primary" onClick={onSubmit}>
						추가
					</Button>
				</Modal.Footer>
			</Modal>
		</>
	);
}
