import { Request, Response } from 'express';
import * as settingsRepo from '../repositories/settings.repository.js';

/**
 * Get watermark settings
 */
export async function getWatermarkSettings(req: Request, res: Response): Promise<void> {
    try {
        const settings = await settingsRepo.getWatermarkSettings();

        res.json({
            success: true,
            settings,
        });
    } catch (error) {
        console.error('Error getting watermark settings:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get watermark settings',
        });
    }
}

/**
 * Update watermark settings (Admin only)
 */
export async function updateWatermarkSettings(req: Request, res: Response): Promise<void> {
    if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
    }

    try {
        const settings = req.body as settingsRepo.WatermarkSettings;

        // Validate required fields
        if (!settings.text || typeof settings.enabled !== 'boolean') {
            res.status(400).json({
                success: false,
                error: 'Invalid settings. Text and enabled status are required.',
            });
            return;
        }

        // Set defaults for optional fields
        const fullSettings: settingsRepo.WatermarkSettings = {
            text: settings.text,
            enabled: settings.enabled,
            fontSize: settings.fontSize || 14,
            opacity: Math.max(0.05, Math.min(0.5, settings.opacity || 0.15)),
            position: settings.position || 'diagonal',
            color: settings.color || '#808080',
            includeUserId: settings.includeUserId ?? true,
            includeTimestamp: settings.includeTimestamp ?? true,
        };

        await settingsRepo.updateWatermarkSettings(fullSettings, req.user.userId);

        res.json({
            success: true,
            message: 'Watermark settings updated successfully',
            settings: fullSettings,
        });
    } catch (error) {
        console.error('Error updating watermark settings:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update watermark settings',
        });
    }
}

/**
 * Preview watermark (returns a sample watermark text)
 */
export async function previewWatermark(req: Request, res: Response): Promise<void> {
    try {
        const settings = await settingsRepo.getWatermarkSettings();

        // Build preview text
        let previewText = settings.text;
        if (settings.includeUserId) {
            previewText += ' | user@example.com';
        }
        if (settings.includeTimestamp) {
            previewText += ` | ${new Date().toISOString().split('T')[0]}`;
        }

        res.json({
            success: true,
            preview: {
                text: previewText,
                fontSize: settings.fontSize,
                opacity: settings.opacity,
                position: settings.position,
                color: settings.color,
            },
        });
    } catch (error) {
        console.error('Error generating watermark preview:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate preview',
        });
    }
}
