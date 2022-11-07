import { useMutation, useQuery } from "@apollo/client";
import { useRef, useState } from "react";
import { Button, CloseButton, Form, InputGroup, Modal } from "react-bootstrap";
import { DELETE_MESSAGE, MESSAGEBOARD } from "../../querys";

export default function DeleteMessageModal({
	messageId,
	messageType,
	writerType,
	currentPage,
}) {
	const [show, setShow] = useState(false);
	const [password, setPassword] = useState(
		writerType === "guest" ? "" : null
	);
	const form = useRef();
	const { refetch } = useQuery(MESSAGEBOARD);
	const [deleteMessage] = useMutation(DELETE_MESSAGE, {
		onCompleted: ({ deleteMessage: { success } }) => {
			if (success === true) {
				refetch({ page: currentPage });
				return;
			}
			alert("삭제할 수 없습니다");
		},
	});
	const onSubmit = (e) => {
		e.preventDefault();
		deleteMessage({
			variables: {
				input: {
					messageType,
					messageId,
					password,
				},
			},
		});
	};
	return (
		<>
			<CloseButton onClick={() => setShow(true)} />
			<Modal
				show={show}
				onHide={() => {
					setShow(false);
				}}>
				<Modal.Header closeButton>
					<Modal.Title as="h5">게시글 삭제</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<Form ref={form} onSubmit={onSubmit}>
						<InputGroup className="mb-3">
							{writerType === "guest" ? (
								<Form.Control
									type="password"
									placeholder="비밀번호"
									maxLength={4}
									pattern="[0-9]{1,4}"
									autoComplete="one-time-code"
									required
									onChange={(e) =>
										setPassword(e.target.value)
									}
								/>
							) : null}
							<Button type="submit" variant="outline-secondary">
								삭제
							</Button>
						</InputGroup>
					</Form>
				</Modal.Body>
			</Modal>
		</>
	);
}
