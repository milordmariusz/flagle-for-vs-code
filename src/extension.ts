import * as vscode from 'vscode';
import * as fs from 'fs';

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		vscode.commands.registerCommand('flagle-for-vs-code.start', () => {

			const path = require('path');
			const fs = require('fs');
			const countriesFilePath = path.join(context.extensionPath, 'src/countries.json');
			const jsonString = fs.readFileSync(countriesFilePath, 'utf-8');
			const countries = JSON.parse(jsonString);
			const countryCodes = Object.keys(countries);
			const randomIndex = Math.floor(Math.random() * countryCodes.length);
			const randomCountryCode = countryCodes[randomIndex];
			const randomCountryName = countries[randomCountryCode];

			console.log(randomCountryCode);
			console.log(randomCountryName);

			let panel = vscode.window.createWebviewPanel(
				'Flagle',
				'Flagle',
				vscode.ViewColumn.One,
				{
					enableScripts: true
				}
			);
			panel.webview.html = getWebviewContent(randomCountryCode, randomCountryName);

			panel.webview.onDidReceiveMessage(message => {
				if (message.command === 'refresh') {
					console.log("Siema");
					const newRandomIndex = Math.floor(Math.random() * countryCodes.length);
					const newRandomCountryCode = countryCodes[newRandomIndex];
					const newRandomCountryName = countries[newRandomCountryCode];
					const newFlagImageUrl = `https://flagcdn.com/w2560/${newRandomCountryCode.toLowerCase()}.png`;
					panel!.webview.html = getWebviewContent(newRandomCountryCode, newRandomCountryName);
				}
			});
		}
		)
	);
}

function getWebviewContent(randomCountryCode: string, randomCountryName: string) {
	const flagImageUrl = `https://flagcdn.com/h120/${randomCountryCode.toLowerCase()}.png`;
	return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Flagle</title>
    </head>
    <body>
        <h1>${randomCountryName}</h1>
        <img src="${flagImageUrl}" height="120">
        <button onclick="refreshFlag()">Refresh</button>
        <script>
            function refreshFlag() {
                const vscode = acquireVsCodeApi();
                vscode.postMessage({ command: 'refresh' });
            }
        </script>
    </body>
    </html>`;
}