import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Menu from "./pages/Menu";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import  Login  from "./pages/Login";
import DetalhesDoTreino from "./pages/DetalhesDoTreino";
import Dieta from "./pages/Dieta";
import Configuracao from "./pages/Configuracao";

// Lazy loading das páginas
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Workouts = lazy(() => import("./pages/Workouts"));
const WorkoutToday = lazy(() => import("./pages/WorkoutToday"));
const WorkoutExecution = lazy(() => import("./pages/WorkoutExecution"));
const WorkoutHistory = lazy(() => import("./pages/WorkoutHistory").then(m => ({ default: m.WorkoutHistory })));
const AddWorkout = lazy(() => import("./pages/AddWorkout").then(m => ({ default: m.AddWorkout })));
const EditWorkout = lazy(() => import("./pages/EditWorkout").then(m => ({ default: m.EditWorkout })));
const WorkoutProgress = lazy(() => import("./pages/WorkoutProgress").then(m => ({ default: m.WorkoutProgress })));

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <main className="page-content">
          <Suspense fallback={<div style={{ padding: "20px", textAlign: "center" }}>Carregando...</div>}>
            <Routes>
              {/* ROTA PÚBLICA */}
              <Route path="/login" element={<Login />} />

              {/* ROTA PÚBLICA */}
              <Route path="/detalhes" element={<DetalhesDoTreino/>} />

              {/* ROTAS PROTEGIDAS - O ProtectedRoute envolve o COMPONENTE, não o Route */}
              <Route path="/" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />

              <Route path="/treinos" element={
                <ProtectedRoute>
                  <Workouts />
                </ProtectedRoute>
              } />

              <Route path="/treino/:id" element={
                <ProtectedRoute>
                  <WorkoutExecution />
                </ProtectedRoute>
              } />

              <Route path="/treino-hoje" element={
                <ProtectedRoute>
                  <WorkoutToday />
                </ProtectedRoute>
              } />

              <Route path="/historico" element={
                <ProtectedRoute>
                  <WorkoutHistory />
                </ProtectedRoute>
              } />

              <Route path="/dieta" element={
                <ProtectedRoute>
                  <Dieta />
                </ProtectedRoute>
              } />

              <Route path="/config" element={
                <ProtectedRoute>
                  <Configuracao />
                </ProtectedRoute>
              } />

              <Route path="/evolucao" element={
                <ProtectedRoute>
                  <WorkoutProgress />
                </ProtectedRoute>
              } />

              <Route path="/adicionar-treino" element={
                <ProtectedRoute>
                  <AddWorkout />
                </ProtectedRoute>
              } />

              <Route path="/edit-workout/:id" element={
                <ProtectedRoute>
                  <EditWorkout />
                </ProtectedRoute>
              } />
            </Routes>
          </Suspense>
          <Menu />
        </main>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;