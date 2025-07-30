import { Routes, Route, Navigate } from 'react-router'
import screens from './screens/index.js'

export default function App() {
	return (
		<Routes>
			<Route path="/" element={<screens.Dashboard />} />
			{Object.entries(screens).map(([screenName, ScreenComponent]) => (
				screenName !== 'Dashboard' && (
				<Route
					key={screenName}
					path={`/${screenName}`}
					element={<ScreenComponent />}
				/>
				)
			))}
			{/* Redirect any unknown route to Dashboard */}
			<Route path="*" element={<Navigate to="/" replace />} />
		</Routes>
	)
}
