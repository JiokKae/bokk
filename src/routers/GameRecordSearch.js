import { useState } from "react";

function OpggSearch({ playerNames }) {
	return (
		<div className="bgc-opgg p-3">
			<form
				className="p-2"
				action="https://www.op.gg/summoner/"
				method="get">
				<div className="row g-3">
					<div className="col">
						<input
							type="search"
							className="form-control mb-2"
							name="userName"
							placeholder="소환사명, 소환사명, ..."
						/>
					</div>
					<div className="col-auto">
						<button type="submit" className="btn bgc-white mb-2">
							검색
						</button>
					</div>
				</div>
			</form>
			{playerNames.map((name, index) => (
				<a
					key={index}
					href={`https://www.op.gg/summoner/userName=${name}`}
					target="_blank"
					className="btn btn-md bgc-white ms-2 mb-2">
					{name}
				</a>
			))}
		</div>
	);
}

function FowkrSearch({ playerNames }) {
	return (
		<div className="bgc-fowkr p-3">
			<form
				className="p-2"
				action="http://fow.kr/"
				method="get"
				acceptCharset="utf-8">
				<input type="hidden" name="act" value="find" />
				<div className="row g-3">
					<div className="col">
						<input
							type="search"
							className="form-control mb-2"
							name="field"
						/>
					</div>
					<div className="col-auto">
						<input
							type="submit"
							className="btn bgc-white mb-2"
							name="submit"
							value="검색"
						/>
					</div>
				</div>
			</form>
			{playerNames.map((name, index) => (
				<a
					key={index}
					href={`http://fow.kr/find/${name}`}
					target="_blank"
					className="btn bgc-white ms-2 mb-2">
					{name}
				</a>
			))}
		</div>
	);
}

function YourggSearch({ playerNames }) {
	const [summonerName, setSummonerName] = useState("");
	const search = () => {
		window.location.replace(`https://your.gg/kr/profile/${summonerName}`);
	};
	const onSubmit = (e) => {
		e.preventDefault();
		search();
	};
	return (
		<div className="bgc-yourgg p-3">
			<form className="p-2" onSubmit={onSubmit}>
				<div className="row g-3">
					<div className="col">
						<input
							type="search"
							className="form-control bgc-white mb-2"
							placeholder="소환사"
							onChange={(e) => setSummonerName(e.target.value)}
						/>
					</div>
					<div className="col-auto">
						<input
							type="button"
							className="btn bgc-white mb-2"
							value="검색"
							onClick={() => search()}
						/>
					</div>
				</div>
			</form>
			{playerNames.map((name, index) => (
				<a
					key={index}
					href={`https://your.gg/kr/profile/${name}`}
					target="_blank"
					className="btn btn_md bgc-white ms-2 mb-2">
					{name}
				</a>
			))}
		</div>
	);
}

function DakggSearch({ playerNames }) {
	//TODO: 검색 기능 수리
	return (
		<div className="bgc-dakgg p-3">
			<form className="p-2" action="https://dak.gg/search">
				<div className="row g-3">
					<div className="col">
						<input
							type="search"
							className="form-control mb-2"
							name="name"
							required
							placeholder="배틀그라운드 닉네임을 입력하세요"
						/>
					</div>
					<div className="col-auto">
						<input
							type="submit"
							className="btn bgc-dakgg-orange mb-2"
							name="submit"
							value="검색"
						/>
					</div>
				</div>
			</form>
			{playerNames.map((name, index) => (
				<a
					key={index}
					href={`https://dak.gg/profile/${name}`}
					target="_blank"
					className="btn bgc-dakgg-orange ms-2 mb-2">
					{name}
				</a>
			))}
		</div>
	);
}

