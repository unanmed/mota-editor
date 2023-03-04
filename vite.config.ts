import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import electron from 'vite-plugin-electron';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        vue(),
        electron({
            entry: 'electron/index.ts'
        })
    ],
    server: {
        port: 6000,
        host: '127.0.0.1'
    }
});
