let htmlFile = [];
let fileInput, htmlInput;
let orderFile, fileList, obfuscateCheck, indexInfoDiv, bundleButton, mismatchDiv, missingDiv, noRefDiv;
let winMouseX, winMouseY;
let savedResult = null;

let empyFileListText, emptyHTMLFileText;
empyFileListText = emptyHTMLFileText = 'Click the button or drop file here.';



window.onload = function () {

	//order file div
	orderFile = document.getElementById( 'orderFile' );
	orderFile.ondragenter = function () {

		this.classList.add( 'dragOver' );

	};
	orderFile.ondragleave = function () {

		this.classList.remove( 'dragOver' );

	};
	orderFile.ondrop = function () {

		this.classList.remove( 'dragOver' );
		getHTML();

	};

	//file list div
	fileList = document.getElementById( 'fileList' );
	fileList.ondragenter = function () {

		this.classList.add( 'dragOver' );

	};
	fileList.ondragleave = function () {

		this.classList.remove( 'dragOver' );

	};
	fileList.ondrop = function () {

		this.classList.remove( 'dragOver' );
		getFiles();

	};


	//create file inputs
	fileInput = document.getElementById( 'fileInput' );
	fileInput.onchange = function () {

		handleFileSelect( this );

	};
	//create html input
	htmlInput = document.getElementById( 'htmlInput' );
	htmlInput.onchange = function () {

		handleFileSelect( this );

	};

	//mouve over extra info
	let indexInfo = document.getElementById( 'showIndexInfo' );
	indexInfo.onmouseover = showIndexInfo;
	indexInfo.onmouseout = hideIndexInfo;

	//clearButton
	document.getElementById( 'clearButton' ).onclick = clearFiles;
	//bundleButton
	bundleButton = document.getElementById( 'bundleButton' );
	bundleButton.onclick = startBundle;
	//htmlbutton
	document.getElementById( 'htmlButton' ).onclick = function () {

		htmlInput.click();

	};
	//filebutton
	document.getElementById( 'fileButton' ).onclick = function () {

		fileInput.click();

	};

	//cancelbutton
	let cancelbutton = document.getElementById( 'cancelButton' );
	cancelbutton.onclick = function () {

		this.parentElement.style.display = 'none';
		bundleButton.textContent = 'Bundle';
		savedResult = null;
		resetBundler();

	};

	//ok button
	let okbutton = document.getElementById( 'okButton' );
	okbutton.onclick = function () {

		this.parentElement.style.display = 'none';
		setTimeout( continueBundle, 500 );

	};


	//mismatch div
	mismatchDiv = document.getElementById( 'mismatch' );
	missingDiv = document.getElementById( 'missing' );
	noRefDiv = document.getElementById( 'noRef' );

	//actual infodiv and checkbox for obfucation
	obfuscateCheck = document.getElementById( 'obfuscateCheckbox' );
	indexInfoDiv = document.getElementById( 'indexInfo' );


	//global events
	//disable drag and drop on body
	window.addEventListener( "dragover", function ( e ) {

		e = e || event;
		e.preventDefault();

	}, false );
	window.addEventListener( "drop", function ( e ) {

		e = e || event;
		e.preventDefault();

	}, false );

	//collect mouse position..
	window.addEventListener( 'mousemove', function ( e ) {

		winMouseX = e.clientX;
		winMouseY = e.clientY;

	} );

};
















//DOM functionality
function showIndexInfo() {

	indexInfoDiv.style.top = ( winMouseY - 10 ) + 'px';
	indexInfoDiv.style.left = ( winMouseX + 5 ) + 'px';
	indexInfoDiv.style.display = 'block';

}
function hideIndexInfo() {

	indexInfoDiv.style.display = 'none';

}




//handleFile
function handleFileSelect( elt ) {

	let callback = ( elt === fileInput ) ? getFiles : getHTML;
	for ( let i = 0; i < elt.files.length; i ++ ) {

		let file = elt.files[ i ];
		let reader = new FileReader();
		reader.onload = function ( e ) {

			this.cb( { name: this.name, data: e.target.result } );

		}.bind( { name: file.name, cb: callback } );
		reader.readAsText( file );

	}

}


