import { PythonRandom, type ReducedTrialRow, type TaskSettings } from "psyflow-web";

export type SettingsView = TaskSettings & Record<string, unknown>;
export type ResponseCategory = "correct" | "intuitive" | "other" | "timeout";

export interface AnswerSpec {
  correct: number;
  intuitive: number;
}

export function buildCrtItemOrder(itemIds: unknown, nItems: number, seed: number): string[] {
  const items = (Array.isArray(itemIds) ? itemIds : []).map(String).map((item) => item.trim()).filter(Boolean);
  if (!items.length) throw new Error("CRT item_ids cannot be empty");
  if (!Number.isInteger(nItems) || nItems < 1 || nItems > items.length) {
    throw new Error(`nItems must be between 1 and ${items.length}, got ${nItems}`);
  }
  return new PythonRandom(Math.trunc(seed)).shuffle([...items]).slice(0, nItems);
}

export function parseNumericResponse(value: unknown): number | null {
  const text = String(value ?? "").normalize("NFKC").trim().replace(/,/gu, "");
  const match = text.match(/[-+]?(?:\d+(?:\.\d*)?|\.\d+)/u);
  if (!match) return null;
  const parsed = Number(match[0]);
  return Number.isFinite(parsed) ? parsed : null;
}

export function classifyResponse(
  responseText: unknown,
  correctValue: unknown,
  intuitiveValue: unknown,
  timedOut = false
): ResponseCategory {
  if (timedOut) return "timeout";
  const parsed = parseNumericResponse(responseText);
  if (parsed === null) return "other";
  if (parsed === Number(correctValue)) return "correct";
  if (parsed === Number(intuitiveValue)) return "intuitive";
  return "other";
}

export function summarizeCrtTrials(rows: ReducedTrialRow[]) {
  const itemRows = rows.filter((row) => typeof row.response_category === "string");
  const categories = itemRows.map((row) => String(row.response_category));
  const responseTimes = itemRows
    .map((row) => row.response_rt)
    .filter((value): value is number => typeof value === "number" && Number.isFinite(value));
  return {
    total_items: itemRows.length,
    correct_count: categories.filter((value) => value === "correct").length,
    intuitive_count: categories.filter((value) => value === "intuitive").length,
    other_count: categories.filter((value) => value === "other").length,
    timeout_count: categories.filter((value) => value === "timeout").length,
    mean_response_time_s: responseTimes.length
      ? responseTimes.reduce((sum, value) => sum + value, 0) / responseTimes.length
      : null
  };
}
