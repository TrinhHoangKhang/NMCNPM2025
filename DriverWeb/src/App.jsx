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

function App() {
  return (
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
  );
}

export default App;