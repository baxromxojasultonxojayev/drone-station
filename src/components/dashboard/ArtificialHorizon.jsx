import { useEffect, useRef } from 'react';
import useDroneStore from '../../store/useDroneStore';

export default function ArtificialHorizon() {
  const canvasRef = useRef(null);
  
  // Use store selectors ONLY for rare-changing state that needs to trigger re-renders
  // For this component, everything is drawn in the high-performance loop via getState().

  // Smooth values maintained across frames
  const smoothRef = useRef({ pitch: 0, roll: 0, yaw: 0, heading: 0 });

  const lerp = (a, b, t) => a + (b - a) * t;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      const size = Math.min(parent.clientWidth, parent.clientHeight);
      canvas.width = size;
      canvas.height = size;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let frameId;
    const render = () => {
      if (document.hidden) {
        frameId = requestAnimationFrame(render);
        return;
      }
      
      // Get FRESH state directly from store without triggering React re-render
      const state = useDroneStore.getState();
      const { attitude, position, flightMode: fm, armed: am } = state;
      
      const ctx = canvas.getContext('2d');
      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;

      // Smooth interpolation
      const s = smoothRef.current;
      s.pitch = lerp(s.pitch, attitude.pitch, 0.15);
      s.roll = lerp(s.roll, attitude.roll, 0.15);
      s.heading = lerp(s.heading, attitude.heading, 0.15);

      ctx.clearRect(0, 0, w, h);
      ctx.save();

      // Clip to circle
      ctx.beginPath();
      ctx.arc(cx, cy, Math.min(cx, cy) - 2, 0, Math.PI * 2);
      ctx.clip();

      // Translate and rotate for attitude
      ctx.translate(cx, cy);
      ctx.rotate((-s.roll * Math.PI) / 180);

      const pitchOffset = s.pitch * 3;

      // Sky
      ctx.fillStyle = '#1a4a7a';
      ctx.fillRect(-w, -h + pitchOffset, w * 2, h);

      // Ground
      ctx.fillStyle = '#5c3d1f';
      ctx.fillRect(-w, pitchOffset, w * 2, h);

      // Horizon line
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-w, pitchOffset);
      ctx.lineTo(w, pitchOffset);
      ctx.stroke();

      // Pitch ladder
      ctx.strokeStyle = 'rgba(255,255,255,0.6)';
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.font = '11px Inter, monospace';
      ctx.textAlign = 'center';
      ctx.lineWidth = 1;

      for (let deg = -40; deg <= 40; deg += 10) {
        if (deg === 0) continue;
        const y = pitchOffset - deg * 3;
        const halfLen = deg % 20 === 0 ? 40 : 20;

        ctx.beginPath();
        if (deg > 0) {
          ctx.setLineDash([]);
        } else {
          ctx.setLineDash([4, 4]);
        }
        ctx.moveTo(-halfLen, y);
        ctx.lineTo(halfLen, y);
        ctx.stroke();
        ctx.setLineDash([]);

        if (deg % 20 === 0) {
          ctx.fillText(`${Math.abs(deg)}`, halfLen + 18, y + 4);
          ctx.fillText(`${Math.abs(deg)}`, -halfLen - 18, y + 4);
        }
      }

      ctx.restore();

      // Fixed aircraft symbol (center crosshair)
      ctx.strokeStyle = '#22d3ee';
      ctx.lineWidth = 2.5;

      // Left wing
      ctx.beginPath();
      ctx.moveTo(cx - 60, cy);
      ctx.lineTo(cx - 20, cy);
      ctx.lineTo(cx - 20, cy + 10);
      ctx.stroke();

      // Right wing
      ctx.beginPath();
      ctx.moveTo(cx + 60, cy);
      ctx.lineTo(cx + 20, cy);
      ctx.lineTo(cx + 20, cy + 10);
      ctx.stroke();

      // Center dot
      ctx.fillStyle = '#22d3ee';
      ctx.beginPath();
      ctx.arc(cx, cy, 3, 0, Math.PI * 2);
      ctx.fill();

      // Roll indicator arc at top
      ctx.save();
      ctx.translate(cx, cy);
      const arcR = Math.min(cx, cy) - 15;

      ctx.strokeStyle = 'rgba(255,255,255,0.4)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, arcR, -Math.PI + 0.3, -0.3);
      ctx.stroke();

      // Roll triangle
      const rollRad = (-s.roll * Math.PI) / 180;
      ctx.save();
      ctx.rotate(rollRad);
      ctx.fillStyle = '#22d3ee';
      ctx.beginPath();
      ctx.moveTo(0, -arcR);
      ctx.lineTo(-6, -arcR + 12);
      ctx.lineTo(6, -arcR + 12);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Roll tick marks
      const rollTicks = [-60, -45, -30, -20, -10, 0, 10, 20, 30, 45, 60];
      ctx.strokeStyle = 'rgba(255,255,255,0.5)';
      ctx.lineWidth = 1;
      rollTicks.forEach((deg) => {
        const rad = ((deg - 90) * Math.PI) / 180;
        const len = deg % 30 === 0 ? 12 : 7;
        ctx.beginPath();
        ctx.moveTo(Math.cos(rad) * arcR, Math.sin(rad) * arcR);
        ctx.lineTo(Math.cos(rad) * (arcR - len), Math.sin(rad) * (arcR - len));
        ctx.stroke();
      });

      ctx.restore();

      // Heading tape at bottom
      ctx.save();
      const tapeY = h - 30;
      const tapeH = 24;

      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(cx - 100, tapeY - tapeH / 2, 200, tapeH);

      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.strokeRect(cx - 100, tapeY - tapeH / 2, 200, tapeH);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px Inter, monospace';
      ctx.textAlign = 'center';

      const headingLabels = { 0: 'N', 45: 'NE', 90: 'E', 135: 'SE', 180: 'S', 225: 'SW', 270: 'W', 315: 'NW' };

      for (let i = -5; i <= 5; i++) {
        let deg = Math.round(s.heading / 10) * 10 + i * 10;
        deg = ((deg % 360) + 360) % 360;
        const x = cx + (i * 10 - (s.heading % 10)) * 2;
        if (x < cx - 95 || x > cx + 95) continue;

        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.beginPath();
        ctx.moveTo(x, tapeY - 4);
        ctx.lineTo(x, tapeY + 4);
        ctx.stroke();

        const label = headingLabels[deg] || `${deg}°`;
        ctx.fillStyle = headingLabels[deg] ? '#22d3ee' : 'rgba(255,255,255,0.7)';
        ctx.fillText(label, x, tapeY + 2);
      }

      // Center heading marker
      ctx.fillStyle = '#22d3ee';
      ctx.beginPath();
      ctx.moveTo(cx, tapeY - tapeH / 2);
      ctx.lineTo(cx - 5, tapeY - tapeH / 2 - 6);
      ctx.lineTo(cx + 5, tapeY - tapeH / 2 - 6);
      ctx.closePath();
      ctx.fill();

      ctx.restore();

      // Vertical Speed Tape (Left)
      ctx.save();
      const speedX = 20;
      const speedW = 45;
      const speedH = h * 0.7;
      const speedY = (h - speedH) / 2;

      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.fillRect(speedX, speedY, speedW, speedH);
      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx.strokeRect(speedX, speedY, speedW, speedH);

      ctx.save();
      ctx.beginPath();
      ctx.rect(speedX, speedY, speedW, speedH);
      ctx.clip();

      const speedScale = 4; // pixels per unit
      const speedValue = position.airSpeed;

      ctx.textAlign = 'right';
      ctx.font = 'bold 11px Inter, monospace';
      
      for (let i = -10; i <= 10; i++) {
        const val = Math.round(speedValue / 5) * 5 + i * 5;
        if (val < 0) continue;
        const y = speedY + speedH/2 - (val - speedValue) * speedScale;
        
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.beginPath();
        ctx.moveTo(speedX + speedW, y);
        ctx.lineTo(speedX + speedW - (val % 10 === 0 ? 12 : 6), y);
        ctx.stroke();

        if (val % 10 === 0) {
          ctx.fillStyle = 'rgba(255,255,255,0.8)';
          ctx.fillText(val.toString(), speedX + speedW - 15, y + 4);
        }
      }
      ctx.restore();

      // Current Speed Box
      ctx.fillStyle = '#111827';
      ctx.strokeStyle = '#22d3ee';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(speedX + speedW, speedY + speedH/2);
      ctx.lineTo(speedX + speedW - 10, speedY + speedH/2 - 10);
      ctx.lineTo(speedX + 5, speedY + speedH/2 - 10);
      ctx.lineTo(speedX + 5, speedY + speedH/2 + 10);
      ctx.lineTo(speedX + speedW - 10, speedY + speedH/2 + 10);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.font = 'bold 13px Inter, monospace';
      ctx.fillText(Math.round(speedValue).toString(), speedX + speedW/2 + 5, speedY + speedH/2 + 5);
      ctx.restore();

      // Vertical Altitude Tape (Right)
      ctx.save();
      const altX = w - 65;
      const altW = 45;
      const altH = h * 0.7;
      const altY = (h - altH) / 2;

      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.fillRect(altX, altY, altW, altH);
      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx.strokeRect(altX, altY, altW, altH);

      ctx.save();
      ctx.beginPath();
      ctx.rect(altX, altY, altW, altH);
      ctx.clip();

      const altScale = 2; // pixels per meter
      const altValue = position.relativeAlt;

      ctx.textAlign = 'left';
      ctx.font = 'bold 11px Inter, monospace';

      for (let i = -10; i <= 10; i++) {
        const val = Math.round(altValue / 10) * 10 + i * 10;
        if (val < 0) continue;
        const y = altY + altH/2 - (val - altValue) * altScale;

        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.beginPath();
        ctx.moveTo(altX, y);
        ctx.lineTo(altX + (val % 50 === 0 ? 12 : 6), y);
        ctx.stroke();

        if (val % 20 === 0) {
          ctx.fillStyle = 'rgba(255,255,255,0.8)';
          ctx.fillText(val.toString(), altX + 15, y + 4);
        }
      }
      ctx.restore();

      // Current Altitude Box
      ctx.fillStyle = '#111827';
      ctx.strokeStyle = '#22d3ee';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(altX, altY + altH/2);
      ctx.lineTo(altX + 10, altY + altH/2 - 12);
      ctx.lineTo(altX + altW - 5, altY + altH/2 - 12);
      ctx.lineTo(altX + altW - 5, altY + altH/2 + 12);
      ctx.lineTo(altX + 10, altY + altH/2 + 12);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.font = 'bold 13px Inter, monospace';
      ctx.fillText(Math.round(altValue).toString(), altX + altW/2 - 5, altY + altH/2 + 5);
      ctx.restore();

      ctx.restore();

      // Mode & armed indicator (top)
      ctx.save();
      ctx.font = 'bold 12px Inter';
      ctx.textAlign = 'center';

      // Mode
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      const modeText = fm;
      const modeWidth = ctx.measureText(modeText).width + 20;
      ctx.fillRect(cx - modeWidth / 2, 8, modeWidth, 22);
      ctx.fillStyle = '#22d3ee';
      ctx.fillText(modeText, cx, 24);

      // Armed status
      ctx.font = 'bold 10px Inter';
      const armedText = am ? 'FAOL' : 'OʻCHIK';
      ctx.fillStyle = am ? '#ef4444' : '#10b981';
      ctx.fillText(armedText, cx, 42);

      ctx.restore();

      frameId = requestAnimationFrame(render);
    };

    frameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, []); // Empty dependency array means this loop starts once and never restarts


  return (
    <div className="glass-card p-3 flex flex-col items-center h-full">
      <div className="flex items-center justify-between w-full mb-2 px-1">
        <h3 className="text-xs font-semibold text-drone-text-dim uppercase tracking-wider">
          Sun’iy gorizont
        </h3>
        <span className="text-[10px] text-drone-accent font-mono">HUD</span>
      </div>
      <div className="relative w-full flex-1 flex items-center justify-center min-h-0">
        <canvas
          ref={canvasRef}
          className="rounded-full border border-drone-border"
          style={{ maxWidth: '100%', maxHeight: '100%' }}
        />
      </div>
    </div>
  );
}
