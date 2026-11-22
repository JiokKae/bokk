import { useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
	WEBLINK_DATE_TOKEN_GROUPS,
	formatWeblinkDynamicText,
	hasDynamicDateToken,
} from "../../utils/weblinkUtil";
import Weblink from "./Weblink";

export default function WeblinkForm({
	id,
	className,
	onSubmit,
	values,
	onChange,
	groups = [],
}) {
	const { name, url, color, backgroundColor, groupId } = values;
	const nameInputRef = useRef(null);
	const urlInputRef = useRef(null);
	const [activeField, setActiveField] = useState("url");
	const [isFormatOpen, setIsFormatOpen] = useState(
		() => hasDynamicDateToken(name) || hasDynamicDateToken(url)
	);

	const handleInsertToken = (token) => {
		const isNameTarget = activeField === "name";
		const inputEl = isNameTarget ? nameInputRef.current : urlInputRef.current;
		const fieldKey = isNameTarget ? "name" : "url";
		const currentValue = (isNameTarget ? name : url) || "";

		if (!inputEl) {
			onChange(fieldKey, currentValue + token);
			return;
		}

		const start =
			typeof inputEl.selectionStart === "number"
				? inputEl.selectionStart
				: currentValue.length;
		const end =
			typeof inputEl.selectionEnd === "number"
				? inputEl.selectionEnd
				: currentValue.length;

		const nextValue =
			currentValue.slice(0, start) + token + currentValue.slice(end);
		onChange(fieldKey, nextValue);

		const nextCursorPos = start + token.length;
		requestAnimationFrame(() => {
			if (inputEl) {
				inputEl.focus();
				try {
					inputEl.setSelectionRange(nextCursorPos, nextCursorPos);
				} catch (_) {
					// ignore if selection range is unsupported
				}
			}
		});
	};

	const now = new Date();
	const isUrlDynamic = hasDynamicDateToken(url);
	const resolvedUrlPreview = isUrlDynamic
		? formatWeblinkDynamicText(url, now)
		: "";

	return (
		<form
			id={id}
			className={cn("flex flex-col gap-3.5", className)}
			onSubmit={(e) => {
				e.preventDefault();
				onSubmit(e);
				e.target.reset();
			}}
		>
			<div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
				<div className="flex flex-col gap-1.5">
					<label
						htmlFor="name"
						className="text-sm font-semibold text-zinc-700"
					>
						이름
					</label>
					<Input
						ref={nameInputRef}
						type="text"
						id="name"
						maxLength={25}
						pattern="[A-Za-z0-9ㄱ-힣\{\}\(\)\[\]\-_.,!?+&/ ]{1,25}"
						required
						value={name}
						onFocus={() => setActiveField("name")}
						onChange={(e) => onChange("name", e.target.value)}
					/>
				</div>

				<div className="flex flex-col gap-1.5">
					<label
						htmlFor="groupId"
						className="text-sm font-semibold text-zinc-700"
					>
						소속 그룹
					</label>
					<select
						id="groupId"
						value={groupId ?? ""}
						onChange={(e) => onChange("groupId", e.target.value)}
						className="flex h-9 w-full rounded-md border-[1px] border-solid border-zinc-300 bg-white px-2.5 text-sm text-zinc-900 shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-bokk focus-visible:ring-2 focus-visible:ring-bokk/30"
					>
						<option value="">미분류</option>
						{groups
							.filter((g) => g.id > 0)
							.map((g) => (
								<option key={g.id} value={g.id}>
									{g.name}
								</option>
							))}
					</select>
				</div>
			</div>

			<div className="flex flex-col gap-1.5">
				<label
					htmlFor="url"
					className="text-sm font-semibold text-zinc-700"
				>
					URL
				</label>
				<Input
					ref={urlInputRef}
					type="text"
					inputMode="url"
					id="url"
					placeholder="https://example.com"
					pattern="https?://\S+"
					required
					value={url}
					onFocus={() => setActiveField("url")}
					onChange={(e) => onChange("url", e.target.value)}
				/>

				<div
					className={cn(
						"mt-1 overflow-hidden rounded-lg border-[1px] border-solid bg-white transition-all duration-200",
						isFormatOpen
							? "border-bokk-border shadow-xs"
							: "border-zinc-200"
					)}
				>
					<div
						className={cn(
							"flex cursor-pointer select-none items-center justify-between px-3.5 py-2.5 transition-colors duration-200",
							isFormatOpen
								? "border-0 border-b border-solid border-bokk-border/70 bg-bokk-subtle/70"
								: "bg-zinc-100/80 hover:bg-zinc-100"
						)}
						onMouseDown={(e) => e.preventDefault()}
						onClick={() => setIsFormatOpen((prev) => !prev)}
					>
						<span
							className={cn(
								"text-sm font-bold",
								isFormatOpen ? "text-zinc-900" : "text-zinc-600"
							)}
						>
							동적 날짜 포맷
						</span>
						<ChevronDown
							className={cn(
								"size-4 transition-transform duration-200",
								isFormatOpen
									? "rotate-180 text-bokk"
									: "text-zinc-500"
							)}
						/>
					</div>

					<div
						className="overflow-hidden bg-white transition-all duration-250 ease-out"
						style={{
							maxHeight: isFormatOpen ? "220px" : "0px",
							opacity: isFormatOpen ? 1 : 0,
						}}
					>
						<div className="flex flex-col gap-1.5 px-3.5 py-2.5">
							{WEBLINK_DATE_TOKEN_GROUPS.map(({ category, tokens }) => (
								<div
									key={category}
									className="flex items-center gap-2"
								>
									<span className="w-10 shrink-0 text-[13.5px] font-semibold text-zinc-500">
										{category}
									</span>
									<div className="flex flex-wrap gap-1.5">
										{tokens.map(({ token, getExample }) => {
											const exampleVal = getExample(now);
											return (
												<button
													key={token}
													type="button"
													className="inline-flex h-8 cursor-pointer items-center gap-1 rounded-md border-[1px] border-solid border-zinc-200 bg-white px-2.5 text-[13px] text-zinc-900 shadow-xs transition-colors hover:border-bokk-border hover:bg-bokk-subtle/60"
													onMouseDown={(e) => e.preventDefault()}
													onClick={() => handleInsertToken(token)}
													title={`클릭 시 ${token} 삽입 (현재 값: ${exampleVal})`}
												>
													<code className="font-bold text-bokk-dark">
														{token}
													</code>
													<span className="text-xs text-zinc-500">
														({exampleVal})
													</span>
												</button>
											);
										})}
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>

			<div className="flex flex-wrap items-start gap-4 pt-1">
				<div className="flex flex-col gap-1.5">
					<label
						htmlFor="color"
						className="text-sm font-semibold text-zinc-700"
					>
						글자 색상
					</label>
					<input
						type="color"
						id="color"
						className="h-9 w-12 cursor-pointer rounded-md border-[1px] border-solid border-zinc-300 bg-white p-1 shadow-xs transition-colors hover:border-bokk focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bokk/30 [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-[4px] [&::-webkit-color-swatch]:border-[1px] [&::-webkit-color-swatch]:border-solid [&::-webkit-color-swatch]:border-black/10 [&::-moz-color-swatch]:rounded-[4px] [&::-moz-color-swatch]:border-[1px] [&::-moz-color-swatch]:border-solid [&::-moz-color-swatch]:border-black/10"
						onInput={(e) => onChange("color", e.target.value)}
						onChange={(e) => onChange("color", e.target.value)}
						value={color}
					/>
				</div>

				<div className="flex flex-col gap-1.5">
					<label
						htmlFor="backgroundColor"
						className="text-sm font-semibold text-zinc-700"
					>
						배경 색상
					</label>
					<input
						type="color"
						id="backgroundColor"
						className="h-9 w-12 cursor-pointer rounded-md border-[1px] border-solid border-zinc-300 bg-white p-1 shadow-xs transition-colors hover:border-bokk focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bokk/30 [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-[4px] [&::-webkit-color-swatch]:border-[1px] [&::-webkit-color-swatch]:border-solid [&::-webkit-color-swatch]:border-black/10 [&::-moz-color-swatch]:rounded-[4px] [&::-moz-color-swatch]:border-[1px] [&::-moz-color-swatch]:border-solid [&::-moz-color-swatch]:border-black/10"
						onInput={(e) => onChange("backgroundColor", e.target.value)}
						onChange={(e) => onChange("backgroundColor", e.target.value)}
						value={backgroundColor}
					/>
				</div>

				<div className="flex min-w-0 flex-1 flex-col gap-1.5">
					<span className="text-sm font-semibold text-zinc-700">
						미리보기
					</span>
					<div>
						<Weblink
							name={name}
							color={color}
							backgroundColor={backgroundColor}
						/>
					</div>
				</div>
			</div>

			{isUrlDynamic && (
				<div
					className="rounded-lg border-[1px] border-solid border-bokk-border bg-bokk-subtle/50 px-3 py-2 text-[13.5px] break-all"
					title={resolvedUrlPreview}
				>
					<span className="mr-1.5 font-semibold text-zinc-600">
						적용 URL:
					</span>
					<span className="font-medium text-bokk-dark">
						{resolvedUrlPreview}
					</span>
				</div>
			)}
		</form>
	);
}
