import React, { useEffect, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { Box } from '@mui/material';

const FloatingMedical = () => {
  const controls = useAnimation();
  const containerRef = useRef(null);

  useEffect(() => {
    const floatingAnimation = async () => {
      await controls.start({
        y: [-10, 10],
        transition: {
          duration: 2,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut"
        }
      });
    };

    floatingAnimation();
  }, [controls]);

  return (
    <motion.div
      ref={containerRef}
      animate={controls}
      style={{
        position: 'relative',
        perspective: '1000px'
      }}
    >
      <Box
        component="img"
        src="/Tuyizere_Dieudonne_Create_an_attractive_animated_image_of_a_friendly_fc6b0968-3131-4bb2-b5c4-5bb15b0b4f3c.png"
        alt="3D Medical Icon"
        sx={{
          width: '100%',
          maxWidth: '400px',
          height: 'auto',
          filter: 'drop-shadow(0px 10px 20px rgba(0,0,0,0.2))',
          transform: 'rotateY(-10deg) rotateX(10deg)',
          transition: 'transform 0.5s ease',
          '&:hover': {
            transform: 'rotateY(-5deg) rotateX(5deg) scale(1.05)',
          }
        }}
      />
    </motion.div>
  );
};

export default FloatingMedical;
