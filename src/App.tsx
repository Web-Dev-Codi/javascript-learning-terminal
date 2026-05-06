import "./App.css";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Header } from "./components/layout/Header";
import { StatusBar } from "./components/layout/StatusBar";
import { Workspace } from "./components/layout/Workspace";

function App() {
	return (
		<div className="App">
			<ErrorBoundary>
				<Header />
				<ErrorBoundary>
					<Workspace />
				</ErrorBoundary>
				<StatusBar />
			</ErrorBoundary>
		</div>
	);
}

export default App;
