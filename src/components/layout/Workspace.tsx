import { useResponsive } from "../../hooks/useResponsive";
import { DesktopLayout } from "./DesktopLayout";
import { MobileLayout } from "./MobileLayout";
import { TabletLayout } from "./TabletLayout";

export function Workspace() {
	const { isMobile, isTablet } = useResponsive();

	if (isMobile) return <MobileLayout />;
	if (isTablet) return <TabletLayout />;
	return <DesktopLayout />;
}
