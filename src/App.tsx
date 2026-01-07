import { BrowserRouter, Routes, Route } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Workouts from "./pages/Workouts";
import WorkoutToday from "./pages/WorkoutToday";
import WorkoutExecution from "./pages/WorkoutExecution";
import Menu from "./pages/Menu";
import { WorkoutHistory } from "./pages/WorkoutHistory";
import { AddWorkout } from "./pages/AddWorkout";
import { EditWorkout } from "./pages/EditWorkout";
import { WorkoutProgress } from "./pages/WorkoutProgress";

function App() {
  return (
    <BrowserRouter>
      {/* CONTEÚDO DAS PÁGINAS */}
      <main className="page-content">
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
      </main>

      {/* MENU FIXO */}
      <Menu />
    </BrowserRouter>
  );
}

export default App;