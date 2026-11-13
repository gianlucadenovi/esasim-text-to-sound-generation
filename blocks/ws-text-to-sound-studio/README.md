# Text to Sound Studio

Prompt-first sound generation: select model and settings, start a new run directly from the View and play every generated WAV.

Use in the Text to Sound Generation project. Wire the sound generator's WAV output to the sounds input. Generate starts a flow run with per-run settings sent to the generator node named generate. Shows independent players for each completed WAV, a download link, and run status. Requires run permission.

An [EsaSim](https://esacode.com/) blueprint block: a view that draws in the browser, in JavaScript (`frontend.js`, `function render(ctx)`).

| | |
|---|---|
| Block | `ws-text-to-sound-studio` · version 1 |
| Workspace | Gianluca De Novi's workspace |
| Author | Gianluca De Novi |

## Inputs

| Port | Type | Description |
|---|---|---|
| `sounds` Generated audio | Files (wav, mp3, ogg, flac, m4a, webm) | Several connections. Optional. |

## Use it in EsaSim

In a workspace, open **Projects > Blocks > New block**, choose this kind of block, copy the ports and settings above and paste the code; or ask an AI assistant connected to EsaSim (MCP) to create it from this folder.
