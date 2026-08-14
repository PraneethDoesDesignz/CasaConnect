// `motion` is the declared dependency; `framer-motion` was only resolving
// transitively, which would break the build the moment the tree flattens.
import { motion, useReducedMotion } from 'motion/react';

/** Scroll-entry reveal. Communicates reading order as sections arrive;
 *  collapses to a plain div when the visitor asks for reduced motion. */
export default function ParallaxFadeIn({
  children,
  y = 24,
  duration = 0.6,
  delay = 0,
  className,
  ...props
}) {
  const reduce = useReducedMotion();

  if (reduce) {
    return (
      <div className={className} {...props}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      className={className}
      initial={{ y, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration, delay, ease: [0.16, 1, 0.3, 1] }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
