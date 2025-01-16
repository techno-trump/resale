import gulp from "gulp";
import notify from "gulp-notify";
import plumber from "gulp-plumber";
import fs from 'fs';
import fonter from 'gulp-fonter-fix';
import ttfToWoff2Converter from "gulp-ttf2woff2";

const srcPath = `./src/fonts`;
const buildPath = `./public/assets/fonts`;
const fontFacesPath = `./src/styles/fonts.scss`;

const otfToTtf = () => {
	const { src, dest } = gulp;

	return src(`${srcPath}/*.otf`)
		.pipe(plumber({
			errorHandler: notify.onError({
				title: "Fonts (otfToTtf)",
				message: "Error: <%= error.message %>"
			})
		}))
		.pipe(fonter({
			formats: ['ttf']
		}))
		.pipe(dest(srcPath));
}
const ttfToWoff = () => {
	const { src, dest } = gulp;

	return src(`${srcPath}/*.ttf`)
		.pipe(plumber({
			errorHandler: notify.onError({
				title: "Fonts (ttfToWoff)",
				message: "Error: <%= error.message %>"
			})
		}))
		.pipe(fonter({
			formats: ['woff']
		}))
		.pipe(dest(buildPath));
}
const ttfToWoff2 = () => {
	const { src, dest } = gulp;

	return src(`${srcPath}/*.ttf`)
		.pipe(plumber({
			errorHandler: notify.onError({
				title: "Fonts (ttfToWoff2)",
				message: "Error: <%= error.message %>"
			})
		}))
		.pipe(ttfToWoff2Converter())
		.pipe(dest(buildPath));
}

export const generateFontFaces = (cb) => {
	const formatMap = {
		"woff": "woff",
		"woff2": "woff2",
		"ttf": "truetype",
	};
	const weightMap = {
		"thin": 100,
		"extralight": 200, "extra-light": 200, "extra_light": 200, "extra light": 200,
		"light": 300,
		"normal": 400,
		"regular": 400,
		"medium": 500,
		"demibold": 600, "demi-bold": 600, "demi_bold": 600, "demi bold": 600,
		"semibold": 600, "semi-bold": 600, "semi_bold": 600, "semi bold": 600,
		"bold": 700,
		"black": 900, "havy": 900, "extrabold": 900,
	};
	const wd = "[\\s_\\-]*";
	const weightPatterns = [
		"thin", "100",
		`extra${wd}light`, `ultra${wd}light`, "200",
		"light", "300",
		"normal", "regular", "400",
		"medium", "500",
		`demi${wd}bold`, `semi${wd}bold`, "600",
		`bold`, "700",
		`black`, `havy`, `extrabold`, "900",
	].join("|");
	const stylePatterns = [
		"italic",
		"normal",
		"oblique"
	].join("|");
	const formatPatterns = [
		"otf",
		"ttf",
		"woff",
		"woff2",
	].join("|");
	const fontNameExp = new RegExp(`^(.+?)${wd}(?:${weightPatterns}).+?`, "i");
	const weightExp = new RegExp(`.+?(${weightPatterns}).+?`, "i");
	const styleExp = new RegExp(`.+?(${stylePatterns}).+?`, "i");
	const formatExp = new RegExp(`.+?(${formatPatterns})$`, "i");
	const cache = {};
	fs.readdir(buildPath, function (err, fontFiles) {
		if (err) return console.error(`Error encountered while attempt to read fonts files: ${err}`), cb();
		if (!fontFiles) return console.log(`No files to process`), cb();
		processFiles(fontFiles);
	});

	function processFiles(fontFiles) {
		let facesFile;
		try {
			if (fs.existsSync(fontFacesPath)) {
				if (process.argv.includes('--rewrite')) {
					try {
						fs.unlinkSync(fontFacesPath);
						console.log("Current fonts.scss has been removed");
					} catch (err) {
						console.error(`Error encountered while fonts.scss removal: ${err}`);
					}
				} else {
					console.log("Файл fonts.scss уже существует. Для обновления файла нужно его удалить или применить флаг --rewrite!");
					return cb();
				}
			}
			facesFile = fs.openSync(fontFacesPath, "wx");
			fontFiles.forEach((fileName) => {
				let match = fileName.match(fontNameExp);
				if (!match) {
					console.error(`Fail while parsing <${fileName}> font name`);
					return;
				}	
				const fontName = match[1];
				match = fileName.match(weightExp);
				const weight = match && match[1].toLowerCase() || "normal";
				match = fileName.match(styleExp);
				const style = match && match[1].toLowerCase() || "normal";
				match = fileName.match(formatExp);
				if (!match) throw new Error(`Fail while parsing <${fileName}> format`);
				const format = match[1].toLowerCase();
				
				if (!weightMap[weight] || !formatMap[format]) {
					throw new Error(`Can't recognize file format: ${fileName}; weight: ${weight}; style: ${style}; format: ${format}`);
				}
				
				if (!cache[fontName]) {
					cache[fontName] = {
						[weight]: {
							[style]: [[fileName, format]]
						}
					};
				} else if (!cache[fontName][weight]) {
					cache[fontName][weight] = {
						[style]: [[fileName, format]]
					};
				} else if (!cache[fontName][weight][style]) {
					cache[fontName][weight][style] = [[fileName, format]];
				} else {
					cache[fontName][weight][style].push([fileName, format]);
				}
			});
	
			Object.keys(cache).forEach((fontName) => {
				const byWeight = cache[fontName];
				Object.keys(byWeight).forEach((fontWeight) => {
					const byStyle = cache[fontName][fontWeight];
					Object.keys(byStyle).forEach((fontStyle) => {
						const formats = cache[fontName][fontWeight][fontStyle];
						const fontFace = _generateFontFace(fontName, fontWeight, fontStyle, formats);
						fs.writeSync(facesFile, fontFace, null);
					});
				});
			});
		} catch(err) {
			fs.closeSync(facesFile);
			fs.rmSync(fontFacesPath);
			throw new Error(err);
		}
		cb();
	}
	
	function _generateFontFace(fontName, fontWeight, fontStyle, formats) {
		
		const sources = formats.map(([fileName, ext]) => {
			const format = formatMap[ext];
			return `url('${process.argv.includes('--prod') ? "./" : "/assets/"}fonts/${fileName}') format('${format}')`;
		}).join(",");

		return `@font-face {\n\tfont-family: '${fontName}';\n\tsrc: local('☺'), ${sources};\n\tfont-weight: ${weightMap[fontWeight]};\n\tfont-style: ${fontStyle};\nfont-display: swap;\n}\n`;
	}
}

export const buildFonts = gulp.series(otfToTtf, ttfToWoff, ttfToWoff2, generateFontFaces);