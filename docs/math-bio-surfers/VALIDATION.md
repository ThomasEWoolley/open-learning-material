# Validation, 23 October 2026

The following checks were completed on the generated `index.html` and the editable question bank.

- Bank validation: 96 questions, 24 per chapter; 12 ordered procedures; 16 misconception obstacles. All entries have section references and valid options or ordered steps.
- JavaScript syntax check: passed.
- DOM and engine checks with jsdom: 1,258 assertions passed. These cover four complete perfect study sessions, 8/12 versus 9/12 completion thresholds, preservation of earned badges after poorer runs, stored progress on reload, chapter isolation, distinct questions and difficulty balance over 200 sampled sessions, double-answer prevention, early exits, mistake review, runner steering and jumping, pause/resume, ordered procedures, collisions, three-life defeat, unavailable local storage, and execution of drawing functions with a stubbed canvas at mobile dimensions.
- Independent mathematical checks: map fixed points and cycle multipliers checked by finite differences; diffusion–decay profile checked against the PDE and both boundary conditions; Schnakenberg derivatives and determinant checked numerically; diffusion-dependent determinant checked by direct matrix expansion; SIR peak compared with direct time integration; SIR threshold and Fisher minimum speed checked numerically.

Live browser testing and a visual assessment remain outstanding. The local environment did not contain a browser binary, its browser download was unsuccessful, and the cloud browser does not permit opening local HTML files. No claim of desktop/mobile pixel-layout validation or full assistive-technology compatibility is made. A final browser check should follow once the adaptation is accessible through GitHub Pages.

The checks are development checks for a revision aid. Question wording, distractors and course coverage should receive a final lecturer review before student use.
