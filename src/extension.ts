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

			body {
				display: flex;
				flex-direction: column;
				justify-content: center;
				align-items: center;
			}

			img {
				padding-top: 20px;
				object-fit: contain;
			}

			label {
				text-align: center;
				font-size: 12px;
			}

			input{
				background-color: #353535;
				color: #f3f3f3;
				border: none;
				border-radius: 3px;
				padding: 6px 12px;
				font-size: 14px;
				line-height: 20px;
				transition: background-color 0.2s ease-in-out;
				margin-top: 10px;
			}

			input:focus {
				background-color: #3c3c3c;
				color: #f3f3f3;
				outline: none;
				border-color: #007acc;
			}

			#buttons {
				flex-direction: row;
			}

			#checkButton, #nextButton {
				margin-top: 20px;
			}

			#user-points {
				margin-top: 20px;
			}

            #countryName {
				text-align: center;
                visibility: hidden;
            }

			button {
				background-color: #007acc;
				color: white;
				border: none;
				border-radius: 4px;
				font-size: 14px;
				font-weight: 500;
				padding: 6px 12px;
				cursor: pointer;
				transition: background-color 0.2s ease-in-out;
				margin-left: 5px;
				margin-right: 5px;
			}

			button:hover {
				background-color: #106ebe;
			}

			button:active {
				background-color: #005b9a;
			}

			button[disabled] {
				background-color: #ccc;
				color: #666;
				cursor: default;
			}
        </style>
    </head>
    <body>	
        <h1>Flagle</h1>
        <img src="${flagImageUrl}" height="120">
        <h2 id="countryName">${randomCountryName}</h2>
        <label for="answer">What country does this flag belong to?</label>
        <input type="text" id="answer">
        <div id="buttons">
			<button id="checkButton" onclick="checkAnswer()">Check</button>
        	<button id="nextButton" onclick="refreshFlag()" disabled>Next</button>
		</div>
		<br>
		<h2 id="user-points">Points: ${userPoints}</h2>
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
				checkButton.disabled = true
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

			window.addEventListener('keydown', event => {
				const checkButton = document.getElementById("checkButton");
				const nextButton = document.getElementById("nextButton");
				const answer = document.getElementById("answer");

				if (answer.value == ""){
					answer.focus();
				}
				else if (event.keyCode === 13) {
					if (checkButton.disabled) {
						refreshFlag();
					} else {
						checkAnswer();
					}
				}
        	});
        </script>
    </body>
    </html>`;
}