import { createApp } from 'vue';
import App from './App.vue';
import './styles.less';
import 'ant-design-vue/dist/antd.dark.css';
import './panel/view/styles.less';
import './panel/view/components/code/worker';
import { loadWASM } from 'onigasm';

createApp(App).mount('#app');

window.addEventListener('load', async () => {
    const wasm = await window.editor.extra.get('code/onigasm.wasm');
    const ab = new ArrayBuffer(wasm.length);
    const view = new Uint8Array(ab);
    wasm.forEach((v, i) => (view[i] = v));

    await loadWASM(ab);
});
