import { ResponsiveContext, useResponsiveValue } from "../../hooks/useResponsive";

interface ResponsiveShellProps {
	children: React.ReactNode;
}

export function ResponsiveShell({ children }: ResponsiveShellProps) {
	const value = useResponsiveValue();
	return (
		<ResponsiveContext.Provider value={value}>
			{children}
		</ResponsiveContext.Provider>
	);
}
