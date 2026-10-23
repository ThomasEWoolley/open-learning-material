# Math Bio Surfers

A mathematical biology revision game adapted from [Oliver Maclaren’s Gradient Surfers](https://github.com/omaclaren/open-learning-material/tree/master/docs/engsci-205/2026/gradient-surfers).

The question bank follows Thomas E. Woolley’s *Mathematical Biology* course notes, dated 16 October 2025, based on notes by Prof. Eamonn A. Gaffney. The LaTeX chapters in `Dropbox/Math_bio_course/Latex` were checked against the supplied full PDF. The original course PDF and LaTeX files are not redistributed here.

| Level | Chapter | Content |
| --- | --- | --- |
| 1 | 2: Things you have forgotten | Mass action, scales, stability, curves and phase planes |
| 2 | 3: Population modelling | Growth, budworm, SIR, maps and periodic orbits |
| 3 | 4: Spatial systems | Diffusion, taxis, boundaries and Fisher waves |
| 4 | 5: Pattern Formation | French flag gradients, Turing conditions, modes and Schnakenberg kinetics |

Chapter 1 appears as an introduction in the menu. The appendices support the stability content within the levels. All levels are available immediately.

## Play

Open `index.html` in a modern browser, or serve this folder with `python3 -m http.server 8000`. There are no runtime package dependencies, external fonts, analytics or accounts. The online game loads the current `questions.json` from the same folder on each page load, with validation and browser caching bypassed. A downloaded HTML copy runs offline using its embedded bank. If an online bank cannot be loaded or is invalid, a visible message explains that the embedded backup is being used.

Runner mode preserves the original three-lane engine: use left/right arrows or a sideways swipe to change lane, and up/Space or an upward swipe to jump low barriers. Question gates pause the game. Obstacles carry common mathematical misconceptions; procedural challenges ask for steps in order. A wrong answer, collision or misplaced step costs a life.

Study mode presents the same multiple-choice bank without movement, time pressure or lost lives. All feedback includes a section reference. Each full session has 12 distinct questions sampled across the three difficulty categories. Complete a level with at least 75% accuracy, normally 9 out of 12. A runner session can end earlier if its three lives run out. An early exit does not earn a badge.

Chapter completion and best accuracy persist in browser local storage. A score measures game performance; the completion badge uses question accuracy. Runner and study scores are labelled by mode. Progress is local to the browser and device, can disappear if storage is cleared, and is not a formal assessment record.

Blue/orange feedback includes explicit correct/incorrect text. Chapter cards have numbered labels. Controls support keyboard use, touch and reduced-motion preferences; study mode removes the moving game interaction. Sound is off by default. Full screen-reader access to the moving canvas is not claimed.

## Edit questions

Open the [question editor](https://thomaswoolley.co.uk/open-learning-material/math-bio-surfers/editor.html), also linked from the game menu. You can edit questions, their three answers, the correct answer, explanations, chapter, difficulty and source references. You can add, duplicate and delete items, preview answer feedback, and edit ordered procedures and misconception obstacles. Deletions can be undone. Drafts are saved locally in the browser, with a warning if a saved draft predates changes to the published bank.

To update the online game:

1. Make your changes in the editor and select **Download questions.json**.
2. Use **Upload questions to GitHub** in the editor. Upload the downloaded file into `docs/math-bio-surfers/` with the exact name `questions.json`, replacing the existing file.
3. Select **Commit changes** in GitHub. Wait for the Pages deployment to complete, then refresh the game.

Only `questions.json` needs uploading for teaching-content changes. No code editing, credentials in the editor or Python build is required. The editor never writes to GitHub itself; publishing uses GitHub's normal authentication and repository permissions. Anyone can try local edits in the editor, while only authorised GitHub users can commit them. Import a downloaded bank to resume work on another device. Back up drafts by downloading them before clearing browser storage.

The **Download updated game** button also produces a standalone HTML game containing the edited bank, ready to play offline. The shared `bank-tools.js` validator checks answers, references, identifiers and the minimum content needed for a complete session. Keep at least 12 questions, one procedure and one misconception per chapter. Normal Unicode mathematical text is supported; LaTeX commands are displayed as text.

For source-code changes, or to refresh the embedded backup after editing `questions.json`, run:

```bash
python3 build.py
```

Commit the authoring files and generated `index.html` after source changes. Question entries specify `level`, `section`, `difficulty` (1 recall, 2 application, 3 reasoning), `prompt`, three `options`, a zero-based `answer`, `why`, and `source`. Option order is shuffled in play. `game.template.html` contains the HTML, styling and adapted engine. `build.py` embeds the bank and validator. The original embedded backup remains available if only the live JSON has been updated.

The bank has 96 questions, 12 ordered procedures and 16 misconception obstacles. See [CONTENT_REVIEW.md](CONTENT_REVIEW.md) for coverage and points where the game clarifies errors or shorthand in the notes.

## Add to the GitHub fork

Place this folder at `docs/math-bio-surfers/` in the fork of `omaclaren/open-learning-material`. This preserves the original game and the other course material. With GitHub Pages configured to serve the `docs` folder on the default branch, the game URL ends in `/open-learning-material/math-bio-surfers/`. Existing hosting settings need checking before making any changes.

`UPSTREAM.json` records the source file and blob SHA used for the adaptation. The original engine is MIT-licensed. Preserve `LICENSE` and the attribution when redistributing. No separate rights to redistribute the full course notes are implied.

## Validation

`build.py` checks bank structure, unique identifiers, valid answers and chapter coverage. `test.cjs` exercises complete study sessions, wrong-answer feedback, badges, persistence, chapter isolation, runner controls and procedural challenges using jsdom with a stubbed canvas at desktop and mobile dimensions. These are DOM and engine checks, not a pixel-layout or live-browser assessment. To run them, install the development-only package with `npm install --no-save jsdom`, then run `node test.cjs`. `python3 test_math.py` independently checks map multipliers, the morphogen profile, SIR thresholds and peak, Fisher speed and Turing examples. These checks do not replace a lecturer’s final review of the teaching content. See [VALIDATION.md](VALIDATION.md) for the checks actually completed.

`node test_editor.cjs` checks question editing, validation, safe HTML/JSON exports, adding/duplicating/deleting/undoing, previews, procedure ordering, local drafts, stale-draft warnings and imports. `node test_bank_loading.cjs` checks current-bank loading, validation failures, network failures and offline behaviour.

Adaptation prepared with ChatGPT for Thomas E. Woolley.

