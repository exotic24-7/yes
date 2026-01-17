// Minimal LocalServer for single-player local-mode
(function(){
    function LocalServer(){
        this.room = (typeof room !== 'undefined') ? room : new Room();
        this.lastTick = performance.now();
        this.running = false;
    }

    LocalServer.prototype.tick = function(){
        const now = performance.now();
        const dtMs = now - this.lastTick;
        const dt = dtMs / 1000;
        this.lastTick = now;

        // Basic flower simulation: move flowers based on angle/magnitude
        for(let id in this.room.flowers){
            const f = this.room.flowers[id];
            if(!f) continue;
            // apply simple movement
            if(typeof f.angle === 'number' && typeof f.magnitude === 'number'){
                f.xv = (f.xv || 0) + Math.cos(f.angle) * (f.magnitude || 0) * (1/9) * (dt * 30);
                f.yv = (f.yv || 0) + Math.sin(f.angle) * (f.magnitude || 0) * (1/9) * (dt * 30);
            }
            f.xv = (f.xv || 0) * (f.friction || 0.3);
            f.yv = (f.yv || 0) * (f.friction || 0.3);
            f.headX = (f.headX || 0) + (f.xv || 0) * (dt * 30);
            f.headY = (f.headY || 0) + (f.yv || 0) * (dt * 30);

            // clamp to room radius
            const dist = Math.hypot(f.headX, f.headY);
            if(dist + (f.radius || 25) > this.room.radius){
                const angle = Math.atan2(f.headY, f.headX);
                f.headX = Math.cos(angle) * (this.room.radius - (f.radius || 25));
                f.headY = Math.sin(angle) * (this.room.radius - (f.radius || 25));
            }

            // interpolate base positions
            f.baseX = (typeof f.baseX === 'number') ? (f.baseX + (f.headX - f.baseX) * 0.4) : f.headX;
            f.baseY = (typeof f.baseY === 'number') ? (f.baseY + (f.headY - f.baseY) * 0.4) : f.headY;

            // petal rotation
            f.petalRotation = (f.petalRotation || 0) + (f.petalRotateSpeed || 0.0833) * (dt * 30);
        }

        // basic cleanup for enemies
        for(let id in this.room.enemies){
            const e = this.room.enemies[id];
            if(!e) continue;
            if(e.dead && e.deadAnimationTimer > 166){
                delete this.room.enemies[id];
            }
        }
    };

    window.LocalServer = LocalServer;
})();
