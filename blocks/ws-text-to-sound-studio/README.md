# Text to Sound Studio

Prompt-first sound generation: select model and settings, start a new run directly from the View and play every generated WAV.

Enter the prompt and select model, variation count, duration and seed. Press Generate sounds to start inference; normal Blueprint runs remain idle. The progress area displays animated waiting indicator, stage messages and percent from the generator's studio_status telemetry. WAV files appear in independent audio players.

An [EsaSim](https://esacode.com/) blueprint block: a view that draws in the browser, in JavaScript (`frontend.js`, `function render(ctx)`).

| | |
|---|---|
| Block | `ws-text-to-sound-studio` · version 2 |
| Workspace | Gianluca De Novi's workspace |
| Author | Gianluca De Novi |

## Inputs

| Port | Type | Description |
|---|---|---|
| `sounds` Generated audio | Files (wav, mp3, ogg, flac, m4a, webm) | Several connections. Optional. |
| `status` Live generation progress | Live telemetry | Connect the generator telemetry to display stages and progress while it works. Optional. |

## Use it in EsaSim

In a workspace, open **Projects > Blocks > New block**, choose this kind of block, copy the ports and settings above and paste the code; or ask an AI assistant connected to EsaSim (MCP) to create it from this folder.
