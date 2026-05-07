import { createContext, useContext, useEffect, useState } from "react";

export type Breakpoint = "xs" | "sm" | "md" | "lg" | "xl";

export interface ResponsiveInfo {
	breakpoint: Breakpoint;
	orientation: "portrait" | "landscape";
	isMobile: boolean;
	isTablet: boolean;
	isDesktop: boolean;
}

export const ResponsiveContext = createContext<ResponsiveInfo>({
	breakpoint: "xl",
	orientation: "landscape",
	isMobile: false,
	isTablet: false,
	isDesktop: true,
});

export function computeBreakpoint(width: number): Breakpoint {
	if (width < 320) return "xs";
	if (width < 640) return "sm";
	if (width < 1024) return "md";
	if (width < 1440) return "lg";
	return "xl";
}

export function deriveResponsiveInfo(width: number, orientation: "portrait" | "landscape"): ResponsiveInfo {
	const breakpoint = computeBreakpoint(width);
	return {
		breakpoint,
		orientation,
		isMobile: breakpoint === "xs" || breakpoint === "sm",
		isTablet: breakpoint === "md",
		isDesktop: breakpoint === "lg" || breakpoint === "xl",
	};
}

export function useResponsiveValue(): ResponsiveInfo {
	const [info, setInfo] = useState<ResponsiveInfo>(() =>
		deriveResponsiveInfo(
			typeof document !== "undefined" ? document.documentElement.clientWidth : 1440,
			typeof window !== "undefined" && window.matchMedia("(orientation: portrait)").matches
				? "portrait"
				: "landscape",
		),
	);

	useEffect(() => {
		if (typeof document === "undefined") return;

		const observer = new ResizeObserver((entries: ResizeObserverEntry[]) => {
			const width = entries[0]?.contentRect.width ?? document.documentElement.clientWidth;
			const orientation: "portrait" | "landscape" = window.matchMedia(
				"(orientation: portrait)",
			).matches
				? "portrait"
				: "landscape";
			setInfo(deriveResponsiveInfo(width, orientation));
		});

		observer.observe(document.documentElement);

		const orientationQuery = window.matchMedia("(orientation: portrait)");
		const handleOrientationChange = () => {
			const orientation: "portrait" | "landscape" = orientationQuery.matches
				? "portrait"
				: "landscape";
			setInfo((prev) => ({ ...prev, orientation }));
		};
		orientationQuery.addEventListener("change", handleOrientationChange);

		return () => {
			observer.disconnect();
			orientationQuery.removeEventListener("change", handleOrientationChange);
		};
	}, []);

	return info;
}

export function useResponsive(): ResponsiveInfo {
	return useContext(ResponsiveContext);
}
