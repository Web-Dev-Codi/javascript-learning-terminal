import { useEffect, useRef, useState } from "react";
import { useEditorStore } from "../../store/editorStore";
import { findLessonById, useLessonStore } from "../../store/lessonStore";
import { validateChallenge } from "../checker/challengeValidator";
import type { ChallengeSection, Diagnostic } from "../../types/lesson";
import { FeedbackPanel } from "../checker/FeedbackPanel";
import { useRunner } from "../runner/useRunner";
import { ChallengeInfo } from "./ChallengeInfo";
import { ConsolePanel } from "./ConsolePanel";
import styles from "./EditorPanel.module.css";
import { useEditor } from "./useEditor";
import { useResponsive } from "../../hooks/useResponsive";

export function EditorPanel() {
	const { activeLesson } = useLessonStore();
	const {
		clearConsole,
		addConsoleMessage,
		activeTab,
	} = useEditorStore();
	const { runCode, isExecuting, isReady } = useRunner();
	const [runtimeDiagnostics, setRuntimeDiagnostics] = useState<Diagnostic[]>(
		[],
	);
	const consoleOutputRef = useRef<string[]>([]);

	const getCurrentLessonData = () => {
		if (activeTab === "scratch") {
			return {
				lessonId: "scratch",
				starterCode: `// JavaScript Playground\n// Write any code and press RUN!\n\nconsole.log("Hello from scratch.js!");\n`,
			};
		}

		const lesson = activeLesson ? findLessonById(activeLesson) : null;
		const starterCode =
			lesson?.sections?.find(
				(s): s is ChallengeSection => s.type === "challenge",
			)?.starterCode ??
			`// Welcome! Write your code here.

console.log("Hello, world!");`;

		return {
			lessonId: activeLesson || "scratch",
			starterCode,
		};
	};

	const { lessonId, starterCode } = getCurrentLessonData();

	const handleRun = async () => {
		const currentCode = getCurrentCode();
		setRuntimeDiagnostics([]);
		consoleOutputRef.current = [];
		clearConsole();
		addConsoleMessage("info", "▶ Running code...");

		await runCode(currentCode, {
			onEvent: (event) => {
				switch (event.type) {
					case "stdout":
						consoleOutputRef.current.push(event.data.message ?? "");
						addConsoleMessage("log", event.data.message ?? "");
						break;
					case "stderr":
						addConsoleMessage("error", event.data.message ?? "");
						break;
					case "error":
						addConsoleMessage("error", `✕ ${event.data.message}`);
						if (event.data.line) {
							setRuntimeDiagnostics([
								{
									ruleId: "runtime-error",
									severity: "error",
									line: event.data.line,
									column: event.data.column ?? 1,
									messages: {
										short: "Runtime error",
										long: event.data.message ?? "Runtime error",
									},
								},
							]);
						}
						break;
					case "done":
						if (event.data.success) {
							addConsoleMessage(
								"info",
								`✓ Code executed (${event.data.runtimeMs ?? 0}ms)`,
							);

							if (activeTab === "challenge") {
								const lesson = activeLesson ? findLessonById(activeLesson) : null;
								const challengeSection = lesson?.sections?.find(
									(s): s is ChallengeSection => s.type === "challenge",
								);
								if (challengeSection?.codeChecks || challengeSection?.expectedOutput) {
									const results = validateChallenge(
										currentCode,
										consoleOutputRef.current,
										challengeSection.codeChecks,
										challengeSection.expectedOutput,
									);

									const allPass = results.every((r) => r.pass);
									if (allPass) {
										addConsoleMessage("pass", "✓ Challenge completed! All checks passed.");
										if (activeLesson) {
											useLessonStore.getState().markLessonCompleted(activeLesson);
										}
									} else {
										addConsoleMessage("fail", "✕ Some checks failed:");
										const failed = results.filter((r) => !r.pass);
										for (const result of failed) {
											addConsoleMessage("fail", `  • ${result.description}: ${result.message}`);
										}
									}
								}
							}
						} else {
							addConsoleMessage(
								"error",
								`✕ Execution failed (${event.data.runtimeMs ?? 0}ms)`,
							);
						}
						break;
					default:
						break;
				}
			},
		});
	};

	const {
		containerRef,
		createEditor,
		destroyEditor,
		resetCode,
		getCurrentCode,
		setActiveTab,
		diagnostics,
		goToLine,
	} = useEditor({
		lessonId,
		starterCode,
		onRun: handleRun,
		extraDiagnostics: runtimeDiagnostics,
	});

	const { isMobile, isTablet } = useResponsive();

	const handleReset = () => {
		resetCode();
		clearConsole();
		addConsoleMessage("info", "↺ Code reset to starter");
		setRuntimeDiagnostics([]);
	};

	useEffect(() => {
		createEditor();
		return () => {
			destroyEditor();
		};
	}, [createEditor, destroyEditor]);

	const handleTabClick = (tabId: string) => {
		setActiveTab(tabId);
		clearConsole();
		setRuntimeDiagnostics([]);
	};

	let runButtonText: string;
	if (isExecuting) {
		runButtonText = "⏳ RUNNING...";
	} else if (isReady) {
		runButtonText = "▶ RUN";
	} else {
		runButtonText = "▶ RUN (offline)";
	}

	return (
		<div className={styles.editorPanel}>
			{activeTab !== "scratch" && <ChallengeInfo />}
			{/* Editor Section */}
			<div className={isMobile ? styles.editorWrapMobile : styles.editorWrap}>
				<div className={styles.editorBar}>
					<div className={styles.editorTabs}>
						<button
							type="button"
							className={`${styles.editorTab} ${activeTab === "challenge" ? styles.active : ""}`}
							onClick={() => handleTabClick("challenge")}
						>
							challenge.js
						</button>
						<button
							type="button"
							className={`${styles.editorTab} ${activeTab === "scratch" ? styles.active : ""}`}
							onClick={() => handleTabClick("scratch")}
						>
							scratch.js
						</button>
					</div>
					<div className={styles.editorActions}>
						<button
							type="button"
							className={`${styles.editorButton} ${styles.resetButton}`}
							onClick={handleReset}
							data-tooltip="Reset code to starter template"
						>
							↺ RESET
						</button>
						<button
							type="button"
							className={`${styles.editorButton} ${styles.runButton} ${isExecuting ? styles.executing : ""}`}
							onClick={handleRun}
							disabled={isExecuting}
							data-tooltip={
								isExecuting ? "Code is running…" : "Run code (Ctrl+Enter)"
							}
						>
							{runButtonText} <span className={styles.shortcut}>^↵</span>
						</button>
					</div>
				</div>
				<div className={styles.editorBody}>
					<div ref={containerRef} className={styles.editorContainer} />
				</div>
			</div>

			{/* Console Section */}
			<div className={isMobile || isTablet ? styles.bottomSectionStacked : styles.bottomSection}>
				<div className={isMobile || isTablet ? styles.consoleWrapFull : styles.consoleWrap}>
					<ConsolePanel />
				</div>

				{/* Feedback Panel */}
				{!isMobile && (
					<div className={styles.feedbackWrap}>
						<FeedbackPanel
							diagnostics={diagnostics}
							onGoToLine={(line) => goToLine(line)}
						/>
					</div>
				)}
			</div>
		</div>
	);
}
