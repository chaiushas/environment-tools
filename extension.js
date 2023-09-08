const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	let disposable = vscode.commands.registerCommand('environment-tools.activate', function () {
        const workspaceFolders = vscode.workspace.workspaceFolders;

		if (workspaceFolders && workspaceFolders.length > 0) {
            const workspacePath = workspaceFolders[0].uri.fsPath;

			const folderNames = ['venv', '.venv'];

			let venvPath = null;

			for (const folderName of folderNames) {
                const potentialPath = path.join(workspacePath, folderName);

                if (fs.existsSync(potentialPath) && fs.statSync(potentialPath).isDirectory()) {
                    venvPath = potentialPath;
                    break;
                }
            }

			if (venvPath) {
                const terminal = vscode.window.activeTerminal || vscode.window.createTerminal({ name: "Terminal" });
				terminal.show()

                // Change directory to the workspace and activate the virtual environment
                terminal.sendText(`cd "${workspacePath}"`);
                terminal.sendText(`source "${path.join(venvPath, 'Scripts', 'activate')}"`);

                vscode.window.showInformationMessage('Activated Virtual Environment');
            } else {
                vscode.window.showWarningMessage('No "venv" or ".venv" folder found in the workspace.');
            }
        } else {
            vscode.window.showWarningMessage('No workspace folder found.');
        }
    });

	let disposableCreateVenv = vscode.commands.registerCommand('environment-tools.create', function () {
		const workspaceFolders = vscode.workspace.workspaceFolders;

        if (workspaceFolders && workspaceFolders.length > 0) {
            const workspacePath = workspaceFolders[0].uri.fsPath;
            const venvPath = path.join(workspacePath, '.venv');
			const venvAltPath = path.join(workspacePath, 'venv');

            if (!fs.existsSync(venvPath) && !fs.existsSync(venvAltPath)) {
                const terminal = vscode.window.activeTerminal || vscode.window.createTerminal({ name: "Terminal" });

                vscode.window.showInformationMessage('Creating and Activating Virtual Environment');

				terminal.show()
                terminal.sendText(`cd "${workspacePath}"`);
                terminal.sendText(`py -m venv .venv`);
                terminal.sendText(`source "${path.join(venvPath, 'Scripts', 'activate')}"`);

            } else {
                vscode.window.showWarningMessage('".venv" or "venv" folder already exists in the workspace.');
            }
        } else {
            vscode.window.showWarningMessage('No workspace folder found.');
        }
	});

	let disposableRemoveVenv = vscode.commands.registerCommand('environment-tools.remove', function () {
		const workspaceFolders = vscode.workspace.workspaceFolders;

        if (workspaceFolders && workspaceFolders.length > 0) {
            const workspacePath = workspaceFolders[0].uri.fsPath;
            const venvPath = path.join(workspacePath, '.venv');
            const venvAltPath = path.join(workspacePath, 'venv');

            if (fs.existsSync(venvPath) || fs.existsSync(venvAltPath)) {
                const folderToDelete = fs.existsSync(venvPath) ? venvPath : venvAltPath;

                rimraf(folderToDelete, (error) => {
                    if (error) {
                        vscode.window.showErrorMessage(`Error deleting folder: ${error.message}`);
                    }
					else {
                        vscode.window.showInformationMessage('Virtual Environment removed.');
                    }
                });
            }
			else {
                vscode.window.showWarningMessage('No ".venv" or "venv" folder found in the workspace.');
            }
        }
		else {
            vscode.window.showWarningMessage('No workspace folder found.');
        }
    });

	context.subscriptions.push(disposable);
	context.subscriptions.push(disposableCreateVenv);
	context.subscriptions.push(disposableRemoveVenv);
}

function deactivate() {}

module.exports = {
	activate,
	deactivate
}