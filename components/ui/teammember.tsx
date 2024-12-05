import { motion } from 'framer-motion';
import Image from 'next/image';

interface TeamMemberProps {
  name: string;
  email: string;
  image: string;
}

export default function TeamMember({ name, email, image }: TeamMemberProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-gray-800/50 backdrop-blur rounded-lg p-6 shadow-lg transition-transform duration-300 hover:scale-105"
    >
      <Image src={image} alt={name} width={200} height={200} className="rounded-full mx-auto mb-4" />
      <h3 className="text-xl font-semibold mb-2 text-center">{name}</h3>
      <p className="text-center text-gray-400">{email}</p>
    </motion.div>
  );
}

