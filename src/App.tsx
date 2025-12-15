import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ContentProvider } from './context/ContentContext';
import { Layout } from './components/Layout';
import { ThemeProvider } from './context/ThemeContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Home } from './pages/Home';
import { GamePage } from './pages/GamePage';
import { AdminPage } from './pages/AdminPage';
import { Login } from './pages/Login';
import { SessionsPage } from './pages/SessionsPage';

import { PublicGameSession } from './pages/PublicGameSession';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route
            path="/login"
            element={
              <ThemeProvider storageKey="theme">
                <Login />
              </ThemeProvider>
            }
          />

          <Route
            path="/session/:sessionId"
            element={
              <ThemeProvider storageKey="public_theme">
                <PublicGameSession />
              </ThemeProvider>
            }
          />

          <Route
            path="/*"
            element={
              <ContentProvider>
                <ThemeProvider storageKey="theme">
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
                      <Route path="sessions" element={<SessionsPage />} />
                      <Route path="admin" element={<AdminPage />} />
                      <Route path="admin/edit/:id" element={<AdminPage />} />
                    </Route>

                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </ThemeProvider>
              </ContentProvider>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