//when js jsFiles get loaded, this function handles the storage and display
function getFiles( file ) {

	//check type
	if ( file.name.substring( file.name.length - 3 ) != ".js" ) {

		typeError( 'JavaScript' );
		return;

	}

	//clear fileList
	if ( fileList.childNodes[ 0 ].textContent == empyFileListText ) fileList.innerHTML = '';

	//check if the file already is loaded
	for ( let i = 0; i < fileList.childNodes.length; i ++ ) {

		if ( fileList.childNodes[ i ].jsFile.name == file.name ) {

			return;

		}

	}

	//add file to filelist
	let rDiv = addRemovableDiv( file.name, fileList, true );
	rDiv.jsFile = {
		name: file.name,
		data: file.data
	};

	fileInput.value = '';

}

//when a html file gets loaded, this function handles the storage and display
function getHTML( file ) {

	//check type
	if ( file.name.substring( file.name.length - 5 ) != ".html" ) {

		typeError( 'HTML' );
		return;

	}

	//add div to list
	orderFile.innerHTML = '';
	addRemovableDiv( file.name, orderFile );

	//save data
	htmlFile = file.data.split( "\n" );
	htmlInput.value = '';

}

//pop a type error alert.
function typeError( type ) {

	alert( 'The file that you tried to upload is not the right filetype: ' + type + '!' );

}

//delete all files!
function clearFiles() {

	htmlFile.length = 0;
	orderFile.innerHTML = fileList.innerHTML = empyFileListText;

}






//add a div to the file lists on screen. Add a X and make it removable
function addRemovableDiv( name, container, draggable ) {

	//setup removable div
	let d = document.createElement( 'div' );
	d.textContent = name;
	d.className = "removableDiv";
	d.id = "removableDiv" + Math.floor( Math.random() * 9999 );

	//add dragability
	if ( draggable ) {

		d.style.borderStyle = "none none solid none";

		d.draggable = true;
		d.ondragenter = function () {

			this.classList.add( 'dragOverFile' );

		};
		d.ondragleave = function () {

			this.classList.remove( 'dragOverFile' );

		};
		d.ondragstart = dragRemovableDiv;
		d.ondrop = dropRemovableDiv;


		//add arrows up/down
		let mu = document.createElement( 'p' );
		mu.id = "mu";
		mu.onclick = moveUpRemovableDiv;

		let md = document.createElement( 'p' );
		md.id = "md";
		md.onclick = moveDownRemovableDiv;

		d.appendChild( mu );
		d.appendChild( md );

	}

	//add the cross to delete
	let x = document.createElement( 'p' );
	x.id = "cross";
	x.onclick = removeRemovableDiv;

	d.appendChild( x );
	container.appendChild( d );

	return d;

}

function removeRemovableDiv() {

	let jsFile = this.parentElement.jsFile;

	//if the div is in the jsfile list
	if ( jsFile ) {

		this.parentElement.parentElement.removeChild( this.parentElement );
		if ( fileList.childNodes.length == 0 ) fileList.innerHTML = empyFileListText;

	} else {

		htmlFile.length = 0;
		orderFile.innerHTML = empyFileListText;

	}

}

function dragRemovableDiv( e ) {

	e.dataTransfer.setData( "text", e.target.id );

}

function dropRemovableDiv( e ) {

	let fromElt = document.getElementById( e.dataTransfer.getData( 'text' ) );
	this.parentNode.insertBefore( fromElt, this );
	this.classList.remove( 'dragOverFile' );

}

function moveUpRemovableDiv() {

	if ( this.parentElement.previousElementSibling )
		this.parentElement.parentNode.insertBefore( this.parentElement, this.parentElement.previousElementSibling );

}
function moveDownRemovableDiv() {

	if ( this.parentElement.nextElementSibling ) {

		this.parentElement.parentNode.insertBefore( this.parentElement.nextElementSibling, this.parentElement );

	}

}

















//do bundling work.

function startBundle() {

	if ( fileList.childNodes.length == 1 && fileList.childNodes[ 0 ].textContent == "" ) return;

	bundleButton.innerHTML = 'Processing... <img id="cog" src="./cog.gif">';

	//give the button time to update its textContent....
	setTimeout( continueBundle, 500 );

}

