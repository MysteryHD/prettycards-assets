
var fs = require('fs');

/*
Stuff that this should do:
- Log and transform theme songs
- Log HD skins

*/

const HD_SKIN_IMAGE_PATH = "../img/HDCardSkins";
const HD_SKIN_JSON_PATH = "../json/hdCardSkins.json";
const INSET_THEME_SONGS_PATH = "../INSERT_THEME_SONGS_HERE";
const CARDS_AUDIO_PATH = "../audio/cards";
const CARDS_AUDIO_JSON_PATH = "../json/baseThemeSongData.json";
const CARDS_AUDIO_DATA_THAT_SHOULD_CARRY_OVER = ["_Disabled_Themes"];

function MapHDSkins() {
	var images = fs.readdirSync(HD_SKIN_IMAGE_PATH);
	var data = images.map(RemoveFileExtension);
	
	fs.writeFileSync(HD_SKIN_JSON_PATH, JSON.stringify(data, null, 4));
}

function TransformThemeSongs() {
	//console.log(fs.readdirSync(INSET_THEME_SONGS_PATH));
	fs.readdirSync(INSET_THEME_SONGS_PATH).forEach(filename => {
		if (!filename.endsWith(".ogg")) {
			console.log(`	"${filename}" is not an audio file. Skipping!`);
			return; // The foreach version of continue
		}
		var myFormat = GetMyFileNameAndFolderFromMysterysFormat(filename);
		console.log(`	Attempting to move ${filename} as ${myFormat.folder}#${myFormat.index}`);
		var fullFolder = `${CARDS_AUDIO_PATH}/${myFormat.folder}`;
		if (!fs.existsSync(fullFolder)) {
			fs.mkdirSync(fullFolder);
		}
		fs.writeFileSync(`${fullFolder}/intro_${myFormat.index}.ogg`, fs.readFileSync(`${INSET_THEME_SONGS_PATH}/${filename}`));
		fs.rmSync(`${INSET_THEME_SONGS_PATH}/${filename}`);
	});
}

function MapThemeSongs() {
	var data = {};
	var dirs = getDirectories(CARDS_AUDIO_PATH);
	dirs.forEach(dir => {
		console.log(`   Started On: ${dir}`);
		
		var dirContents = fs.readdirSync(`${CARDS_AUDIO_PATH}/${dir}`);
		//var maxNum = dirContents.map(GetMyFileNameAndFolderFromMysterysFormat).sort((a, b) => b.index - a.index)[0]; // This is a very disgusting hack, but it *should* work . . .
		var maxNum = dirContents.length; // Nevermind, I am stoopid
		data[dir.replace(/_/gm, " ")] = maxNum;
	});
	var oldData = JSON.parse(fs.readFileSync(CARDS_AUDIO_JSON_PATH).toString());
	CARDS_AUDIO_DATA_THAT_SHOULD_CARRY_OVER.forEach(prop => {data[prop] = oldData[prop];})
	fs.writeFileSync(CARDS_AUDIO_JSON_PATH, JSON.stringify(data, null, 4));
}

function RemoveFileExtension(/** @type {string} */ fileName) {
	var arr = fileName.split(".");
	arr.splice(arr.length-1, 1);
	return arr.join(".");
}

function GetMyFileNameAndFolderFromMysterysFormat(/** @type {string} */ name) {
	var name2 = RemoveFileExtension(name);
	if (name2.length <= 0) {
		throw new Error(`GetMyFileNameAndFolderFromMysterysFormat received an invalid filename (empty) "${name}" ("${name2}" after trimming the file extension)`);
	}
	var digit = name2.charAt(name2.length-1);
	var number = 0;
	var p = 1;
	while (name2.length > 0 && !isNaN(parseInt(digit))) {
		number = number + p*parseInt(digit);
		p *= 10;
		name2 = name2.substring(0,name2.length-1);
		digit = name2.charAt(name2.length-2);
	}
	if (number == 0) {
		number = 1;
	}
	if (name2.length <= 0) {
		throw new Error(`GetMyFileNameAndFolderFromMysterysFormat received an invalid filename (numbers only) "${name}" ("${name2}" after trimming the file extension and number)`);
	}
	return {folder: name2, index: number};
}

// This handly little thing is from StackOverflow, but nobody needs to know that
const getDirectories = source =>
	fs.readdirSync(source, { withFileTypes: true })
	  .filter(dirent => dirent.isDirectory())
	  .map(dirent => dirent.name)


console.log("Starting . . .");
MapHDSkins();
console.log("HD Skins Mapped . . .");
TransformThemeSongs();
console.log("Theme songs transformed . . .");
MapThemeSongs();
console.log("Theme Songs Mapped! Done!");