import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ContentProvider } from './context/ContentContext';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Home } from './pages/Home';
import { GamePage } from './pages/GamePage';
import { AdminPage } from './pages/AdminPage';
import { Login } from './pages/Login';

import { PublicGameSession } from './pages/PublicGameSession';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes - outside ContentProvider */}
          <Route path="/login" element={<Login />} />

          <Route path="/session/:sessionId" element={<PublicGameSession />} />

          {/* Protected routes - inside ContentProvider */}
          <Route
            path="/*"
            element={
              <ContentProvider>
                <Routes>
                  <Route
                    path="/"
                    element={
                      <ProtectedRoute>
                        <Layout />
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={<Home />} />
                    <Route path="game/:id" element={<GamePage />} />
                    <Route path="admin" element={<AdminPage />} />
                  </Route>

                  {/* Catch all - redirect to home */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </ContentProvider>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