function continueBundle() {

	let mergedFile;
	if ( savedResult ) {

		savedResult.forEach( file => {

			mergedFile += file.data + '\n\n';

		} );

	} else {

		mergedFile = mergeFiles();
		if ( mergedFile == 'error' ) return;

	}

	if ( obfuscateCheck.checked ) mergedFile = obfuscate( mergedFile );

	let modifiedHTML;
	if ( htmlFile.length > 0 ) modifiedHTML = modifyHTML( htmlFile );

	console.log( 'DOWNLOAD' );
	//console.log( mergedFile, modifiedHTML )
	download( mergedFile, modifiedHTML );
	resetBundler();

}



function mergeFiles() {

	let result = "";

	if ( htmlFile.length > 0 ) {

		//if htmlfile (order file) is presultent
		let { orderedFiles, isModule } = orderFiles();


		if ( orderedFiles == 'error' ) {

			return 'error';

		}


		if ( isModule ) {

			let collectedExports = {};
			orderedFiles.forEach( file=>{

				let c = collectExports( file );
				if ( c ) {

					file.data = c.result.join( '\n' );
					collectedExports[ file.name ] = c.aliases;

				}

			} );


			let importOutput = {};
			orderedFiles.forEach( file=>{

				let c = collectImports( file, collectedExports );
				if ( c ) {

					file.data = c.result.join( '\n' );
					importOutput[ file.name ] = { name: file.name, data: c.result };

				}

			} );

		}



		orderedFiles.forEach( file => {

			result += file.data + '\n\n';

		} );
		return result;


	} else {

		//use the order of the fileList
		fileList.childNodes.forEach( node =>{

			//check if there is an import/export??
			result += node.jsFile.data + '\n\n';

		} );
		return result;

	}

}




function orderFiles() {

	//init as object (hashmap), to prevent double filenames.
	let foundModule = false;
	let result = [];
	let totalReferences = {};

	//search html file for javacript filenames
	htmlFile.forEach( line => {

		let fileName = getFileName( line );
		let isModule = line.includes( 'type="module"' );

		if ( fileName && ! totalReferences[ fileName ] ) {

			totalReferences[ fileName ] = fileName;
			for ( let i = 0; i < fileList.childNodes.length; i ++ ) {

				if ( fileList.childNodes[ i ].jsFile.name == fileName ) {

					//////result.push( fileList.childNodes[i].jsFile );
					//////
					result.push( {
						name: fileList.childNodes[ i ].jsFile.name,
						data: fileList.childNodes[ i ].jsFile.data,
						read: false
					} );

					if ( isModule ) {

						foundModule = true;
						searchAndOrderImportFiles( fileList.childNodes[ i ].jsFile, result, totalReferences );

					}

					break;

				}

			}

		}

	} );

	//get differences/mismatching names..
	let d = getDiffString( totalReferences );

	if ( d.missing.length > 0 || d.noRef.length > 0 ) {

		//show the mismatch div.
		missingDiv.innerHTML = d.missing;
		noRefDiv.innerHTML = d.noRef;
		mismatchDiv.style.display = 'block';
		//save the resultult to continue it later.
		savedResult = result;
		return 'error';

	}

	return { orderedFiles: result, isModule: foundModule };

}




function searchAndOrderImportFiles( file, result, totalReferences ) {

	let lines = file.data.split( '\n' );
	file.read = true;
	lines.forEach( line=>{

		let comment = line.search( '//' );
		let imp = line.search( 'import' );
		if ( imp >= 0 && ( comment < 0 || comment > imp ) ) {

			let fileName = getImportFileName( line );
			console.log( fileName );

			if ( ! totalReferences[ fileName ] ) {

				//doesnt exist, put on top!
				totalReferences[ fileName ] = fileName;

			}

			//get matching file from filelist
			for ( let x = 0; x < fileList.childNodes.length; x ++ ) {

				if ( fileList.childNodes[ x ].jsFile.name == fileName ) {

					// if (!totalReferences[ fileName ]) {
					//   //doesnt exist, put on top!
					//   totalReferences[ fileName ] = fileName;


					// } else {
					//if already exist, make sure it is above the file from where it was imported
					let existingFileIndex = null;
					let originFileIndex = null;
					for ( let i = 0; i < result.length; i ++ ) {

						if ( result[ i ].name == fileName ) existingFileIndex = i;
						if ( result[ i ].name == file.name ) originFileIndex = i;

					}

					//move the file above the originfile...
					if ( existingFileIndex != null && originFileIndex != null &&
              existingFileIndex > originFileIndex ) {

						let existingFile = result.splice( existingFileIndex, 1 )[ 0 ];
						result.splice( originFileIndex, 0, existingFile );

					} else {

						//result.unshift( fileList.childNodes[x].jsFile );
						result.unshift( {
							name: fileList.childNodes[ x ].jsFile.name,
							data: fileList.childNodes[ x ].jsFile.data,
							read: false
						} );

					}
					// }


					if ( ! fileList.childNodes[ x ].jsFile.read ) searchAndOrderImportFiles( fileList.childNodes[ x ].jsFile, result, totalReferences );

					break;

				}

			}

		}

	} );

}






















