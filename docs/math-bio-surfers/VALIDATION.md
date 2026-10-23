# Validation, 23 October 2026

The following checks were completed on the generated `index.html` and the editable question bank.

- Bank validation: 96 questions, 24 per chapter; 12 ordered procedures; 16 misconception obstacles. All entries have section references and valid options or ordered steps.
- JavaScript syntax check: passed.
- DOM and engine checks with jsdom: 1,258 assertions passed. These cover four complete perfect study sessions, 8/12 versus 9/12 completion thresholds, preservation of earned badges after poorer runs, stored progress on reload, chapter isolation, distinct questions and difficulty balance over 200 sampled sessions, double-answer prevention, early exits, mistake review, runner steering and jumping, pause/resume, ordered procedures, collisions, three-life defeat, unavailable local storage, and execution of drawing functions with a stubbed canvas at mobile dimensions.
- Independent mathematical checks: map fixed points and cycle multipliers checked by finite differences; diffusion–decay profile checked against the PDE and both boundary conditions; Schnakenberg derivatives and determinant checked numerically; diffusion-dependent determinant checked by direct matrix expansion; SIR peak compared with direct time integration; SIR threshold and Fisher minimum speed checked numerically.

## Live publication and browser checks

GitHub Pages was enabled on 23 October 2026, serving `/docs` from `master`, with HTTPS enforced. The initial build and deployment succeeded. The GitHub Pages address redirects through the account’s existing custom domain to https://thomaswoolley.co.uk/open-learning-material/math-bio-surfers/.

The live game was checked in desktop Chrome: chapter selection, study mode, a correct answer, an incorrect answer and explanatory feedback, progression to the next question, early exit, score and mistake review, return to the chapter menu, runner start, left steering, jump input and pause. The chapter menu, question panel and paused runner were inspected visually. These checks supplement the automated DOM and mathematical checks above.

A complete 12-question session has been exercised in the automated DOM tests, but was not repeated manually in the live browser. Mobile pixel layout, touch interaction, all procedural challenges and full assistive-technology compatibility have not been assessed in a live browser.

The checks are development checks for a revision aid. Question wording, distractors and course coverage should receive a final lecturer review before student use.

## Question editor and live question-bank loading

The editor adds 50 passing DOM checks covering changes to wording, answers and explanations; choosing the correct answer; preview feedback; adding and duplicating items with unique identifiers; deletion and undo without losing later edits; procedural-step ordering; misconception feedback; safe JSON and standalone HTML exports; draft restoration and warnings about newer published content; invalid imports; minimum chapter sizes; and recovery from a failed initial fetch through file import.

The live-bank loader adds 27 passing checks covering server content replacing the embedded bank, updated chapter counts, bypassing browser caching, disabling start while loading, and visible playable backup behaviour after invalid content, HTTP errors, network failure or malformed JSON. Downloaded offline games do not fetch a remote bank. The original 1,258 session checks and 50 independent mathematical checks continue to pass.

