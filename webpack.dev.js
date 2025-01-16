import path from 'path';

const __dirname = path.dirname(new URL(import.meta.url).pathname);

const config = {
	target: "web",
	mode: "development",
	devtool: 'inline-source-map',
	entry: './src/scripts/index.js',
	output: {
    path: path.resolve(__dirname, 'dist/assets'), // Папка для выходных файлов
		publicPath: `/assets/`,
    filename: '[name].js', // Файл выхода
  },
	optimization: {
		minimize: false
	},
	resolve: {
    extensions: ['.ts', '.js'], // Расширения, которые Webpack будет обрабатывать
  },
	devServer: {
		port: 5173,
    devMiddleware: {
      writeToDisk: false, // Записывать файлы на диск не нужно, используем память
    },
	},
	module: {
		rules: [
			{
        test: /\.ts|\.js$/, // Обрабатываем TypeScript файлы
        use: 'ts-loader', // Используем ts-loader для компиляции TypeScript в JavaScript
        exclude: /node_modules/,
      },
			{
				test: /\.(scss|css)$/,
				use: [
					'style-loader',
					{
						loader: 'css-loader',
						options: {
							sourceMap: true,
							importLoaders: 1,
							modules: false,
							url: {
								filter: (url, _) => {
									if (url.includes("img/") || url.includes("fonts/") || url.includes("cursors/")) {
										return false;
									}
									return true;
								},
							},
						},
					},
					{
						loader: 'sass-loader',
						options: {
							sourceMap: true,
						}
					},
					{
						loader: 'string-replace-loader',
						options: {
							search: '@img',
							replace: '../img',
							flags: 'g'
						}
					}
				],
			}
    ]
	}
};

export default config;