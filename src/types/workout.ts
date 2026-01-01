export interface Exercise {
  id: string
  name: string
  substitute: string
  series: number
  reps: number
  weight: number; // Novo campo
  rest: number;   // Novo campo (em segundos)
}

export interface Workout {
  id: string
  name: string
  exercises: Exercise[]
}

export interface WorkoutLogExercise {
  exerciseId: string
  name: string
  completed: boolean
}

export interface WorkoutLog {
  id: string
  workoutId: string
  date: string
  workoutName: string;
  exercises: WorkoutLogExercise[]
}

