# T000092 -> H000092 Transfer Audit

## Canonical Source

`T000092-cognitive-reflection-test` is canonical. `H000092` is a browser-native re-authoring of its stable identity, three fixed items, Chinese stimuli, seeded scheduling, response window, open-response parsing, outcome categories, and summary meaning.

## Alignment Matrix

| Contract | Python canonical | Web port | Status |
|---|---|---|---|
| Identity | T000092 / `cognitive-reflection-test` | H000092 / `variant: html` | aligned |
| Condition | One `classic_crt` baseline | Same | aligned |
| Items | Bat-and-ball, widgets, lily pads | Same config text and values | aligned |
| Ordering | Seeded Python shuffle without replacement | `PythonRandom` equivalent | aligned |
| Response | Editable numeric TextBox2; Return submits | Editable browser input; Enter normalized to Return | aligned |
| Window | 180 s operational ceiling | 180 s | aligned |
| Feedback | None | None | aligned |
| Classification | correct / intuitive / other / timeout | Same | aligned |
| Score | Correct count, 0–3 | Same reduced-row meaning | aligned |
| Reduced data | One logical row per item | Exactly three item rows | aligned |

## Intentional Web-Only Differences

- Browser registration, fullscreen request, force quit, and result downloads are handled by `psyflow-web`.
- The browser uses an HTML input and operating-system IME instead of PsychoPy TextBox2.
- Hardware output is absent; trigger codes remain attached to stage metadata for audit.

## Framework Boundary

- `main.ts` visibly compiles instructions, lifecycle markers, the item sequence, and completion into three logical trials.
- `src/run_trial.ts` contains only one-item stimulus/response orchestration and reduced-row finalization.
- `src/utils.ts` contains only task-specific fixed-item scheduling, numeric parsing/classification, and summary helpers.
- No task file imports `jsPsych`, and no app shell, `node_modules`, `dist`, or Vite configuration is included.
- Editable textbox behavior is supplied by the shared runtime introduced in `TaskBeacon/psyflow-web` commit `6f5ddd5`.

## Integration

`.github/workflows/notify-psyflow-web.yml` dispatches `html-task-updated` to `TaskBeacon/psyflow-web` when this H task is pushed.

## Validation Evidence

- Task-scoped TypeScript compilation: PASS.
- TAPS v0.2.0 strict validation: 5 PASS, 0 WARN, 0 FAIL.
- Shared-runner unit tests: 8/8 PASS (task helpers plus editable-textbox stage behavior).
- Chromium end-to-end test: PASS; exercised three-item without-replacement scheduling, intuitive/correct/timeout outcomes, exactly three reduced rows, and CSV export.
- Production site build: PASS with H000092 included in the generated task manifest.
- Visual browser audit: PASS at 1280 × 720; question, input, unit label, and submit hint are legible and non-overlapping.
- Aggregate shared-runner `npm run typecheck` still reports only unrelated sibling-task errors in H000076, H000091, and H000101; H000092's isolated typecheck is green.
