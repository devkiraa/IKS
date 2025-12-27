import { getPgPool } from '../config/database.js';

export interface WatermarkSettings {
    text: string;
    enabled: boolean;
    fontSize: number;
    opacity: number;
    position: 'diagonal' | 'center' | 'footer' | 'tiled';
    color: string;
    includeUserId: boolean;
    includeTimestamp: boolean;
}

export interface AppSettings {
    watermark: WatermarkSettings;
}

/**
 * Get a setting by key
 */
export async function getSetting<T = unknown>(key: string): Promise<T | null> {
    const pool = getPgPool();
    const result = await pool.query(
        'SELECT value FROM app_settings WHERE key = $1',
        [key]
    );

    if (result.rows.length === 0) {
        return null;
    }

    return result.rows[0].value as T;
}

/**
 * Update a setting
 */
export async function updateSetting<T = unknown>(
    key: string,
    value: T,
    userId?: string
): Promise<void> {
    const pool = getPgPool();
    await pool.query(
        `INSERT INTO app_settings (key, value, updated_at, updated_by) 
         VALUES ($1, $2::jsonb, CURRENT_TIMESTAMP, $3)
         ON CONFLICT (key) DO UPDATE SET 
            value = $2::jsonb, 
            updated_at = CURRENT_TIMESTAMP,
            updated_by = $3`,
        [key, JSON.stringify(value), userId || null]
    );
}

/**
 * Get watermark settings
 */
export async function getWatermarkSettings(): Promise<WatermarkSettings> {
    const settings = await getSetting<WatermarkSettings>('watermark');

    // Return default settings if not found
    if (!settings) {
        return {
            text: 'Amrita Vishwa Vidyapeetham Kochi',
            enabled: true,
            fontSize: 14,
            opacity: 0.15,
            position: 'diagonal',
            color: '#808080',
            includeUserId: true,
            includeTimestamp: true,
        };
    }

    return settings;
}

/**
 * Update watermark settings
 */
export async function updateWatermarkSettings(
    settings: WatermarkSettings,
    userId: string
): Promise<void> {
    await updateSetting('watermark', settings, userId);
}
