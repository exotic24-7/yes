// minimal room stub to accept snapshots
window.room = { flowers: {}, enemies: {}, petals: {}, selfId: null };
function applySnapshot(snapshot){
    if(snapshot.player){
        room.flowers[snapshot.player.id] = snapshot.player;
        room.selfId = snapshot.player.id;
    }
    if(snapshot.enemies) room.enemies = {};
    snapshot.enemies?.forEach(e => room.enemies[e.id] = e);
    if(snapshot.petals) room.petals = {};
    snapshot.petals?.forEach(p => room.petals[p.id] = p);
}
