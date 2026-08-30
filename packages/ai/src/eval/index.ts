// Eval harness — import từ '@antadmin/ai/eval' (node-only, dùng trong script/CI).
export { checkAssertion } from './assertions'
export type { Assertion, AssertionResult } from './assertions'
export { callGateway, runEvalCase, runEvalSuite } from './runner'
export type { EvalCase, EvalCaseResult, EvalRunOptions } from './runner'
export { formatReport, summarize } from './report'
export type { EvalSummary } from './report'
