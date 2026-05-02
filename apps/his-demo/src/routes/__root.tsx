import {
	HeadContent,
	Link,
	Outlet,
	Scripts,
	createRootRouteWithContext,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { TanStackDevtools } from "@tanstack/react-devtools";
import { Activity, MessageSquare } from "lucide-react";

import TanStackQueryDevtools from "../integrations/tanstack-query/devtools";
import { ChatDrawer } from "../components/chatbot/chat-drawer";

import appCss from "../styles.css?url";

import type { QueryClient } from "@tanstack/react-query";

interface MyRouterContext {
	queryClient: QueryClient;
}

// In static SPA builds (GitHub Pages at /fhir-dsl/demo) the /api/chat and
// /api/mcp server routes don't exist. Hide the chatbot UI to keep the demo
// honest about what's actually working.
const IS_STATIC = import.meta.env.BASE_URL !== "/";

export const Route = createRootRouteWithContext<MyRouterContext>()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{ name: "viewport", content: "width=device-width, initial-scale=1" },
			{ title: "Caduceus — fhir-dsl HIS demo" },
		],
		links: [{ rel: "stylesheet", href: appCss }],
	}),
	shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" className="dark">
			<head>
				<HeadContent />
			</head>
			<body className="min-h-dvh bg-background text-foreground antialiased">
				<AppShell>{children}</AppShell>
				{IS_STATIC ? null : <ChatDrawer />}
				<TanStackDevtools
					config={{ position: "bottom-right" }}
					plugins={[
						{ name: "Tanstack Router", render: <TanStackRouterDevtoolsPanel /> },
						TanStackQueryDevtools,
					]}
				/>
				<Scripts />
			</body>
		</html>
	);
}

function AppShell({ children }: { children: React.ReactNode }) {
	return (
		<div className="flex min-h-dvh flex-col">
			<header className="border-b bg-background/80 px-6 py-3 backdrop-blur">
				<div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
					<Link to="/" className="flex items-center gap-2 text-lg font-semibold tracking-tight">
						<Activity className="h-5 w-5 text-primary" />
						Caduceus
						<span className="ml-1 rounded bg-muted px-1.5 py-0.5 text-xs font-mono text-muted-foreground">
							fhir-dsl
						</span>
					</Link>
					<nav className="flex items-center gap-4 text-sm">
						<Link
							to="/patients"
							activeProps={{ className: "text-foreground" }}
							inactiveProps={{ className: "text-muted-foreground hover:text-foreground" }}
						>
							Patients
						</Link>
						<Link
							to="/playground"
							activeProps={{ className: "text-foreground" }}
							inactiveProps={{ className: "text-muted-foreground hover:text-foreground" }}
						>
							Playground
						</Link>
						{IS_STATIC ? null : (
							<button
								type="button"
								className="flex items-center gap-1 rounded border border-border px-2 py-1 text-xs text-muted-foreground hover:bg-muted"
								data-chatbot-trigger
							>
								<MessageSquare className="h-3.5 w-3.5" /> Chat
							</button>
						)}
					</nav>
				</div>
			</header>
			<main className="mx-auto w-full max-w-7xl flex-1 px-6 py-8">{children ?? <Outlet />}</main>
		</div>
	);
}
