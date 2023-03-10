import { readFile } from 'fs/promises';

interface FileHandler {
    read: typeof readFile;
}
