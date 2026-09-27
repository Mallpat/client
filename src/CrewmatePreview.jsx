import { useEffect, useRef } from 'react';
import { drawCrewmate } from './amongus';

export function CrewmatePreview({
  colorId = 'red',
  hatId = 'none',
  width = 110,
  height = 130,
  isMoving = true,
  facingLeft = false
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    let animId;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = width * 2;
    canvas.height = height * 2;

    const render = () => {
      const time = Date.now() / 1000;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.scale(2, 2);
      ctx.translate(width / 2, height / 2 + 14);
      const walk = isMoving ? Math.sin(time * 8) * 4 : 0;
      drawCrewmate(ctx, colorId, hatId, walk, time, isMoving, facingLeft, false, false);
      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [colorId, hatId, width, height, isMoving, facingLeft]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        display: 'block'
      }}
    />
  );
}
