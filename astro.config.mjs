import { defineConfig } from 'astro/config';
import path from "path";
const __dirname = path.dirname(new URL(import.meta.url).pathname);

export default defineConfig({
	build: {
    format: 'file', // Генерация страниц как отдельных файлов
  },
	vite: {
    server: {
      proxy: {
        '/assets': 'http://localhost:5173', // Проксируем Webpack
      },
			watch: {
        paths: ['dist/assets/**/*.js'], // Следим за изменениями JS-файлов
      },
    },
		resolve: {
			alias: {
				'img': path.resolve(__dirname, 'public/img')
			}
		}
  },
});
