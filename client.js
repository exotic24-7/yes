// Ensure a global `send` exists early so other scripts can call it safely
if(!window.send){
  window.wsMsgQueue = Array.isArray(window.wsMsgQueue) ? window.wsMsgQueue : [];
  window.send = function(msg){
    if(!Array.isArray(window.wsMsgQueue)) window.wsMsgQueue = [];
    try{
      window.wsMsgQueue.push(msg);
    }catch(e){
      console.warn('wsMsgQueue push failed, resetting queue', e);
      window.wsMsgQueue = [msg];
    }
  };
}

// Provide minimal UI globals early so other modules can safely reference them
if (typeof window.menuInventory === 'undefined') {
  window.menuInventory = {
    pack: function(){ return {}; },
    mouseDown: function(){},
    mouseUp: function(){},
    positionPetalSlots: function(){},
    initChangePetalsQueue: function(){},
    sendQueuedChangedPetalsImmediately: function(){},
    speedCircle: { reload: 0 }
  };
}
if (typeof window.craftingMenu === 'undefined') {
  window.craftingMenu = {
    menuActive: false,
    hoveringOverButton: false,
    hoveringOverX: false,
    toggleMenu: function(){},
    mouseMove: function(){},
    mouseDown: function(){},
    mouseUp: function(){},
    updateScroll: function(){},
    addPetalContainer: function(){},
    removePetalContainer: function(){},
    removePetalContainerAmount: function(){},
    processCraftResults: function(){},
    draw: function(){},
    drawIcon: function(){},
    enterGame: function(){},
    recalculateTypeIndexes: function(){},
    removeCraftingPetalContainers: function(){}
  };
}
if (typeof window.globalInventory === 'undefined') {
  window.globalInventory = {
    mouseDown: function(){},
    mouseUp: function(){},
    updateScroll: function(){},
    resizeScroll: function(){},
    toggleMenu: function(){},
    menuActive: false
  };
}
if (typeof window.draggingPetalContainer === 'undefined') {
  window.draggingPetalContainer = null;
}

