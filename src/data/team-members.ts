export interface TeamMember {
    id: string
    name: string
    email: string
    image: string
    github?: string
    linkedin?: string
  }
  
  export const teamMembers: TeamMember[] = [
    {
      id: '1',
      name: 'Fabián Camilo Quintero Pareja',
      email: 'parejaf@utb.edu.co',
      image: '/images/Fabián.webp',
      github: 'https://github.com/f4-bit',
      linkedin: 'https://www.linkedin.com/in/f4bit/',
    },
    {
      id: '2',
      name: 'Santiago Quintero Pareja',
      email: 'squintero@utb.edu.co',
      image: '/images/Santiago.webp',
      github: 'https://github.com/SantiagoQP31',
      linkedin: 'https://www.linkedin.com/in/santiago-quintero-pareja-939860262/',
    },
    {
      id: '3',
      name: 'Eduardo Alejandro Negrín Pérez',
      email: 'enegrin@utb.edu.co',
      image: '/images/Eduardo.webp',
      github: 'https://github.com/Edalenp',
      linkedin: 'https://www.linkedin.com/in/eduardo-negrin/',
    },
    {
      id: '4',
      name: 'Isabella Sofía Arrieta Guardo',
      email: 'arrietai@utb.edu.co',
      image: '/images/Isabella.webp',
      github: 'https://github.com/IsabellaArrieta',
      linkedin: 'https://www.linkedin.com/in/isabella-sof%C3%ADa-arrieta-guardo-62a083235/',
    },
    {
      id: '5',
      name: 'José Fernando González Ortiz',
      email: 'joseortiz@utb.edu.co',
      image: '/images/Jose.webp',
      github: 'https://github.com/Joverit5',
      linkedin: 'https://linkedin.com/in/josé-fernando-gonzález-ortiz',
    },
    {
      id: '6',
      name: 'David Sierra Porta',
      email: 'dporta@utb.edu.co',
      image: '/images/David.webp',
      github: 'https://github.com/sierraporta',
      linkedin: 'https://www.linkedin.com/in/david-sierra-porta-7a7191169/',
    }
  ]

