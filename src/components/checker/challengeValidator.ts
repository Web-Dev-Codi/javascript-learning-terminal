import { parse } from "@babel/parser";
import type { CodeCheck, ValidationResult } from "../../types/lesson";
import type { ESTreeAST, ESTreeNode } from "./ruleEngine";
import { walkAST } from "./ruleEngine";

function parseCode(code: string): ESTreeAST | null {
	try {
		const ast = parse(code, {
			sourceType: "module",
			errorRecovery: true,
		}) as unknown as ESTreeAST;
		return ast;
	} catch {
		return null;
	}
}

function checkDeclaresConst(node: ESTreeNode, targetName: string): boolean {
	if (node.type !== "VariableDeclaration") return false;
	if (node.kind !== "const") return false;
	const decls = node.declarations as ESTreeNode[] | undefined;
	if (!decls) return false;
	return decls.some((d) => {
		const id = d.id as ESTreeNode & { name?: string };
		return id?.name === targetName;
	});
}

function checkDeclaresLet(node: ESTreeNode, targetName: string): boolean {
	if (node.type !== "VariableDeclaration") return false;
	if (node.kind !== "let") return false;
	const decls = node.declarations as ESTreeNode[] | undefined;
	if (!decls) return false;
	return decls.some((d) => {
		const id = d.id as ESTreeNode & { name?: string };
		return id?.name === targetName;
	});
}

function checkDeclaresFunction(node: ESTreeNode, targetName: string): boolean {
	if (node.type !== "FunctionDeclaration") return false;
	const id = node.id as ESTreeNode & { name?: string };
	return id?.name === targetName;
}

function checkContainsString(source: string, text: string): boolean {
	return source.includes(text);
}

export function validateChallenge(
	code: string,
	consoleOutput: string[],
	codeChecks?: CodeCheck[],
	expectedOutput?: string[],
): ValidationResult[] {
	const results: ValidationResult[] = [];

	if (codeChecks) {
		const ast = parseCode(code);

		for (const check of codeChecks) {
			switch (check.type) {
				case "declares-const": {
					let found = false;
					if (ast) {
						walkAST(ast, {
							VariableDeclaration: (node: ESTreeNode) => {
								if (checkDeclaresConst(node, check.name)) found = true;
							},
						});
					}
					results.push({
						pass: found,
						description: check.description,
						message: found
							? `${check.name} declared as const`
							: `Expected const '${check.name}' but it was not found. Make sure to use: const ${check.name} = value;`,
					});
					break;
				}

				case "declares-let": {
					let found = false;
					if (ast) {
						walkAST(ast, {
							VariableDeclaration: (node: ESTreeNode) => {
								if (checkDeclaresLet(node, check.name)) found = true;
							},
						});
					}
					results.push({
						pass: found,
						description: check.description,
						message: found
							? `${check.name} declared as let`
							: `Expected let '${check.name}' but it was not found. Make sure to use: let ${check.name} = value;`,
					});
					break;
				}

				case "declares-function": {
					let found = false;
					if (ast) {
						walkAST(ast, {
							FunctionDeclaration: (node: ESTreeNode) => {
								if (checkDeclaresFunction(node, check.name)) found = true;
							},
						});
					}
					results.push({
						pass: found,
						description: check.description,
						message: found
							? `Function ${check.name} declared`
							: `Expected function '${check.name}' but it was not found.`,
					});
					break;
				}

				case "uses-if": {
					let found = false;
					if (ast) {
						walkAST(ast, {
							IfStatement: () => {
								found = true;
							},
						});
					}
					results.push({
						pass: found,
						description: check.description,
						message: found
							? "if statement found"
							: "Expected an if statement but none was found.",
					});
					break;
				}

				case "has-return": {
					let found = false;
					if (ast) {
						walkAST(ast, {
							ReturnStatement: () => {
								found = true;
							},
						});
					}
					results.push({
						pass: found,
						description: check.description,
						message: found
							? "return statement found"
							: "Expected a return statement but none was found.",
					});
					break;
				}

				case "contains-string": {
					const found = checkContainsString(code, check.text);
					results.push({
						pass: found,
						description: check.description,
						message: found
							? `Found "${check.text}" in code`
							: `Expected to find "${check.text}" in your code but it was missing.`,
					});
					break;
				}

				case "custom": {
					results.push({
						pass: false,
						description: check.description,
						message: "Custom checks are not supported yet.",
					});
					break;
				}

				default: {
					break;
				}
			}
		}
	}

	if (expectedOutput) {
		for (const expected of expectedOutput) {
			const found = consoleOutput.some((line) => line.includes(expected));
			results.push({
				pass: found,
				description: `Output should contain: "${expected}"`,
				message: found
					? `Found "${expected}" in console output`
					: `Expected "${expected}" in console output but it was not found in console output. Check that your console.log statements are correct.`,
			});
		}
	}

	return results;
}
