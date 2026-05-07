import {
	findLessonById,
	findParentLesson,
	useLessonStore,
} from "../../store/lessonStore";
import styles from "./LessonPanel.module.css";
import { LessonSection } from "./LessonSection";

export function LessonPanel() {
	const {
		activeLesson,
		setActiveLesson,
		navigateNext,
		navigatePrev,
		canNavigateNext,
		canNavigatePrev,
		getFlatNavList,
		markLessonCompleted,
	} = useLessonStore();

	const currentLesson = activeLesson ? findLessonById(activeLesson) : null;
	const parentLesson = activeLesson ? findParentLesson(activeLesson) : null;
	const isSubLesson = parentLesson !== null;

	const flatNav = getFlatNavList();
	const currentIndex = flatNav.findIndex((e) => e.lessonId === activeLesson);
	const totalCount = flatNav.length;

	// Progress dots: show dots for parent + siblings when in a sub-lesson
	const getProgressDots = () => {
		if (!currentLesson) return [];
		if (isSubLesson && parentLesson?.subLessons) {
			const parent = parentLesson;
			const siblings = [parent, ...(parent.subLessons ?? [])];
			return siblings.map((l) => ({
				id: l.id,
				active: l.id === activeLesson,
				isSub: l.id !== parent.id,
			}));
		}
		return [];
	};

	const dots = getProgressDots();

	const canPrev = canNavigatePrev();
	const canNext = canNavigateNext();
	const isPrevDisabled = canPrev === false;
	const isNextDisabled = canNext === false;

	const handleNext = () => {
		if (activeLesson) markLessonCompleted(activeLesson);
		navigateNext();
	};

	const handlePrev = () => {
		navigatePrev();
	};

	// Build the panel title
	const getPanelTitle = () => {
		if (!currentLesson) return "// SELECT A LESSON";
		if (isSubLesson && parentLesson) {
			const parentNum = parentLesson.id.split("-")[0];
			return `// ${parentNum} › ${currentLesson.title.toUpperCase()}`;
		}
		const num = currentLesson.id.split("-")[0];
		return `// ${num.padStart(2, "0")} — ${currentLesson.title.toUpperCase()}`;
	};

	const getDifficultyClass = (diff: string) => {
		switch (diff) {
			case "beginner":
				return styles.pillBeginner;
			case "intermediate":
				return styles.pillIntermediate;
			case "advanced":
				return styles.pillAdvanced;
			default:
				return styles.pillBeginner;
		}
	};

	return (
		<div className={styles.lessonPanel}>
			<div className={styles.panelBar}>
				<span className={styles.panelTitle}>{getPanelTitle()}</span>
				{currentLesson && (
					<div className={styles.panelPills}>
						{isSubLesson && parentLesson && (
							<span className={`${styles.pill} ${styles.pillParent}`}>
								↑ {parentLesson.title}
							</span>
						)}
						<span
							className={`${styles.pill} ${getDifficultyClass(currentLesson.difficulty)}`}
						>
							{currentLesson.difficulty.toUpperCase()}
						</span>
						<span className={`${styles.pill} ${styles.pillTime}`}>
							⏱ {currentLesson.estimatedMinutes} MIN
						</span>
					</div>
				)}
			</div>

			<div className={styles.lessonBody}>
				{currentLesson ? (
					<div>
						<h1 className={styles.lessonTitle}>
							{currentLesson.title.toUpperCase()}
						</h1>

						{/* Sub-lesson breadcrumb */}
						{isSubLesson && parentLesson && (
							<div className={styles.breadcrumb}>
								<span className={styles.breadcrumbParent}>
									{parentLesson.title}
								</span>
								<span className={styles.breadcrumbSep}> › </span>
								<span className={styles.breadcrumbCurrent}>
									{currentLesson.title}
								</span>
							</div>
						)}

						{/* Sub-lesson navigator pills (show when in a parent lesson) */}
						{!isSubLesson &&
							currentLesson.subLessons &&
							currentLesson.subLessons.length > 0 && (
								<div className={styles.subLessonList}>
									<div className={styles.subLessonLabel}>
										{"// IN THIS LESSON"}
									</div>
									{currentLesson.subLessons.map((sub, idx) => (
										<div
											key={sub.id}
											role="button"
											tabIndex={0}
											className={styles.subLessonPill}
											onClick={() => setActiveLesson(sub.id)}
											onKeyDown={(e) => {
												if (e.key === "Enter" || e.key === " ") {
													e.preventDefault();
													setActiveLesson(sub.id);
												}
											}}
										>
											<span className={styles.subLessonNum}>
												{String(idx + 1).padStart(2, "0")}
											</span>
											<span className={styles.subLessonTitle}>{sub.title}</span>
											<span className={styles.subLessonTime}>
												⏱ {sub.estimatedMinutes}m
											</span>
										</div>
									))}
								</div>
							)}

						{currentLesson.sections.map((section, index) => {
							const sectionKey =
								section.type === "challenge" && section.id
									? section.id
									: `${currentLesson.id}-${section.type}-${index}`;

							return (
								<LessonSection
									key={sectionKey}
									lessonId={currentLesson.id}
									sectionIndex={index}
									section={section}
								/>
							);
						})}

						{/* Navigation footer */}
						<div className={styles.lessonFooter}>
							<button
								className={`${styles.pageButton} ${isPrevDisabled ? styles.disabled : ""}`}
								onClick={handlePrev}
								disabled={isPrevDisabled}
								type="button"
								data-tooltip="Previous lesson"
							>
								← PREV
							</button>

							<div className={styles.navInfo}>
								{dots.length > 0 ? (
									<div className={styles.dots}>
										{dots.map((d) => (
											<div
												key={d.id}
												className={`${styles.dot} ${d.active ? styles.active : ""} ${d.isSub ? styles.dotSub : ""}`}
												data-tooltip={d.id}
											/>
										))}
									</div>
								) : (
									<span className={styles.navCounter}>
										{currentIndex + 1} / {totalCount}
									</span>
								)}
							</div>

							<button
								className={`${styles.pageButton} ${styles.nextBtn} ${isNextDisabled ? styles.disabled : ""}`}
								onClick={handleNext}
								disabled={isNextDisabled}
								type="button"
								data-tooltip="Next lesson"
							>
								{canNext ? "NEXT →" : "COMPLETE ✓"}
							</button>
						</div>
					</div>
				) : (
					<div className={styles.emptyState}>
						<h1 className={styles.lessonTitle}>READY TO LEARN?</h1>
						<p className={styles.lessonIntro}>
							Choose a lesson from the sidebar to begin your JavaScript journey.
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