function collectExports( file ) {

	if ( ! file.data.includes( 'export' ) ) return;

	let result = [];
	let aliases = {};
	let strings = file.data.split( '\n' );
	strings.forEach( line =>{

		let comment = line.search( '//' );
		if ( comment >= 0 ) line = line.substring( 0, comment );

		let exp = line.search( 'export' );
		if ( exp < 0 ) {

			result.push( line );

		} else if ( exp >= 0 ) {

			if ( line.includes( ' from ' ) ) {

				result.push( '//ERROR: "export from" is not allowed.' );
				console.error( '//ERROR: "export from" is not allowed.' );


			} else if ( line.includes( 'export let' ) || line.includes( 'export const' ) || line.includes( 'export var' ) ||
                 line.includes( 'export function' ) || line.includes( 'export class' ) ) {

				//remove export...
				result.push( line.replace( 'export ', '' ) );

			} else if ( line.includes( 'export {' ) ) {

				extractNamesAndAliases( line, result, aliases );

			} else if ( line.includes( 'default' ) ) {

				extractDefault( line, result, aliases );

			} else {

				result.push( line );

			}

		}

	} );

	if ( result.length > 0 ) {

		return {
			result: result,
			aliases: aliases
		};

	}

}






function extractNamesAndAliases( line, result, aliases ) {

	let workLine = line.replace( 'export ', '' ).replace( '{', '' ).replace( '}', '' ).replace( ';', '' ).trim();
	let nameNAlias = workLine.split( ',' );
	nameNAlias.forEach( name=>{

		name = name.trim();
		if ( name.includes( ' as ' ) ) {

			let nameNAlias = name.split( ' as ' );

			aliases[ nameNAlias[ 1 ] ] = nameNAlias[ 0 ];
			if ( nameNAlias[ 1 ] != 'default' ) result.push( `let ${nameNAlias[ 1 ]} = ${nameNAlias[ 0 ]};` );


		} else {

			aliases[ name ] = name;

		}

	} );





}



function extractDefault( line, result, aliases ) {

	//check if it is unnamed function

	line = line.replace( ';', '' );

	let defaults = [
		"export default function (",
		"export default function(",
		"export default class {",
		"export default class {",
	];
	let found = false;

	for ( let i = 0; i < defaults.length; i ++ ) {

		if ( line.includes( defaults[ i ] ) ) {

			let rndV = "rndV" + Math.floor( Math.random() * 9999 );
			aliases[ 'default' ] = rndV;

			let c = ( i < 2 ) ? 'function ' : "class ";
			let ec = ( i < 2 ) ? '(' : "{";


			line = line.replace( defaults[ i ], c + rndV + ec );

			result.push( line );
			found = true;
			break;

		}

	}

	if ( ! found ) {

		//check if named function
		let name = null;
		if ( line.includes( 'function' ) ) {

			let st = line.search( 'function ' ) + 9;
			for ( let i = st; i < line.length; i ++ ) {

				if ( line.charAt( i ) == " " || line.charAt( i ) == '(' ) {

					name = line.substring( st, i );

				}

			}

		} else if ( line.includes( 'class' ) ) {

			let st = line.search( 'class ' ) + 6;
			for ( let i = st; i < line.length; i ++ ) {

				if ( line.charAt( i ) == " " || line.charAt( i ) == '{' ) {

					name = line.substring( st, i );

				}

			}

		} else {

			console.log( line.replace( 'export default ', '' ) );
			name = line.replace( 'export default ', '' );

		}

		if ( name ) {

			aliases[ 'default' ] = name;
			aliases[ name ] = name;

		}

	}

}












