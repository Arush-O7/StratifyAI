import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverGlow?: boolean;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className = '', hoverGlow = true, onClick }) => {
  const baseStyle = "bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-2xl p-6 transition-all duration-300";
  const glowStyle = hoverGlow ? "hover:border-indigo-500/40 hover:shadow-[0_0_25px_rgba(99,102,241,0.15)]" : "";
  const cursorStyle = onClick ? "cursor-pointer hover:scale-[1.01]" : "";

  if (onClick) {
    return (
      <motion.div
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={onClick}
        className={`${baseStyle} ${glowStyle} ${cursorStyle} ${className}`}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={`${baseStyle} ${glowStyle} ${className}`}>
      {children}
    </div>
  );
};

export default Card;
