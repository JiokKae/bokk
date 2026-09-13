import { useMutation } from "@apollo/client";
import { useState } from "react";
import { Form } from "react-bootstrap";
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
		<div
			className="d-flex align-items-center flex-shrink-0 w-100 justify-content-between justify-content-sm-end"
			style={{ position: "relative" }}
		>
			{buttons.map((button) => (
				<button
					key={button.id}
					className={`btn btn-sm p-1 border-0 ${styles.controllerBtn} ${
						button?.classCond ? "bgc-bokk-light" : ""
					}`}
					type="button"
					title={button.title || ""}
					onClick={
						button?.condition
							? button.swap?.onClick
							: button?.onClick
					}>
					<img
						src={`${process.env.REACT_APP_BOKK_IMG}/${
							button?.condition ? button.swap.id : button.id
						}.png`}
						alt={button?.condition ? button.swap.id : button.id}
						style={{ width: "20px", height: "20px", objectFit: "contain" }}
					/>
				</button>
			))}
			{showOption ? (
				<div className={`px-4 py-3 ${styles.popover}`} style={{ top: "100%", right: 0, marginTop: "4px" }}>
					<div>
						<Form.Check
							type="checkbox"
							label="자동 재생"
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
					</div>
				</div>
			) : null}
		</div>
	);
}
