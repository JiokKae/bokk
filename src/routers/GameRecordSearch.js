import { useState } from "react";
import { GAME_SEARCH_PROVIDERS } from "../constants/gameSearchProviders";

function GameSearchPanel({ provider }) {
	const [query, setQuery] = useState("");
	const isJsNavigate = typeof provider.onNavigate === "function";

	const handleSubmit = (e) => {
		if (!isJsNavigate) return;
		e.preventDefault();
		provider.onNavigate(query);
	};

	return (
		<div className={`bgc-${provider.name} p-3`}>
			<form
				className="p-2"
				action={isJsNavigate ? undefined : provider.action}
				method={isJsNavigate ? undefined : "get"}
				acceptCharset={provider.acceptCharset}
				onSubmit={handleSubmit}
			>
				{provider.hiddenInputs?.map(({ name, value }) => (
					<input key={name} type="hidden" name={name} value={value} />
				))}
				<div className="row g-3">
					<div className="col">
						<input
							type="search"
							className={provider.inputClass || "form-control mb-2"}
							name={provider.inputName}
							maxLength={provider.maxLength}
							required={provider.required}
							placeholder={provider.placeholder}
							value={isJsNavigate ? query : undefined}
							onChange={
								isJsNavigate ? (e) => setQuery(e.target.value) : undefined
							}
						/>
					</div>
					<div className="col-auto">
						<button
							type="submit"
							className={`btn ${provider.buttonClass} mb-2`}
						>
							검색
						</button>
					</div>
				</div>
			</form>
			{provider.players.map((name) => (
				<a
					key={name}
					href={provider.getProfileUrl(name)}
					target="_blank"
					rel="noopener noreferrer"
					className={provider.linkClass}
				>
					{name}
				</a>
			))}
		</div>
	);
}

export default function GameRecordSearch() {
	const [searcherIndex, setSearcherIndex] = useState(0);
	const currentProvider = GAME_SEARCH_PROVIDERS[searcherIndex];

	return (
		<div className="fs20">
			<div className="nav nav-pills flex-column flex-sm-row">
				{GAME_SEARCH_PROVIDERS.map((provider, index) => (
					<button
						key={provider.name}
						className={`bgc-${provider.name} flex-sm-fill text-sm-center nav-link brt-2`}
						onClick={() => setSearcherIndex(index)}
					>
						{provider.title}
					</button>
				))}
			</div>
			<GameSearchPanel key={currentProvider.name} provider={currentProvider} />
		</div>
	);
}
