export default function handler(req, res) {
    if (req.method === 'POST') {
      // Aquí normalmente actualizarías una base de datos real
      // Por ahora, solo simularemos una actualización exitosa
      console.log('Achievement unlocked:', req.body.achievement)
      res.status(200).json({ message: 'Achievement updated successfully' })
    } else {
      res.setHeader('Allow', ['POST'])
      res.status(405).end(`Method ${req.method} Not Allowed`)
    }
  }