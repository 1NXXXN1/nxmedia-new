'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

export default function Logo() {

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const letterVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 10,
      },
    },
  };

  const playVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: {
      scale: 1,
      rotate: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 10,
      },
    },
  };

  return (
    <motion.div
      className="flex items-center gap-2"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
        {/* Favicon Image */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={playVariants}
          className="relative w-8 h-8 flex-shrink-0 cursor-pointer"
        >
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="w-full h-full"
          >
            <Image
              src="/favicon-white.png"
              alt="NXMEDIA"
              width={32}
              height={32}
              className="w-8 h-8 object-contain"
              priority
            />
          </motion.div>
        </motion.div>

      {/* Text - MEDIA */}
      <motion.div className="flex items-center gap-0">
        <motion.span
          variants={letterVariants}
          className="text-lg font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
        >
          MEDIA
        </motion.span>
      </motion.div>
    </motion.div>
  );
}
