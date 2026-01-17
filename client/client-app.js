(() => {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  function resize() {
    canvas.width = innerWidth;
    canvas.height = innerHeight;
  }
  addEventListener('resize', resize);
  resize();

  const HOST = (location.origin.replace(/^http/, 'ws'));
  const ws = new WebSocket(HOST);
  ws.binaryType = 'arraybuffer';

  let lastSnapshot = null;

  ws.onopen = () => {
    console.log('connected to local server');
  };
  ws.onclose = () => console.log('disconnected');
  ws.onerror = (e) => console.warn('ws error', e);

  ws.onmessage = (ev) => {
    try {
      const snap = msgpackr.unpack(new Uint8Array(ev.data));
      lastSnapshot = snap;
    } catch (e) {
      console.warn('failed to unpack', e);
    }
  };

  // Input state
  const input = { moveX: 0, moveY: 0, mouseAngle: 0, actions: {} };
  const keys = {};

  function updateInputFromKeys() {
    const up = keys['ArrowUp'] || keys['w'];
    const down = keys['ArrowDown'] || keys['s'];
    const left = keys['ArrowLeft'] || keys['a'];
    const right = keys['ArrowRight'] || keys['d'];
    input.moveY = (down ? 1 : 0) + (up ? -1 : 0);
    input.moveX = (right ? 1 : 0) + (left ? -1 : 0);
    if (input.moveX !== 0 && input.moveY !== 0) {
      // normalize
      const m = Math.hypot(input.moveX, input.moveY);
      input.moveX /= m; input.moveY /= m;
    }
  }

  addEventListener('keydown', (e) => { keys[e.key] = true; updateInputFromKeys(); });
  addEventListener('keyup', (e) => { keys[e.key] = false; updateInputFromKeys(); });
  addEventListener('mousemove', (e) => {
    const cx = canvas.width / 2; const cy = canvas.height / 2;
    input.mouseAngle = Math.atan2(e.clientY - cy, e.clientX - cx);
  });

  // Send input 30x/sec
  setInterval(() => {
    if (ws.readyState !== WebSocket.OPEN) return;
    try {
      ws.send(msgpackr.pack({ input }));
    } catch (e) {
      console.warn('failed to pack input', e);
    }
  }, 1000 / 30);

  function render() {
    requestAnimationFrame(render);
    ctx.clearRect(0,0,canvas.width,canvas.height);
    if (!lastSnapshot) return;

    // simple camera: center on player
    const player = lastSnapshot.player;
    const camX = player.x - canvas.width / 2;
    const camY = player.y - canvas.height / 2;

    // draw background grid
    ctx.fillStyle = '#071018';
    ctx.fillRect(0,0,canvas.width,canvas.height);

    // draw enemies
    if (lastSnapshot.enemies) {
      for (const e of lastSnapshot.enemies) {
        ctx.beginPath();
        ctx.fillStyle = '#d9534f';
        ctx.arc(e.x - camX, e.y - camY, 12, 0, Math.PI*2);
        ctx.fill();
      }
    }

    // draw player
    ctx.beginPath();
    ctx.fillStyle = '#5bc0de';
    ctx.arc(player.x - camX, player.y - camY, 14, 0, Math.PI*2);
    ctx.fill();

    // HUD
    ctx.fillStyle = '#ffffff';
    ctx.font = '16px sans-serif';
    ctx.fillText('HP: ' + Math.max(0, Math.round(player.hp || 0)), 12, 20);
    ctx.fillText('Time: ' + (Math.floor((lastSnapshot.timeAlive||0))), 12, 40);

    if (lastSnapshot.gameOver) {
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(0,0,canvas.width, canvas.height);
      ctx.fillStyle = '#fff';
      ctx.font = '40px sans-serif';
      ctx.fillText('You died — respawning...', canvas.width/2 - 220, canvas.height/2);
    }
  }

  render();
})();
