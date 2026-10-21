import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
import ts from "typescript";

const source = await readFile(new URL("../src/lib/services/learning-workflow-rules.service.ts", import.meta.url), "utf8");
const code = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const context = { exports: {}, require(id) { assert.equal(id, "server-only"); return {}; } };
vm.runInNewContext(code, context);
const { CompletionRuleEvaluator, initialLearningWorkflowRules } = context.exports;
const base = {
  completedModules: 7, publishedModules: 7, enrollmentActive: true,
  modules: [], requiredForms: 2, submittedRequiredForms: 2,
  requiredTradingDays: 0, tradingDays: 0, practiceRequirementWaived: false,
};
const evaluate = (changes = {}) => CompletionRuleEvaluator.evaluate(initialLearningWorkflowRules, { ...base, ...changes });
assert.equal(evaluate().allSatisfied, true);
assert.equal(evaluate({ tradingDays: 5 }).allSatisfied, true);
assert.equal(evaluate({ requiredTradingDays: 5 }).allSatisfied, true);
assert.equal(evaluate({ enrollmentActive: false }).allSatisfied, false);
assert.equal(evaluate({ completedModules: 6 }).allSatisfied, false);
assert.equal(evaluate({ publishedModules: 0, completedModules: 0 }).allSatisfied, false);
assert.equal(evaluate({ submittedRequiredForms: 1 }).allSatisfied, false);
assert.equal(evaluate({ requiredForms: 0, submittedRequiredForms: 0 }).allSatisfied, true);
assert.equal(evaluate().rules.some((rule) => rule.key === "trading_days"), false);
console.log("PASS: practice days are optional; enrollment, modules and required forms remain mandatory.");
