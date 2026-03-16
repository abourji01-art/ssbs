import { useInView } from 'framer-motion'
import { useRef } from 'react'

export const useSnakeAnimation = (index: number) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { 
    once: true, 
    amount: 0.3 
  })
  
  // Even index → slide from LEFT
  // Odd index  → slide from RIGHT
  const isFromLeft = index % 2 === 0
  
  const variants = {
    hidden: {
      opacity: 0,
      x: isFromLeft ? -80 : 80,
      y: 20,
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration: 0.6,
        delay: 0.1,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  }
  
  return { ref, variants, isInView }
}
