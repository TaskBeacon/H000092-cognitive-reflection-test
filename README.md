# Cognitive Reflection Test (Web)

Browser-native companion to `T000092-cognitive-reflection-test`. The Python task is canonical. This repository preserves the classic three-item set, Chinese semantic translation, seeded without-replacement item order, open numeric response, 180-second safety ceiling, no itemwise feedback, correct/intuitive/other/timeout categories, and 0–3 score semantics.

The shared `TaskBeacon/psyflow-web` runner loads this source-only task. No task-local app shell, dependencies, build output, or direct `jsPsych` import is included.

## Alignment

- Identity: `H000092` pairs with canonical `T000092` and keeps slug `cognitive-reflection-test`.
- Structure: one baseline `classic_crt` condition with three fixed item identities.
- Ordering: `PythonRandom` mirrors the canonical seeded shuffle; all three items appear once without replacement.
- Procedure: instruction -> three open-response questions -> neutral completion.
- Response: an editable browser textbox collects one numeric answer; Enter maps to canonical `return`.
- Timing: each item has the same 180-second operational safety ceiling.
- Feedback: no itemwise correctness, answer, or score is shown.
- Scoring: the same numeric normalization and `correct / intuitive / other / timeout` categories are exported.
- Data: reduced output contains exactly three logical item rows; lifecycle and instruction stages are nested inside the first/last item trials.

## Intentional browser differences

- Registration, fullscreen request, cursor policy, force quit, and downloads belong to the shared runner.
- PsychoPy `TextBox2` is represented by a browser `<input>` with operating-system IME support.
- Hardware trigger delivery is absent; trigger codes remain in compiled stage metadata for audit.

## Run URL

`https://taskbeacon.github.io/psyflow-web/?task=H000092-cognitive-reflection-test`

## Shared-runner refresh

`.github/workflows/notify-psyflow-web.yml` sends `html-task-updated` after pushes to `main`. It expects `TASKBEACON_ORG_DISPATCH_TOKEN`. A fine-grained PAT must include `TaskBeacon/psyflow-web` with **Contents: Read and write**; TaskBeacon organization approval may also be required.