function collectImports( file, aliases ) {

	if ( ! file.data.includes( 'import' ) ) return;

	let result = [];
	let strings = file.data.split( '\n' );


	strings.forEach( line =>{

		let comment = line.search( '//' );
		if ( comment >= 0 ) line = line.substring( 0, comment );



		let imp = line.search( 'import' );
		if ( imp < 0 ) {

			result.push( line );

		} else if ( imp >= 0 ) {



			if ( line.includes( 'import "' ) || line.includes( "import '" ) ) {

				//do nothing

			} else if ( line.includes( 'import(' ) || line.includes( "import (" ) ) {

				//change promise, or remove of somthing?
				console.log( 'promise import, not working, too be implemented' );


			} else {

				let filename = getImportFileName( line );
				let fileAliases = aliases[ filename ];

				let fr = line.search( 'from' );
				let vars = line.substring( imp + 6, fr ).trim();
				console.log( vars, filename, fileAliases );

				if ( line.includes( 'import * as ' ) ) {

					//strip data from 'name.'
					//or, check aliasses and make it a let?
					let start = line.search( 'as ' ) + 3;
					let end = line.search( 'from' );
					let name = line.substring( start, end ).trim();

					let str = `let ${name}DefImp = {`;

					for ( let alias in fileAliases ) {

						//alias = fileAliases[alias];
						str += alias + ": " + fileAliases[ alias ] + ", ";

					}
					str = str.substring( 0, str.length - 2 );
					str += "};";
					//}
					result.push( str );

					for ( let i = 0; i < strings.length; i ++ ) {

						strings[ i ] = strings[ i ].replace( name + ".", name + "DefImp." );

					}

					console.log( 'stripdata * as name' );




				} else if ( vars.includes( ', * as ' ) || vars.includes( ',* as ' ) || vars.includes( ',*as ' ) ) {

					let start = vars.search( ',' );
					let end = vars.search( 'as ' );
					let splitstr = vars.substring( start, end + 3 );
					let split = vars.split( splitstr );


					if ( split[ 0 ] != fileAliases.default ) {

						result.push( `let ${split[ 0 ]} = ${fileAliases.default};` );

					}


					let str = `let ${split[ 1 ]}DefImp = {`;
					for ( let alias in fileAliases ) {

						// alias = fileAliases[alias];
						str += alias + ": " + fileAliases[ alias ] + ", ";

					}
					str = str.substring( 0, str.length - 2 );
					str += "};";
					// }
					result.push( str );

					//check file and remove alias
					for ( let i = 0; i < strings.length; i ++ ) {

						strings[ i ] = strings[ i ].replace( split[ 1 ] + ".", split[ 1 ] + "DefImp." );

					}



					//part 1 == default
					//part 2 => strip data of 'name.'
					console.log( 'default + stripdata' );





				} else if ( vars.includes( ', {' ) || vars.includes( ',{' ) ) {

					let splitstr = ( vars.includes( ', {' ) ) ? ', {' : ",{";
					let split = vars.split( splitstr );

					if ( split[ 0 ] != fileAliases.default ) {

						result.push( `let ${split[ 0 ]} = ${fileAliases.default};` );

					}

					let res = [];
					extractNamesAndAliases( split[ 1 ], res, {} );
					result = result.concat( res );

					console.log( 'default + check for as' );




				} else if ( vars.includes( '{' ) ) {

					//search for ' as '
					let res = [];
					extractNamesAndAliases( vars, res, {} );
					result = result.concat( res );
					//check if there is a 'default'!?!?
					console.log( 'check for as' );


				} else {

					//default
					console.log( 'default' );
					if ( vars != fileAliases.default ) {

						result.push( `let ${vars} = ${fileAliases.default}` );

					}

				}

			}




			//result.push( line + "  //////IMPORT!!!!!");

		}

	} );

	if ( result.length > 0 ) {

		return {
			result: result
		};
		// collector[ file.name ] = {};
		// collector[ file.name ].data = result;
		// collector[ file.name ].aliases = aliases;

	}

}














