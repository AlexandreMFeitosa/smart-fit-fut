import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Menu from "./pages/Menu";

// Usando lazy() para carregar as páginas apenas quando necessário
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Workouts = lazy(() => import("./pages/Workouts"));
const WorkoutToday = lazy(() => import("./pages/WorkoutToday"));
const WorkoutExecution = lazy(() => import("./pages/WorkoutExecution"));
const WorkoutHistory = lazy(() => import("./pages/WorkoutHistory").then(module => ({ default: module.WorkoutHistory })));
const AddWorkout = lazy(() => import("./pages/AddWorkout").then(module => ({ default: module.AddWorkout })));
const EditWorkout = lazy(() => import("./pages/EditWorkout").then(module => ({ default: module.EditWorkout })));
const WorkoutProgress = lazy(() => import("./pages/WorkoutProgress").then(module => ({ default: module.WorkoutProgress })));

function App() {
  return (
    <BrowserRouter>
      <main className="page-content">
        {/* O Suspense é obrigatório ao usar lazy loading. 
            O fallback é o que aparece na tela enquanto o arquivo da página é baixado. */}
        <Suspense fallback={<div style={{ padding: '20px', textAlign: 'center' }}>Carregando...</div>}>
          <Routes>
            {/* DASHBOARD */}
            <Route path="/" element={<Dashboard />} />

            {/* TREINOS */}
            <Route path="/treinos" element={<Workouts />} />
            <Route path="/treino/:id" element={<WorkoutExecution />} />
            <Route path="/treino-hoje" element={<WorkoutToday />} />

            {/* HISTÓRICO */}
            <Route path="/historico" element={<WorkoutHistory />} />
            <Route path="/evolucao" element={<WorkoutProgress />} />

            {/* CRUD */}
            <Route path="/adicionar-treino" element={<AddWorkout />} />
            <Route path="/edit-workout/:id" element={<EditWorkout />} />
          </Routes>
        </Suspense>
      </main>

      {/* MENU FIXO - Mantemos fora do Suspense para ele nunca sumir da tela */}
      <Menu />
    </BrowserRouter>
  );
}

export default App;