import { findLessonById, useLessonStore } from "../../store/lessonStore";
import type { ChallengeSection } from "../../types/lesson";
import styles from "./ChallengeInfo.module.css";

export function ChallengeInfo() {
	const { activeLesson } = useLessonStore();

	if (!activeLesson) return null;

	const lesson = findLessonById(activeLesson);
	if (!lesson) return null;

	const challengeSection = lesson.sections.find(
		(s): s is ChallengeSection => s.type === "challenge",
	);

	if (!challengeSection) {
		return (
			<div className={styles.noChallenge}>
				No challenge for this lesson. Use the editor as a scratchpad.
			</div>
		);
	}

	return (
		<div className={styles.challengeInfo}>
			<div className={styles.challengeHeader}>
				<span className={styles.challengeIcon}>🎯</span>
				<span className={styles.challengeLabel}>CHALLENGE</span>
			</div>
			<div className={styles.challengePrompt}>{challengeSection.prompt}</div>
			{challengeSection.hints && challengeSection.hints.length > 0 && (
				<div className={styles.challengeHints}>
					<span className={styles.hintsLabel}>💡 Hints available in lesson panel</span>
				</div>
			)}
		</div>
	);
}