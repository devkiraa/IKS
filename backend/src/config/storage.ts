import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get the absolute path for local storage
const getLocalStoragePath = (): string => {
    const storagePath = path.resolve(__dirname, '..', '..', config.storage.localPath);
    // Ensure the directory exists
    if (!fs.existsSync(storagePath)) {
        fs.mkdirSync(storagePath, { recursive: true });
    }
    return storagePath;
};

// Initialize storage directory on module load
const STORAGE_PATH = getLocalStoragePath();
console.log(`📁 Local storage initialized at: ${STORAGE_PATH}`);

/**
 * Upload a file to local storage
 */
export const uploadToStorage = async (
    key: string,
    body: Buffer,
    _contentType?: string,
    _metadata?: Record<string, string>
): Promise<void> => {
    const filePath = path.join(STORAGE_PATH, key);

    // Ensure subdirectory exists
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    await fs.promises.writeFile(filePath, body);
};

/**
 * Get a file from local storage
 */
export const getFromStorage = async (key: string): Promise<Buffer> => {
    const filePath = path.join(STORAGE_PATH, key);

    if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${key}`);
    }

    return fs.promises.readFile(filePath);
};

/**
 * Delete a file from local storage
 */
export const deleteFromStorage = async (key: string): Promise<void> => {
    const filePath = path.join(STORAGE_PATH, key);

    if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
    }
};

/**
 * Check if a file exists in local storage
 */
export const objectExists = async (key: string): Promise<boolean> => {
    const filePath = path.join(STORAGE_PATH, key);
    return fs.existsSync(filePath);
};

/**
 * Get the full file path for a storage key
 */
export const getFilePath = (key: string): string => {
    return path.join(STORAGE_PATH, key);
};

/**
 * Get a readable stream for a file (for efficient serving)
 */
export const getFileStream = (key: string): fs.ReadStream => {
    const filePath = path.join(STORAGE_PATH, key);
    if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${key}`);
    }
    return fs.createReadStream(filePath);
};

/**
 * Get file stats (size, modified time, etc.)
 */
export const getFileStats = async (key: string): Promise<fs.Stats> => {
    const filePath = path.join(STORAGE_PATH, key);
    return fs.promises.stat(filePath);
};

/**
 * Get storage directory info
 */
export const getStorageInfo = () => ({
    path: STORAGE_PATH,
    type: 'local',
});

// Legacy export for compatibility (no-op in local storage)
export const storageBucket = 'local';
export const getSignedDownloadUrl = async (key: string): Promise<string> => {
    return getFilePath(key);
};
