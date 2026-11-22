import { Outlet } from "react-router-dom";

export default function SignLayout() {
	return (
		<div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-10">
			<div className="w-full max-w-[380px] rounded-2xl border-[1px] border-solid border-zinc-200 bg-white p-7 shadow-sm">
				<Outlet />
			</div>
		</div>
	);
}
