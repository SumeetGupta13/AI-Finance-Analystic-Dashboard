import { Toaster } from 'react-hot-toast';
import AppRouter from './routes/AppRouter';

export default function App() {
  return (
    <>
      <AppRouter />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#111111',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#ffffff',
          },
        }}
      />
    </>
  );
}
