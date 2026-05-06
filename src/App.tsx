import styles from "./App.module.css";
import { Header } from "./components/layout/Header";
import { StatusBar } from "./components/layout/StatusBar";
import { Workspace } from "./components/layout/Workspace";

function App() {
	return (
		<div className={styles.app}>
			<Header />
			<Workspace />
			<StatusBar />
		</div>
	);
}

export default App;
