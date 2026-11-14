# Text to Sound Studio

Prompt-first sound generation: select model and settings and start a new run directly from the View, with live progress.

Prompt, model and settings, a Generate sounds button that starts a run with those settings, and the live progress of the generator (connect its telemetry to Live generation progress). The generated takes are shown in a separate player panel.

An [EsaSim](https://esacode.com/) blueprint block: a view that draws in the browser, in JavaScript (`frontend.js`, `function render(ctx)`).

| | |
|---|---|
| Block | `ws-text-to-sound-studio` · version 5 |
| Workspace | Gianluca De Novi's workspace |
| Author | Gianluca De Novi |

## Inputs

| Port | Type | Description |
|---|---|---|
| `status` Live generation progress | Live telemetry | Connect the generator telemetry to display stages and progress while it works. Optional. |

## Use it in EsaSim

In a workspace, open **Projects > Blocks > New block**, choose this kind of block, copy the ports and settings above and paste the code; or ask an AI assistant connected to EsaSim (MCP) to create it from this folder.
