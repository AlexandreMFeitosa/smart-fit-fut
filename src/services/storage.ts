
import type { Workout, WorkoutLog } from "../types/workout";

const LOGS_KEY = "logs";
const WORKOUTS_KEY = "workouts";

// Retorna sempre uma Array, evitando o erro .filter() no Dashboard
export function getLogs(): WorkoutLog[] {
  const data = localStorage.getItem(LOGS_KEY);
  if (!data) return [];
  try {
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// Salva e mantém o histórico (concatena novos logs aos antigos)
export function saveLogs(newLogs: WorkoutLog[]) {
  const currentLogs = getLogs();
  const updatedLogs = [...currentLogs, ...newLogs];
  localStorage.setItem(LOGS_KEY, JSON.stringify(updatedLogs));
}

export function getWorkouts(): Workout[] {
  const data = localStorage.getItem(WORKOUTS_KEY);
  if (!data) return [];
  return JSON.parse(data);
}

export function saveWorkouts(workouts: Workout[]) {
  localStorage.setItem(WORKOUTS_KEY, JSON.stringify(workouts));
}

export function finishWorkout(workout: Workout) {
  const today = new Date().toISOString().slice(0, 10);

  const newLog: WorkoutLog = {
    id: crypto.randomUUID(),
    workoutId: workout.id,
    workoutName: workout.name,
    date: today,
    exercises: workout.exercises.map(ex => ({
      exerciseId: ex.id,
      name: ex.name,
      completed: true,
    })),
  };

  // Usa a função saveLogs que já criamos acima para adicionar à lista
  saveLogs([newLog]);
}

export function deleteWorkout(workoutId: string): void {
  const workouts = getWorkouts();
  const updatedWorkouts = workouts.filter((w) => w.id !== workoutId);
  saveWorkouts(updatedWorkouts);
}

export function updateWorkout(updatedWorkout: Workout) {
  const workouts = getWorkouts();
  const updatedList = workouts.map(w => w.id === updatedWorkout.id ? updatedWorkout : w);
  saveWorkouts(updatedList);
}