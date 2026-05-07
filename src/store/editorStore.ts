import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ConsoleMessage {
	id: string;
	type: "log" | "warn" | "error" | "info" | "pass" | "fail";
	content: string;
	timestamp: number;
}

interface IssueSummary {
	errors: number;
	warnings: number;
	info: number;
}

interface EditorState {
	codeByLessonId: Record<string, string>;

	activeTab: string;

	consoleMessages: ConsoleMessage[];
	maxConsoleMessages: number;

	cursorPosition: { line: number; column: number };
	issueSummary: IssueSummary;
	runnerStatus: "idle" | "ready" | "running" | "error";

	setCode: (lessonId: string, code: string) => void;
	getCode: (lessonId: string) => string;
	resetCode: (lessonId: string, starterCode: string) => void;

	setActiveTab: (tabId: string) => void;

	addConsoleMessage: (type: ConsoleMessage["type"], content: string) => void;
	clearConsole: () => void;

	setCursorPosition: (line: number, column: number) => void;
	setIssueSummary: (summary: IssueSummary) => void;
	setRunnerStatus: (status: EditorState["runnerStatus"]) => void;
}

export const useEditorStore = create<EditorState>()(
	persist(
		(set, get) => ({
			codeByLessonId: {},
			activeTab: "challenge",
			consoleMessages: [],
			maxConsoleMessages: 200,
			cursorPosition: { line: 1, column: 1 },
			issueSummary: { errors: 0, warnings: 0, info: 0 },
			runnerStatus: "idle",

			setCode: (lessonId: string, code: string) => {
				const state = get();
				set({
					codeByLessonId: {
						...state.codeByLessonId,
						[lessonId]: code,
					},
				});
			},

			getCode: (lessonId: string) => {
				return get().codeByLessonId[lessonId] || "";
			},

			resetCode: (lessonId: string, starterCode: string) => {
				get().setCode(lessonId, starterCode);
			},

			setActiveTab: (tabId: string) => {
				set({ activeTab: tabId });
			},

			addConsoleMessage: (type: ConsoleMessage["type"], content: string) => {
				const state = get();
				const newMessage: ConsoleMessage = {
					id: `${Date.now()}-${Math.random()}`,
					type,
					content,
					timestamp: Date.now(),
				};

				let updatedMessages = [...state.consoleMessages, newMessage];

				if (updatedMessages.length > state.maxConsoleMessages) {
					updatedMessages = updatedMessages.slice(-state.maxConsoleMessages);
				}

				set({ consoleMessages: updatedMessages });
			},

			clearConsole: () => {
				set({ consoleMessages: [] });
			},

			setCursorPosition: (line: number, column: number) => {
				set({ cursorPosition: { line, column } });
			},
			setIssueSummary: (summary: IssueSummary) => {
				set({ issueSummary: summary });
			},

			setRunnerStatus: (status: EditorState["runnerStatus"]) => {
				set({ runnerStatus: status });
			},
		}),
		{
			name: "synthscript-editor-store",
			partialize: (state) => {
				const maxEntries = 50;
				const codeEntries = Object.entries(state.codeByLessonId).slice(
					-maxEntries,
				);
				return {
					codeByLessonId: Object.fromEntries(codeEntries),
				};
			},
		},
	),
);
