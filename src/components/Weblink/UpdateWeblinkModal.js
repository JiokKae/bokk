import { useMutation, useQuery } from "@apollo/client";
import { useState } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { MY_WEBLINK_GROUPS, OWN_WEBLINKS, UPDATE_WEBLINK } from "../../constants/querys";
import WeblinkForm from "./WeblinkForm";

const createValuesFromWeblink = (weblink) => ({
	name: weblink.name,
	url: weblink.url,
	color: weblink.color,
	backgroundColor: weblink.backgroundColor,
	groupId: weblink.groupId ?? "",
});

export default function UpdateWeblinkModal({ weblink }) {
	const [open, setOpen] = useState(false);
	const [formValues, setFormValues] = useState(() =>
		createValuesFromWeblink(weblink)
	);

	const { data: groupData } = useQuery(MY_WEBLINK_GROUPS);
	const groups = groupData?.myWeblinkGroups || [];

	const handleFieldChange = (field, value) => {
		setFormValues((prev) => ({ ...prev, [field]: value }));
	};

	const isChange = () => {
		const { name, url, color, backgroundColor, groupId } = formValues;
		if (name !== weblink.name) return true;
		if (url !== weblink.url) return true;
		if (color !== weblink.color) return true;
		if (backgroundColor !== weblink.backgroundColor) return true;
		if (String(groupId ?? "") !== String(weblink.groupId ?? "")) return true;
		return false;
	};

	const [updateWeblink] = useMutation(UPDATE_WEBLINK, {
		refetchQueries: [{ query: OWN_WEBLINKS }, { query: MY_WEBLINK_GROUPS }],
	});

	const onSubmit = () => {
		setOpen(false);
		if (isChange() === false) {
			return;
		}
		const { name, url, color, backgroundColor, groupId } = formValues;
		updateWeblink({
			variables: {
				input: {
					id: weblink.id,
					name,
					url,
					color,
					backgroundColor,
					groupId: groupId ? Number(groupId) : null,
				},
			},
		});
	};

	const handleOpen = () => {
		setFormValues(createValuesFromWeblink(weblink));
		setOpen(true);
	};

	return (
		<>
			<Button variant="secondary" size="sm" onClick={handleOpen}>
				수정
			</Button>

			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className="max-w-lg gap-0 overflow-hidden p-0">
					<DialogHeader className="rounded-t-xl border-0 border-b border-solid border-zinc-200 bg-white px-5 py-3.5">
						<div className="flex items-center gap-2.5">
							<span className="inline-flex size-8 items-center justify-center rounded-lg bg-bokk-subtle text-bokk-dark">
								<Pencil className="size-4" />
							</span>
							<div>
								<DialogTitle className="text-lg font-bold text-zinc-900">
									웹링크 수정
								</DialogTitle>
								<DialogDescription className="sr-only">
									선택한 웹링크의 이름, 소속 그룹, URL 및 색상을 수정합니다.
								</DialogDescription>
							</div>
						</div>
					</DialogHeader>

					<div className="max-h-[75vh] overflow-y-auto bg-white px-5 py-4">
						<WeblinkForm
							id="updateWeblinkForm"
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
						<Button form="updateWeblinkForm" type="submit">
							수정
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
