export interface Workout {
  id: string
  title: string
  instructor: string
  image?: string
  duration: string
  difficulty: number
}

export async function fetchWorkouts(): Promise<Workout[]> {
  const res = await fetch('https://aether-fit.vercel.app/api/workouts')
  if (!res.ok) {
    throw new Error(`Error fetching workouts: ${res.statusText}`)
  }
  const data = await res.json()
  if (!Array.isArray(data)) {
    throw new Error('Invalid data format received')
  }
  return data as Workout[]
}