import React, { useEffect, useRef, useState } from 'react';
import { Box, useTheme } from '@mui/material';

const ParticleBackground = () => {
  const canvasRef = useRef(null);
  const theme = useTheme();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];
    let hoverParticles = [];
    let connectParticles = true;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Handle mouse movement
    const handleMouseMove = (event) => {
      setMousePosition({
        x: event.clientX,
        y: event.clientY
      });
      setIsHovering(true);

      // Create hover particles
      if (hoverParticles.length < 5) {
        for (let i = 0; i < 3; i++) {
          const size = Math.random() * 4 + 2;
          const color = getRandomColor();
          hoverParticles.push(new HoverParticle(event.clientX, event.clientY, size, color));
        }
      }
    };

    const handleMouseLeave = () => {
      setIsHovering(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    // Get random color from theme palette
    const getRandomColor = () => {
      const colors = [
        theme.palette.primary.main,
        theme.palette.primary.light,
        theme.palette.secondary.main,
        theme.palette.secondary.light,
        '#4f46e5',
        '#06b6d4',
        '#a5f3fc',
        '#7c3aed'
      ];
      return colors[Math.floor(Math.random() * colors.length)];
    };

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 5 + 1;
        this.baseSize = this.size;
        this.speedX = Math.random() * 1 - 0.5;
        this.speedY = Math.random() * 1 - 0.5;
        this.color = getRandomColor();
        this.opacity = Math.random() * 0.5 + 0.2;
        this.pulseSpeed = Math.random() * 0.02 + 0.01;
        this.pulseDirection = 1;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        // Pulse size effect
        if (this.size > this.baseSize * 1.5) this.pulseDirection = -1;
        if (this.size < this.baseSize * 0.8) this.pulseDirection = 1;
        this.size += this.pulseDirection * this.pulseSpeed;

        // Boundary check with bounce
        if (this.x > canvas.width) {
          this.x = canvas.width;
          this.speedX *= -1;
        } else if (this.x < 0) {
          this.x = 0;
          this.speedX *= -1;
        }

        if (this.y > canvas.height) {
          this.y = canvas.height;
          this.speedY *= -1;
        } else if (this.y < 0) {
          this.y = 0;
          this.speedY *= -1;
        }

        // Mouse interaction - particles are attracted to mouse position
        if (isHovering) {
          const dx = mousePosition.x - this.x;
          const dy = mousePosition.y - this.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 150) {
            const forceDirectionX = dx / distance;
            const forceDirectionY = dy / distance;
            const force = (150 - distance) / 150;

            this.speedX += forceDirectionX * force * 0.2;
            this.speedY += forceDirectionY * force * 0.2;

            // Limit speed
            const maxSpeed = 3;
            const currentSpeed = Math.sqrt(this.speedX * this.speedX + this.speedY * this.speedY);
            if (currentSpeed > maxSpeed) {
              this.speedX = (this.speedX / currentSpeed) * maxSpeed;
              this.speedY = (this.speedY / currentSpeed) * maxSpeed;
            }
          }
        }

        // Add some randomness to movement
        if (Math.random() < 0.01) {
          this.speedX += (Math.random() - 0.5) * 0.2;
          this.speedY += (Math.random() - 0.5) * 0.2;
        }
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color + Math.floor(this.opacity * 255).toString(16).padStart(2, '0');
        ctx.fill();

        // Add glow effect
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.color;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    class HoverParticle {
      constructor(x, y, size, color) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.color = color;
        this.opacity = 1;
        this.speedX = (Math.random() - 0.5) * 3;
        this.speedY = (Math.random() - 0.5) * 3;
        this.lifespan = 50;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.lifespan--;
        this.opacity = this.lifespan / 50;
        this.size *= 0.98;
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color + Math.floor(this.opacity * 255).toString(16).padStart(2, '0');
        ctx.fill();

        // Add glow effect
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    const init = () => {
      particles = [];
      for (let i = 0; i < 150; i++) {
        particles.push(new Particle());
      }
    };

    const connectNearbyParticles = () => {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 100) {
            // Calculate opacity based on distance
            const opacity = 1 - (distance / 100);

            ctx.beginPath();
            ctx.strokeStyle = `rgba(165, 243, 252, ${opacity * 0.2})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      particles.forEach((particle) => {
        particle.update();
        particle.draw();
      });

      // Connect particles with lines
      if (connectParticles) {
        connectNearbyParticles();
      }

      // Update and draw hover particles
      hoverParticles = hoverParticles.filter(particle => particle.lifespan > 0);
      hoverParticles.forEach(particle => {
        particle.update();
        particle.draw();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    init();
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, [mousePosition, isHovering, theme]);

  return (
    <Box
      component="canvas"
      ref={canvasRef}
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        opacity: 0.7,
        zIndex: 0,
      }}
    />
  );
};

export default ParticleBackground;
