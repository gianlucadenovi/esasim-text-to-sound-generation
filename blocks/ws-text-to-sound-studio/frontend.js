// ── EsaSim block ──────────────────────────────────────────────────────
// Text to Sound Studio (ws-text-to-sound-studio) · version 3 · view, JavaScript: function render(ctx)
// Prompt-first sound generation: select model and settings, start a new run directly from the View and play every generated WAV.
// Workspace: Gianluca De Novi's workspace · Author: Gianluca De Novi
// Saved: 2026-11-13
//
// Inputs   ctx.input("id") gives { files, stream }; ctx.rows("id"), ctx.json("id"), ctx.text("id")
//   sounds      Files (wav, mp3, ogg, flac, m4a, webm) Generated audio · several · optional
//   status      Live telemetry            Live generation progress · optional · Connect the generator telemetry to display stages and progress while it works.
// Settings ctx.params.key
//   (none)
// EsaSim rewrites these lines from the block's definition each time it is saved: change the definition, not them.
// ── end of EsaSim block header ────────────────────────────────────────

function render(ctx) {
  var defaults = { prompt: "A sudden powerful thunderclap directly overhead, followed by a long low rolling rumble that slowly fades into a quiet rainstorm. Photorealistic field recording, no music, no voices.", model: "AudioLDM 2", model_id: "", custom_family: "AudioLDM 2", count: 4, seconds: 8, seed: 1, negative: "speech, music", steps: 0, guidance: 0 };
  var saved = (ctx.state && ctx.state.settings) || {};
  var state = Object.assign({}, defaults, saved);
  var busy = false, message = "", players = {}, urls = {}, lastProgress = null;
  var history = Array.isArray(ctx.state && ctx.state.soundHistory) ? ctx.state.soundHistory.slice(0,80) : [];
  var currentRun = ctx.run && ctx.run.id || null;
  var root = ctx.el;
  root.innerHTML = '<div class="viz-pad" style="display:flex;flex-direction:column;gap:14px;padding:14px;box-sizing:border-box">'
    + '<div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap"><div><div style="font-size:21px;font-weight:750;letter-spacing:-.03em">Sound Studio</div><div class="viz-small viz-muted">Describe a sound, generate variations, and listen to each take.</div></div><span class="viz-small viz-muted" id="studio-run"></span></div>'
    + '<div class="viz-tile" style="padding:14px;display:flex;flex-direction:column;gap:11px">'
    + '<label class="viz-small" for="studio-prompt"><strong>Describe your sound</strong></label>'
    + '<textarea id="studio-prompt" class="viz-in" rows="4" style="width:100%;box-sizing:border-box;min-height:105px;resize:vertical;font-size:14px;line-height:1.5;padding:11px" placeholder="What does it sound like? Describe its texture, environment, movement and ending."></textarea>'
    + '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(135px,1fr));gap:11px">'
    + '<label class="viz-small">Model<select class="viz-in" id="studio-model" style="display:block;width:100%;margin-top:5px"><option>AudioLDM 2</option><option>AudioLDM 2 Large</option><option>AudioLDM</option><option>Stable Audio Open 1.0</option><option>Other Diffusers repository</option></select></label>'
    + '<label class="viz-small">Variations<input class="viz-in" id="studio-count" type="number" min="1" max="100" step="1" style="display:block;width:100%;box-sizing:border-box;margin-top:5px"></label>'
    + '<label class="viz-small">Duration (seconds)<input class="viz-in" id="studio-seconds" type="number" min="1" max="47" step="1" style="display:block;width:100%;box-sizing:border-box;margin-top:5px"></label>'
    + '<label class="viz-small">First seed (0 = random)<input class="viz-in" id="studio-seed" type="number" min="0" max="2147483647" step="1" style="display:block;width:100%;box-sizing:border-box;margin-top:5px"></label>'
    + '</div><div id="studio-custom" style="display:none;gap:10px;flex-wrap:wrap"><label class="viz-small" style="flex:2;min-width:150px">Hugging Face repository ID<input class="viz-in" id="studio-model-id" style="display:block;width:100%;box-sizing:border-box;margin-top:5px" placeholder="organization/model"></label><label class="viz-small" style="flex:1;min-width:130px">Pipeline family<select class="viz-in" id="studio-family" style="display:block;width:100%;margin-top:5px"><option>AudioLDM 2</option><option>AudioLDM</option><option>Stable Audio</option></select></label></div>'
    + '<details><summary class="viz-small" style="cursor:pointer">Advanced generation settings</summary><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:10px;padding-top:10px"><label class="viz-small">Negative prompt<input class="viz-in" id="studio-negative" style="display:block;width:100%;box-sizing:border-box;margin-top:5px"></label><label class="viz-small">Inference steps (0 = auto)<input class="viz-in" id="studio-steps" type="number" min="0" max="200" style="display:block;width:100%;box-sizing:border-box;margin-top:5px"></label><label class="viz-small">Guidance (0 = auto)<input class="viz-in" id="studio-guidance" type="number" min="0" max="20" step=".1" style="display:block;width:100%;box-sizing:border-box;margin-top:5px"></label></div></details>'
    + '<div class="viz-row" style="display:flex;align-items:center;gap:10px;flex-wrap:wrap"><button id="studio-generate" class="viz-btn primary" style="padding:10px 20px;font-size:14px;font-weight:650">Generate sounds</button><span id="studio-status" class="viz-small viz-muted" aria-live="polite"></span><span class="viz-small viz-muted" style="margin-left:auto">Ctrl + Enter</span></div></div>'
    + '<div class="viz-tile" id="studio-activity" style="padding:14px;display:flex;flex-direction:column;gap:10px" aria-live="polite"><div style="display:flex;align-items:center;gap:12px"><div id="studio-spinner" style="width:26px;height:26px;flex-shrink:0;border:3px solid var(--line,#8894a045);border-top-color:var(--accent,#2f4ae0);border-radius:50%;animation:studio-spin 1s linear infinite;display:none"></div><div style="flex:1;min-width:0"><div id="studio-phase" style="font-weight:650;font-size:14px">Ready to generate</div><div id="studio-message" class="viz-small viz-muted">Enter your prompt and press Generate sounds. No model runs until you click.</div></div><span id="studio-percent" class="viz-small viz-muted">0%</span></div><div style="height:7px;background:var(--panel-2,#90909025);border-radius:6px;overflow:hidden"><div id="studio-bar" style="height:100%;width:0%;background:var(--accent,#2f4ae0);border-radius:6px;transition:width .25s"></div></div><div id="studio-event-list" class="viz-small viz-muted" style="max-height:145px;overflow:auto;display:flex;flex-direction:column;gap:4px"></div><style>@keyframes studio-spin{to{transform:rotate(360deg)}}</style></div>'
    + '<div><div style="font-size:16px;font-weight:700;margin-bottom:9px">Generated sounds</div><div id="studio-results" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:10px"></div></div></div>';
  function el(id) { return root.querySelector('#studio-' + id); }
  var fieldIds = {prompt:'prompt',model:'model',count:'count',seconds:'seconds',seed:'seed',negative:'negative',steps:'steps',guidance:'guidance',model_id:'model-id',custom_family:'family'};
  Object.keys(fieldIds).forEach(function(k) {
    var e = el(fieldIds[k]); if (!e) return;
    e.value = state[k] == null ? '' : state[k];
    e.addEventListener('input', function() { state[k] = e.type === 'number' ? (e.value === '' ? '' : Number(e.value)) : e.value; persist(); if (k === 'model') syncModel(); });
    e.addEventListener('change', function() { state[k] = e.type === 'number' ? Number(e.value) : e.value; persist(); if (k === 'model') syncModel(); });
  });
  function persist(sync) { if (ctx.saveState) ctx.saveState({settings:state,soundHistory:history}, !!sync); }
  function rememberSound(item) {
    var key=String(item.run)+'|'+item.name;
    if(history.some(function(h){return String(h.run)+'|'+h.name===key;})) return;
    history.unshift(item);history=history.slice(0,80);
    persist(true);
  }
  function syncModel() {
    var custom = state.model === 'Other Diffusers repository';
    el('custom').style.display = custom ? 'flex' : 'none';
    var max = state.model === 'Stable Audio Open 1.0' || (custom && state.custom_family === 'Stable Audio') ? 47 : 10;
    el('seconds').max = String(max);
    if (+state.seconds > max) { state.seconds = max; el('seconds').value = String(max); persist(); }
  }
  syncModel();
  function updateActivity() {
    var inp = ctx.input('status') || {stream: []};
    var messages = (inp.stream || []).filter(function(it) { return it.channel === 'studio_status' && it.data && typeof it.data === 'object'; });
    var latest = messages.length ? messages[messages.length - 1].data : null;
    var active = !!(busy || (ctx.run && ctx.run.active));
    var phase = latest && latest.phase || (active ? 'starting' : 'idle');
    var pct = latest && Number.isFinite(Number(latest.percent)) ? Math.max(0,Math.min(100,+latest.percent)) : 0;
    if (active && !latest) pct = 1;
    var headings = {idle:'Ready to generate',preparing:'Preparing environment',loading:'Loading the audio model',model_ready:'Model ready',generating:'Generating audio',generated:'Variation completed',done:'Generation complete',starting:'Starting generation'};
    var failure = !active && ctx.run && ['failed','canceled','lost'].indexOf(ctx.run.status) >= 0;
    var done = !active && ctx.run && ctx.run.status === 'succeeded';
    el('spinner').style.display = active ? 'block' : 'none';
    el('phase').textContent = failure ? 'Generation stopped' : (headings[phase] || (done ? 'Finished' : 'Ready to generate'));
    el('message').textContent = failure ? 'Run ' + ctx.run.status + '. Check the run log for the error details.' : latest && latest.message ? latest.message : (active ? 'Waiting for the worker to report its progress…' : 'Enter your prompt and press Generate sounds. No model runs until you click.');
    el('bar').style.width = pct + '%';
    el('percent').textContent = String(Math.round(pct)) + '%';
    var hist = messages.slice(-7).reverse();
    el('event-list').replaceChildren();
    hist.forEach(function(it) { var item=document.createElement('div'); item.textContent='• '+(it.data.message||it.data.phase||'Update'); el('event-list').appendChild(item); });
  }
  function status() {
    var running = ctx.run && ctx.run.active;
    el('generate').disabled = !!(running || busy);
    el('run').textContent = ctx.run && ctx.run.id ? 'Run #' + ctx.run.id + ' · ' + (ctx.run.status || '') : 'Ready to generate';
    el('status').textContent = busy ? 'Starting generation…' : message || (running ? 'Generating — results will appear below.' : (ctx.run && ctx.run.status === 'failed' ? 'Last run failed — check its log.' : 'Ready.'));
    updateActivity();
  }
  function start() {
    if (busy || (ctx.run && ctx.run.active)) return;
    var prompt = String(state.prompt || '').trim();
    if (!prompt) { message = 'Please enter a sound description.'; el('prompt').focus(); status(); return; }
    if (state.model === 'Other Diffusers repository' && !String(state.model_id || '').trim()) { message = 'Enter a Hugging Face repository ID.'; el('model-id').focus(); status(); return; }
    var count = Math.floor(+state.count), seconds = +state.seconds, seed = Math.floor(+state.seed);
    var cap = state.model === 'Stable Audio Open 1.0' || (state.model === 'Other Diffusers repository' && state.custom_family === 'Stable Audio') ? 47 : 10;
    if (!Number.isFinite(count) || count < 1 || count > 100) { message = 'Variations must be between 1 and 100.'; status(); return; }
    if (!Number.isFinite(seconds) || seconds < 1 || seconds > cap) { message = 'Duration must be between 1 and ' + cap + ' seconds for this model.'; status(); return; }
    if (!Number.isFinite(seed) || seed < 0 || seed > 2147483647) { message = 'Seed must be between 0 and 2147483647.'; status(); return; }
    var settings = {prompt:prompt, model:state.model, count:count, seconds:seconds, seed:seed, negative:String(state.negative || ''), steps:Number(state.steps || 0), guidance:Number(state.guidance || 0)};
    if (state.model === 'Other Diffusers repository') { settings.model_id = String(state.model_id).trim(); settings.custom_family = state.custom_family; }
    persist(true); busy = true; message = ''; status();
    settings.start_from_view = true;
    var params = {generate:settings};
    ctx.run({params:params}).then(function() {busy = false; status();}, function(err) {busy = false; message = err && err.message ? err.message : 'Unable to start generation.'; status();});
  }
  el('generate').addEventListener('click', start);
  el('prompt').addEventListener('keydown',function(e) {if(e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {e.preventDefault();start();}});
  function showResults() {
    var port=ctx.input('sounds')||{files:[]}, files=(port.files||[]).filter(function(f){return /\.(wav|mp3|ogg|flac|m4a|webm)$/i.test(f.name||'');});
    var box=el('results');
    var liveRun=ctx.run&&ctx.run.id||null;
    // Never clear existing UI during a new run. Previous cards remain visible.
    if(!files.length&&!history.length&&!Object.keys(players).length){
      box.innerHTML='<div class="viz-tile viz-small viz-muted" style="padding:18px;grid-column:1/-1">No sounds yet. Enter a prompt and Generate sounds. Previous takes will remain below when you start another run.</div>';
    } else {
      var empty=box.querySelector('.viz-muted');if(empty&&empty.parentNode===box)empty.remove();
    }
    function timeFmt(s){return Math.floor((Number(s)||0)/60)+':'+String(Math.floor((Number(s)||0)%60)).padStart(2,'0');}
    function card(key, name, runId, url, file, stored){
      if(players[key])return players[key];
      var tile=document.createElement('div');tile.className='viz-tile';tile.style.cssText='padding:12px;display:flex;flex-direction:column;gap:9px;min-width:0';
      var title=document.createElement('div');title.style.cssText='display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap';
      var label=document.createElement('strong');label.textContent=name;label.style.cssText='font-size:13px;overflow-wrap:anywhere';
      var run=document.createElement('span');run.className='viz-small viz-muted';run.textContent='Run #'+runId;
      title.append(label,run);
      var audio=document.createElement('audio');audio.controls=true;audio.preload='metadata';audio.style.width='100%';
      var canvas=document.createElement('canvas');canvas.style.cssText='display:block;width:100%;height:76px;cursor:crosshair;border-radius:6px;background:var(--panel-2,#253448)';canvas.height=76;
      var timing=document.createElement('div');timing.className='viz-small viz-muted';timing.textContent='0:00 / 0:00';
      var btn=document.createElement('button');btn.type='button';btn.className='viz-btn primary';btn.style='align-self:start;padding:8px 12px';btn.textContent='↓ Download WAV';
      var note=document.createElement('div');note.className='viz-small viz-muted';note.textContent=stored?'Saved from previous run. Older file links may expire.':'Click anywhere on the waveform to seek.';
      tile.append(title,canvas,timing,audio,btn,note);
      box.appendChild(tile);
      var p={tile:tile,audio:audio,canvas:canvas,url:url,file:file,samples:null};
      players[key]=p;
      function paint(){
        if(!tile.isConnected)return;
        var w=Math.max(1,Math.round(canvas.clientWidth)),h=76,dpr=window.devicePixelRatio||1;
        if(canvas.width!==Math.round(w*dpr)||canvas.height!==Math.round(h*dpr)){canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);}
        var g=canvas.getContext('2d');g.setTransform(dpr,0,0,dpr,0,0);g.clearRect(0,0,w,h);
        var samples=p.samples;
        if(samples&&samples.length){
          g.strokeStyle='rgba(94,164,219,.9)';g.lineWidth=1;g.beginPath();
          for(var x=0;x<w;x++){
            var a=Math.floor(x*samples.length/w),b=Math.min(samples.length,Math.max(a+1,Math.ceil((x+1)*samples.length/w))),peak=0;
            for(var i=a;i<b;i++)peak=Math.max(peak,samples[i]);
            var hh=Math.max(1,peak*(h*.45));g.moveTo(x+.5,h/2-hh);g.lineTo(x+.5,h/2+hh);
          }
          g.stroke();
        } else {g.fillStyle='rgba(150,170,190,.2)';g.fillRect(0,h/2,w,1);}
        var duration=audio.duration,current=audio.currentTime||0;
        if(Number.isFinite(duration)&&duration>0){
          var x=Math.max(0,Math.min(w,(current/duration)*w));
          g.fillStyle='rgba(65,150,240,.13)';g.fillRect(0,0,x,h);
          g.strokeStyle='#2f8dea';g.lineWidth=2;g.beginPath();g.moveTo(x,0);g.lineTo(x,h);g.stroke();
        }
        timing.textContent=timeFmt(current)+' / '+timeFmt(duration);
      }
      p.paint=paint;
      function decodeBuffer(buf){
        var AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
        var ac=new AC();
        ac.decodeAudioData(buf.slice(0)).then(function(decoded){
          var src=decoded.getChannelData(0),step=Math.max(1,Math.ceil(src.length/6000)),peaks=new Float32Array(Math.ceil(src.length/step));
          for(var k=0;k<peaks.length;k++){var top=0;for(var j=k*step;j<Math.min(src.length,(k+1)*step);j++)top=Math.max(top,Math.abs(src[j]));peaks[k]=top;}
          p.samples=peaks;paint();
        }).catch(function(){}).finally(function(){ac.close().catch(function(){});});
      }
      function useUrl(u){
        p.url=u;audio.src=u;
        paint();
        if(file){rememberSound({run:runId,name:name,url:u,recorded:new Date().toISOString()});}
      }
      if(url)useUrl(url);
      else if(file){ctx.files.url(file).then(useUrl).catch(function(){note.textContent='File link unavailable in this run.';});}
      if(file){ctx.files.buffer(file).then(decodeBuffer).catch(function(){note.textContent='Waveform unavailable; playback and download may still work.';});}
      // Old-file links are retained by saveState; the runtime currently offers no old-run file object binding.
      btn.onclick=function(){
        if(file){
          btn.disabled=true;btn.textContent='Preparing WAV…';
          ctx.files.buffer(file).then(function(buffer){
            var objectUrl=URL.createObjectURL(new Blob([buffer],{type:'audio/wav'}));
            var a=document.createElement('a');a.href=objectUrl;a.download=name;document.body.appendChild(a);a.click();a.remove();
            setTimeout(function(){URL.revokeObjectURL(objectUrl);},15000);
          }).catch(function(){
            if(p.url){var a=document.createElement('a');a.href=p.url;a.download=name;a.target='_blank';a.rel='noopener';document.body.appendChild(a);a.click();a.remove();}
          }).finally(function(){btn.disabled=false;btn.textContent='↓ Download WAV';});
        } else if(p.url){
          var a=document.createElement('a');a.href=p.url;a.download=name;a.target='_blank';a.rel='noopener';document.body.appendChild(a);a.click();a.remove();
        }
      };
      canvas.addEventListener('pointerdown',function(e){
        var r=canvas.getBoundingClientRect();
        if(Number.isFinite(audio.duration)&&audio.duration>0&&r.width>0){audio.currentTime=Math.max(0,Math.min(audio.duration,(e.clientX-r.left)/r.width*audio.duration));paint();}
      });
      audio.addEventListener('timeupdate',paint);audio.addEventListener('seeked',paint);audio.addEventListener('loadedmetadata',paint);
      audio.addEventListener('play',function(){Object.keys(players).forEach(function(k){if(k!==key&&!players[k].audio.paused)players[k].audio.pause();});});
      audio.addEventListener('error',function(){note.textContent='The audio link could not be loaded. Older run links may have expired; use Results to retrieve the file.';});
      paint();
      return p;
    }
    // Restore old takes first; they remain visible alongside incoming files.
    history.slice().reverse().forEach(function(h){if(h&&h.name&&h.url)card('history:'+h.run+':'+h.name,h.name,h.run,h.url,null,true);});
    files.forEach(function(f,i){
      var name=f.name||('sound_'+(i+1)+'.wav');
      var key='history:'+liveRun+':'+name;
      var p=card(key,name,liveRun,null,f,false);
      // A history card may already exist after a remount: bind current-file access back to it.
      if(p&&!p.file){p.file=f;ctx.files.buffer(f).then(function(buf){
        // A temporary blob is used for playback so it remains available while this view is open.
        var u=URL.createObjectURL(new Blob([buf],{type:'audio/wav'}));p.audio.src=u;
      }).catch(function(){});}
    });
  }
  ctx.on('update',function(){status();showResults();});
  ctx.on('run',function(){message='';status();showResults();});
  status();showResults();
}