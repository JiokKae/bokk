import { defineConfig, loadEnv, transformWithEsbuild } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), ['VITE_', 'REACT_APP_']);
	const processEnvDefine = {};
	for (const [key, val] of Object.entries(env)) {
		processEnvDefine[`process.env.${key}`] = JSON.stringify(val);
	}

	return {
		plugins: [
			{
				name: 'treat-js-files-as-jsx',
				async transform(code, id) {
					if (!id.match(/src\/.*\.js$/)) return null;
					return transformWithEsbuild(code, id, {
						loader: 'jsx',
						jsx: 'automatic',
					});
				},
			},
			react(),
		],
		envPrefix: ['VITE_', 'REACT_APP_'],
		define: processEnvDefine,
		optimizeDeps: {
			esbuildOptions: {
				loader: {
					'.js': 'jsx',
				},
			},
		},
		server: {
			port: 3000,
			host: true,
		},
		build: {
			outDir: 'build',
		},
	};
});
