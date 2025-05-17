import React, { useEffect, useRef } from 'react';
import { Box, useTheme } from '@mui/material';

const HealthPathBackground = () => {
  const canvasRef = useRef(null);
  const theme = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let pathPoints = [];
    let milestones = [];
    let particles = [];
    let time = 0;

    // Handle window resize
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initPath();
      initMilestones();
      initParticles();
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Initialize path
    function initPath() {
      pathPoints = [];
      const segments = 12;
      const amplitude = canvas.height * 0.1;
      const frequency = 2;

      for (let i = 0; i <= segments; i++) {
        const x = (canvas.width * 0.8 / segments) * i + canvas.width * 0.1;
        const y = canvas.height * 0.5 + Math.sin(i * frequency * Math.PI / segments) * amplitude;

        pathPoints.push({ x, y });
      }
    }

    // Initialize milestones
    function initMilestones() {
      milestones = [];
      const milestoneCount = 5;

      for (let i = 0; i < milestoneCount; i++) {
        const pathIndex = Math.floor((pathPoints.length - 1) * (i / (milestoneCount - 1)));
        const point = pathPoints[pathIndex];

        milestones.push({
          x: point.x,
          y: point.y,
          size: 20,
          baseSize: 20,
          pulseSpeed: 0.2,
          pulseDirection: 1,
          color: getMilestoneColor(i),
          completed: i < 2, // First two are completed
          progress: i < 2 ? 100 : i === 2 ? 60 : 0,
          icon: getMilestoneIcon(i)
        });
      }
    }

    // Initialize particles with more subtle parameters
    function initParticles() {
      particles = [];
      // Reduce the number of particles
      const particleCount = Math.floor(canvas.width * canvas.height / 30000);

      for (let i = 0; i < particleCount; i++) {
        // Create particles with varying opacity based on position
        // Particles near the edges are more transparent
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;

        // Calculate distance from center as a percentage (0-1)
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY);
        const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
        const distanceRatio = distance / maxDistance;

        // Particles further from center are more transparent
        const alphaAdjustment = 1 - (distanceRatio * 0.7);

        particles.push({
          x: x,
          y: y,
          size: Math.random() * 2.5 + 0.8, // Slightly smaller particles
          speedX: (Math.random() - 0.5) * 0.3, // Slower movement
          speedY: (Math.random() - 0.5) * 0.3, // Slower movement
          color: getRandomHealthColor(Math.random() * 0.4 + 0.15 * alphaAdjustment) // More transparent
        });
      }
    }

    // Get milestone color
    function getMilestoneColor(index) {
      const colors = [
        '#7c3aed', // Purple
        '#3b82f6', // Blue
        '#10b981', // Green
        '#f59e0b', // Amber
        '#ef4444'  // Red
      ];
      return colors[index % colors.length];
    }

    // Get milestone icon
    function getMilestoneIcon(index) {
      const icons = ['🏆', '🏅', '🎯', '🚀', '⭐'];
      return icons[index % icons.length];
    }

    // Get random health color
    function getRandomHealthColor(alpha = 1) {
      const colors = [
        `rgba(124, 58, 237, ${alpha})`,   // Purple
        `rgba(59, 130, 246, ${alpha})`,   // Blue
        `rgba(16, 185, 129, ${alpha})`,   // Green
        `rgba(236, 72, 153, ${alpha})`,   // Pink
        `rgba(245, 158, 11, ${alpha})`,   // Amber
        `rgba(6, 182, 212, ${alpha})`,    // Cyan
        `rgba(79, 70, 229, ${alpha})`     // Indigo
      ];
      return colors[Math.floor(Math.random() * colors.length)];
    }

    // Draw the path with more subtle styling
    function drawPath() {
      // Draw main path
      ctx.beginPath();
      ctx.moveTo(pathPoints[0].x, pathPoints[0].y);

      for (let i = 1; i < pathPoints.length; i++) {
        const xc = (pathPoints[i].x + pathPoints[i - 1].x) / 2;
        const yc = (pathPoints[i].y + pathPoints[i - 1].y) / 2;
        ctx.quadraticCurveTo(pathPoints[i - 1].x, pathPoints[i - 1].y, xc, yc);
      }

      // Path styling - thinner line for subtlety
      ctx.lineWidth = 12;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Create gradient with more subtle colors
      const gradient = ctx.createLinearGradient(
        pathPoints[0].x, pathPoints[0].y,
        pathPoints[pathPoints.length - 1].x, pathPoints[pathPoints.length - 1].y
      );
      gradient.addColorStop(0, 'rgba(124, 58, 237, 0.15)');  // More transparent purple
      gradient.addColorStop(0.3, 'rgba(79, 70, 229, 0.15)');  // More transparent indigo
      gradient.addColorStop(0.5, 'rgba(59, 130, 246, 0.15)'); // More transparent blue
      gradient.addColorStop(0.7, 'rgba(6, 182, 212, 0.15)');  // More transparent cyan
      gradient.addColorStop(1, 'rgba(16, 185, 129, 0.15)');   // More transparent green

      ctx.strokeStyle = gradient;
      ctx.stroke();

      // Draw path border with more subtle styling
      ctx.beginPath();
      ctx.moveTo(pathPoints[0].x, pathPoints[0].y);

      for (let i = 1; i < pathPoints.length; i++) {
        const xc = (pathPoints[i].x + pathPoints[i - 1].x) / 2;
        const yc = (pathPoints[i].y + pathPoints[i - 1].y) / 2;
        ctx.quadraticCurveTo(pathPoints[i - 1].x, pathPoints[i - 1].y, xc, yc);
      }

      ctx.lineWidth = 1.5; // Thinner border
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)'; // More transparent border
      ctx.stroke();

      // Draw progress on path with more subtle styling
      const progressPoint = Math.floor(pathPoints.length * 0.4); // 40% progress

      ctx.beginPath();
      ctx.moveTo(pathPoints[0].x, pathPoints[0].y);

      for (let i = 1; i <= progressPoint; i++) {
        const xc = (pathPoints[i].x + pathPoints[i - 1].x) / 2;
        const yc = (pathPoints[i].y + pathPoints[i - 1].y) / 2;
        ctx.quadraticCurveTo(pathPoints[i - 1].x, pathPoints[i - 1].y, xc, yc);
      }

      // Progress styling - thinner line for subtlety
      ctx.lineWidth = 6;

      // Create progress gradient with more subtle colors
      const progressGradient = ctx.createLinearGradient(
        pathPoints[0].x, pathPoints[0].y,
        pathPoints[progressPoint].x, pathPoints[progressPoint].y
      );
      progressGradient.addColorStop(0, 'rgba(124, 58, 237, 0.65)');  // More transparent purple
      progressGradient.addColorStop(0.3, 'rgba(79, 70, 229, 0.65)');  // More transparent indigo
      progressGradient.addColorStop(0.6, 'rgba(59, 130, 246, 0.65)'); // More transparent blue
      progressGradient.addColorStop(1, 'rgba(6, 182, 212, 0.65)');    // More transparent cyan

      ctx.strokeStyle = progressGradient;
      ctx.stroke();

      // Add more subtle glow effect to the progress path
      ctx.shadowBlur = 6;
      ctx.shadowColor = 'rgba(124, 58, 237, 0.35)';
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Draw animated dots on the progress path with more subtle styling
      const dotCount = 4; // Reduced number of dots
      const dotColors = [
        'rgba(124, 58, 237, 0.7)',  // Purple (more transparent)
        'rgba(79, 70, 229, 0.7)',   // Indigo (more transparent)
        'rgba(59, 130, 246, 0.7)',  // Blue (more transparent)
        'rgba(6, 182, 212, 0.7)',   // Cyan (more transparent)
        'rgba(16, 185, 129, 0.7)',  // Green (more transparent)
      ];

      for (let i = 0; i < dotCount; i++) {
        // Slower animation
        const t = (time * 0.3 + i / dotCount) % 1;
        const pointIndex = Math.floor(t * progressPoint);

        if (pointIndex < pathPoints.length - 1) {
          const point = pathPoints[pointIndex];
          const dotColor = dotColors[i % dotColors.length];
          // Smaller pulse size
          const pulseSize = 3 + Math.sin(time * 2 + i) * 1.2;

          // Draw outer glow (more subtle)
          ctx.beginPath();
          ctx.arc(point.x, point.y, pulseSize + 2, 0, Math.PI * 2);
          ctx.fillStyle = dotColor.replace('0.7', '0.2');
          ctx.fill();

          // Draw main dot
          ctx.beginPath();
          ctx.arc(point.x, point.y, pulseSize, 0, Math.PI * 2);
          ctx.fillStyle = dotColor;
          ctx.fill();

          // Add glow (more subtle)
          ctx.shadowBlur = 8;
          ctx.shadowColor = dotColor.replace('0.7', '0.5');
          ctx.fill();
          ctx.shadowBlur = 0;

          // Add white center (more subtle)
          ctx.beginPath();
          ctx.arc(point.x, point.y, pulseSize * 0.35, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
          ctx.fill();
        }
      }
    }

    // Draw milestones
    function drawMilestones() {
      milestones.forEach((milestone, index) => {
        // Pulse size
        milestone.size += milestone.pulseDirection * milestone.pulseSpeed;
        if (milestone.size > milestone.baseSize * 1.3) milestone.pulseDirection = -1;
        if (milestone.size < milestone.baseSize * 0.8) milestone.pulseDirection = 1;

        // Draw milestone circle
        ctx.beginPath();
        ctx.arc(milestone.x, milestone.y, milestone.size, 0, Math.PI * 2);

        // Different styling based on completion
        if (milestone.completed) {
          // Completed milestone
          ctx.fillStyle = milestone.color;

          // Add glow
          ctx.shadowBlur = 15;
          ctx.shadowColor = milestone.color;
          ctx.fill();
          ctx.shadowBlur = 0;

          // Add white border
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.lineWidth = 3;
          ctx.stroke();
        } else {
          // Incomplete milestone
          ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
          ctx.fill();

          // Add colored border
          ctx.strokeStyle = milestone.color;
          ctx.lineWidth = 2;
          ctx.stroke();

          // Draw progress arc if there's progress
          if (milestone.progress > 0) {
            ctx.beginPath();
            ctx.arc(
              milestone.x, milestone.y, milestone.size - 5,
              -Math.PI / 2, -Math.PI / 2 + (milestone.progress / 100) * Math.PI * 2,
              false
            );
            ctx.strokeStyle = milestone.color;
            ctx.lineWidth = 3;
            ctx.stroke();
          }
        }

        // Draw milestone icon
        ctx.font = `${milestone.size}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(milestone.icon, milestone.x, milestone.y);

        // Draw milestone number
        const numberSize = milestone.size * 0.6;
        const numberX = milestone.x + milestone.size * 1.5;
        const numberY = milestone.y - milestone.size * 1.5;

        ctx.beginPath();
        ctx.arc(numberX, numberY, numberSize, 0, Math.PI * 2);
        ctx.fillStyle = milestone.completed ? milestone.color : 'rgba(255, 255, 255, 0.1)';

        // Add glow if completed
        if (milestone.completed) {
          ctx.shadowBlur = 10;
          ctx.shadowColor = milestone.color;
        }

        ctx.fill();
        ctx.shadowBlur = 0;

        // Add border
        ctx.strokeStyle = milestone.completed ? 'rgba(255, 255, 255, 0.8)' : milestone.color;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Draw number
        ctx.font = `bold ${numberSize}px Arial`;
        ctx.fillStyle = milestone.completed ? 'white' : milestone.color;
        ctx.fillText((index + 1).toString(), numberX, numberY);
      });
    }

    // Draw particles
    function drawParticles() {
      particles.forEach(particle => {
        // Update position
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        // Boundary check with wrap-around
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.fill();
      });
    }

    // Animation loop
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      time += 0.01;

      drawParticles();
      drawPath();
      drawMilestones();

      animationFrameId = requestAnimationFrame(animate);
    }

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme]);

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
        opacity: 0.45,
        zIndex: 0,
        filter: 'blur(0.7px)',
        mixBlendMode: 'lighten',
      }}
    />
  );
};

export default HealthPathBackground;
