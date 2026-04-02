// // src/App.tsx

// src/App.tsx
import AppRoutes from './routes/AppRoutes'

import ScrollToTop from './components/common/ScrollToTop'
import { ToastContainer } from 'react-toastify'
import './CustomToastStyles.css'

export default function App() {
	return (
		<>
			<ScrollToTop />

			<AppRoutes />

			<ToastContainer
				position="top-right"
				autoClose={3000}
				hideProgressBar={true}
				pauseOnHover={false}
				newestOnTop
				theme="colored"
				toastClassName="app-toast"
				// bodyClassName="app-toast-body"
				progressClassName="app-toast-progress"
			/>
		</>
	)
}
