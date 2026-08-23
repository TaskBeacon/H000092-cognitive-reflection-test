import {
  set_trial_context,
  type StimBank,
  type TrialBuilder,
  type TrialSnapshot
} from "psyflow-web";

import { classifyResponse, parseNumericResponse, type AnswerSpec, type SettingsView } from "./utils";

function unitState(snapshot: TrialSnapshot, label: string): Record<string, unknown> {
  return snapshot.units[label] ?? {};
}

export function runTrial(
  trial: TrialBuilder,
  condition: string,
  options: { settings: SettingsView; stimBank: StimBank; block_id: string; block_idx: number }
) {
  const { settings, stimBank, block_id: blockId, block_idx: blockIdx } = options;
  const itemId = String(condition).trim();
  const answerKey = settings.answer_key as Record<string, AnswerSpec>;
  const answer = answerKey[itemId];
  if (!answer) throw new Error(`Unsupported CRT item: ${itemId}`);

  const label = "question_response";
  const submitKey = String(settings.submit_key ?? "return").trim().toLowerCase() || "return";
  const responseWindow = Number(settings.response_window_s);
  const triggers = settings.triggers as Record<string, number>;
  const questionStimId = `question_${itemId}`;
  const unitStimId = `unit_${itemId}`;
  const unit = trial.unit(label).addStim(
    stimBank.get(questionStimId),
    stimBank.get("response_entry"),
    stimBank.get(unitStimId),
    stimBank.get("submit_hint")
  );
  set_trial_context(unit, {
    trial_id: trial.trial_id,
    phase: label,
    deadline_s: responseWindow,
    valid_keys: [submitKey],
    block_id: blockId,
    condition_id: itemId,
    task_factors: {
      item_id: itemId,
      correct_value: answer.correct,
      intuitive_value: answer.intuitive,
      block_idx: blockIdx
    },
    stim_id: `${questionStimId}+response_entry+${unitStimId}+submit_hint`,
    stim_features: { item_id: itemId, response_mode: "open_numeric" }
  });
  unit.captureResponse({
    keys: [submitKey],
    duration: responseWindow,
    onset_trigger: triggers[`${itemId}_onset`],
    response_trigger: { [submitKey]: triggers.response_submit },
    timeout_trigger: triggers.response_timeout,
    terminate_on_response: true
  }).to_dict();

  trial.finalize((snapshot, _runtime, helpers) => {
    const state = unitState(snapshot, label);
    const rawKey = typeof state.response === "string" ? state.response : "";
    const responseKey = submitKey === "return" && rawKey === "enter" ? "return" : rawKey;
    const responseText = typeof state.response_text === "string" ? state.response_text : "";
    const responseRt = typeof state.rt === "number" ? state.rt : null;
    const timedOut = state.timeout_triggered === true || !responseKey;
    const responseCategory = classifyResponse(
      responseText,
      answer.correct,
      answer.intuitive,
      timedOut
    );
    const row = {
      trial_id: trial.trial_id,
      block_id: blockId,
      block_idx: blockIdx,
      condition: itemId,
      condition_id: itemId,
      correct_value: answer.correct,
      intuitive_value: answer.intuitive,
      response_key: responseKey,
      response_text: responseText,
      response_value: parseNumericResponse(responseText),
      response_rt: responseRt,
      response_category: responseCategory,
      response_correct: responseCategory === "correct",
      timed_out: timedOut
    };
    Object.entries(row).forEach(([key, value]) => helpers.setTrialState(key, value));
  });
  return trial;
}

export { runTrial as run_trial };
export default runTrial;
