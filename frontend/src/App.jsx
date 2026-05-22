import { BrowserRouter as Router } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import AppRouter from './routes/AppRouter';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-background text-foreground font-sans">
          <AppRouter />
          <Toaster 
            position="top-right"
            toastOptions={{
              className: 'bg-card text-foreground border border-border shadow-lg',
              style: {
                background: 'hsl(var(--card))',
                color: 'hsl(var(--foreground))',
                border: '1px solid hsl(var(--border))'
              }
            }}
          />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
