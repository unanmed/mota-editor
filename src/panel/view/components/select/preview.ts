import { Ticker } from 'mutate-animate';
import { ref } from 'vue';

export class AudioPreviewer {
    ac = new AudioContext();

    path: string;
    buffer?: ArrayBuffer;
    audio?: AudioBuffer;
    source?: AudioBufferSourceNode;

    playing = ref(false);
    progress = ref(0);
    previewing = ref(false);

    ticker: Ticker = new Ticker();

    destroyed: boolean = false;
    readyed = false;

    start: number = 0;

    constructor(path: string) {
        this.path = path;
        this.getData();
    }

    async getData() {
        const data = (await window.editor.file.read(this.path)) as Uint8Array;
        const buffer = new ArrayBuffer(data.byteLength);
        const uintArr = new Uint8Array(buffer);
        uintArr.set(data);
        try {
            const audio = await this.ac.decodeAudioData(buffer);
            this.audio = audio;
            this.buffer = buffer;
            this.ready();
        } catch {
            this.previewing.value = false;
            alert('音频解析失败！');
        }
    }

    ready() {
        if (!this.audio || !this.buffer) return;
        this.playing.value = false;
        this.source?.stop();
        const source = this.ac.createBufferSource();
        source.buffer = this.audio;
        this.source = source;
        source.connect(this.ac.destination);
        this.source.start();
        this.ac.suspend();
        const start = this.ac.currentTime;
        this.start = start;
        this.ticker.clear();
        this.progress.value = 0;
    }

    play() {
        this.ticker.add(this.cal);
        this.playing.value = true;
        this.ac.resume();
    }

    pause() {
        this.ticker.clear();
        this.playing.value = false;
        this.ac.suspend();
    }

    trigger() {
        this.playing.value ? this.pause() : this.play();
    }

    cal = () => {
        console.log(1);

        this.progress.value =
            ((this.ac.currentTime - this.start) / this.audio!.duration) * 100;
    };

    destroy() {
        this.destroyed = true;
        this.ticker.destroy();
    }
}
