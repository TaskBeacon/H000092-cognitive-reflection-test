import {
  StimBank,
  SubInfo,
  TaskSettings,
  TrialBuilder,
  mountTaskApp,
  next_trial_id,
  parsePsyflowConfig,
  reset_trial_counter,
  set_trial_context,
  type CompiledTrial
} from "psyflow-web";

import { runTrial } from "./src/run_trial";
import { buildCrtItemOrder, type SettingsView } from "./src/utils";

const TASK_ID = "H000092-cognitive-reflection-test";

async function loadConfig() {
  const response = await fetch(new URL("./config/config.yaml", import.meta.url));
  if (!response.ok) throw new Error(`Failed to load config: ${response.status} ${response.statusText}`);
  return parsePsyflowConfig(await response.text(), import.meta.url);
}

function signalUnit(trial: TrialBuilder, id: string, trigger: number | null) {
  const unit = trial.unit(id);
  set_trial_context(unit, {
    trial_id: trial.trial_id,
    phase: id,
    deadline_s: 0.001,
    valid_keys: [],
    block_id: trial.block_id,
    condition_id: trial.condition,
    task_factors: { stage: id },
    stim_id: null
  });
  unit.show({ duration: 0.001, onset_trigger: trigger });
}

function waitScreenUnit(trial: TrialBuilder, stimBank: StimBank, id: string, stimId: string) {
  const unit = trial.unit(id).addStim(stimBank.get(stimId));
  set_trial_context(unit, {
    trial_id: trial.trial_id,
    phase: id,
    deadline_s: null,
    valid_keys: ["space"],
    block_id: trial.block_id,
    condition_id: trial.condition,
    task_factors: { stage: id },
    stim_id: stimId
  });
  unit.waitAndContinue({ keys: ["space"] });
}

function compileItem(
  itemId: string,
  index: number,
  total: number,
  settings: SettingsView,
  stimBank: StimBank
): CompiledTrial {
  const blockId = "crt_items";
  const triggers = settings.triggers as Record<string, number>;
  const trial = new TrialBuilder({
    trial_id: next_trial_id(),
    block_id: blockId,
    trial_index: index,
    condition: itemId
  });

  if (index === 0) {
    signalUnit(trial, "exp_onset", triggers.exp_onset);
    waitScreenUnit(trial, stimBank, "instruction", "instruction_text");
    signalUnit(trial, "block_onset", triggers.block_onset);
  }

  runTrial(trial, itemId, { settings, stimBank, block_id: blockId, block_idx: 0 });

  if (index === total - 1) {
    signalUnit(trial, "block_end", triggers.block_end);
    signalUnit(trial, "good_bye_onset", triggers.good_bye_onset);
    waitScreenUnit(trial, stimBank, "good_bye", "good_bye_text");
    signalUnit(trial, "exp_end", triggers.exp_end);
  }
  return trial.build();
}

function buildTrials(settings: SettingsView, stimBank: StimBank): CompiledTrial[] {
  reset_trial_counter();
  const itemOrder = buildCrtItemOrder(
    settings.item_ids,
    Number(settings.trials_per_block),
    Number(settings.overall_seed)
  );
  return itemOrder.map((itemId, index) =>
    compileItem(itemId, index, itemOrder.length, settings, stimBank)
  );
}

export async function main(root: HTMLElement) {
  const parsed = await loadConfig();
  const settings = TaskSettings.from_dict(parsed.task_config) as SettingsView;
  settings.triggers = parsed.trigger_config as Record<string, number>;
  const stimBank = new StimBank(parsed.stim_config);
  return mountTaskApp({
    root,
    task_id: TASK_ID,
    task_name: "Cognitive Reflection Test",
    task_description: "Browser companion for canonical T000092, preserving the classic three open-response items, non-speeded semantics, intuitive-error classification, and 0-3 score.",
    settings,
    subInfo: new SubInfo(parsed.subform_config),
    stimBank,
    buildTrials: () => buildTrials(settings, stimBank)
  });
}

export default main;
