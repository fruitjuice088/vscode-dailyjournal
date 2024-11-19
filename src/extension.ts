// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

function getWorkspaceFolderPath(): string | null {
	const folderPath = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
	vscode.window.showInformationMessage('Hello!');
	if (!folderPath) {
		vscode.window.showErrorMessage('No folder is opened!');
		return null;
	}
	return folderPath;
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	const createOrFocusTodayFile = vscode.commands.registerCommand('dailyjournal.createOrFocusTodayFile', async () => {
		const today = new Date();
		const fileName = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}.md`;

		const folderPath = getWorkspaceFolderPath();
		if (!folderPath) { return; }

		const filePath = path.join(folderPath, fileName);

		if (!fs.existsSync(filePath)) {
			fs.writeFileSync(filePath, '');
		}

		const document = await vscode.workspace.openTextDocument(filePath);
		await vscode.window.showTextDocument(document);
	})

	const focusPreviousDate = vscode.commands.registerCommand('dailyjournal.focusPreviousDate', async () => {
		const today = new Date();
		const folderPath = getWorkspaceFolderPath();
		if (!folderPath) { return; }

		const files = fs.readdirSync(folderPath)
				.filter(file => /\.md$/.test(file) && /^\d{4}\.\d{2}\.\d{2}\.md$/.test(file))
				.sort()
				.reverse();
		const prevFile = files.find(file => {
			const [year, month, day] = file.split('.')[0].split('.').map(Number);
			const fileDate = new Date(year, month - 1, day);
			return fileDate < today;
		})

		if (prevFile) {
			const document = await vscode.workspace.openTextDocument(path.join(folderPath, prevFile));
			await vscode.window.showTextDocument(document);
		} else {
			vscode.window.showInformationMessage('Previous date not found.');
		}
	});

	context.subscriptions.push(createOrFocusTodayFile);
	context.subscriptions.push(focusPreviousDate);
}

// This method is called when your extension is deactivated
export function deactivate() {}
