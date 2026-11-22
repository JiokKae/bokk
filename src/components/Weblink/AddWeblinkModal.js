import { useMutation, useQuery } from "@apollo/client";
import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { ADD_WEBLINK, MY_WEBLINK_GROUPS, OWN_WEBLINKS } from "../../constants/querys";
import WeblinkForm from "./WeblinkForm";

const createInitialValues = (defaultGroupId) => ({
	name: "",
	url: "",
	color: "#FFFFFF",
	backgroundColor: "#1EA1F7",
	groupId: defaultGroupId ?? "",
});

export default function AddWeblinkModal({ position = "last", defaultGroupId = null }) {
	const [open, setOpen] = useState(false);
	const [formValues, setFormValues] = useState(() =>
		createInitialValues(defaultGroupId)
	);

	const { data: groupData } = useQuery(MY_WEBLINK_GROUPS);
	const groups = groupData?.myWeblinkGroups || [];

	const [addWeblink] = useMutation(ADD_WEBLINK, {
		refetchQueries: [{ query: OWN_WEBLINKS }, { query: MY_WEBLINK_GROUPS }],
	});

	const handleFieldChange = (field, value) => {
		setFormValues((prev) => ({ ...prev, [field]: value }));
	};

	const handleOpen = () => {
		setFormValues(createInitialValues(defaultGroupId));
		setOpen(true);
	};

	const onSubmit = () => {
		const { name, url, color, backgroundColor, groupId } = formValues;
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
		setOpen(false);
	};

	return (
		<>
			<button
				type="button"
				className="btn btn-dot m-1 user-select-none"
				style={{ userSelect: "none" }}
				onMouseDown={(e) => e.preventDefault()}
				onClick={handleOpen}
			>
				+
			</button>

			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className="max-w-lg gap-0 overflow-hidden p-0">
					<DialogHeader className="rounded-t-xl border-0 border-b border-solid border-zinc-200 bg-white px-5 py-3.5">
						<div className="flex items-center gap-2.5">
							<span className="inline-flex size-8 items-center justify-center rounded-lg bg-bokk-subtle text-bokk-dark">
								<Plus className="size-4" />
							</span>
							<div>
								<DialogTitle className="text-lg font-bold text-zinc-900">
									웹 링크 추가
								</DialogTitle>
								<DialogDescription className="sr-only">
									새 웹 링크의 이름, 소속 그룹, URL 및 색상을 입력합니다.
								</DialogDescription>
							</div>
						</div>
					</DialogHeader>

					<div className="max-h-[75vh] overflow-y-auto bg-white px-5 py-4">
						<WeblinkForm
							id="addWeblinkForm"
							onSubmit={onSubmit}
							values={formValues}
							onChange={handleFieldChange}
							groups={groups}
						/>
					</div>

					<DialogFooter className="flex-row justify-end gap-2 rounded-b-xl border-0 border-t border-solid border-zinc-200 bg-zinc-100/80 px-5 py-3">
						<Button variant="outline" onClick={() => setOpen(false)}>
							취소
						</Button>
						<Button form="addWeblinkForm" type="submit">
							추가
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