function resetBundler() {

	fileList.childNodes.forEach( node=>{

		node.jsFile.read = false;

	} );
	savedResult = null;
	bundleButton.textContent = "Bundle";

}

function modifyHTML( html ) {

	let newHTML = [].concat( html );
	//cleanup, remove script tags from files we're bundling
	for ( let i = newHTML.length - 1; i >= 0; i -- ) {

		let fileName = getFileName( newHTML[ i ] );
		if ( fileName ) {

			for ( let x = 0; x < fileList.childNodes.length; x ++ ) {

				if ( fileList.childNodes[ x ].jsFile.name == fileName ) {

					newHTML.splice( i, 1 );
					break;

				}

			}

		}

	}
	//add a script tag for bundle.js!!! (just before the </head>) :)
	for ( let i = 0; i < newHTML.length; i ++ ) {

		if ( newHTML[ i ].search( '</head>' ) >= 0 ) {

			newHTML.splice( i, 0, '    <script src="./bundle.js"></script>' );
			newHTML.splice( i + 1, 0, '' );
			break;

		}

	}
	return newHTML.join( '\n' );

}

function getFileName( line ) {

	let ext = line.lastIndexOf( ".js" );
	let scr = line.search( 'script' );
	if ( scr > 0 && ext > 0 ) {

		let part = line.substr( 0, ext + 3 );
		let start = [
			part.lastIndexOf( "/" ),
			part.lastIndexOf( '"' ),
			part.lastIndexOf( "'" )
		].filter( value =>{

			return value > 0;

		} ).sort( ( a, b )=>{

			return b - a;

		} );

		let fileName = part.substr( start[ 0 ] + 1 );
		return fileName;

	}

}

function getImportFileName( line ) {

	let ext = line.lastIndexOf( ".js" );
	let part = line.substr( 0, ext + 3 );
	let start = [
		part.lastIndexOf( "/" ),
		part.lastIndexOf( '"' ),
		part.lastIndexOf( "'" )
	].filter( value =>{

		return value > 0;

	} ).sort( ( a, b )=>{

		return b - a;

	} );

	let fileName = part.substr( start[ 0 ] + 1 );
	return fileName;

}

function getDiffString( result ) {

	//check for references for files that are not loaded
	let missing = "";
	for ( let res in result ) {

		let found = false;
		for ( let x = 0; x < fileList.childNodes.length; x ++ ) {

			if ( result[ res ] == fileList.childNodes[ x ].jsFile.name ) {

				found = true;
				break;

			}

		}
		if ( ! found ) missing += "- " + result[ res ] + "<br>";

	}
	//check for files that are loaded but not refereced;
	let noRef = "";
	for ( let i = 0; i < fileList.childNodes.length; i ++ ) {

		let found = false;

		for ( let res in result ) {

			if ( fileList.childNodes[ i ].jsFile.name == result[ res ] ) {

				found = true;
				break;

			}

		}
		if ( ! found ) noRef += "- " + fileList.childNodes[ i ].jsFile.name + "<br>";

	}
	return { missing: missing, noRef: noRef };

}













function obfuscate( code ) {

	let options = {
		compact: true,
		controlFlowFlattening: false,
		deadCodeInjection: false,
		debugProtection: false,
		debugProtectionInterval: false,
		disableConsoleOutput: true,
		identifierNamesGenerator: 'hexadecimal',
		log: false,
		renameGlobals: false,
		rotateStringArray: true,
		selfDefending: true,
		shuffleStringArray: true,
		splitStrings: false,
		stringArray: true,
		stringArrayEncoding: false,
		stringArrayThreshold: 0.75,
		unicodeEscapeSequence: false
	};

	let result = JavaScriptObfuscator.obfuscate(
		code, options
	);

	return result.getObfuscatedCode();

}

function download( code, html ) {

	let zip = new JSZip();
	zip.file( 'bundle.js', code );
	if ( html ) zip.file( 'index.html', html );
	zip.generateAsync( { type: 'blob' } )
		.then( resultult =>{

			let pom = document.createElement( 'a' );
			pom.setAttribute( 'href', window.URL.createObjectURL( resultult ) );
			pom.setAttribute( 'download', 'bundle.zip' );
			pom.click();

		} );

}
