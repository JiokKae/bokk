import { useMutation, useQuery } from "@apollo/client";
import { useRef, useState } from "react";
import { Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { DELETE_MESSAGE, MESSAGEBOARD } from "../../constants/querys";

export default function DeleteMessageModal({
	messageId,
	messageType,
	writerType,
	currentPage,
}) {
	const [open, setOpen] = useState(false);
	const [password, setPassword] = useState(
		writerType === "guest" ? "" : null
	);
	const form = useRef();
	const { refetch } = useQuery(MESSAGEBOARD);
	const [deleteMessage, { loading }] = useMutation(DELETE_MESSAGE, {
		onCompleted: ({ deleteMessage: { success } }) => {
			if (success === true) {
				setOpen(false);
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
			<button
				type="button"
				aria-label="게시글 삭제"
				title="삭제"
				onClick={() => setOpen(true)}
				className="inline-flex size-7 cursor-pointer items-center justify-center rounded-md border-0 bg-transparent text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-500"
			>
				<X className="size-4" />
			</button>

			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className="max-w-sm gap-0 overflow-hidden p-0">
					<DialogHeader className="rounded-t-xl border-0 border-b border-solid border-zinc-200 bg-white px-5 py-3.5">
						<div className="flex items-center gap-2.5">
							<span className="inline-flex size-8 items-center justify-center rounded-lg bg-red-50 text-red-500">
								<Trash2 className="size-4" />
							</span>
							<div>
								<DialogTitle className="text-lg font-bold text-zinc-900">
									게시글 삭제
								</DialogTitle>
								<DialogDescription className="sr-only">
									게시글을 삭제합니다. 비회원 글은 비밀번호 입력이 필요합니다.
								</DialogDescription>
							</div>
						</div>
					</DialogHeader>

					<form ref={form} onSubmit={onSubmit}>
						<div className="bg-white px-5 py-4">
							{writerType === "guest" ? (
								<div className="flex flex-col gap-2">
									<p className="m-0 text-sm text-zinc-600">
										작성 시 입력한 4자리 숫자 비밀번호를 입력해주세요.
									</p>
									<Input
										type="password"
										placeholder="비밀번호 (숫자 4자리)"
										maxLength={4}
										pattern="[0-9]{1,4}"
										autoComplete="one-time-code"
										required
										autoFocus
										onChange={(e) => setPassword(e.target.value)}
									/>
								</div>
							) : (
								<p className="m-0 text-sm text-zinc-600">
									정말 이 게시글을 삭제하시겠습니까? 삭제된 글은 복구할 수 없습니다.
								</p>
							)}
						</div>

						<DialogFooter className="flex-row justify-end gap-2 rounded-b-xl border-0 border-t border-solid border-zinc-200 bg-zinc-100/80 px-5 py-3">
							<Button
								variant="outline"
								onClick={() => setOpen(false)}
								disabled={loading}
							>
								취소
							</Button>
							<Button
								type="submit"
								variant="destructive"
								disabled={loading}
							>
								{loading ? "삭제 중..." : "삭제"}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>
		</>
	);
}
