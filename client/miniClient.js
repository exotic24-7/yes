// Lightweight overlay renderer + input sender for server snapshot
(function(){
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');

  let snapshot = null;
  let keys = {w:0,a:0,s:0,d:0};
  let mouseDown = false;

  const scale = 1/2; // world -> screen scale

  window.addEventListener('snapshot', (e) => {
    snapshot = e.detail;
  });

  // Send input periodically
  setInterval(() => {
    if (!window.connected) return;
    const dx = (keys.d - keys.a);
    const dy = (keys.s - keys.w);
    const inp = { moveX: dx, moveY: dy, actions: { attack: !!mouseDown } };
    try { send({ input: inp }); } catch (e) {}
  }, 50);

  // keyboard
  window.addEventListener('keydown', (e)=>{
    if(e.key === 'w' || e.key === 'W') keys.w = 1;
    if(e.key === 'a' || e.key === 'A') keys.a = 1;
    if(e.key === 's' || e.key === 'S') keys.s = 1;
    if(e.key === 'd' || e.key === 'D') keys.d = 1;
    if(e.key === ' '){ mouseDown = true; }
  });
  window.addEventListener('keyup', (e)=>{
    if(e.key === 'w' || e.key === 'W') keys.w = 0;
    if(e.key === 'a' || e.key === 'A') keys.a = 0;
    if(e.key === 's' || e.key === 'S') keys.s = 0;
    if(e.key === 'd' || e.key === 'D') keys.d = 0;
    if(e.key === ' '){ mouseDown = false; }
  });
  window.addEventListener('mousedown', ()=>{ mouseDown = true; });
  window.addEventListener('mouseup', ()=>{ mouseDown = false; });

  function drawOverlay(){
    if(!snapshot) return;
    // draw on top without affecting main render state
    ctx.save();
    // clear only overlay elements by drawing nothing since main render clears canvas
    // Draw player at center
    const pw = canvas.width/2; const ph = canvas.height/2;
    ctx.resetTransform();
    ctx.fillStyle = 'rgba(0,0,0,0)';
    // player
    ctx.beginPath();
    ctx.fillStyle = '#33cc33';
    ctx.arc(pw, ph, 12, 0, Math.PI*2);
    ctx.fill();
    ctx.closePath();

    // draw enemies relative to player
    if(snapshot.enemies){
      for(let e of snapshot.enemies){
        const ex = pw + (e.x - snapshot.player.x) * scale;
        const ey = ph + (e.y - snapshot.player.y) * scale;
        ctx.beginPath();
        ctx.fillStyle = '#cc3333';
        ctx.arc(ex, ey, 10, 0, Math.PI*2);
        ctx.fill();
        ctx.closePath();
      }
    }

    // draw petals
    if(snapshot.petals){
      for(let p of snapshot.petals){
        const px = pw + (p.x - snapshot.player.x) * scale;
        const py = ph + (p.y - snapshot.player.y) * scale;
        ctx.beginPath();
        ctx.fillStyle = '#ffcc33';
        ctx.arc(px, py, 6, 0, Math.PI*2);
        ctx.fill();
        ctx.closePath();
      }
    }

    // draw HUD inventory count
    ctx.resetTransform();
    ctx.fillStyle = 'white';
    ctx.font = '16px Arial';
    const invCount = (snapshot.inventory || []).length;
    ctx.fillText('Inventory: ' + invCount, 10, 22);

    ctx.restore();
  }

  function loop(){
    drawOverlay();
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
})();
