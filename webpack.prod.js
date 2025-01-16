import path from 'path';
import MiniCssExtractPlugin from "mini-css-extract-plugin";

const __dirname = path.resolve();

const config = {
	target: "web",
	mode: "production",
	entry: './src/scripts/index.js',
	output: {
    path: path.resolve(__dirname, 'dist/assets'), // Папка для выходных файлов
				publicPath: `/assets/`,
				filename: '[name].js', // Файл выхода
  },
	optimization: {
		minimize: true
	},
	resolve: {
    extensions: ['.ts', '.js'], // Расширения, которые Webpack будет обрабатывать
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
					MiniCssExtractPlugin.loader,
					{
						loader: 'string-replace-loader',
						options: {
							search: '@img',
							replace: '../img',
							flags: 'g'
						}
					},
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
					// "group-css-media-queries-loader",
					{
						loader: 'sass-loader',
						options: {
							sourceMap: true,
						}
					}
				],
			},
    ]
	},
	plugins: [
		new MiniCssExtractPlugin({
			filename: '[name].css',
		})
	],
};

export default config;