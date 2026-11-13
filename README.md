# Text to Sound Generation

Generate sound effects from one prompt using an open Hugging Face audio diffusion model. Set the number of variations, duration and optional seed, then run the generation blueprint.

## How to run
1. Open **1 · Generate and review sounds**.
2. Select AudioLDM, AudioLDM 2, AudioLDM 2 Large, Stable Audio Open 1.0, or a compatible custom Diffusers audio repository.
3. Enter the prompt and number of variations (1–100). Adjust clip duration, seed, inference steps and guidance as needed.
4. Run the flow on an available CPU or NVIDIA GPU machine (GPU recommended).
5. Use the **Listen to variations** panel: each generated WAV has its own audio player. Review waveforms and generation details below.

Stable Audio Open may require accepting the Hugging Face model terms and entering an access token in the generator block's secret field. AudioLDM-family models are limited to around 10 seconds per clip. Review model licenses before commercial use.

Outputs: one WAV per variation, a generation CSV, and a JSON manifest. Random seeds make runs reproducible.

<!-- esasim: files of the project -->

---

An [EsaSim](https://esacode.com/) project of the workspace Gianluca De Novi's workspace (generative-audio).

### Blueprints in this repository

- [1 · Generate and review sounds](blueprints/1-generate-and-review-sounds.json) · 4 blocks · version 1

### Workspace blocks it uses

- [Text to sound effects](blocks/ws-text-to-sound-effects) · version 1

Keys pasted in blocks (secret settings) are not saved here. Datasets, results and the team stay in EsaSim.
