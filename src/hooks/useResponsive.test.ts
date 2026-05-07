import { describe, expect, it } from "vitest";
import { computeBreakpoint, deriveResponsiveInfo } from "./useResponsive";

describe("computeBreakpoint", () => {
	it("returns xs for widths below 320px", () => {
		expect(computeBreakpoint(280)).toBe("xs");
	});

	it("returns sm for widths between 320px and 639px", () => {
		expect(computeBreakpoint(320)).toBe("sm");
		expect(computeBreakpoint(500)).toBe("sm");
	});

	it("returns md for widths between 640px and 1023px", () => {
		expect(computeBreakpoint(640)).toBe("md");
		expect(computeBreakpoint(800)).toBe("md");
	});

	it("returns lg for widths between 1024px and 1439px", () => {
		expect(computeBreakpoint(1024)).toBe("lg");
		expect(computeBreakpoint(1366)).toBe("lg");
	});

	it("returns xl for widths at or above 1440px", () => {
		expect(computeBreakpoint(1440)).toBe("xl");
		expect(computeBreakpoint(2560)).toBe("xl");
	});
});

describe("deriveResponsiveInfo", () => {
	it("marks xs/sm breakpoints as mobile", () => {
		expect(deriveResponsiveInfo(360, "portrait").isMobile).toBe(true);
		expect(deriveResponsiveInfo(480, "portrait").isMobile).toBe(true);
	});

	it("marks md breakpoint as tablet", () => {
		expect(deriveResponsiveInfo(768, "portrait").isTablet).toBe(true);
		expect(deriveResponsiveInfo(768, "landscape").isTablet).toBe(true);
	});

	it("marks lg/xl breakpoints as desktop", () => {
		expect(deriveResponsiveInfo(1200, "portrait").isDesktop).toBe(true);
		expect(deriveResponsiveInfo(1920, "landscape").isDesktop).toBe(true);
	});

	it("tracks orientation", () => {
		expect(deriveResponsiveInfo(800, "portrait").orientation).toBe("portrait");
		expect(deriveResponsiveInfo(800, "landscape").orientation).toBe("landscape");
	});

	it("returns correct breakpoint string", () => {
		expect(deriveResponsiveInfo(280, "portrait").breakpoint).toBe("xs");
		expect(deriveResponsiveInfo(400, "landscape").breakpoint).toBe("sm");
		expect(deriveResponsiveInfo(800, "portrait").breakpoint).toBe("md");
		expect(deriveResponsiveInfo(1200, "landscape").breakpoint).toBe("lg");
		expect(deriveResponsiveInfo(1600, "portrait").breakpoint).toBe("xl");
	});
});
