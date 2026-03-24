import { useEffect, useState, useRef } from 'react';

export default function useGamepad() {
  const [gamepads, setGamepads] = useState({});
  const [activeGamepad, setActiveGamepad] = useState(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const handleConnect = (e) => {
      setGamepads((prev) => ({ ...prev, [e.gamepad.index]: e.gamepad }));
      setActiveGamepad(e.gamepad.index);
    };

    const handleDisconnect = (e) => {
      setGamepads((prev) => {
        const next = { ...prev };
        delete next[e.gamepad.index];
        return next;
      });
      setActiveGamepad(null);
    };

    window.addEventListener('gamepadconnected', handleConnect);
    window.addEventListener('gamepaddisconnected', handleDisconnect);

    const pollGamepads = () => {
      const pads = navigator.getGamepads();
      const active = {};
      for (let i = 0; i < pads.length; i++) {
        if (pads[i]) {
          active[pads[i].index] = pads[i];
        }
      }
      if (Object.keys(active).length > 0) {
        setGamepads(active);
      }
      rafRef.current = requestAnimationFrame(pollGamepads);
    };

    rafRef.current = requestAnimationFrame(pollGamepads);

    return () => {
      window.removeEventListener('gamepadconnected', handleConnect);
      window.removeEventListener('gamepaddisconnected', handleDisconnect);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const pad = activeGamepad !== null ? gamepads[activeGamepad] : null;

  return {
    connected: !!pad,
    gamepad: pad,
    axes: pad ? Array.from(pad.axes) : [0, 0, 0, 0],
    buttons: pad ? Array.from(pad.buttons).map((b) => b.pressed) : [],
  };
}
