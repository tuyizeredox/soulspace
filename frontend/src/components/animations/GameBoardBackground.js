import React, { useEffect, useRef } from 'react';
import { Box, useTheme } from '@mui/material';

const GameBoardBackground = () => {
  const canvasRef = useRef(null);
  const theme = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let gridPoints = [];
    let hexagons = [];
    let achievements = [];
    let mouseX = 0;
    let mouseY = 0;

    // Handle window resize
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initGrid();
      initHexagons();
      initAchievements();
    };

    // Handle mouse movement
    const handleMouseMove = (event) => {
      mouseX = event.clientX;
      mouseY = event.clientY;
    };

    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('mousemove', handleMouseMove);
    resizeCanvas();

    // Initialize grid points with more subtle parameters
    function initGrid() {
      gridPoints = [];
      const spacing = 100; // Increased spacing for less density
      const xCount = Math.ceil(canvas.width / spacing) + 1;
      const yCount = Math.ceil(canvas.height / spacing) + 1;

      for (let x = 0; x < xCount; x++) {
        for (let y = 0; y < yCount; y++) {
          // Offset every other row
          const offsetX = y % 2 === 0 ? 0 : spacing / 2;

          // Only add points with a certain probability to reduce density
          if (Math.random() > 0.2) {
            gridPoints.push({
              x: x * spacing + offsetX,
              y: y * spacing,
              baseX: x * spacing + offsetX,
              baseY: y * spacing,
              size: Math.random() * 1.2 + 0.4, // Slightly smaller points
              color: getRandomHealthColor(0.8), // More transparent
              pulseSpeed: Math.random() * 0.015 + 0.003, // Slower pulse
              pulseDirection: Math.random() > 0.5 ? 1 : -1,
              glowing: Math.random() > 0.85 // Fewer glowing points
            });
          }
        }
      }
    }

    // Initialize hexagons with more subtle parameters
    function initHexagons() {
      hexagons = [];
      // Reduce the number of hexagons
      const count = Math.floor(canvas.width * canvas.height / 300000);

      for (let i = 0; i < count; i++) {
        hexagons.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 35 + 15, // Slightly smaller hexagons
          rotation: Math.random() * Math.PI,
          rotationSpeed: (Math.random() - 0.5) * 0.007, // Slower rotation
          color: getRandomHealthColor(0.1), // More transparent fill
          borderColor: getRandomHealthColor(0.25), // More transparent border
          speedX: (Math.random() - 0.5) * 0.15, // Slower movement
          speedY: (Math.random() - 0.5) * 0.15  // Slower movement
        });
      }
    }

    // Initialize achievement icons with more subtle parameters
    function initAchievements() {
      achievements = [];
      const icons = ['❤️', '🏃', '💊', '🧠', '🍎', '💧', '😴', '🧘'];
      // Reduce the number of achievement icons
      const count = Math.floor(canvas.width * canvas.height / 400000);

      for (let i = 0; i < count; i++) {
        achievements.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          icon: icons[Math.floor(Math.random() * icons.length)],
          size: Math.random() * 8 + 12, // Smaller icons
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.015, // Slower rotation
          speedX: (Math.random() - 0.5) * 0.3, // Slower movement
          speedY: (Math.random() - 0.5) * 0.3, // Slower movement
          pulseSpeed: Math.random() * 0.02 + 0.008, // Slower pulse
          pulseDirection: 1,
          baseSize: Math.random() * 8 + 12, // Smaller base size
          opacity: Math.random() * 0.3 + 0.15 // More transparent
        });
      }
    }

    // Get random health-related color with more subtle tones
    function getRandomHealthColor(alpha = 1) {
      const colors = [
        `rgba(124, 58, 237, ${alpha * 0.8})`,   // Purple (more subtle)
        `rgba(59, 130, 246, ${alpha * 0.7})`,   // Blue (more subtle)
        `rgba(16, 185, 129, ${alpha * 0.7})`,   // Green (more subtle)
        `rgba(236, 72, 153, ${alpha * 0.6})`,   // Pink (more subtle)
        `rgba(245, 158, 11, ${alpha * 0.6})`,   // Amber (more subtle)
        `rgba(6, 182, 212, ${alpha * 0.7})`,    // Cyan (more subtle)
        `rgba(79, 70, 229, ${alpha * 0.7})`,    // Indigo (more subtle)
        `rgba(139, 92, 246, ${alpha * 0.7})`    // Violet (more subtle)
      ];
      return colors[Math.floor(Math.random() * colors.length)];
    }

    // Draw a hexagon
    function drawHexagon(x, y, size, rotation, color, borderColor) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);

      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;
        const xPos = size * Math.cos(angle);
        const yPos = size * Math.sin(angle);

        if (i === 0) {
          ctx.moveTo(xPos, yPos);
        } else {
          ctx.lineTo(xPos, yPos);
        }
      }
      ctx.closePath();

      // Fill
      ctx.fillStyle = color;
      ctx.fill();

      // Border
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.restore();
    }

    // Draw connections between points with more subtle styling
    function drawConnections() {
      for (let i = 0; i < gridPoints.length; i++) {
        const point = gridPoints[i];

        // Connect to nearby points
        for (let j = i + 1; j < gridPoints.length; j++) {
          const otherPoint = gridPoints[j];
          const dx = point.x - otherPoint.x;
          const dy = point.y - otherPoint.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          // Reduce connection distance for fewer connections
          if (distance < 90) {
            // Calculate opacity based on distance with lower maximum opacity
            const opacity = 1 - (distance / 90);

            // Use a more subtle color with lower opacity
            const colorIndex = (i + j) % 3; // Cycle through 3 subtle colors
            let connectionColor;

            switch(colorIndex) {
              case 0:
                connectionColor = `rgba(165, 243, 252, ${opacity * 0.12})`; // Cyan
                break;
              case 1:
                connectionColor = `rgba(196, 181, 253, ${opacity * 0.12})`; // Lavender
                break;
              case 2:
                connectionColor = `rgba(167, 243, 208, ${opacity * 0.12})`; // Green
                break;
            }

            ctx.beginPath();
            ctx.strokeStyle = connectionColor;
            ctx.lineWidth = 0.4; // Thinner lines
            ctx.moveTo(point.x, point.y);
            ctx.lineTo(otherPoint.x, otherPoint.y);
            ctx.stroke();
          }
        }
      }
    }

    // Draw health path
    function drawHealthPath() {
      const pathPoints = [];
      const pathCount = Math.min(5, Math.floor(canvas.width / 300));

      // Create path points
      for (let i = 0; i < pathCount; i++) {
        pathPoints.push({
          x: (canvas.width / (pathCount - 1)) * i,
          y: canvas.height / 2 + Math.sin(i * 0.5) * 50
        });
      }

      // Draw path
      ctx.beginPath();
      ctx.moveTo(pathPoints[0].x, pathPoints[0].y);

      for (let i = 1; i < pathPoints.length; i++) {
        const xc = (pathPoints[i].x + pathPoints[i - 1].x) / 2;
        const yc = (pathPoints[i].y + pathPoints[i - 1].y) / 2;
        ctx.quadraticCurveTo(pathPoints[i - 1].x, pathPoints[i - 1].y, xc, yc);
      }

      ctx.strokeStyle = 'rgba(124, 58, 237, 0.2)';
      ctx.lineWidth = 10;
      ctx.stroke();

      // Draw path points
      for (let i = 0; i < pathPoints.length; i++) {
        ctx.beginPath();
        ctx.arc(pathPoints[i].x, pathPoints[i].y, 8, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(124, 58, 237, 0.3)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(124, 58, 237, 0.5)';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }

    // Animation loop
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw grid points
      gridPoints.forEach(point => {
        // Pulse size
        point.size += point.pulseDirection * point.pulseSpeed;
        if (point.size > 2.5) point.pulseDirection = -1;
        if (point.size < 0.5) point.pulseDirection = 1;

        // Mouse interaction
        const dx = mouseX - point.x;
        const dy = mouseY - point.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 100) {
          const force = (100 - distance) / 100;
          point.x = point.baseX - dx * force * 0.2;
          point.y = point.baseY - dy * force * 0.2;
        } else {
          // Return to original position
          point.x += (point.baseX - point.x) * 0.1;
          point.y += (point.baseY - point.y) * 0.1;
        }

        // Draw point
        ctx.beginPath();
        ctx.arc(point.x, point.y, point.size, 0, Math.PI * 2);
        ctx.fillStyle = point.color;
        ctx.fill();

        // Add glow effect for some points
        if (point.glowing) {
          ctx.shadowBlur = 10;
          ctx.shadowColor = point.color;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      });

      // Draw connections
      drawConnections();

      // Update and draw hexagons
      hexagons.forEach(hex => {
        // Update position
        hex.x += hex.speedX;
        hex.y += hex.speedY;

        // Boundary check
        if (hex.x < -hex.size) hex.x = canvas.width + hex.size;
        if (hex.x > canvas.width + hex.size) hex.x = -hex.size;
        if (hex.y < -hex.size) hex.y = canvas.height + hex.size;
        if (hex.y > canvas.height + hex.size) hex.y = -hex.size;

        // Update rotation
        hex.rotation += hex.rotationSpeed;

        // Draw hexagon
        drawHexagon(hex.x, hex.y, hex.size, hex.rotation, hex.color, hex.borderColor);
      });

      // Update and draw achievements
      achievements.forEach(achievement => {
        // Update position
        achievement.x += achievement.speedX;
        achievement.y += achievement.speedY;

        // Boundary check with bounce
        if (achievement.x < achievement.size) {
          achievement.x = achievement.size;
          achievement.speedX *= -1;
        }
        if (achievement.x > canvas.width - achievement.size) {
          achievement.x = canvas.width - achievement.size;
          achievement.speedX *= -1;
        }
        if (achievement.y < achievement.size) {
          achievement.y = achievement.size;
          achievement.speedY *= -1;
        }
        if (achievement.y > canvas.height - achievement.size) {
          achievement.y = canvas.height - achievement.size;
          achievement.speedY *= -1;
        }

        // Pulse size
        achievement.size += achievement.pulseDirection * achievement.pulseSpeed;
        if (achievement.size > achievement.baseSize * 1.3) achievement.pulseDirection = -1;
        if (achievement.size < achievement.baseSize * 0.7) achievement.pulseDirection = 1;

        // Update rotation
        achievement.rotation += achievement.rotationSpeed;

        // Draw achievement
        ctx.save();
        ctx.translate(achievement.x, achievement.y);
        ctx.rotate(achievement.rotation);
        ctx.font = `${achievement.size}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(achievement.icon, 0, 0);
        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(animate);
    }

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
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
        opacity: 0.5,
        zIndex: 0,
        filter: 'blur(0.8px)',
        mixBlendMode: 'soft-light',
      }}
    />
  );
};

export default GameBoardBackground;
