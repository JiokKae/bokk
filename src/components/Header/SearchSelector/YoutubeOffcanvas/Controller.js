import { useState } from "react";
import { Form } from "react-bootstrap";
import styles from "./Controller.module.css";

export default function Controller({
	isPlaying,
	autoPlay,
	setAutoPlay,
	player,
	onPreviousPlay,
	onNextPlay,
	onRandomPlay,
	isRandom,
}) {
	const [showOption, setShowOption] = useState(false);
	const buttons = [
		{ id: "previous_play", onClick: onPreviousPlay },
		{
			id: "play",
			onClick: () => player.playVideo(),
			condition: isPlaying,
			swap: { id: "pause", onClick: () => player.pauseVideo() },
		},
		{ id: "next_play", onClick: onNextPlay },
		{
			id: "random_play",
			onClick: onRandomPlay,
			classCond: isRandom,
			class: "",
		},
		{ id: "gear", onClick: () => setShowOption(!showOption) },
	];
	return (
		<div className="float-end mb-3" style={{ position: "relative" }}>
			{buttons.map((button) => (
				<button
					key={button.id}
					className={`btn ${
						button?.classCond ? "bgc-bokk-light" : ""
					}`}
					type="button"
					onClick={
						button?.condition
							? button.swap?.onClick
							: button?.onClick
					}>
					<img
						src={`https://jiokkae.com/볶음밥/img/${
							button?.condition ? button.swap.id : button.id
						}.png`}
						style={{ width: "24px" }}
					/>
				</button>
			))}
			{showOption ? (
				<div className={`px-4 py-3 ${styles.popover}`}>
					<div>
						<Form.Check
							type="checkbox"
							label="자동 재생"
							defaultChecked={autoPlay}
							onChange={() =>
								//API 추가
								setAutoPlay(!autoPlay)
							}
						/>
					</div>
				</div>
			) : null}
		</div>
	);
}
