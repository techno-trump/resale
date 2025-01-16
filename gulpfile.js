// Импорт основного модуля
import gulp from "gulp";
import { buildFonts, generateFontFaces } from "./gulp-tasks/fonts.js";
import { processIconFonts, processFontFaces as convertIconFontsFaces } from "./gulp-tasks/icon-fonts.js";


export const build = gulp.series(buildFonts, processIconFonts);

export { convertIconFontsFaces };
export { generateFontFaces };
export { processIconFonts };
export { buildFonts };

gulp.task('default', build);