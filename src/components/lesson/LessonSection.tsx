import type { LessonSection as LessonSectionType } from "../../types/lesson";
import { ChallengeSection } from "./ChallengeSection";
import { CodeExample } from "./CodeExample";
import { QuizBlock } from "./QuizBlock";
import { TextSection } from "./TextSection";

interface LessonSectionProps {
	readonly lessonId: string;
	readonly sectionIndex: number;
	readonly section: LessonSectionType;
	readonly onRunExample?: (code: string) => void;
}

export function LessonSection({
	lessonId,
	sectionIndex,
	section,
	onRunExample,
}: LessonSectionProps) {
	switch (section.type) {
		case "text":
			return <TextSection content={section.content} />;

		case "code-example":
			return (
				<CodeExample
					label={section.label}
					code={section.code}
					highlightLines={section.highlightLines}
					onRun={onRunExample}
				/>
			);

		case "quiz":
			return (
				<QuizBlock
					question={section.question}
					options={section.options}
					correctIndex={section.correctIndex}
					explanation={section.explanation}
				/>
			);

		case "challenge": {
			const challengeId = section.id
				? section.id
				: `${lessonId}-challenge-${sectionIndex}`;

			return (
				<ChallengeSection
					challengeId={challengeId}
					prompt={section.prompt}
					starterCode={section.starterCode}
					hints={section.hints}
					tests={section.tests}
				/>
			);
		}

		default:
			console.warn("Unknown lesson section type:", section);
			return null;
	}
}
