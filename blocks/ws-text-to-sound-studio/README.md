# Text to Sound Studio

Prompt-first sound generation: select model and settings, start a new run directly from the View and play every generated WAV.

Prompt-first sound generation. Sound gallery preserves previous runs using view state and saved playback links, displays individual WAV players, synchronized waveform playback cursors, click-to-seek and download buttons. Note: older temporary links can expire; durable archiving needs dataset integration.

An [EsaSim](https://esacode.com/) blueprint block: a view that draws in the browser, in JavaScript (`frontend.js`, `function render(ctx)`).

| | |
|---|---|
| Block | `ws-text-to-sound-studio` · version 3 |
| Workspace | Gianluca De Novi's workspace |
| Author | Gianluca De Novi |

## Inputs

| Port | Type | Description |
|---|---|---|
| `sounds` Generated audio | Files (wav, mp3, ogg, flac, m4a, webm) | Several connections. Optional. |
| `status` Live generation progress | Live telemetry | Connect the generator telemetry to display stages and progress while it works. Optional. |

## Use it in EsaSim

In a workspace, open **Projects > Blocks > New block**, choose this kind of block, copy the ports and settings above and paste the code; or ask an AI assistant connected to EsaSim (MCP) to create it from this folder.
