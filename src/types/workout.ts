export interface Exercise {
  id: string
  name: string
  substitute: string
  series: number
  reps: string; // Agora é string para permitir "8-12"
  weight: number; // Novo campo
  rest: number;   // Novo campo (em segundos)
  imageUrl?: string; 
  muscleUrl?: string;
  specs?: string;
  anotacao: string;

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

