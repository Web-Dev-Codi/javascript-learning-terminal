import type { LessonSection as LessonSectionType } from "../../types/lesson";
import { CodeExample } from "./CodeExample";
import { QuizBlock } from "./QuizBlock";
import { TextSection } from "./TextSection";

interface LessonSectionProps {
	readonly lessonId: string;
	readonly sectionIndex: number;
	readonly section: LessonSectionType;
}

export function LessonSection({
	lessonId,
	sectionIndex,
	section,
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
				/>
			);

		case "quiz":
			return (
				<QuizBlock
					lessonId={lessonId}
					questionIndex={sectionIndex}
					question={section.question}
					options={section.options}
					correctIndex={section.correctIndex}
					explanation={section.explanation}
				/>
			);

		case "challenge":
			return null;

		default:
			return null;
	}
}
