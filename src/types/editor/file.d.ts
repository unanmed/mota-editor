import { readFile } from 'fs/promises';

interface FileHandler {
    read: typeof readFile;
    readdir: (path: string) => Promise<string[]>;
}
