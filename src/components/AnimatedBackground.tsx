/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';

export default function AnimatedBackground() {
  return (
    <div id="cyber-bg" className="fixed inset-0 -z-50 overflow-hidden bg-cyber-dark">
      {/* 1. Cybernetic Grid */}
      <div className="absolute inset-0 cyber-grid opacity-60 pointer-events-none"></div>

      {/* 2. Radial Ambient Blobs */}
      <motion.div
        animate={{
          x: [0, 80, -40, 0],
          y: [0, -60, 40, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-[10%] left-[20%] w-[450px] h-[450px] rounded-full bg-cyan-500/8 blur-[130px] pointer-events-none"
      />

      <motion.div
        animate={{
          x: [0, -100, 50, 0],
          y: [0, 80, -50, 0],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute bottom-[15%] right-[15%] w-[550px] h-[550px] rounded-full bg-blue-500/8 blur-[150px] pointer-events-none"
      />

      <motion.div
        animate={{
          scale: [1, 1.2, 0.9, 1],
          opacity: [0.3, 0.5, 0.3, 0.3],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-violet-500/5 blur-[120px] pointer-events-none"
      />

      {/* 3. Horizontal Cyber lines */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent"></div>
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"></div>
    </div>
  );
}
