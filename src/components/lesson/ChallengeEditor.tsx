import { useEffect, useState } from "react";
import { useEditorStore } from "../../store/editorStore";
import { useCodeMirror } from "../editor/useCodeMirror";
import type { RunnerEvent } from "../runner/types";
import { useRunner } from "../runner/useRunner";
import styles from "./ChallengeEditor.module.css";

interface ChallengeEditorProps {
	challengeId: string;
	starterCode: string;
	onRun?: (result: { success: boolean; output: string }) => void;
}

export const ChallengeEditor: React.FC<ChallengeEditorProps> = ({
	challengeId,
	starterCode,
	onRun,
}) => {
	const {
		getChallengeCode,
		setChallengeCode,
		addConsoleMessage,
		clearConsole,
	} = useEditorStore();
	const savedCode = getChallengeCode(challengeId);
	const [code, setCode] = useState(() => savedCode ?? starterCode);
	const { runCode, isExecuting, isReady } = useRunner();

	const handleRun = async () => {
		clearConsole();
		addConsoleMessage("info", "▶ Running code...");

		await runCode(code, {
			onEvent: (event: RunnerEvent) => {
				switch (event.type) {
					case "stdout":
						addConsoleMessage("log", event.data.message ?? "");
						break;
					case "stderr":
						addConsoleMessage("error", event.data.message ?? "");
						break;
					case "error":
						addConsoleMessage("error", `✕ ${event.data.message}`);
						break;
					case "done":
						if (event.data.success) {
							addConsoleMessage(
								"info",
								`✓ Code executed (${event.data.runtimeMs ?? 0}ms)`,
							);
							onRun?.({ success: true, output: "" });
						} else {
							addConsoleMessage(
								"error",
								`✕ Execution failed (${event.data.runtimeMs ?? 0}ms)`,
							);
							onRun?.({ success: false, output: event.data.message ?? "" });
						}
						break;
					default:
						break;
				}
			},
		});
	};

	const handleReset = () => {
		setCode(starterCode);
		setChallengeCode(challengeId, starterCode);
		clearConsole();
	};

	const {
		containerRef,
		createEditor,
		destroyEditor,
		setCode: setEditorCode,
	} = useCodeMirror({
		initialCode: code,
		onChange: (newCode) => {
			setCode(newCode);
			setChallengeCode(challengeId, newCode);
		},
		onRun: handleRun,
	});

	useEffect(() => {
		createEditor();
		return () => {
			destroyEditor();
		};
	}, [createEditor, destroyEditor]);

	useEffect(() => {
		setEditorCode(code);
	}, [code, setEditorCode]);

	return (
		<div className={styles.challengeEditor}>
			<div className={styles.editorContainer}>
				<div ref={containerRef} className={styles.editor} />
			</div>
			<div className={styles.controls}>
				<button
					className={styles.runButton}
					onClick={handleRun}
					disabled={isExecuting || !isReady}
					type="button"
				>
					{isExecuting ? "RUNNING..." : "RUN"}
				</button>
				<button
					className={styles.resetButton}
					onClick={handleReset}
					type="button"
				>
					RESET
				</button>
			</div>
		</div>
	);
};
