import { useState } from "react";
import { cn } from "@/lib/utils";
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
		<div
			className={`bgc-${provider.name} rounded-b-xl px-4 py-5 sm:px-5`}
		>
			<form
				className="mb-4 flex items-center gap-2"
				action={isJsNavigate ? undefined : provider.action}
				method={isJsNavigate ? undefined : "get"}
				acceptCharset={provider.acceptCharset}
				onSubmit={handleSubmit}
			>
				{provider.hiddenInputs?.map(({ name, value }) => (
					<input key={name} type="hidden" name={name} value={value} />
				))}
				<input
					type="search"
					className={cn(
						"h-10 min-w-0 flex-1 rounded-lg border-[1px] border-solid border-black/15 bg-white px-3.5 text-sm text-zinc-900 shadow-xs outline-none placeholder:text-zinc-400 focus:ring-2 focus:ring-white/60",
						provider.inputClass
					)}
					name={provider.inputName}
					maxLength={provider.maxLength}
					required={provider.required}
					placeholder={provider.placeholder}
					value={isJsNavigate ? query : undefined}
					onChange={
						isJsNavigate ? (e) => setQuery(e.target.value) : undefined
					}
				/>
				<button
					type="submit"
					className={cn(
						"inline-flex h-10 shrink-0 cursor-pointer items-center justify-center rounded-lg border-0 px-4 text-sm font-semibold shadow-xs transition-opacity hover:opacity-90",
						provider.buttonClass
					)}
				>
					검색
				</button>
			</form>

			<div className="flex flex-wrap gap-2">
				{provider.players.map((name) => (
					<a
						key={name}
						href={provider.getProfileUrl(name)}
						target="_blank"
						rel="noopener noreferrer"
						className={cn(
							"inline-flex items-center rounded-lg px-3 py-1.5 text-sm font-medium no-underline shadow-xs transition-opacity hover:opacity-85",
							provider.linkClass
						)}
					>
						{name}
					</a>
				))}
			</div>
		</div>
	);
}

export default function GameRecordSearch() {
	const [searcherIndex, setSearcherIndex] = useState(0);
	const currentProvider = GAME_SEARCH_PROVIDERS[searcherIndex];

	return (
		<div className="overflow-hidden rounded-xl shadow-xs">
			<div className="grid grid-cols-2 sm:grid-cols-6">
				{GAME_SEARCH_PROVIDERS.map((provider, index) => {
					const isActive = index === searcherIndex;
					return (
						<button
							key={provider.name}
							type="button"
							className={cn(
								`bgc-${provider.name} cursor-pointer border-0 px-3 py-2.5 text-center text-base transition-opacity sm:first:rounded-tl-xl sm:last:rounded-tr-xl`,
								isActive
									? "font-bold opacity-100"
									: "font-medium opacity-80 hover:opacity-95"
							)}
							onClick={() => setSearcherIndex(index)}
						>
							{provider.title}
						</button>
					);
				})}
			</div>
			<GameSearchPanel key={currentProvider.name} provider={currentProvider} />
		</div>
	);
}
