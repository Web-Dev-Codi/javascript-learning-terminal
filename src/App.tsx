import "./App.css";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Header } from "./components/layout/Header";
import { ResponsiveShell } from "./components/layout/ResponsiveShell";
import { StatusBar } from "./components/layout/StatusBar";
import { Workspace } from "./components/layout/Workspace";

function App() {
	return (
		<div className="App">
			<ResponsiveShell>
				<ErrorBoundary>
					<Header />
					<ErrorBoundary>
						<Workspace />
					</ErrorBoundary>
					<StatusBar />
				</ErrorBoundary>
			</ResponsiveShell>
		</div>
	);
}

export default App;
