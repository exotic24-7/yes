// Original client.js copied into client/
// (content preserved)
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


// Use guest flow: generate persistent guestId and auto-start as guest
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
  
  // Auto-login as guest (mirror normal login event)
  if(window.reconnecting !== true){
    const name = (document.querySelector('.nickname') && document.querySelector('.nickname').value) || 'Player';
    send({ guestLogin: true, id: guestId, name });
  }
    // If auto-start hasn't run yet, schedule it shortly after guestLogin
    try {
      if (typeof window.__autoStartGame === 'undefined') window.__autoStartGame = false;
      setTimeout(() => {
        if (window.__autoStartGame) return;
        // Auto-select a safe mode and call the same ready path used by the menu
        try {
          // prefer private/new single-player behavior
          if (typeof squadUI !== 'undefined') {
            squadUI.reset();
            squadUI.public = false;
          }
          if (typeof playText !== 'undefined') playText.setAttribute('stroke', 'Ready');
          // Call the existing ready path (this sends the same message the Ready button would)
          if (typeof changeReady === 'function') changeReady(true);
          window.__autoStartGame = true;
        } catch (e) {
          console.warn('autoStartGame failed', e);
        }
      }, 150);
    } catch (e) {}
  

}

function handleMessage(data){
  window.lastMessageTimeReceived = performance.now();
  // try to unpack first; if msg contains control flags, handle them
  let msgObj;
  try {
    msgObj = msgpackr.unpack(data.data);
  } catch(e) {
    // binary/raw handling stays the same
    if(window.state === 'game'){
      const decoded = new Float32Array(data.data);
      processRawMessage[/*type*/decoded[0]](decoded);
      return;
    } else {
      return;
    }
  }

  if (msgObj.gameReady) {
    // server indicates player attached and ready — start game
    if (typeof enterGame === 'function') {
      enterGame();
      return;
    }
  }

  if(window.state === 'game'){
    try {
      processGameMessage(msgObj);
    } catch(e){
      const decoded = new Float32Array(data.data);
      // console.log({[decoded[0]]: decoded});
      processRawMessage[/*type*/decoded[0]](decoded);
    }
  } else {
    processMenuMessage(msgObj);
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

  // Dispatch raw server snapshot events for lightweight client overlay
  if (msgObj && msgObj.player && msgObj.petals) {
    try { window.dispatchEvent(new CustomEvent('snapshot', { detail: msgObj })); } catch (e) {}
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


initWS();

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
      ws.send(/*msgpack.encode(msg)*/msgpackr.pack(msg));
    }
  }
  for(let i = 0; i < wsMsgQueue.length; i++){
    send(wsMsgQueue[i]);
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
    squadUI.reset();
    window.squadUIEnabled = true;

    playText.setAttribute("stroke", "Ready");
    
    changeReady(false);
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

let wsMsgQueue = Array.isArray(window.wsMsgQueue) ? window.wsMsgQueue : [];
function _safePushQueue(q, msg){
  if(!Array.isArray(q)) q = [];
  try{ q.push(msg); }catch(e){ q = [msg]; }
  return q;
}
let send = (msg) => {
  wsMsgQueue = _safePushQueue(wsMsgQueue, msg);
};

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

// 3d
if(location.href.endsWith('/3d')){
  window.is3D = true;

  const t = document.createElement("script");
  t.type = "module";
  t.src = "systems/3d.js";
  document.body.append(t);
}