if(window.__clientInitialized){
  console.log('client.js already initialized — skipping second load');
} else {
  window.__clientInitialized = true;

  (function(){

  // early, function-scoped send to avoid TDZ when code calls `send` before later initialization
  var wsMsgQueue = Array.isArray(window.wsMsgQueue) ? window.wsMsgQueue : [];
  var send = function(msg){
    if(!Array.isArray(wsMsgQueue)) wsMsgQueue = [];
    try{
      wsMsgQueue.push(msg);
      window.wsMsgQueue = wsMsgQueue;
    }catch(e){
      console.warn('wsMsgQueue push failed (local), resetting queue', e);
      wsMsgQueue = [msg];
      window.wsMsgQueue = wsMsgQueue;
    }
  };

  let ver = document.scripts[0].src.split("v=")[1];
if (!ver && location.host == 'localhost:3000') ver = 'Developer'
let servers = {
  "wss://flowr.fun/": "Server 1",
  "wss://server2.flowr.fun/": "Server 2",
  "ws://localhost:3000/": "Local"
}

console.log(`Client version ${ver} (this is not going to be updated every update probably)`)

HOST = location.origin.replace(/^http/, 'ws')
if(location.origin === 'https://flowrclient.serum0017.repl.co'){
  HOST = 'wss://flowr.fun'.replace(/^http/, 'ws')
}
let ws;


// Use guest flow by default for local single-player — disable account gating
let guestId = localStorage.getItem('guestId');
if (!guestId) {
  try { guestId = crypto.randomUUID(); } catch (e) { guestId = 'g_' + Math.random().toString(36).slice(2,10); }
  localStorage.setItem('guestId', guestId);
}
window.state = 'menu';
window.skipLogin = true;
window.connected = false;
window.spectating = false;

window.reconnectTries = 20;
window.reconnecting = false;
window.lastMessageTimeReceived = performance.now();

window.keepAlive = [];

function initWS(){
  ws = new WebSocket(HOST);
  console.log("Initiating WebSocket connection!")
  ws.binaryType = "arraybuffer";

  ws.onopen = handleOpen;
  ws.onmessage = handleMessage;
  ws.onclose = handleClose;

  // ws.onclose = async (event) => {
  //   
  // }
}

function startKeepAlive(){
  window.keepAlive = [setInterval(() => {
    if(window.state !== 'game'){
      send({ping: true});
    } 
  }, 20000), setInterval(() => {

    if(window.state == 'game' && performance.now() - window.lastMessageTimeReceived > 5000){
      //we DC'ed. Try reconnecting!
      console.log("DISCONNECT DETECTED! Closing WebSocket to attempt reconnect.")
      ws.onopen = null;
      ws.onmessage = null;
      ws.onclose = null;
      ws.onerror = null;
      ws.close(1000, "manual reconnection");
      handleClose();
      
      //ws.onclose();
      window.lastMessageTimeReceived = performance.now();
    }
  }, 1000)];
}

function stopKeepAlive(){
  window.keepAlive.forEach(v=>clearInterval(v));
}

// Start a local single-player game: create a room, spawn a player, and enter game.
function startLocalGame(){
  if(window._localGameStarted) return;
  window._localGameStarted = true;
  console.log('Starting local game...');
  const id = Math.floor(Math.random() * 900000) + 1000;
  window.selfId = id;
  const nameElem = document.querySelector('.nickname');
  const name = (nameElem && nameElem.value) ? nameElem.value : 'Local';
  const biomeName = (biomeManager && biomeManager.getCurrentBiomeData) ? (biomeManager.getCurrentBiomeData().current || 'garden') : 'garden';

  // Tell the UI about the squad (so squadUI builds client entries)
  try{
    processMenuMessage({
      squadInit: true,
      clients: [{name: name, id: id, ready: false, sw: 200, maxSW: 200, petals: []}],
      public: false,
      selfId: id,
      biome: biomeName,
    });
  }catch(e){ console.warn('processMenuMessage.squadInit failed', e); }

  // Prepare initial room state and spawn our flower
  try{
    const flowers = {};
    // create a few default petals so client code has valid arrays to work with
    const defaultPetals = [];
    for(let i = 0; i < 3; i++){
      defaultPetals.push({
        id: i,
        type: 'Basic',
        distance: neutralPetalDistance,
        angle: (Math.PI * 2 * i) / 3,
        x: 0,
        y: 0,
        render: {x:0,y:0,angle:0,distance:neutralPetalDistance,reload:1,hp:1},
        reload: 1,
        hp: 1,
        maxReload: 1,
        offset: {angle:0,distance:0},
        petalContainerId: -1,
        subId: 0,
        subStackedId: 0,
        totalStackedId: 1
      });
    }
    flowers[id] = {id: id, hp: 100, maxHp: 100, headX: 0, headY: 0, petalRotation: 0, angle: 0, isPoisoned: 0, petals: defaultPetals, name, username: name};
    const init = {radius: 500, wave: 1, waveTimer: 0, biome: biomeName, shinyWave: false, tick: 0, flowers: flowers, enemies: {}};
    if(typeof room !== 'undefined' && room.processInit) room.processInit(init);
  }catch(e){ console.warn('room.processInit failed', e); }

  // Enter the game (hide menus, start game loop)
  try{
    // Ensure saved slots are 5 and populate with 5 Basic petals for local play
    try{
      localStorage.setItem('savedSlotAmount', '5');
      if (typeof menuInventory !== 'undefined' && menuInventory && typeof menuInventory.setPetalSlotsNumber === 'function'){
        menuInventory.setPetalSlotsNumber(5);
      }
      if (typeof Petal !== 'undefined' && typeof PetalContainer !== 'undefined' && typeof menuInventory !== 'undefined'){
        for(let i = 0; i < 5; i++){
          if (menuInventory.topPetalContainers[i] === undefined){
            const pet = new Petal({ type: 'Basic', rarity: 0, reload: 1, hp: 1, maxReload: 1 });
            const pc = new PetalContainer([pet], { x:0, y:0, w:65, h:65, originalX:0, originalY:0, radius:100, toOscillate:false }, Math.random(), 1);
            menuInventory.addPetalContainer(pc, true, i, false);
          }
        }
      }
    }catch(_e){}

    if (typeof enterGame === 'function') enterGame();
  }catch(e){ console.warn('enterGame failed', e, e && e.stack ? e.stack : 'no-stack'); }

  console.log('Local game started');
}


function handleOpen(){

  startKeepAlive();

  if(window.reconnecting === true && !window.connectBackMainServ) {
      const obj = {reconnect: true, id: window.reconnectId};

      if(window.connectOtherServerId !== undefined){
        obj.connectOtherServerId = window.connectOtherServerId;
        delete window.connectOtherServerId;

        window.state = 'menu';
        console.log('Connect Other Server Packet Sent!');
      } else {
        window.state = 'game';
        console.log('Reconnect Packet Sent!')
      }

      ws.send(msgpackr.pack(obj));
      wsMsgQueue = [];
      //give the server a chance to process
      setTimeout(sendQueuedMessages, 100);
      window.reconnectTries = 20;
      
    }
  ws.onerror = ()=>{};
  window.reconnecting = false;

    if(window.connectBackMainServ) {
      window.state = 'menu';
      delete window.connectBackMainServ;
    }

  ws.binaryType = "arraybuffer";
  console.log('connected to server!');
  window.connected = true;
  window.connectedTime = window.time;
  document.querySelector('.grid').classList.add('show');
  
  if(window.skipLogin === true && window.reconnecting !== true){
    send({login: true, username, hashedPassword, hashedPassword2/*, betakey*/});
  }
  

}

function handleMessage(data){
  window.lastMessageTimeReceived = performance.now();
  if(window.state === 'game'){
    try {
      let msg = msgpackr.unpack(data.data);//msgpack.decode(new Uint8Array(data.data));
      processGameMessage(msg);
    } catch(e){
      const decoded = new Float32Array(data.data);
      // console.log({[decoded[0]]: decoded});
      processRawMessage[/*type*/decoded[0]](decoded);
    }
  } else {
    let msg = msgpackr.unpack(data.data);//msgpack.decode(new Uint8Array(data.data));
    processMenuMessage(msg);
  }
}

function handleClose(event){
  stopKeepAlive();
  delete window.connectedTime;
  console.log(`WebSocket closed for`, event, event ? event.reason : "unknown reason");
  window.state = "disconnected";
  if(event && (event.reason) && event.reason != '') {
    window.connected = false;
    return;
  }
  
  if(!['game', 'disconnected'].includes(window.state) && window.connectOtherServerId === undefined){
    window.connected = false;
  } else {

    
    // try to reconnect and send reconnect msg 
    if(window.reconnectTries > 0){
      wsMsgQueue.length = 0;
      send = (msg) => {
        wsMsgQueue.push(msg);
      };
      console.log(`trying to reconnect in ${timeBetweenReconnects(window.reconnectTries)}`);
      window.reconnecting = true;
      setTimeout(attemptReconnect, timeBetweenReconnects(window.reconnectTries));  

    }
  }
  
}

function attemptReconnect(){
  
  
  initWS();
  ws.onerror = (e)=>{
    console.log("WS INIT FAILED", e)
    /*console.log(`WS INIT FAILED, TRYING AGAIN: ${timeBetweenReconnects(window.reconnectTries)}`)
    setTimeout(attemptReconnect, timeBetweenReconnects(window.reconnectTries)); */
  }
  
  console.log(`Reconnect Attempt; ${window.reconnectTries} tries left`);
  window.reconnectTries--;

}

function timeBetweenReconnects(triesleft){
  return 500 + 1000 * (20 - triesleft);
}


// If running on localhost, skip the remote WebSocket and enable a local-mode send() so
// Play can start a local game without the server's matchmaking protocol.
if(location.host && location.host.includes('localhost')){
  console.log('Local mode: skipping remote WebSocket connection');
  window.connected = true;
  // mark local mode; don't assign `send` yet (avoids TDZ when `send` is declared later)
  window.localMode = true;
  // start local server heartbeat
  setTimeout(() => {
    try{
      if(window.LocalServer){
        window._localServer = new LocalServer();
        setInterval(() => { try{ window._localServer.tick(); }catch(e){} }, 1000/30);
        console.log('LocalServer started');
      }
    }catch(e){}
  }, 100);
  // safety: ensure local game starts even if something else doesn't trigger it
  // Do NOT auto-start a local game on load; require explicit Play click.
  // setTimeout(() => {
  //   try{ if(typeof startLocalGame === 'function') startLocalGame(); }catch(e){}
  // }, 200);
} else {
  initWS();
}

//END OF WS CONNECTION LOGIC

window.onload = () => {
  resize();
  document.querySelector('.loader').style.animation = 'fadeOut .2s';
  setTimeout(() => {
    document.querySelector('.loader').remove();
  }, 200 - 1000 / 60 * 2)

  for(let i = 0; i < onLoadFunctions.length; i++){
    onLoadFunctions[i]();
  }
  onLoadFunctions.length = 0;

  window.loaded = true;

  send = (msg, forceSend) => {
    if (forceSend || !window.reconnecting){
      if(typeof ws !== 'undefined' && ws && typeof ws.send === 'function'){
        try{
          ws.send(/*msgpack.encode(msg)*/msgpackr.pack(msg));
        }catch(e){
          console.warn('ws.send failed, queuing message', e);
          if(!Array.isArray(wsMsgQueue)) wsMsgQueue = [];
          try{ wsMsgQueue.push(msg); }catch(_e){ wsMsgQueue = [msg]; }
        }
      } else {
        // WebSocket not ready — queue message
        if(!Array.isArray(wsMsgQueue)) wsMsgQueue = [];
        try{ wsMsgQueue.push(msg); }catch(_e){ wsMsgQueue = [msg]; }
      }
    }
  }
  for(let i = 0; i < wsMsgQueue.length; i++){
    send(wsMsgQueue[i]);
  }

  // If we're running in localMode, make the main menu UI visible and perform a local login
  if(window.localMode){
    try{
      document.querySelector('.grid').classList.add('show');
    }catch(e){}
    window.connected = true;
    console.log('Local mode: UI shown and connected flag set');
    // run a harmless login via the local send implementation so client behaves like connected
    try{ send({login: true, username, hashedPassword, hashedPassword2}); }catch(e){}
  }
}

const customCodeBiomeNames = ["Rainforest_cc", "petri_dish", "Slime", "Mutated_Garden", "Freshwater_Lake"];

const playButton = document.querySelector('.play-btn');

const playText = document.querySelector('.play-text');


let lastAttempt = Date.now();

playButton.onclick = (e) => {
  const biome = biomeManager.getCurrentBiome();
  const isCustomCodeBiome = customCodeBiomeNames.includes(biome);

  squadUI.isCustomCode = isCustomCodeBiome;
  if(isCustomCodeBiome === true){
    processMenuMessage({
      squadInit: true,
      clients: [{name: "", id: 1, ready: false, sw: 200, maxSW: 200, petals: [], username: ""}],
      public: false,
      selfId: 1,
      biome,
    })
  }

  if(playText.getAttribute("stroke") === "Ready"){
    // the first time the user clicks ready this will trigger. Otherwise it wont ever (unless user changes biome).
    if(isCustomCodeBiome === true){
      loadCustomCodeBiome(biome);
      return;
    }

    // toggle ready
    changeReady(!window.ready);
  } else {
    // open menu for the first time (play)
    if (!window.connected) return;
    if (window.captchaStatus == true && Date.now() > lastAttempt + 1500){
      const hcaptchaElem = document.querySelector('.h-captcha');
      const captchaDiv = document.querySelector(".captcha");
      captchaDiv.classList.remove("hidden");
      const hcaptchaIframe = hcaptchaElem.firstChild;
      const solveInterval = setInterval(() => {
          const captchaResponse = hcaptchaIframe.getAttribute('data-hcaptcha-response');
          // console.log(captchaResponse)
          if(captchaResponse.length > 0){
              clearInterval(solveInterval);
              captchaDiv.classList.add("hidden");
              send({captchaVerify: true, captchaResponse});
              lastAttempt = Date.now();
              hcaptcha.reset();
          }
      }, 100)
      return;
    }
    // Auto-join a public room on Play (skip the public/new/private menu)
    if(window.connected){
      console.log('Play clicked: auto-joining public room, biome=', biomeManager.getCurrentBiomeData && biomeManager.getCurrentBiomeData().current);
      // If running against the simple local server (no squad support), fake squad init and enter game locally
      const isLocalServer = typeof HOST === 'string' && HOST.includes('localhost');
      const biomeName = biomeManager.getCurrentBiomeData ? biomeManager.getCurrentBiomeData().current : 'garden';
      if(isLocalServer){
        console.log('Detected local server — starting local game without matchmaking');
        // Ensure we start the local game loop and spawn the player
        try{ startLocalGame(); }catch(e){console.warn('startLocalGame failed', e)}
        return;
      }

      sendRoomRequest({findPublic: true, biome: biomeName});
      playText.setAttribute("stroke", "Ready");
      // send ready shortly after joining (allow server to process room request first)
      setTimeout(() => { console.log('Auto-ready after join'); changeReady(true); }, 150);
    } else {
      // fallback to original behavior when not connected
      squadUI.reset();
      window.squadUIEnabled = true;
      playText.setAttribute("stroke", "Ready");
      changeReady(false);
    }
  }
}

function loadCustomCodeBiome(biome){
  const iframe = document.createElement('iframe');
  iframe.src = `${location.origin}/customBiome/${biome}`;
  const menu = document.querySelector('.menu');
  iframe.style.position = "fixed";
  iframe.style.top = 0;
  iframe.style.left = 0;
  iframe.style.width = "100%";
  iframe.style.height = "100%";
  iframe.style.zIndex = "99999999999999999";
  menu.appendChild(iframe);
  window.addEventListener('message', (event) => {
    unloadCustomCodeBiome(iframe);
  });
  iframe.onload = () => {
    iframe.contentWindow.postMessage([menuInventory.pack().top, Math.round(squadUI.startingWaveSlider * 200 + 1)]);
  }
}

function unloadCustomCodeBiome(iframe){
  iframe.remove();
  squadUI.reset();
  closeSquadUI();
}

wsMsgQueue = Array.isArray(wsMsgQueue) ? wsMsgQueue : [];
send = (msg) => {
  if(!Array.isArray(wsMsgQueue)) wsMsgQueue = [];
  try{ wsMsgQueue.push(msg); }catch(_e){ wsMsgQueue = [msg]; }
};

// If localMode was enabled earlier, override `send` with a local logger implementation
if(window.localMode){
  send = (msg, forceSend) => {
    console.log('local send:', msg);
  }
}

function sendQueuedMessages(){
  let int = setInterval(()=>{
    if(wsMsgQueue.length == 0){
      clearInterval(int);
      send = (msg) => {
        ws.send(/*msgpack.encode(msg)*/msgpackr.pack(msg));
      }
      return;
    }
    ws.send(msgpackr.pack(wsMsgQueue.shift()));
  }, 100);
  
  
}


// mainWS.onclose = (e) => {
//   // intentional closing
//   if(window.state === 'game'){
//     return;
//   }

//   console.log('closed ws, try to reconnect');
//   mainWS = new WebSocket(HOST);
//   mainWS.binaryType = "arraybuffer"
//   window.connected = false;
// }

// mainWS.onerror = (e) => {
//   console.log("ws error");
// }

// let reconnectInterval = setInterval(() => {
//   tryReconnect();
// }, 5000)

// function tryReconnect(){
//   if(window.state === "game"){
//     return;
//   }
//   // if(mainWS.readyState === 1 && window.connected === false){
//   //   initMainWS();
//   //   mainWS.onopen();
//   //   return;
//   // }
//   if(window.connected === false){
//     // console.log('closed ws, try to reconnect');
//     setTimeout(() => {
//       globalInventory.initInventory([]);
//       menuInventory.clear();
//       mainWS = new WebSocket(HOST);
//       mainWS.binaryType = "arraybuffer"
//       window.connected = false; 
//       initMainWS();
//     }, 2000);
//     // setTimeout(() => {
//     //   window.location.reload();
//     // }, 2000)
//   }
// }

// 3d
if(location.href.endsWith('/3d')){
  window.is3D = true;

  // appending scripts
  // const s = document.createElement("script");
  // s.type = "text/javascript";
  // s.src = "systems/three.js";
  // document.body.append(s);

  const t = document.createElement("script");
  t.type = "module";
  t.src = "systems/3d.js";
  document.body.append(t);
}

  })();

}