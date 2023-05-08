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

			let panel = vscode.window.createWebviewPanel(
				'Flagle',
				'Flagle',
				vscode.ViewColumn.One,
				{
					enableScripts: true
				}
			);
			panel.webview.html = getWebviewContent(randomCountryCode, randomCountryName);

			panel.webview.onDidReceiveMessage(
				message => {
					switch (message.command) {
						case 'refresh':
							console.log("Refreshing...");
							const newRandomIndex = Math.floor(Math.random() * countryCodes.length);
							const newRandomCountryCode = countryCodes[newRandomIndex];
							const newRandomCountryName = countries[newRandomCountryCode];
							const newFlagImageUrl = `https://flagcdn.com/w2560/${newRandomCountryCode.toLowerCase()}.png`;
							console.log("After Refreshing...");
							panel.webview.html = getWebviewContent(newRandomCountryCode, newRandomCountryName);
							return;
						case 'check':
							console.log("Checking...");
							return;
					}
				},
				undefined,
				context.subscriptions
			);
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
        <style>
            #countryName {
                visibility: hidden;
            }
        </style>
    </head>
    <body>
        <img src="${flagImageUrl}" height="120">
        <h1 id="countryName">${randomCountryName}</h1>
        <label for="answer">What country does this flag belong to?</label>
        <br>
        <input type="text" id="answer">
        <br>
        <br>
        <button onclick="checkAnswer()">Check</button>
        <button id="nextButton" onclick="refreshFlag()" disabled>Next</button>
        <script>
			const vscode = acquireVsCodeApi();
            function checkAnswer() {

                const answer = document.getElementById("answer").value.trim().toLowerCase();
                const countryName = document.getElementById("countryName");
                const nextButton = document.getElementById("nextButton");

				countryName.style.visibility = "visible";

                if (answer.toLowerCase() === "${randomCountryName.toLowerCase()}") {
					vscode.postMessage({ command: 'check' });
                } else {
					vscode.postMessage({ command: 'check' });

                }
				nextButton.disabled = false
            }
			function refreshFlag() {
                vscode.postMessage({ command: 'refresh' });
            }
        </script>
    </body>
    </html>`;
}



// if (answer.toLowerCase() === "${randomCountryName.toLowerCase()}") {
//     countryName.style.visibility = "visible";
// } else {
//     countryName.style.visibility = "hidden";
// }
