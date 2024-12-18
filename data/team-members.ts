export interface TeamMember {
    id: string
    name: string
    role: string
    image: string
    coordinates: { x: number; y: number }
  }
  
  export const teamMembers: TeamMember[] = [
    {
      id: '1',
      name: 'Fabián Camilo Quintero Pareja',
      role: 'parejaf@utb.edu.co',
      image: '/images/Fabián.jpg',
      coordinates: { x: 20, y: 30 }
    },
    {
      id: '2',
      name: 'Santiago Quintero Pareja',
      role: 'squintero@utb.edu.co',
      image: '/images/Santiago.jpg',
      coordinates: { x: 60, y: 20 }
    },
    {
      id: '3',
      name: 'Eduardo Alejandro Negrín Pérez',
      role: 'enegrin@utb.edu.co',
      image: '/images/Eduardo.jpg',
      coordinates: { x: 80, y: 50 }
    },
    {
      id: '4',
      name: 'Isabella Sofía Arrieta Guardo',
      role: 'arrietai@utb.edu.co',
      image: '/images/Isabella.jpg',
      coordinates: { x: 40, y: 70 }
    },
    {
      id: '5',
      name: 'José Fernando González Ortiz',
      role: 'joseortiz@utb.edu.co',
      image: '/images/Jose.jpg',
      coordinates: { x: 10, y: 80 }
    },
    {
      id: '6',
      name: 'David Sierra Porta',
      role: 'dporta@utb.edu.co',
      image: '/images/David.png',
      coordinates: { x: 90, y: 90 }
    }
  ]
  
  