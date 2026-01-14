import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './context/AuthProvider';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { LocaleProvider } from './context/LocaleContext';
import router from './routes';

import { SocketProvider } from './context/SocketContext';

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