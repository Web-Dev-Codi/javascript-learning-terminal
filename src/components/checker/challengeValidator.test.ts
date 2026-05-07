import { describe, expect, it } from "vitest";
import type { CodeCheck } from "../../types/lesson";
import { validateChallenge } from "./challengeValidator";

describe("validateChallenge", () => {
	describe("AST checks", () => {
		it("detects declares-const with correct name", () => {
			const code = 'const gameName = "SYNTHSCRIPT";\nconsole.log(gameName);';
			const checks: CodeCheck[] = [
				{
					type: "declares-const",
					name: "gameName",
					description: "Declare gameName as const",
				},
			];
			const results = validateChallenge(code, [], checks);
			expect(results[0].pass).toBe(true);
		});

		it("fails when declares-const name is missing", () => {
			const code = "const lives = 3;\nconsole.log(lives);";
			const checks: CodeCheck[] = [
				{
					type: "declares-const",
					name: "gameName",
					description: "Declare gameName as const",
				},
			];
			const results = validateChallenge(code, [], checks);
			expect(results[0].pass).toBe(false);
		});

		it("detects declares-let with correct name", () => {
			const code = "let lives = 3;\nconsole.log(lives);";
			const checks: CodeCheck[] = [
				{
					type: "declares-let",
					name: "lives",
					description: "Declare lives as let",
				},
			];
			const results = validateChallenge(code, [], checks);
			expect(results[0].pass).toBe(true);
		});

		it("fails when declares-let name is missing", () => {
			const code = 'const gameName = "SYNTHSCRIPT";\nconsole.log(gameName);';
			const checks: CodeCheck[] = [
				{
					type: "declares-let",
					name: "lives",
					description: "Declare lives as let",
				},
			];
			const results = validateChallenge(code, [], checks);
			expect(results[0].pass).toBe(false);
		});

		it("detects declares-function with correct name", () => {
			const code = 'function greet() { return "hello"; }';
			const checks: CodeCheck[] = [
				{
					type: "declares-function",
					name: "greet",
					description: "Declare greet function",
				},
			];
			const results = validateChallenge(code, [], checks);
			expect(results[0].pass).toBe(true);
		});

		it("fails when declares-function name is missing", () => {
			const code = 'function greet() { return "hello"; }';
			const checks: CodeCheck[] = [
				{
					type: "declares-function",
					name: "sayHi",
					description: "Declare sayHi function",
				},
			];
			const results = validateChallenge(code, [], checks);
			expect(results[0].pass).toBe(false);
		});

		it("detects uses-if", () => {
			const code = "if (x > 5) { console.log(x); }";
			const checks: CodeCheck[] = [
				{ type: "uses-if", description: "Use an if statement" },
			];
			const results = validateChallenge(code, [], checks);
			expect(results[0].pass).toBe(true);
		});

		it("fails when no if statement exists", () => {
			const code = "const x = 5;\nconsole.log(x);";
			const checks: CodeCheck[] = [
				{ type: "uses-if", description: "Use an if statement" },
			];
			const results = validateChallenge(code, [], checks);
			expect(results[0].pass).toBe(false);
		});

		it("detects has-return", () => {
			const code = "function add(a, b) { return a + b; }";
			const checks: CodeCheck[] = [
				{ type: "has-return", description: "Use a return statement" },
			];
			const results = validateChallenge(code, [], checks);
			expect(results[0].pass).toBe(true);
		});

		it("fails when no return statement exists", () => {
			const code = "const x = 5;";
			const checks: CodeCheck[] = [
				{ type: "has-return", description: "Use a return statement" },
			];
			const results = validateChallenge(code, [], checks);
			expect(results[0].pass).toBe(false);
		});

		it("detects contains-string", () => {
			const code = "health = health - 30;";
			const checks: CodeCheck[] = [
				{ type: "contains-string", text: "- 30", description: "Subtract 30" },
			];
			const results = validateChallenge(code, [], checks);
			expect(results[0].pass).toBe(true);
		});

		it("fails when contains-string text not found", () => {
			const code = "health = health + 20;";
			const checks: CodeCheck[] = [
				{ type: "contains-string", text: "- 30", description: "Subtract 30" },
			];
			const results = validateChallenge(code, [], checks);
			expect(results[0].pass).toBe(false);
		});
	});

	describe("output checks", () => {
		it("passes when all expected output lines are present", () => {
			const output = ["SYNTHSCRIPT", "3"];
			const results = validateChallenge("", output, [], ["SYNTHSCRIPT", "3"]);
			expect(results.every((r) => r.pass)).toBe(true);
		});

		it("fails when expected output is missing", () => {
			const output = ["SYNTHSCRIPT"];
			const results = validateChallenge("", output, [], ["SYNTHSCRIPT", "3"]);
			expect(results.some((r) => !r.pass)).toBe(true);
		});
	});

	describe("combined checks", () => {
		it("passes when both AST and output are correct", () => {
			const code =
				'const gameName = "SYNTHSCRIPT";\nlet lives = 3;\nconsole.log(gameName);\nconsole.log(lives);';
			const output = ["SYNTHSCRIPT", "3"];
			const checks: CodeCheck[] = [
				{
					type: "declares-const",
					name: "gameName",
					description: "Declare gameName as const",
				},
				{
					type: "declares-let",
					name: "lives",
					description: "Declare lives as let",
				},
			];
			const results = validateChallenge(code, output, checks, [
				"SYNTHSCRIPT",
				"3",
			]);
			expect(results.every((r) => r.pass)).toBe(true);
		});

		it("fails with descriptive message for missing output", () => {
			const code =
				'const gameName = "SYNTHSCRIPT";\nlet lives = 3;\nconsole.log(gameName);\nconsole.log(lives);';
			const output: string[] = [];
			const checks: CodeCheck[] = [
				{
					type: "declares-const",
					name: "gameName",
					description: "Declare gameName as const",
				},
			];
			const results = validateChallenge(code, output, checks, ["SYNTHSCRIPT"]);
			const outputResult = results.find(
				(r) => r.description === 'Output should contain: "SYNTHSCRIPT"',
			);
			expect(outputResult?.pass).toBe(false);
			expect(outputResult?.message).toContain("not found in console output");
		});

		it("handles empty code gracefully", () => {
			const results = validateChallenge("", [], [], []);
			expect(Array.isArray(results)).toBe(true);
		});

		it("validates the challenge-01 scenario end-to-end", () => {
			const code = `const gameName = "SYNTHSCRIPT";
let lives = 3;
console.log(gameName);
console.log(lives);`;
			const output = ["SYNTHSCRIPT", "3"];
			const checks: CodeCheck[] = [
				{
					type: "declares-const",
					name: "gameName",
					description: "Declare gameName as const",
				},
				{
					type: "declares-let",
					name: "lives",
					description: "Declare lives as let",
				},
			];
			const results = validateChallenge(code, output, checks, [
				"SYNTHSCRIPT",
				"3",
			]);
			expect(results.every((r) => r.pass)).toBe(true);
			expect(results).toHaveLength(4);
		});

		it("reports specific failures for challenge-01 starter code", () => {
			const code = `// Declare gameName as a const
const gameName

// Declare lives as a let
let lives

console.log(gameName);
console.log(lives);`;
			const output: string[] = [];
			const checks: CodeCheck[] = [
				{
					type: "declares-const",
					name: "gameName",
					description: "Declare gameName as const",
				},
				{
					type: "declares-let",
					name: "lives",
					description: "Declare lives as let",
				},
			];
			const results = validateChallenge(code, output, checks, [
				"SYNTHSCRIPT",
				"3",
			]);
			expect(results[0].pass).toBe(true);
			expect(results[1].pass).toBe(true);
			expect(results[2].pass).toBe(false);
			expect(results[3].pass).toBe(false);
		});

		it("validates without codeChecks when only expectedOutput is provided", () => {
			const code = 'console.log("hello");';
			const output = ["hello"];
			const results = validateChallenge(code, output, undefined, ["hello"]);
			expect(results[0].pass).toBe(true);
		});

		it("validates without expectedOutput when only codeChecks are provided", () => {
			const code = "let x = 5;";
			const checks: CodeCheck[] = [
				{ type: "declares-let", name: "x", description: "Declare x as let" },
			];
			const results = validateChallenge(code, [], checks, undefined);
			expect(results[0].pass).toBe(true);
		});
	});
});
