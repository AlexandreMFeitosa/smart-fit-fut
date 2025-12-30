import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Workouts from "./pages/Workouts";
import WorkoutToday from "./pages/WorkoutToday";
import WorkoutExecution from "./pages/WorkoutExecution";
import Menu from "./pages/Menu";
import WorkoutHistory from "./pages/WorkoutHistory";
import { AddWorkout } from "./pages/AddWorkout";
import { EditWorkout } from "./pages/EditWorkout";

function App() {
  return (
    <BrowserRouter>
      <Menu />

      <Routes>
        {/* DASHBOARD */}
        <Route path="/" element={<Dashboard />} />

        {/* TREINOS */}
        <Route path="/treinos" element={<Workouts />} />
        <Route path="/treino/:id" element={<WorkoutExecution />} />
        <Route path="/treino-hoje" element={<WorkoutToday />} />

        {/* HISTÓRICO */}
        <Route path="/historico" element={<WorkoutHistory />} />

        {/* CRUD */}
        <Route path="/adicionar-treino" element={<AddWorkout />} />
        <Route path="/edit-workout/:id" element={<EditWorkout />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
