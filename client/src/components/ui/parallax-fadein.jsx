import { motion, useAnimation, useInView } from "framer-motion";
import { useRef, useEffect } from "react";

export default function ParallaxFadeIn({ children, y = 40, duration = 0.6, delay = 0, ...props }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const controls = useAnimation();

  useEffect(() => {
    if (inView) {
      controls.start({ y: 0, opacity: 1, transition: { duration, delay } });
    }
  }, [inView, controls, duration, delay]);

  return (
    <motion.div
      ref={ref}
      initial={{ y, opacity: 0 }}
      animate={controls}
      style={{ willChange: "transform, opacity" }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
