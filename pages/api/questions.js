import fs from 'fs'
import path from 'path'

export default function handler(req, res) {
  try {
    const jsonDirectory = path.join(process.cwd(), 'exoplanet-questions.json')
    const fileContents = fs.readFileSync(jsonDirectory, 'utf8')
    const questions = JSON.parse(fileContents)
    
    // Seleccionar 10 preguntas aleatorias
    const selectedQuestions = questions.sort(() => 0.5 - Math.random()).slice(0, 10)
    
    res.status(200).json(selectedQuestions)
  } catch (error) {
    res.status(500).json({ error: 'Unable to load questions' })
  }
}