import { readFile, stat, writeFile } from 'fs/promises';

interface FileHandler {
    read: typeof readFile;
    readdir: (path: string) => Promise<string[]>;
    write: typeof writeFile;
    isFile: (path: string) => Promise<boolean>;
}
