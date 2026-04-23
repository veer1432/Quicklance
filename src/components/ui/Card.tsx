import { cn } from "@/src/lib/utils";
import { motion, HTMLMotionProps } from "motion/react";

export interface CardProps extends HTMLMotionProps<"div"> {
  hover?: boolean;
}

export function Card({ className, hover = true, ...props }: CardProps) {
  return (
    <motion.div
      whileHover={hover ? { 
        y: -8, 
        scale: 1.01,
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)"
      } : {}}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={cn(
        "rounded-[2.5rem] bg-white dark:bg-[#111827] p-8 shadow-sm ring-1 ring-gray-100 dark:ring-gray-800 transition-all",
        hover && "hover:ring-blue-100 dark:hover:ring-blue-900/50 hover:shadow-xl",
        className
      )}
      {...props}
    />
  );
}
