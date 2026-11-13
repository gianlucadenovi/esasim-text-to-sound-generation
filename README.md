<div align="center">

# Text to Sound Generation

**Describe a sound. Generate as many variations as you want. Listen to every take, compare the waveforms, and keep the WAV files.**

Turn one natural-language prompt into a collection of original sound effects using open audio diffusion models from Hugging Face. Choose a model, set the length and number of variations, and run everything on your own EsaSim worker. Each generated clip has its **own playback control**, with a waveform view and a complete record of the prompt, model, seed and generation time.

![type](https://img.shields.io/badge/type-Generative%20Audio-blue) ![language](https://img.shields.io/badge/language-Python-3776AB) ![runs on](https://img.shields.io/badge/runs%20on-NVIDIA%20%7C%20CPU-6f42c1) ![models](https://img.shields.io/badge/models-Hugging%20Face-ffcc4d) ![output](https://img.shields.io/badge/output-WAV%20%7C%20CSV%20%7C%20JSON-178c8c) [![made with](https://img.shields.io/badge/made%20with-EsaSim-0b7285)](https://esacode.com/)

</div>

## Overview

Imagine you need the sound of **thunder rolling across a valley**, **a heavy metal door closing**, **footsteps through deep snow**, or **rain on the roof of a moving car**. Instead of hunting through a sound library, describe the scene in your own words.

An audio diffusion model starts with noise and shapes it into a waveform guided by your description. The random **seed** determines the starting noise: use different seeds for different takes of the same idea, or reuse a seed to help reproduce a particular result with the same model and settings.

**One prompt → N seeded variations → individual WAV files → players, waveforms and a results table.**

**The Sound Studio View is the control panel:** enter your prompt, choose the model and settings, and press **Generate sounds** directly in the View. You do not need to edit the Blueprint or press Run separately; the View starts a new run with your chosen settings. A new run can be started when the previous one is no longer active.

**Run behavior:** A normal Blueprint **Run** does **not** start audio inference. Only clicking **Generate sounds** in Sound Studio starts a generation run. While the worker loads the model and generates each variation, the View displays an animated waiting indicator, current stage, percentage and recent progress messages. A queued run shows a waiting state until a worker starts.

The model downloads from Hugging Face to the selected worker's local cache on first use and can be reused on later runs. Inference runs on the selected worker, rather than through a hosted sound-generation API. The model download and resulting artifacts still use the configured network connections and EsaSim result storage.

## The flow

### 1 · Generate and review sounds

[**Open the blueprint →**](https://esacode.com/app/projects/17/flows/57)

| Block | What it does |
|---|---|
| **Sound Studio · Prompt and Generate** | In the View, write a prompt, pick the model, duration, variations and seed, and press **Generate sounds** to start a new run. It also displays individual audio players and WAV download links. |
| **Generate sound variations** | Runs the selected model with the settings supplied by the Sound Studio and produces separate seeded WAV takes. |
| **Listen to every variation** | Displays an individual browser audio player for every generated file, each with playback and seeking controls. |
| **Inspect audio waveforms** | Explore the sound signals visually, with zoom, scroll and playback. |
| **Generation details** | Compare variation number, seed, model, duration, sample rate, machine and time spent generating each take. |

The results view is designed for comparing different takes of the **same sound**, rather than just previewing one file at a time. The files appear in the views when available to the run; the generator logs progress as it works through the variations.

## The models

| Model | Hugging Face repository | Clip length | Best for |
|---|---|---|---|
| **AudioLDM 2** · default | [cvssp/audioldm2](https://huggingface.co/cvssp/audioldm2) | Up to 10 s | General-purpose sound effects and a good starting point |
| **AudioLDM 2 Large** | [cvssp/audioldm2-large](https://huggingface.co/cvssp/audioldm2-large) | Up to 10 s | Trying the larger AudioLDM 2 variant |
| **AudioLDM** | [cvssp/audioldm](https://huggingface.co/cvssp/audioldm) | Up to 10 s | Exploring the original AudioLDM family |
| **Stable Audio Open 1.0** | [stabilityai/stable-audio-open-1.0](https://huggingface.co/stabilityai/stable-audio-open-1.0) | Up to 47 s | Longer sound effects and texture generation |
| **Other Diffusers repository** | Your model ID | Model-dependent | A compatible custom AudioLDM, AudioLDM 2 or Stable Audio pipeline |

**Default demo:** AudioLDM 2 generates **4 different 8-second thunderstorm takes**, from seeds 1–4. Change the prompt to any sound you want.

Model availability, generated quality, memory requirements and use rights depend on the selected repository and installed software. Some repositories require accepting their terms and authenticating with a Hugging Face access token.

## Where it runs

- **NVIDIA GPU:** recommended for generation. The block uses CUDA when PyTorch detects a compatible NVIDIA GPU, with half-precision model weights.
- **CPU:** supported for experimentation, but substantially slower, especially with larger models or longer clips.
- **Model cache:** the first run downloads model weights to the worker's cache. Repeated runs with the same model can reuse the download.
- **Tenstorrent / AMD / Intel:** not currently implemented as acceleration backends in this audio block. The current code supports CUDA or CPU execution.

Make sure the machine has enough free memory and disk space for the selected audio model and its dependencies.

## What you need

1. An EsaSim worker available to this project under **Compute**; preferably one with an NVIDIA GPU.
2. Internet access to Hugging Face for the first download of the chosen model.
3. Python and the audio-generation dependencies, including **PyTorch**, **Diffusers**, **NumPy** and **SoundFile**. The worker handles package provisioning where supported.
4. For gated models, accept the terms on the model's Hugging Face page and supply an access token in the generator block's **Hugging Face access token** secret field.

No external sound-generation API is needed for local model inference. Be sure to review the individual model card and license before commercial distribution.

## How to run it

1. Under **Compute**, make sure an eligible machine is available for the project. The first generation may download the model from Hugging Face.
2. Open [**1 · Generate and review sounds**](https://esacode.com/app/projects/17/flows/57) and switch to **View**. Find the **Sound Studio** panel.
3. Type a prompt describing your sound. Select the model, number of variations, duration and seed; use **Advanced generation settings** if needed.
4. Click **Generate sounds** (or press **Ctrl+Enter** in the prompt). The View starts a new flow run using these settings for that run only; **no Blueprint edits or separate Run click are required**.
5. Watch its run status. When the outputs are available, listen to each take using its independent audio player and download the WAV. The waveform and details panels remain available for further comparison.
6. To try a different sound, edit the prompt and generate again once the current run finishes.

**Note:** A run must not already be active when you press Generate. The View's Generate button needs project runner permission. Authenticated/gated models may require a Hugging Face token set in the generator block's secret field; secrets cannot be passed as per-run View settings.

## Settings worth knowing

| Setting | Meaning |
|---|---|
| **Model** | Choose a preset or **Other Diffusers repository** with its model ID and pipeline family. |
| **Sound description** | Describe the source, action, space, intensity and how the sound changes over time. |
| **Number of variations** | 1–100 separate takes from the same prompt. |
| **Duration per clip** | Requested duration: 1–47 seconds; AudioLDM variants cap this at 10 seconds. |
| **First random seed** | Variation 1 starts with this seed, variation 2 uses the next, and so on. Set to **0** to pick a new random starting seed. |
| **Inference steps** | 0 uses the block's automatic default; more steps usually cost more computation. |
| **Guidance** | 0 uses the model-family default; higher values increase prompt guidance but do not guarantee better sound. |
| **Negative prompt** | Describes unwanted elements; the default is **speech, music**. |
| **Hugging Face access token** | A secret used for repositories requiring authentication or accepted access terms. |

For better results, describe not only *what* the sound is, but also its **onset**, **texture**, **environment**, **movement** and **decay**. A specific acoustic scene generally provides more useful guidance than a one-word prompt.

## What you get

Each run produces:

- **Individual 16-bit PCM WAV files**, named like `sound_01_seed1.wav`, `sound_02_seed2.wav`, and so on. Each one has its own playback widget.
- **Waveform visualization**, for inspecting and playing the generated sounds.
- **`sounds.csv`**, one row per variation, including its filename, seed, prompt, repository, duration, sample rate, generation time and execution device.
- **`generation.json`**, recording the model, requested count, seeds, timing, generation settings and output manifest.
- **Progress and run logs**, useful for monitoring downloads, generation and troubleshooting.

A repeated seed with the same settings can support reproducibility, although exact audio may depend on hardware, model and library versions.

## Models, licensing and responsible use

The model weights are provided by their respective publishers on Hugging Face. **Openly available weights do not necessarily mean unrestricted commercial use.** Review the current model card and license of the chosen repository, especially for Stable Audio Open and any custom model. Avoid generating deceptive audio intended to impersonate a real person's voice.

The example has been **created and published in EsaSim**, and the blueprint currently passes structural validation. A full audio-generation run has **not yet been executed or verified**; successful loading, inference and playback depend on the chosen machine, model access and runtime dependencies.

---

<sub>Built with EsaSim · Open-model audio generation · Local compute · Reproducible experiments</sub>

<!-- esasim: files of the project -->

---

An [EsaSim](https://esacode.com/) project of the workspace Gianluca De Novi's workspace (generative-audio).

### Blueprints in this repository

- [1 · Generate and review sounds](blueprints/1-generate-and-review-sounds.json) · 5 blocks · version 5

### Workspace blocks it uses

- [Text to Sound Studio](blocks/ws-text-to-sound-studio) · version 2
- [Text to sound effects](blocks/ws-text-to-sound-effects) · version 4

Keys pasted in blocks (secret settings) are not saved here. Datasets, results and the team stay in EsaSim.
