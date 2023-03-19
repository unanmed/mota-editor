import { readFile, writeFile } from 'fs/promises';

interface FileHandler {
    read: typeof readFile;
    readdir: (path: string) => Promise<string[]>;
    write: typeof writeFile;
}