function LlchggSearch({ playerNames }) {
	return (
		<div className="bgc-llchgg p-3">
			<form action="https://lolchess.gg/search" className="search p-2">
				<div className="row g-3">
					<input type="hidden" name="region" value="KR" />
					<div className="col">
						<input
							type="search"
							className="form-control mb-2"
							name="name"
							maxLength="30"
							required
							placeholder="소환사 검색"
						/>
					</div>
					<div className="col-auto">
						<input
							type="submit"
							className="btn bgc-white mb-2"
							name="submit"
							value="검색"
						/>
					</div>
				</div>
			</form>
			{playerNames.map((name, index) => (
				<a
					key={index}
					href={`https://lolchess.gg/profile/kr/${name}`}
					target="_blank"
					className="btn btn_md bgc-white ms-2 mb-2">
					{name}
				</a>
			))}
		</div>
	);
}

function LoawaSearch({ playerNames }) {
	const [characterName, setCharacterName] = useState("");
	const onClick = () => {
		window.location = `https://loawa.com/char/${characterName}`;
	};
	return (
		<div className="bgc-loawa p-3">
			<div className="search p-2">
				<div className="row g-3">
					<div className="col">
						<input
							type="text"
							className="form-control mb-2"
							name="name"
							maxLength="30"
							required
							placeholder="검색할 캐릭터명을 입력"
							onChange={(e) => setCharacterName(e.target.value)}
						/>
					</div>
					<div className="col-auto">
						<button
							className="btn bgc-loawa-gray mb-2"
							onClick={onClick}>
							검색
						</button>
					</div>
				</div>
			</div>
			{playerNames.map((name, index) => (
				<a
					key={index}
					href={`https://loawa.com/char/${name}`}
					target="_blank"
					className="btn bgc-loawa-gray ms-2 mb-2">
					{name}
				</a>
			))}
		</div>
	);
}

export default function GameRecordSearch() {
	const [searcherIndex, setSearcherIndex] = useState(0);
	const PLAYER_NAMES = {
		LOL: [
			"인터넷설치기사",
			"철갑꽁치",
			"영원히지지기",
			"SmartRain",
			"구질구질막타전용",
			"데임벨",
			"USSR",
			"멍청대왕",
			"지옥의러바오",
			"뚜루뚜빠라라랏",
		],
		PUBG: [
			"JiokKae",
			"RadioactiveWaste",
			"Unwoo",
			"HanNiVar",
			"Mark_99",
			"ArmoredFISH",
		],
		LOA: [
			"순두부굴전골",
			"최고책임자",
			"침대는좋아",
			"내모든것이딱딱해",
			"뚜루뚜빠라빠랏",
			"리퍼YJ",
			"신한영",
			"핵폐기물",
		],
	};
	const SEARCHES = [
		{
			name: "opgg",
			title: "OP.GG",
			element: <OpggSearch playerNames={PLAYER_NAMES.LOL} />,
		},
		{
			name: "fowkr",
			title: "FOW.KR",
			element: <FowkrSearch playerNames={PLAYER_NAMES.LOL} />,
		},
		{
			name: "yourgg",
			title: "YOUR.GG",
			element: <YourggSearch playerNames={PLAYER_NAMES.LOL} />,
		},
		{
			name: "dakgg",
			title: "DAK.GG",
			element: <DakggSearch playerNames={PLAYER_NAMES.PUBG} />,
		},
		{
			name: "llchgg",
			title: "LOLCHESS.GG",
			element: <LlchggSearch playerNames={PLAYER_NAMES.LOL} />,
		},
		{
			name: "loawa",
			title: "LOAWA",
			element: <LoawaSearch playerNames={PLAYER_NAMES.LOA} />,
		},
	];
	return (
		<div className="fs20">
			<div className="nav nav-pills flex-column flex-sm-row">
				{SEARCHES.map((search, index) => (
					<button
						key={index}
						className={`bgc-${search.name} flex-sm-fill text-sm-center nav-link brt-2`}
						onClick={() => setSearcherIndex(index)}>
						{search.title}
					</button>
				))}
			</div>
			{SEARCHES[searcherIndex].element}
		</div>
	);
}
