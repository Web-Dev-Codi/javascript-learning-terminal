import React, { useState } from "react";
import { useLessonStore } from "../../store/lessonStore";
import styles from "./QuizBlock.module.css";

interface QuizBlockProps {
	question: string;
	options: string[];
	correctIndex: number;
	explanation: string;
	lessonId?: string;
	questionIndex?: number;
}

export const QuizBlock: React.FC<QuizBlockProps> = ({
	question,
	options,
	correctIndex,
	explanation,
	lessonId = "",
	questionIndex = 0,
}) => {
	const { getQuizAnswer, saveQuizAnswer } = useLessonStore();
	const storedAnswer = getQuizAnswer(lessonId, questionIndex);
	const [selectedOption, setSelectedOption] = useState<number | null>(
		storedAnswer ?? null,
	);
	const [showExplanation, setShowExplanation] = useState(storedAnswer !== null);

	const handleOptionClick = (optionIndex: number) => {
		if (selectedOption !== null) return; // Already answered

		setSelectedOption(optionIndex);
		saveQuizAnswer(lessonId, questionIndex, optionIndex);
		setShowExplanation(true);
	};

	const getOptionClass = (index: number) => {
		if (selectedOption === null) return styles.option;

		if (index === correctIndex) return `${styles.option} ${styles.correct}`;
		if (index === selectedOption && index !== correctIndex)
			return `${styles.option} ${styles.incorrect}`;

		return styles.option;
	};

	const getOptionIcon = (index: number) => {
		if (selectedOption === null) return String.fromCodePoint(65 + index); // A, B, C, D

		if (index === correctIndex) return "✓";
		if (index === selectedOption && index !== correctIndex) return "✕";

		return String.fromCodePoint(65 + index);
	};

	return (
		<div className={styles.quizWrap}>
			<div className={styles.quizLabel}>▸ QUIZ</div>
			<div className={styles.quizQuestion}>{question}</div>

			<div className={styles.quizOptions}>
				{options.map((option, index) => (
					<div
						key={index}
						role="button"
						tabIndex={0}
						aria-pressed={selectedOption === index}
						className={getOptionClass(index)}
						onClick={() => handleOptionClick(index)}
						onKeyDown={(e) => {
							if (e.key === "Enter" || e.key === " ") {
								e.preventDefault();
								handleOptionClick(index);
							}
						}}
					>
						<span className={styles.optionKey}>{getOptionIcon(index)}</span>
						<span className={styles.optionText}>{option}</span>
						{index === correctIndex && selectedOption !== null && (
							<span className={styles.correctBadge}>✓</span>
						)}
					</div>
				))}
			</div>

			{showExplanation && (
				<div className={styles.explanation}>
					<div className={styles.explanationContent}>{explanation}</div>
				</div>
			)}
		</div>
	);
};
