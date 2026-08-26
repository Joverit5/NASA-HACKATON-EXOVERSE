import { motion } from "framer-motion"

interface FeatureCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

export function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="bg-gradient-to-br from-gray-900 to-gray-800  backdrop-blur-md  rounded-lg p-6 shadow-lg border border-gray-700"
    >
      <div className="flex items-center mb-4">
        <div className="mr-4 p-2 bg-blue-500 bg-opacity-20 rounded-full">
          <Icon className="w-6 h-6 text-blue-400" />
        </div>
        <h3 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
          {title}
        </h3>
      </div>
      <p className="text-gray-400">{description}</p>
    </motion.div>
  )
}

