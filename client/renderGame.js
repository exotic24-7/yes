// Minimal safe renderGame shim to replace corrupted client copy.
// This file provides lightweight, non-conflicting implementations
// of the renderer entrypoints used elsewhere so the client parses.

(function(){
    function renderGame(state, ctx) {
        // Basic safe rendering: clear and draw a placeholder frame
        try {
            if (!ctx) return;
            if (ctx.clearRect) ctx.clearRect(0, 0, ctx.canvas?.width || 800, ctx.canvas?.height || 600);
            ctx.save && ctx.save();
            ctx.fillStyle = '#000000';
            ctx.globalAlpha = 0.0; // keep invisible by default
            ctx.fillRect(0,0,1,1);
            ctx.globalAlpha = 1;
            ctx.restore && ctx.restore();
        } catch (e) {
            console.debug('renderGame shim error', e);
        }
    }

    function renderHitbox(box, ctx) {
        if (!ctx || !box) return;
        try {
            ctx.save && ctx.save();
            ctx.strokeStyle = 'rgba(255,0,0,0.25)';
            ctx.lineWidth = 1;
            if (ctx.strokeRect) ctx.strokeRect(box.x - box.w/2, box.y - box.h/2, box.w, box.h);
            ctx.restore && ctx.restore();
        } catch (e) {
            console.debug('renderHitbox shim error', e);
        }
    }

    // Attach guarded to window to avoid redeclaration issues
    if (typeof window !== 'undefined') {
        window.renderGame = window.renderGame || renderGame;
        window.renderHitbox = window.renderHitbox || renderHitbox;
    } else {
        this.renderGame = this.renderGame || renderGame;
        this.renderHitbox = this.renderHitbox || renderHitbox;
    }
})();
