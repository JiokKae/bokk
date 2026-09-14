import { useMutation, useQuery } from "@apollo/client";
import { useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { ADD_WEBLINK, MY_WEBLINK_GROUPS, OWN_WEBLINKS } from "../../constants/querys";
import WeblinkForm from "./WeblinkForm";

export default function AddWeblinkModal({ position = "last", defaultGroupId = null }) {
	const [show, setShow] = useState(false);
	const [name, setName] = useState("");
	const [url, setUrl] = useState("");
	const [color, setColor] = useState("#FFFFFF");
	const [backgroundColor, setBackgroundColor] = useState("#1EA1F7");
	const [groupId, setGroupId] = useState(defaultGroupId ?? "");

	const { data: groupData } = useQuery(MY_WEBLINK_GROUPS);
	const groups = groupData?.myWeblinkGroups || [];

	const [addWeblink] = useMutation(ADD_WEBLINK, {
		refetchQueries: [{ query: OWN_WEBLINKS }, { query: MY_WEBLINK_GROUPS }],
	});

	const handleOpen = () => {
		setName("");
		setUrl("");
		setColor("#FFFFFF");
		setBackgroundColor("#1EA1F7");
		setGroupId(defaultGroupId ?? "");
		setShow(true);
	};

	const onSubmit = () => {
		addWeblink({
			variables: {
				input: {
					name,
					url,
					color,
					backgroundColor,
					position,
					groupId: groupId ? Number(groupId) : null,
				},
			},
		});
		setShow(false);
	};
	return (
		<>
			<button
				className="btn btn-dot m-1 user-select-none"
				style={{ userSelect: "none" }}
				onMouseDown={(e) => e.preventDefault()}
				onClick={handleOpen}>
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
						groupId={groupId}
						setGroupId={setGroupId}
						groups={groups}
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
