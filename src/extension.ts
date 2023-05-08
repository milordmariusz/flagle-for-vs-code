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
			let randomCountryCode = countryCodes[randomIndex];
			let randomCountryName = countries[randomCountryCode];

			let userPoints = 0;

			let panel = vscode.window.createWebviewPanel(
				'Flagle',
				'Flagle',
				vscode.ViewColumn.One,
				{
					enableScripts: true
				}
			);
			panel.webview.html = getWebviewContent(randomCountryCode, randomCountryName, userPoints);

			panel.webview.onDidReceiveMessage(
				message => {
					switch (message.command) {
						case 'refresh':
							const newRandomIndex = Math.floor(Math.random() * countryCodes.length);
							randomCountryCode = countryCodes[newRandomIndex];
							randomCountryName = countries[randomCountryCode];
							panel.webview.html = getWebviewContent(randomCountryCode, randomCountryName, userPoints);
							console.log(randomCountryName);
							return;
						case 'incrementPoints':
							userPoints++;
							panel.webview.postMessage({ command: 'updatePoints', text: userPoints });
							return;
						case 'resetPoints':
							userPoints = 0;
							panel.webview.postMessage({ command: 'updatePoints', text: userPoints });
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

function getWebviewContent(randomCountryCode: string, randomCountryName: string, userPoints: number) {
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
		<br>
		<h1 id="user-points">Points: ${userPoints}</h1>
        <script>
			const vscode = acquireVsCodeApi();
            function checkAnswer() {

                const answer = document.getElementById("answer").value.trim().toLowerCase();
                const countryName = document.getElementById("countryName");
                const nextButton = document.getElementById("nextButton");

				countryName.style.visibility = "visible";

                if (answer.toLowerCase() === "${randomCountryName.toLowerCase()}") {
					vscode.postMessage({ command: 'incrementPoints' });
                } else {
					vscode.postMessage({ command: 'resetPoints' });

                }
				nextButton.disabled = false
            }

			function refreshFlag() {
                vscode.postMessage({ command: 'refresh' });
            }

			window.addEventListener('message', event => {

				const message = event.data;
				const points = document.getElementById('user-points');

				switch (message.command) {
					case 'updatePoints':
						points.textContent = "Points: "+message.text;
						break;
            	}
        	});
        </script>
    </body>
    </html>`;
}



// if (answer.toLowerCase() === "${randomCountryName.toLowerCase()}") {
//     countryName.style.visibility = "visible";
// } else {
//     countryName.style.visibility = "hidden";
// }
