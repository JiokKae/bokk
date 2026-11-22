import { useMutation } from "@apollo/client";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { ME, SET_USER_CONFIG } from "../../../../constants/querys";
import styles from "./Controller.module.css";

export default function Controller({
	isPlaying,
	autoPlay,
	player,
	onPreviousPlay,
	onNextPlay,
	onRandomPlay,
	isRandom,
	onRepeatOnePlay,
	isRepeatOne,
}) {
	const [showOption, setShowOption] = useState(false);
	const [setUserConfig] = useMutation(SET_USER_CONFIG, {
		refetchQueries: [{ query: ME }],
		update(cache, { data: { setUserConfig } }) {
			if (setUserConfig?.config) {
				const existingMe = cache.readQuery({ query: ME });
				if (existingMe?.me) {
					cache.writeQuery({
						query: ME,
						data: {
							me: {
								...existingMe.me,
								config: {
									...existingMe.me.config,
									videoAutoPlay: setUserConfig.config.videoAutoPlay,
								},
							},
						},
					});
				}
			}
		},
	});

	const buttons = [
		{ id: "previous_play", onClick: onPreviousPlay, title: "이전 곡" },
		{
			id: "play",
			onClick: () => player?.playVideo(),
			condition: isPlaying,
			swap: { id: "pause", onClick: () => player?.pauseVideo() },
			title: isPlaying ? "일시 정지" : "재생",
		},
		{ id: "next_play", onClick: onNextPlay, title: "다음 곡" },
		{
			id: "random_play",
			onClick: onRandomPlay,
			classCond: isRandom,
			title: "셔플 재생",
		},
		{
			id: "play_one",
			onClick: onRepeatOnePlay,
			classCond: isRepeatOne,
			title: "한곡 반복",
		},
		{ id: "gear", onClick: () => setShowOption(!showOption), title: "설정" },
	];

	return (
		<div className="relative flex w-full shrink-0 items-center justify-between gap-0.5 sm:justify-end">
			{buttons.map((button) => (
				<button
					key={button.id}
					className={cn(
						"inline-flex cursor-pointer items-center justify-center rounded-md border-0 bg-transparent p-1.5 transition-colors hover:bg-zinc-100",
						styles.controllerBtn,
						button?.classCond && "bgc-bokk-light"
					)}
					type="button"
					title={button.title || ""}
					onClick={
						button?.condition ? button.swap?.onClick : button?.onClick
					}
				>
					<img
						src={`${process.env.REACT_APP_BOKK_IMG}/${
							button?.condition ? button.swap.id : button.id
						}.png`}
						alt={button?.condition ? button.swap.id : button.id}
						className="size-5 object-contain"
					/>
				</button>
			))}
			{showOption ? (
				<div
					className={cn("px-4 py-3", styles.popover)}
					style={{ top: "100%", right: 0, marginTop: "4px" }}
				>
					<label className="flex cursor-pointer select-none items-center gap-2 whitespace-nowrap text-sm text-zinc-800">
						<input
							type="checkbox"
							className="size-4 cursor-pointer accent-bokk"
							checked={Boolean(autoPlay)}
							onChange={() => {
								setUserConfig({
									variables: {
										input: {
											videoAutoPlay: !autoPlay,
										},
									},
								});
							}}
						/>
						<span>자동 재생</span>
					</label>
				</div>
			) : null}
		</div>
	);
}
