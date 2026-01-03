import { RouterProvider } from 'react-router-dom';
import {
  AuthProvider,
  ThemeProvider,
  ToastProvider,
  LocaleProvider,
  DriverProvider,
  SocketProvider
} from './context';
import router from './routes';

import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <LocaleProvider>
        <ThemeProvider>
          <ToastProvider>
            <AuthProvider>
              <SocketProvider>
                <DriverProvider>
                  <RouterProvider router={router} />
                </DriverProvider>
              </SocketProvider>
            </AuthProvider>
          </ToastProvider>
        </ThemeProvider>
      </LocaleProvider>
    </ErrorBoundary>
  );
}

export default App;