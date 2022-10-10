// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
//import { posix } from 'path';
import * as path from 'path';
import * as fs from 'fs';
import internal = require('stream');
//import internal = require('stream');


// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	
	// Use the console to output diagnostic information (mylog) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	function mylog(arg:any, ...args:any[]){
		//console.trace()
		//console.log(arg, ...args);
	}
	mylog('Congratulations, your extension "openfile-in-palette" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('openfile-in-palette.openfile', async () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		//vscode.window.showInformationMessage('Hello World from openfile-in-palette!');
		let ib = vscode.window.createInputBox();
		
		//ib.onDidTriggerButton();
		ib.onDidChangeValue(str => {
		});
		class III implements vscode.QuickPickItem{
			label: string;
			//kind: vscode.QuickPickItemKind;
			//alwaysShow?: boolean | undefined = true;
			description: string;
			//detail: string;
			//buttons?: readonly vscode.QuickInputButton[] | undefined = undefined;
			constructor(str:string, description:string,){
				this.label = str;
				this.description = description;
				//this.detail = detail;
				//this.kind = vscode.QuickPickItemKind.Separator;
			}
		}
		//declare global {
			type AwaitType<T> =
			T extends Promise<infer U> ? U :
			T extends (...args: Array<any>) => Promise<infer V> ? V :
			T;
		//	};
		//let currentdir = vscode.Uri.parse('./');
		let currentdir = '';
		let currentDirArray : string[];

		//let currentitems : [string, vscode.FileSystem.FileType][] = [];
		//let currentitems:ReturnType<typeof getdiritems>;
		type currentitemsType = AwaitType<typeof getdiritems>;
		let currentitems:AwaitType<typeof getdiritems>;
		let currentStaredItems:AwaitType<typeof getdiritems>;
		let qp = vscode.window.createQuickPick<III>();
		qp.title = 'openfile-in-palette.openfile';
		qp.placeholder = 'input file path.'
		qp.matchOnDescription = true;
		qp.step = undefined;
		//qp.selectedItems
		function normalize(pathname:string) : string{
			//return pathname.replace('\\\\', '/');
			//return pathname.replaceAll('\\', '/');
			//return pathname.replace(/\\/g, '/');
			return pathname.replace(/\\/g, '/');
			//return path.resolve(pathname).replace(/\\/g, '/');
		}
		async function isdir(dir : string){
			if(!fs.existsSync(dir))return false;
			return true;
			//fs.statSync(dir);
			/*
			let st;
			try{
				st = await vscode.workspace.fs.stat(uri);
			}catch{
				return;
			}
			*/
		}
		function gethome(){
			let userhome = process.env[process.platform == "win32" ? "USERPROFILE" : "HOME"];
			return userhome!;
		}
		function getresolve(str:string){
			// 懸念３：~は解決されない。
			// 懸念４：c:も解決されない。
			// 頭にドライブ文字がないと、C:が頭に追加される。
			mylog('getresolve.0', str);
			let nstr = normalize(str);
			let endSlash = nstr.endsWith('/'); // resolveで終端/が消えるので、記憶。
			let ps = nstr.split('/').filter(v => v !== '');
			let tils = ps.map((v,i)=>v.match(/~/) ? i : 0).filter(v=>v);
			let i_til = tils.length ? tils.at(-1)! : -1;
			let drives = ps.map((v,i)=>v.match(/[A-Za-z]:/) ? i : 0).filter(v=>v);
			let i_drives = drives.length ? drives.at(-1)! : -1;
			if(i_til === -1 && i_drives === -1){
				// どちらも存在しないなら、そのまま。
			}else{
				let i = Math.max(i_til, i_drives);
				ps = ps.slice(i);
				if(i_til > i_drives){
					//ps.unshift(gethome());
					ps[0] = gethome();
				}
			}
			mylog('resolve.1', ps);
			//let str2 = ps.join('/').slice(1); // 先頭のスラッシュはいらない。
			let str2 = ps.join('/') + '/'; // 先頭のスラッシュはいらない。
			
			let str3 = normalize(path.resolve(str2));
			if(endSlash && !str3.endsWith('/'))str3 += '/';
			mylog('resolve.2:', str3);
			return str3;
			
		}
		function getjoin(str1:string, str2:string){
			// 懸念１：path.joinだと、結果がresolveされたものになってしまう。ここでは、resolve無しで、単にjoinしてほしい。
			// 懸念２：懸念１が解決した場合、items2IIIでのjoinは、resolveを前提とした処理になってるので、getresolveをitem2IIIに追加する。あるいは、items2IIIの利用者側でgetresolveをしてやる。
			// str2が終端/のときのpath.joinの結果が終端/になる。
			// ~は解決されない。
			// c:も解決されない。
			let str1EndSlash = !str1.endsWith('/') && !str1.endsWith(path.sep);
			let str2StartsSlash = !str2.startsWith('/') && !str2.startsWith(path.sep);
			if(str1EndSlash && !str2StartsSlash || !str1EndSlash && str2StartsSlash){
				return str1 + str2;
			}else if(str1EndSlash && str2StartsSlash){
				let r = `^[^${path.sep}/]+`;
				let re = RegExp(r);
				let str3 = str2.replace(re, '');
				return str1 + str3;
				
			}else{
				return str1 + '/' + str2;
			}

			return path.join(str1, str2);
		}
		function getdirname(str:string, resolve:boolean = false){
			//let str2 = str;
			if(resolve){
				str = getresolve(str);
			}
			// path.dirnameでは、入力がa/b/c/だと、a/bを返す。/で終わってるので、a/b/c/を返してほしい。
			if(str.endsWith('/')){
				return normalize(str);
				//return normalize(path.resolve(str));
			}
			let dirname = normalize(path.dirname(str));
			// let dirname = normalize(path.resolve(path.dirname(str)));
			if(!dirname)throw new Error("my invalid dirname");
			if(!dirname.endsWith('/'))dirname += '/';
			return dirname;
		}
		function getbasename(str:string){
			let basename = path.basename(str);
			mylog('getbasename', basename, str);
			return basename;
		}
		let diritems_cache = new Map<string, [string, vscode.FileType][]>();
		async function getdiritems(dir:string){
			let dir2 = getresolve(dir);
			mylog('getdiritems', dir2);
			if(!fs.existsSync(dir2))return [];
			if(diritems_cache.has(dir2)){
				let ret2 = diritems_cache.get(dir2)!;
				mylog('----[[[[ FS: READDIRSYNC CACHE]]]]----')
				return ret2;
			}

			mylog('----[[[[ FS:READDIRSYNC ]]]]-----');
			let items = fs.readdirSync(dir2, {withFileTypes:true});
			let dirs = [];
			let files = [];
			let syms = [];
			for(let item of items){
				if(item.isDirectory()){
					dirs.push(item.name + '/');
				}else if(item.isFile()){
					files.push(item.name);
				}else if(item.isSymbolicLink()){
					// symbolic linkの時は、directoryとする。
					// もし、そうじゃない場合に対応する場合、この条件分岐の中でさらに調査し、ディレクトリっぽいなら/で終端。ファイルっぽいなら無終端でpushする。
					// onAccept側では、/終端か無終端かで処理を変えている。
					syms.push(item.name + '/'); 
				}
			}
			let ret0 : [string, vscode.FileType][] = dirs.map(v => [v, vscode.FileType.Directory]);
			let ret1 : [string, vscode.FileType][] = files.map(v => [v, vscode.FileType.File]);
			let ret2 : [string, vscode.FileType][] = syms.map(v => [v, vscode.FileType.SymbolicLink]);
			let ret = ret0.concat(ret1).concat(ret2);
			//fs.opendirSync(dir);
			//let yyy = xxx.map(v => fs.statSync(path.join(dir, v)));
			//mylog(ret);
			//mylog(yyy);
			diritems_cache.set(dir2, ret);
			return ret;

			let uri = vscode.Uri.parse(dir);
			return await vscode.workspace.fs.readDirectory(uri);
		}
		function hasStar(name:string){
			return name.indexOf('*') >= 0;
		}
		function staredStr2regex(staredStr: string){
			//let staredStr2 = '^' + staredStr.replace('.', '\\.').replace('*', '.*') + '/?$'; // ディレクトリにもマッチするように最後に/を追加。replaceは最初の文字のみ置き換えるのでダメ。
			let staredStr2 = '^' + staredStr.replace(/\./g, '\\.').replace(/\*/g, '.*') + '/?$'; // ディレクトリにもマッチするように最後に/を追加。replaceを正規表現で使うと全て置き換えてくれる。
			mylog('staredStr2regex.1', staredStr2);
			let r = RegExp(staredStr2);
			return r;
		}
		function getMatchedStaredStrs(r: RegExp, strs : string[]){
			return strs.filter(v => {
					if(!hasStar(v))return false;
					return r.test(v);
				});
		};
		function getTemplates(extension:string){
			let c = vscode.workspace.getConfiguration('myext.templates.' + extension);
			if(!c)return [];
			//c.get()
			return [];
		}
		function type2icon(type: vscode.FileType){
			let icon;
			switch (type) {
				case vscode.FileType.File:
					icon = '$(file)';
					break;
				case vscode.FileType.Directory:
					icon = '$(folder)';
					break;
				case vscode.FileType.SymbolicLink:
					icon = '$(symbol-folder)';
					break;
				case vscode.FileType.Unknown:
					icon = '$(new-file)';
					break;
				default:
					icon = '';
					break;
			}
			return icon;
		}
		function icon2type(iconedStr: string){
			if(iconedStr.startsWith('$(file)'))return vscode.FileType.File;
			else if(iconedStr.startsWith('$(folder)'))return vscode.FileType.Directory;
			else if(iconedStr.startsWith('$(symbol-folder)'))return vscode.FileType.SymbolicLink;
			else if(iconedStr.startsWith('$(new-file)'))return vscode.FileType.Unknown;
		}
		function addIcon(name: string, type: vscode.FileType){
			let icon = type2icon(type);
			let sep = ' ';
			return icon + sep + name;
		}
		function removeIcon(name: string){
			let i = name.indexOf(' ');
			return name.slice(i + 1);
		}
		function iconedStr2type(iconedStr: string){
			return icon2type(iconedStr);
		}
		//function items2III<V>(items : [string,V][], dir:string)
		function items2III(items : [string,vscode.FileType][], dir:string)
		{
			let sep = ' ';
			return items.map(item => {
				let [name,  type] = item;
				let icon:string;
				return new III(addIcon(name, type), normalize(getjoin(dir, name)));
				//return new III(name, normalize(getresolve(getjoin(dir, name))));
			})
		}
		function getdirarray(str:string){
			let nstr = normalize(str);
			let base = path.basename(nstr);
			let arr = nstr.split('/').filter(v=>v !== ''); // 空っぽは無視。つまり/終端だと空っぽが生じるが無視してるので、fileパスは表現できない。
			//let arr = getresolve(normalize(str)).split('/'); // 今のディレクトリと一致するかどうかみるだけなので、resolveするのは重すぎる。
			return arr;
		}
		function equalDirArray(dirarray1:string[], dirarray2:string[]){
			let eq = dirarray1 === dirarray2;
			if(!eq){
				mylog('eq.1', dirarray1, dirarray2);
			}
			return eq;
		}
		let userinputname:string = '';
		//qp.onDidChangeActive
		qp.onDidChangeValue(async str => {
			let nstr = normalize(str);
			qp.value = nstr;
			mylog('change:', nstr);
			let dirarray = getdirarray(nstr);
			if(nstr === currentdir)return; // 何も変化なし。最初にここにくる。
			let samedirname = nstr.startsWith(currentdir);
			if(samedirname){
				// 変わったのはitem
				if(nstr.endsWith('/')){
					if(hasStar(nstr)){
						// *付きでディレクトリを指定しようとしたなら、阻止する。
						qp.value = currentdir;
						return;
					}
					mylog('change.1:');
					// ディレクトリを指定。
					//let dirname2 = getdirname(nstr);
					let dirname2 = getdirname(nstr, true);
					qp.value = dirname2; // resolveした場合は、getdiritemsと合わせるために、入力窓も変換。
					let items2 = await getdiritems(dirname2);
					qp.items = items2III(items2, dirname2);
					currentitems = items2;
					currentdir = dirname2;
					
					return;
				}else{
					// ファイル名指定。itemsの変化はないのでこのまま。だが、そうすると任意ファイル名が指定できなくなるので、任意名ならリストに追加。
					let newitemname = getbasename(nstr);
					let dirname = getdirname(nstr);
					mylog('change.2:', dirname);
					if(hasStar(newitemname)){
						let r = staredStr2regex(newitemname);
						let matchedItems = currentitems.filter(v => {return r.test(v[0]);});
						qp.items = items2III(matchedItems, dirname);
					}else{
						if(!currentitems.map(v=>v[0]).includes(newitemname)){
							// 最初に以前のuserinputを削除。
							if(userinputname){
								currentitems = currentitems.filter(v=>{return !(v[0] === userinputname && v[1] === vscode.FileType.Unknown)});
							}

							// 次に、今回のuserinputが、dirnameに存在しないか確認。
							if(!currentitems.some(v => v[0] === newitemname + '/')){
								// dirnameとしても存在しない場合、
								// 次に、今回のuserinputを追加。
								let newitem : [string, vscode.FileType] = [newitemname, vscode.FileType.Unknown];
								currentitems.push(newitem);
								qp.items = items2III(currentitems, dirname);
		
								userinputname = newitemname;
								//mylog(currentitems, userinputname);
							}else{
								// 存在した場合
								userinputname = ''; // 何も追加してないので空っぽに。
							}

							// INJECT user values into proposed values
							//if (!choices.includes(quickPick.value)) quickPick.items = [quickPick.value, ...choices].map(label => ({ label }))
						}
					}
				}
			}else{
				// 変わったのはdirname
				mylog('change.3:');
				let dirname2 = getdirname(nstr);
				let items2 = await getdiritems(dirname2);
				qp.items = items2III(items2, dirname2);
				currentitems = items2;
				currentdir = dirname2;
				return;
			}

			return;
		});
		qp.onDidHide(() => {
			mylog('[[[ HIDE ]]]');
			if(diritems_cache.size){
				diritems_cache.clear(); // cacheのクリア
				mylog('----[[[[ hide.CLEAR CACHE ]]]]----')
			}
	});
		qp.onDidAccept(async () => {
			let a = qp.selectedItems[0];
			//currentitems[a.label]
			mylog('accept.1:', a, currentdir);
			let type = iconedStr2type(a.label);
			let itemname = removeIcon(a.label);
			let newpath = normalize(getjoin(currentdir, itemname));
			let extension = path.extname(itemname);
			let isDir = newpath.endsWith('/');
			if(isDir){
				mylog('accept.2:');
				// ディレクトリを指定。
				//let dirname2 = getdirname(nstr);
				let nstr = newpath;
				let dirname2 = getdirname(nstr, true);
				qp.value = dirname2; // resolveした場合は、getdiritemsと合わせるために、入力窓も変換。
				let items2 = await getdiritems(dirname2);
				qp.items = items2III(items2, dirname2);
				currentitems = items2;
				currentdir = dirname2;
				return;
			}else if(type === vscode.FileType.Unknown){
				// 新規ファイル。
				mylog('accept.3:');
				//vscode.window.showInformationMessage(newpath); // ここでawaitすると、message windowを消すまで以下が実行されない。
				let conf_useTemplate = vscode.workspace.getConfiguration().get<boolean>('openfile-in-palette.templates.enable');
				//let conf_useTemplate = vscode.workspace.getConfiguration().get<boolean>('conf.templates.fip.enable');
				type ssmap = {
					//[k:string]:string;
					[ext:string]:{
						snippet:string,
						//args?:string[]
					};
				};
				let snipetmap = vscode.workspace.getConfiguration().get<ssmap>('openfile-in-palette.templates.map');
				let snipet = snipetmap && snipetmap[extension];

				if(conf_useTemplate && snipet)
				{
					let useTemplate = await vscode.window.showQuickPick(['yes', 'no'], {title: 'openfile-in-palette.openfile', placeHolder: 'use template?'});
					if(useTemplate === 'yes'){
						// 新規ファイル作成。TODO:テンプレートに対応すること。特定の名前のスニペットを読み込み、ここで書き込めばいい。
						// 例えば、configurationに拡張子毎の特定snipetを対応させておき、これを読み込む。
						//const newFile = vscode.Uri.parse('untitled:' + path.join(vscode.workspace.rootPath, 'safsa.txt'));
						const newFile = vscode.Uri.parse('untitled:' + newpath);
						vscode.workspace.openTextDocument(newFile).then(document => {
							let edit = new vscode.WorkspaceEdit();
							{
								// ここでsetしても、snippetの変数が展開されない。
								//edit.set(newFile, [vscode.SnippetTextEdit.insert(new vscode.Position(0,0), snippetString)]);
								//edit.insert(newFile, new vscode.Position(0, 0), "Hello world!");
							}
							return vscode.workspace.applyEdit(edit).then(success => {
								if (success) {
									//vscode.window.activeTextEditor?.insertSnippet(snippetString);
									vscode.window.showTextDocument(document).then(editor => {
										let snippetString = new vscode.SnippetString(snipet!.snippet);
										editor.insertSnippet(snippetString); // activeEditorにのみsnippetを適用でき、変数が展開される。
									});
								} else {
									vscode.window.showInformationMessage('Error!');
								}
							});
						});

					}else{
						const newFile = vscode.Uri.parse('untitled:' + newpath);
						vscode.workspace.openTextDocument(newFile).then(document => {
									vscode.window.showTextDocument(document);
							});
					}
				}else{
					const newFile = vscode.Uri.parse('untitled:' + newpath);
					vscode.workspace.openTextDocument(newFile).then(document => {
								vscode.window.showTextDocument(document);
						});
				}
				qp.dispose(); // quickPickのUIを消して処理を終える。これの呼び出し時にonDidHideが呼ばれてから、qp.dispose()以降の処理が動く。なので、一番下の行とした。
			}else if(type === vscode.FileType.File){
				// 既存ファイルの読み込み。
				{
					// let uri = vscode.Uri.parse(newpath); // parseに、c:/saru/desu.txtをいれると、schema:c, path: /saru/desu.txtになる。
					let uri = vscode.Uri.file(newpath);
					mylog('accept.4', uri);

					let doc = await vscode.workspace.openTextDocument();
					//vscode.window.showTextDocument(uri, { viewColumn: vscode.ViewColumn.Beside });
					vscode.window.showTextDocument(uri);

					if(diritems_cache.size){
						diritems_cache.clear(); // cacheのクリア
						mylog('----[[[[ accept.CLEAR CACHE ]]]]----')
					}
				}

				qp.dispose(); // quickPickのUIを消して処理を終える。これの呼び出し時にonDidHideが呼ばれてから、qp.dispose()以降の処理が動く。なので、一番下の行とした。
			}
			//let uri = currentdir.with({path:a.label});
			// let uri = vscode.Uri.parse(path.join(currentdir.path, a.label));
			// mylog('selected', a, uri);
			// let st = await vscode.workspace.fs.stat(uri);
			// if(st.type === 2){
			// 	currentdir = uri;
			// 	let items : III[] = [];
			// 	for(const [name, type] of await vscode.workspace.fs.readDirectory(uri)){
			// 		//const filePath = posix.join(uri.path, name);
			// 		//const stat = await vscode.workspace.fs.stat(uri.with({ path: filePath }));
			// 		items.push(new III(name));
			// 	}
			// 	qp.items = items;
			// 	qp.value = uri.path;
			// }

		});
		//mylog(path.delimiter, path.sep, path.win32);
		//let userhome = process.env[process.platform == "win32" ? "USERPROFILE" : "HOME"];
		let userhome = gethome();
		let initfilepath = vscode.window.activeTextEditor?.document.uri.fsPath;
		let initpath;
		if(initfilepath){
			let initdir = path.dirname(initfilepath!);
			mylog(initdir);
			initpath = initdir && initdir !== '.' ? initdir : userhome;
		}else{
			initpath = userhome;
		}
		//path.join(userhome, xxxx);
		mylog(process.env);
		currentdir = normalize(initpath!);
		currentDirArray = getdirarray(initpath!);
		if(!currentdir.endsWith('/')) currentdir += '/';
		mylog(currentdir);
		//qp.value = currentdir;
		let items = await getdiritems(currentdir);
		currentitems = items;
		//qp.value = currentdir.path;
		//currentdir.fsPath
		qp.items = items2III(currentitems, currentdir);
		//qp.items = [new III('saru'), new III('desu')];
		//qp.value = str;
		qp.show();
		qp.value = currentdir; // showの後で.valueにいれることで、UIに表示される文字列が範囲選択されてしまうのを防ぐことができた。
		//mylog('xxxx', str);
		//ib.value = str;
		//ib.show();
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
