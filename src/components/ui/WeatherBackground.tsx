'use client';

import React, { useEffect, useRef } from 'react';

interface WeatherBackgroundProps {
  condition: string;
  intensity: number; // 0 to 1
}

export default function WeatherBackground({ condition, intensity }: WeatherBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resize);
    resize();

    class Particle {
      x: number;
      y: number;
      size: number;
      speedY: number;
      speedX: number;
      opacity: number;

      constructor() {
        const c = canvas!;
        this.x = Math.random() * c.width;
        this.y = Math.random() * c.height;
        this.size = condition === 'snow' ? Math.random() * 3 + 1 : Math.random() * 1 + 0.5;
        this.speedY = condition === 'snow' ? Math.random() * 1 + 0.5 : Math.random() * 15 + 10;
        this.speedX = (Math.random() - 0.5) * 2;
        this.opacity = Math.random() * 0.5 + 0.1;
      }

      update() {
        const c = canvas!;
        this.y += this.speedY * intensity;
        this.x += this.speedX;

        if (this.y > c.height) {
          this.y = -10;
          this.x = Math.random() * c.width;
        }
      }

      draw() {
        if (!ctx) return;
        ctx.beginPath();
        if (condition === 'snow') {
          ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        } else {
          ctx.moveTo(this.x, this.y);
          ctx.lineTo(this.x + this.speedX, this.y + this.size * 10);
          ctx.strokeStyle = `rgba(0, 212, 255, ${this.opacity})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
        ctx.fill();
      }
    }

    let particles: Particle[] = [];

    const init = () => {
      particles = [];
      const count = condition === 'none' ? 0 : 100 * intensity;
      for (let i = 0; i < count; i++) {
        particles.push(new Particle());
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      animationFrameId = requestAnimationFrame(animate);
    };

    init();
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [condition, intensity]);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 pointer-events-none z-0 opacity-40"
      style={{ filter: 'blur(1px)' }}
    />
  );
}
