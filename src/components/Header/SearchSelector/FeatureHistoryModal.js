import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp, ClipboardList } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { FEATURE_HISTORY_CATEGORIES } from "../../../constants/featureHistory";

const TWO_WEEKS_MS = 14 * 24 * 60 * 60 * 1000;

function isDateNew(dateStr, nowMs) {
	const time = new Date(dateStr.replace(/\./g, "-")).getTime();
	return nowMs - time <= TWO_WEEKS_MS;
}

// 기본 노출 개수: 최신 릴리즈 일자의 항목들(1~6개)을 온전히 기본 노출하고, 이전 날짜의 내역은 '더보기'로 제공
function getInitialVisibleCount(updates) {
	if (updates.length <= 5) return updates.length;
	const latestDate = updates[0]?.date;
	const sameDateCount = updates.filter((u) => u.date === latestDate).length;
	if (sameDateCount >= 1 && sameDateCount <= 6) return sameDateCount;
	return 5;
}

export default function FeatureHistoryModal() {
	const [open, setOpen] = useState(false);

	const sortedCategories = useMemo(() => {
		return [...FEATURE_HISTORY_CATEGORIES].sort((a, b) => {
			const latestA = Math.max(
				...a.updates.map((u) => new Date(u.date.replace(/\./g, "-")).getTime() || 0)
			);
			const latestB = Math.max(
				...b.updates.map((u) => new Date(u.date.replace(/\./g, "-")).getTime() || 0)
			);
			return latestB - latestA;
		});
	}, []);

	const [openCategoryIds, setOpenCategoryIds] = useState({
		[sortedCategories[0].id]: true,
	});
	const [expandedCategoryIds, setExpandedCategoryIds] = useState({});

	const toggleCategory = (id) => {
		setOpenCategoryIds((prev) => ({
			...prev,
			[id]: !prev[id],
		}));
	};

	const toggleExpandCategory = (id) => {
		setExpandedCategoryIds((prev) => ({
			...prev,
			[id]: !prev[id],
		}));
	};

	const now = Date.now();

	return (
		<>
			<Button
				variant="outline"
				size="icon"
				className="size-8 rounded-lg border-border bg-background text-foreground shadow-xs hover:border-bokk-border hover:bg-bokk-subtle hover:text-bokk-dark"
				onClick={() => setOpen(true)}
				onMouseDown={(e) => e.preventDefault()}
				title="기능 추가 내역"
				aria-label="기능 추가 내역"
			>
				<ClipboardList className="size-4" />
			</Button>

			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className="max-w-3xl gap-0 overflow-hidden p-0">
					<DialogHeader className="rounded-t-xl border-0 border-b border-solid border-zinc-200 bg-white px-5 py-3.5">
						<div className="flex items-center gap-2.5">
							<span className="inline-flex size-8 items-center justify-center rounded-lg bg-bokk-subtle text-bokk-dark">
								<ClipboardList className="size-4" />
							</span>
							<div>
								<DialogTitle className="text-lg font-bold text-zinc-900">
									기능 추가 내역
								</DialogTitle>
								<DialogDescription className="sr-only">
									볶음밥의 최근 업데이트 및 기능 추가 히스토리 목록입니다.
								</DialogDescription>
							</div>
						</div>
					</DialogHeader>

					<div className="always-scrollbar max-h-[70vh] overflow-y-scroll overflow-x-hidden bg-zinc-50 px-4 py-4 pr-5">
						<style>{`
							.always-scrollbar::-webkit-scrollbar {
								width: 8px !important;
							}
							.always-scrollbar::-webkit-scrollbar-thumb {
								background-color: #cbd5e1 !important;
								border-radius: 4px !important;
							}
							.always-scrollbar::-webkit-scrollbar-thumb:hover {
								background-color: #94a3b8 !important;
							}
							.always-scrollbar::-webkit-scrollbar-track {
								background-color: #f1f5f9 !important;
								border-radius: 4px !important;
							}
						`}</style>

						<div className="flex flex-col gap-2.5">
							{sortedCategories.map((category) => {
								const isOpen = Boolean(openCategoryIds[category.id]);
								const isExpanded = Boolean(expandedCategoryIds[category.id]);
								const latestUpdate = category.updates[0];
								const hasNew = category.updates.some((u) => isDateNew(u.date, now));

								const visibleCount = getInitialVisibleCount(category.updates);
								const hasMore = category.updates.length > visibleCount;
								const displayedUpdates = isExpanded
									? category.updates
									: category.updates.slice(0, visibleCount);
								const hiddenCount = category.updates.length - visibleCount;

								return (
									<div
										key={category.id}
										className={cn(
											"overflow-hidden rounded-xl border-[1px] border-solid bg-white transition-all duration-200",
											isOpen
												? "border-bokk-border shadow-xs"
												: "border-zinc-200"
										)}
									>
										<div
											className={cn(
												"flex cursor-pointer select-none items-center justify-between px-4 py-3 transition-colors duration-200",
												isOpen
													? "border-0 border-b border-solid border-zinc-100 bg-white"
													: "bg-zinc-100/80 hover:bg-zinc-100"
											)}
											onClick={() => toggleCategory(category.id)}
											onMouseDown={(e) => e.preventDefault()}
										>
											<div className="flex items-center gap-2">
												<h6
													className={cn(
														"m-0 text-[15px] font-bold",
														isOpen ? "text-zinc-900" : "text-zinc-500"
													)}
												>
													{category.mainTitle}
												</h6>
												{hasNew && <Badge variant="default">NEW</Badge>}
											</div>

											<div className="flex shrink-0 items-center gap-2 text-xs text-zinc-500">
												<span>{latestUpdate?.date}</span>
												<ChevronDown
													className={cn(
														"size-4 transition-transform duration-200",
														isOpen ? "rotate-180 text-bokk" : "text-zinc-400"
													)}
												/>
											</div>
										</div>

										<div
											className="overflow-hidden bg-white transition-all duration-300 ease-out"
											style={{
												maxHeight: isOpen ? (isExpanded ? "3000px" : "800px") : "0px",
												opacity: isOpen ? 1 : 0,
											}}
										>
											<div className="px-4 py-2">
												<div className="flex flex-col">
													{displayedUpdates.map((sub, idx) => {
														const isSubNew = isDateNew(sub.date, now);
														return (
															<div
																key={idx}
																className={cn(
																	"py-3 first:pt-2 last:pb-2",
																	idx !== 0 && "border-0 border-t border-solid border-zinc-100"
																)}
															>
																<div className="mb-1.5 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
																	<div className="flex items-center justify-between gap-2 sm:hidden">
																		<Badge variant={isSubNew ? "default" : "secondary"}>
																			{sub.tag || (isSubNew ? "신규" : "업데이트")}
																		</Badge>
																		<span className="shrink-0 text-xs text-zinc-500">
																			{sub.date}
																		</span>
																	</div>
																	<div className="flex items-center gap-2">
																		<Badge
																			variant={isSubNew ? "default" : "secondary"}
																			className="hidden sm:inline-flex"
																		>
																			{sub.tag || (isSubNew ? "신규" : "업데이트")}
																		</Badge>
																		<span className="text-sm font-semibold leading-snug text-zinc-900">
																			{sub.title}
																		</span>
																	</div>
																	<span className="hidden shrink-0 text-xs text-zinc-500 sm:inline">
																		{sub.date}
																	</span>
																</div>
																<p className="m-0 pl-0.5 text-[13.5px] leading-relaxed whitespace-pre-line break-words text-zinc-600">
																	{sub.description}
																</p>
															</div>
														);
													})}
												</div>

												{hasMore && (
													<div className="pt-2 pb-1">
														<Button
															variant="outline"
															size="sm"
															className="h-9 w-full rounded-lg border-zinc-200 bg-zinc-50 text-[13px] font-medium text-zinc-600 hover:border-bokk-border hover:bg-bokk-subtle/60 hover:text-bokk-dark"
															onClick={(e) => {
																e.stopPropagation();
																toggleExpandCategory(category.id);
															}}
														>
															{isExpanded ? (
																<>
																	<ChevronUp className="size-3.5" />
																	<span>이전 업데이트 접기</span>
																</>
															) : (
																<>
																	<ChevronDown className="size-3.5 text-bokk" />
																	<span>이전 업데이트 {hiddenCount}개 더보기</span>
																</>
															)}
														</Button>
													</div>
												)}
											</div>
										</div>
									</div>
								);
							})}
						</div>
					</div>

					<DialogFooter className="flex-row justify-end rounded-b-xl border-0 border-t border-solid border-zinc-200 bg-zinc-100/80 px-4 py-2.5">
						<span className="text-xs font-medium text-zinc-600">
							Release Note
						</span>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
