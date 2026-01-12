import { RouterProvider } from 'react-router-dom';
import {
  AuthProvider,
  ThemeProvider,
  ToastProvider,
  LocaleProvider,
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
              <RouterProvider router={router} />
            </SocketProvider>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </LocaleProvider>
  );
}

export default App;