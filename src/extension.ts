// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode'

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "barrel-export" is now active!')

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand(
		'barrel-export.generate',
		() => {
			// vscode.window.showInformationMessage('Hi from barrel export')

			const editor = vscode.window.activeTextEditor
			if (!editor) {
				return // No open text editor
			}

			// Promt user for component name
			vscode.window
				.showInputBox({
					prompt: 'Enter component name',
					placeHolder: 'Component name',
				})
				.then((componentName) => {
					if (!componentName) {
						return
					}
					const isTypescript = checkIsTypescriptProject(editor)

					createNewFolder(editor, componentName)
					createNewComponentFile(editor, componentName, isTypescript)
					createNewIndexFile(editor, componentName, isTypescript)

					const textToInsert = `export * from './${componentName}'\n`

					editor.edit((editBuilder) => {
						editBuilder.insert(editor.selection.start, textToInsert)
						// remove the selected text
						editBuilder.delete(editor.selection)
					})
				})
		}
	)

	context.subscriptions.push(disposable)
}

// This method is called when your extension is deactivated
export function deactivate() {
	console.log('deactivated')
}

// create new folder in the same directory as the current file and name it as the component name
const createNewFolder = (editor: vscode.TextEditor, componentName: string) => {
	const currentFileUri = editor.document.uri
	const currentFileDir = currentFileUri.fsPath.split('/').slice(0, -1).join('/')
	const newDir = `${currentFileDir}/${componentName}`
	vscode.workspace.fs.createDirectory(vscode.Uri.file(newDir))
}

// create new file in the new folder and name it as the component name
const createNewComponentFile = (
	editor: vscode.TextEditor,
	componentName: string,
	isTypescript: boolean
) => {
	const currentFileUri = editor.document.uri
	const currentFileDir = currentFileUri.fsPath.split('/').slice(0, -1).join('/')
	const newDir = `${currentFileDir}/${componentName}`
	const newFile = `${newDir}/${componentName}.${isTypescript ? 'tsx' : 'jsx'}`

	console.log('isTypescript', isTypescript, editor.document.fileName)

	const textToInsert = generateComponentBoilerPlate(componentName, isTypescript)

	vscode.workspace.fs.writeFile(
		vscode.Uri.file(newFile),
		new TextEncoder().encode(textToInsert)
	)
}

// create new file in the new folder and name it as index.ts
const createNewIndexFile = (
	editor: vscode.TextEditor,
	componentName: string,
	isTypescript: boolean
) => {
	const currentFileUri = editor.document.uri
	const currentFileDir = currentFileUri.fsPath.split('/').slice(0, -1).join('/')
	const newDir = `${currentFileDir}/${componentName}`
	const newFile = `${newDir}/index.${isTypescript ? 'ts' : 'js'}`

	const textToInsert = `export * from './${componentName}'`

	// insert the text in the new file
	vscode.workspace.fs.writeFile(
		vscode.Uri.file(newFile),
		new TextEncoder().encode(textToInsert)
	)
}

const generateComponentBoilerPlate = (
	componentName: string,
	isTypescript?: boolean
) => {
	const typescriptContent = `import { FC } from 'react'

export interface ${componentName}Props {}

export const ${componentName}: FC<${componentName}Props> = () => {
	return <div>${componentName} works!</div>
}`
	const javascriptContent = `import React from 'react'

export const ${componentName} = () => {
	return <div>${componentName} works!</div>
}`
	return isTypescript ? typescriptContent : javascriptContent
}

const checkIsTypescriptProject = (editor: vscode.TextEditor) => {
	return (
		editor.document.fileName.endsWith('.ts') ||
		editor.document.fileName.endsWith('.tsx')
	)
}
