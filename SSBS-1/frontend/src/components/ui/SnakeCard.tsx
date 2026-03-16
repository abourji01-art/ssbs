import { motion, useInView } from 'framer-motion'
import { useRef, useState, useEffect } from 'react'

interface SnakeCardProps {
  index: number
  children: React.ReactNode
  className?: string
  /** For long lists — wraps index with modulo to prevent huge delays */
  maxItems?: number
}

export const SnakeCard = ({ 
  index, 
  children, 
  className,
  maxItems = 8
}: SnakeCardProps) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { 
    once: true,
    amount: 0.2
  })

  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setIsMobile(window.innerWidth < 768)
  }, [])
  
  const wrappedIndex = index % maxItems
  const isFromLeft = wrappedIndex % 2 === 0
  
  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ willChange: 'transform, opacity' }}
      initial={
        isMobile
          ? { opacity: 0 }
          : { opacity: 0, x: isFromLeft ? -60 : 60, y: 10 }
      }
      animate={
        isInView
          ? { opacity: 1, x: 0, y: 0 }
          : {}
      }
      transition={{
        duration: 0.55,
        ease: [0.25, 0.46, 0.45, 0.94],
        delay: (wrappedIndex % 4) * 0.08
      }}
    >
      {children}
    </motion.div>
  )
}
