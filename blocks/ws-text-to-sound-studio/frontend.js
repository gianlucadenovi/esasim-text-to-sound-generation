// ── EsaSim block ──────────────────────────────────────────────────────
// Text to Sound Studio (ws-text-to-sound-studio) · version 5 · view, JavaScript: function render(ctx)
// Prompt-first sound generation: select model and settings and start a new run directly from the View, with live progress.
// Workspace: Gianluca De Novi's workspace · Author: Gianluca De Novi
// Saved: 2026-11-14
//
// Inputs   ctx.input("id") gives { files, stream }; ctx.rows("id"), ctx.json("id"), ctx.text("id")
//   status      Live telemetry            Live generation progress · optional · Connect the generator telemetry to display stages and progress while it works.
// Settings ctx.params.key
//   (none)
// EsaSim rewrites these lines from the block's definition each time it is saved: change the definition, not them.
// ── end of EsaSim block header ────────────────────────────────────────

function render(ctx) {
  var defaults = { prompt: "A sudden powerful thunderclap directly overhead, followed by a long low rolling rumble that slowly fades into a quiet rainstorm. Photorealistic field recording, no music, no voices.", model: "AudioLDM 2", model_id: "", custom_family: "AudioLDM 2", count: 4, seconds: 8, seed: 1, negative: "low quality, distorted, speech, music", steps: 0, guidance: 0 };
  var saved = (ctx.state && ctx.state.settings) || {};
  var state = Object.assign({}, defaults, saved);
  var busy = false, message = "";
  var root = ctx.el;
  root.innerHTML = '<div class="viz-pad" style="display:flex;flex-direction:column;gap:14px;padding:14px;box-sizing:border-box">'
    + '<div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap"><div><div style="font-size:21px;font-weight:750;letter-spacing:-.03em">Sound Studio</div><div class="viz-small viz-muted">Describe a sound and generate variations. Listen to and download the takes in panel 2.</div></div><span class="viz-small viz-muted" id="studio-run"></span></div>'
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
    + '</div>';
  function el(id) { return root.querySelector('#studio-' + id); }
  var fieldIds = {prompt:'prompt',model:'model',count:'count',seconds:'seconds',seed:'seed',negative:'negative',steps:'steps',guidance:'guidance',model_id:'model-id',custom_family:'family'};
  Object.keys(fieldIds).forEach(function(k) {
    var e = el(fieldIds[k]); if (!e) return;
    e.value = state[k] == null ? '' : state[k];
    e.addEventListener('input', function() { state[k] = e.type === 'number' ? (e.value === '' ? '' : Number(e.value)) : e.value; persist(); if (k === 'model') syncModel(); });
    e.addEventListener('change', function() { state[k] = e.type === 'number' ? Number(e.value) : e.value; persist(); if (k === 'model') syncModel(); });
  });
  function persist(sync) { if (ctx.saveState) ctx.saveState({settings:state}, !!sync); }
  function syncModel() {
    var custom = state.model === 'Other Diffusers repository';
    el('custom').style.display = custom ? 'flex' : 'none';
    var max = state.model === 'Stable Audio Open 1.0' || (custom && state.custom_family === 'Stable Audio') ? 47 : 10;
    el('seconds').max = String(max);
    if (+state.seconds > max) { state.seconds = max; el('seconds').value = String(max); persist(); }
    showAuthHelp();
  }
  var authHelp = document.createElement('div');
  authHelp.className = 'viz-small viz-muted';
  authHelp.style.cssText = 'display:none;padding:9px 11px;border:1px solid var(--line,#aab4c5);border-radius:8px';
  authHelp.textContent = 'Stable Audio Open is gated: open huggingface.co/stabilityai/stable-audio-open-1.0, accept the model terms, then save your Hugging Face token in your EsaSim profile (Profile > Keys) or in the generator block\'s Hugging Face token setting. Tokens cannot be entered through this View.';
  el('generate').parentNode.parentNode.appendChild(authHelp);
  function showAuthHelp() { authHelp.style.display = state.model === 'Stable Audio Open 1.0' ? 'block' : 'none'; }
  syncModel();
  function updateActivity() {
    var inp = ctx.input('status') || {stream: []};
    var messages = (inp.stream || []).filter(function(it) { return it.channel === 'studio_status' && it.data && typeof it.data === 'object'; });
    var latest = messages.length ? messages[messages.length - 1].data : null;
    var active = !!(busy || (ctx.run && ctx.run.active));
    var phase = latest && latest.phase || (active ? 'starting' : 'idle');
    var pct = latest && Number.isFinite(Number(latest.percent)) ? Math.max(0, Math.min(100, +latest.percent)) : 0;
    if (active && !latest) pct = 1;
    var headings = {auth_required:'Hugging Face access required',idle:'Ready to generate',preparing:'Preparing environment',loading:'Loading the audio model',model_ready:'Model ready',generating:'Generating audio',generated:'Variation completed',done:'Generation complete — listen in panel 2',starting:'Starting generation'};
    var failure = !active && ctx.run && ['failed','canceled','lost'].indexOf(ctx.run.status) >= 0;
    var done = !active && ctx.run && ctx.run.status === 'succeeded';
    el('spinner').style.display = active ? 'block' : 'none';
    el('phase').textContent = phase === 'auth_required' ? 'Hugging Face access required' : failure ? 'Generation stopped' : (headings[phase] || (done ? 'Finished' : 'Ready to generate'));
    el('message').textContent = phase === 'auth_required' ? (latest.message || 'Accept the model terms and save your Hugging Face token.') : failure ? 'Run ' + ctx.run.status + '. Check the run log for the error details.' : latest && latest.message ? latest.message : (active ? 'Waiting for the worker to report its progress…' : 'Enter your prompt and press Generate sounds. No model runs until you click.');
    el('bar').style.width = pct + '%';
    el('percent').textContent = String(Math.round(pct)) + '%';
    var hist = messages.filter(function(it) { return !it.data.heartbeat; }).slice(-7).reverse();
    el('event-list').replaceChildren();
    hist.forEach(function(it) { var item = document.createElement('div'); item.textContent = '• ' + (it.data.message || it.data.phase || 'Update'); el('event-list').appendChild(item); });
  }
  function status() {
    var running = ctx.run && ctx.run.active;
    el('generate').disabled = !!(running || busy);
    el('run').textContent = ctx.run && ctx.run.id ? 'Run #' + ctx.run.id + ' · ' + (ctx.run.status || '') : 'Ready to generate';
    el('status').textContent = busy ? 'Starting generation…' : message || (running ? 'Generating — the takes appear in panel 2.' : (ctx.run && ctx.run.status === 'failed' ? 'Last run failed — check its log.' : 'Ready.'));
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
    ctx.run({params:{generate:settings}}).then(function() { busy = false; status(); }, function(err) { busy = false; message = err && err.message ? err.message : 'Unable to start generation.'; status(); });
  }
  el('generate').addEventListener('click', start);
  el('prompt').addEventListener('keydown', function(e) { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); start(); } });
  ctx.on('update', status);
  ctx.on('run', function() { message = ''; status(); });
  status();
}
