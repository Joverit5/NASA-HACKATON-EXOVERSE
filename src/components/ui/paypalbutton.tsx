import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import paypal from '@/src/assets/paypal.svg';

export default function PayPalButton() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className="fixed right-8 bottom-8 z-30 cursor-pointer"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >

      <motion.div
        className={`relative w-20 h-20 flex items-center justify-center rounded-full shadow-lg 
          bg-gradient-to-r from-blue-500 to-indigo-500`}
        whileHover={{ rotate: 15 }}
        animate={{
          boxShadow: isHovered
            ? '0px 4px 20px rgba(0, 0, 0, 0.2)'
            : '0px 2px 10px rgba(0, 0, 0, 0.1)',
        }}
        transition={{ duration: 0.3 }}
      >

        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: isHovered ? 0 : 1 }}
          transition={{ duration: 0.3 }}
        >
          <Image src={paypal} alt="PayPal" width={40} height={40} />
        </motion.div>

        <motion.div
          className="absolute inset-0 flex items-center justify-center text-white font-extrabold"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        >
          Support
        </motion.div>
      </motion.div>


      <motion.div
        className="absolute inset-0 w-full h-full rounded-full bg-blue-500 opacity-40"
        animate={{
          scale: [1, 1.4],
          opacity: [0.4, 0],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </motion.div>
  );
}
