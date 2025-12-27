'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchJsonWithAuth, getApiUrl, isAuthenticated } from '@/lib/api';

// Icons
const ArrowLeftIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m12 19-7-7 7-7" />
        <path d="M19 12H5" />
    </svg>
);

const LoadingSpinner = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
        <circle cx="12" cy="12" r="10" opacity="0.25" />
        <path d="M12 2a10 10 0 0 1 10 10" />
    </svg>
);

const SaveIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
        <polyline points="17 21 17 13 7 13 7 21" />
        <polyline points="7 3 7 8 15 8" />
    </svg>
);

interface WatermarkSettings {
    text: string;
    enabled: boolean;
    fontSize: number;
    opacity: number;
    position: 'diagonal' | 'center' | 'footer' | 'tiled';
    color: string;
    includeUserId: boolean;
    includeTimestamp: boolean;
}

export default function WatermarkSettingsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [settings, setSettings] = useState<WatermarkSettings>({
        text: 'Amrita Vishwa Vidyapeetham Kochi',
        enabled: true,
        fontSize: 14,
        opacity: 0.15,
        position: 'diagonal',
        color: '#808080',
        includeUserId: true,
        includeTimestamp: true,
    });

    useEffect(() => {
        if (!isAuthenticated()) {
            router.push('/login');
            return;
        }
        fetchSettings();
    }, [router]);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const response = await fetchJsonWithAuth<{ success: boolean; settings: WatermarkSettings }>(
                getApiUrl('/settings/watermark')
            );
            if (response.success && response.settings) {
                setSettings(response.settings);
            }
        } catch (err) {
            console.error('Failed to fetch settings:', err);
            setError('Failed to load watermark settings');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        setSuccess('');

        try {
            const response = await fetchJsonWithAuth<{ success: boolean; error?: string }>(
                getApiUrl('/settings/watermark'),
                {
                    method: 'PUT',
                    body: JSON.stringify(settings),
                }
            );

            if (response.success) {
                setSuccess('Watermark settings saved successfully!');
            } else {
                setError(response.error || 'Failed to save settings');
            }
        } catch (err) {
            console.error('Save error:', err);
            setError('Failed to save watermark settings');
        } finally {
            setSaving(false);
        }
    };

    const generatePreviewText = () => {
        let text = settings.text;
        if (settings.includeUserId) {
            text += ' | user@example.com';
        }
        if (settings.includeTimestamp) {
            text += ` | ${new Date().toISOString().split('T')[0]}`;
        }
        return text;
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh' }}>
                <LoadingSpinner />
                <span style={{ marginLeft: '1rem', color: '#64748b' }}>Loading settings...</span>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <Link href="/dashboard" style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: '#64748b',
                textDecoration: 'none',
                fontSize: '0.875rem',
                marginBottom: '1.5rem',
            }}>
                <ArrowLeftIcon /> Back to Dashboard
            </Link>

            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#0f172a', margin: 0 }}>
                    Watermark Settings
                </h1>
                <p style={{ color: '#64748b', marginTop: '0.25rem' }}>
                    Configure the watermark that appears on all downloaded manuscripts
                </p>
            </div>

            {error && (
                <div style={{
                    padding: '1rem',
                    background: '#fee2e2',
                    color: '#991b1b',
                    borderRadius: '0.5rem',
                    marginBottom: '1.5rem',
                }}>
                    {error}
                </div>
            )}

            {success && (
                <div style={{
                    padding: '1rem',
                    background: '#dcfce7',
                    color: '#166534',
                    borderRadius: '0.5rem',
                    marginBottom: '1.5rem',
                }}>
                    {success}
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '2rem' }}>
                {/* Settings Form */}
                <form onSubmit={handleSubmit}>
                    <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '1.5rem', marginBottom: '1.5rem' }}>
                        <h2 style={{ fontSize: '1rem', fontWeight: 600, color: '#0f172a', marginBottom: '1.25rem' }}>
                            Watermark Text
                        </h2>

                        <div style={{ marginBottom: '1.25rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                <input
                                    type="checkbox"
                                    checked={settings.enabled}
                                    onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
                                    style={{ width: '18px', height: '18px', accentColor: '#059669' }}
                                />
                                <span style={{ fontWeight: 500, color: '#0f172a' }}>Enable watermark on downloads</span>
                            </label>

                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#0f172a', marginBottom: '0.5rem' }}>
                                Institution Text
                            </label>
                            <input
                                type="text"
                                value={settings.text}
                                onChange={(e) => setSettings({ ...settings, text: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    fontSize: '0.9375rem',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '0.5rem',
                                    outline: 'none',
                                }}
                                placeholder="e.g., Amrita Vishwa Vidyapeetham Kochi"
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <input
                                    type="checkbox"
                                    checked={settings.includeUserId}
                                    onChange={(e) => setSettings({ ...settings, includeUserId: e.target.checked })}
                                    style={{ accentColor: '#059669' }}
                                />
                                <span style={{ fontSize: '0.875rem', color: '#475569' }}>Include user email</span>
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <input
                                    type="checkbox"
                                    checked={settings.includeTimestamp}
                                    onChange={(e) => setSettings({ ...settings, includeTimestamp: e.target.checked })}
                                    style={{ accentColor: '#059669' }}
                                />
                                <span style={{ fontSize: '0.875rem', color: '#475569' }}>Include download date</span>
                            </label>
                        </div>
                    </div>

                    <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '1.5rem', marginBottom: '1.5rem' }}>
                        <h2 style={{ fontSize: '1rem', fontWeight: 600, color: '#0f172a', marginBottom: '1.25rem' }}>
                            Appearance
                        </h2>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#0f172a', marginBottom: '0.5rem' }}>
                                    Position
                                </label>
                                <select
                                    value={settings.position}
                                    onChange={(e) => setSettings({ ...settings, position: e.target.value as WatermarkSettings['position'] })}
                                    style={{
                                        width: '100%',
                                        padding: '0.625rem 0.75rem',
                                        fontSize: '0.9375rem',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '0.5rem',
                                        outline: 'none',
                                        background: 'white',
                                    }}
                                >
                                    <option value="diagonal">Diagonal (Recommended)</option>
                                    <option value="center">Center</option>
                                    <option value="footer">Footer</option>
                                    <option value="tiled">Tiled Pattern</option>
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#0f172a', marginBottom: '0.5rem' }}>
                                    Color
                                </label>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <input
                                        type="color"
                                        value={settings.color}
                                        onChange={(e) => setSettings({ ...settings, color: e.target.value })}
                                        style={{
                                            width: '50px',
                                            height: '38px',
                                            border: '1px solid #e5e7eb',
                                            borderRadius: '0.5rem',
                                            cursor: 'pointer',
                                        }}
                                    />
                                    <input
                                        type="text"
                                        value={settings.color}
                                        onChange={(e) => setSettings({ ...settings, color: e.target.value })}
                                        style={{
                                            flex: 1,
                                            padding: '0.625rem 0.75rem',
                                            fontSize: '0.9375rem',
                                            border: '1px solid #e5e7eb',
                                            borderRadius: '0.5rem',
                                            outline: 'none',
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#0f172a', marginBottom: '0.5rem' }}>
                                    Font Size: {settings.fontSize}px
                                </label>
                                <input
                                    type="range"
                                    min="8"
                                    max="24"
                                    value={settings.fontSize}
                                    onChange={(e) => setSettings({ ...settings, fontSize: parseInt(e.target.value) })}
                                    style={{ width: '100%', accentColor: '#059669' }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#0f172a', marginBottom: '0.5rem' }}>
                                    Opacity: {Math.round(settings.opacity * 100)}%
                                </label>
                                <input
                                    type="range"
                                    min="5"
                                    max="50"
                                    value={settings.opacity * 100}
                                    onChange={(e) => setSettings({ ...settings, opacity: parseInt(e.target.value) / 100 })}
                                    style={{ width: '100%', accentColor: '#059669' }}
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={saving}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.75rem 1.5rem',
                            fontSize: '0.9375rem',
                            fontWeight: 500,
                            color: 'white',
                            background: saving ? '#6ee7b7' : '#059669',
                            border: 'none',
                            borderRadius: '0.5rem',
                            cursor: saving ? 'not-allowed' : 'pointer',
                        }}
                    >
                        {saving ? <LoadingSpinner /> : <SaveIcon />}
                        {saving ? 'Saving...' : 'Save Settings'}
                    </button>
                </form>

                {/* Preview Panel */}
                <div>
                    <div style={{
                        background: 'white',
                        borderRadius: '12px',
                        border: '1px solid #e5e7eb',
                        overflow: 'hidden',
                        position: 'sticky',
                        top: '1rem',
                    }}>
                        <div style={{
                            padding: '1rem 1.5rem',
                            borderBottom: '1px solid #e5e7eb',
                            background: '#f8fafc',
                        }}>
                            <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#0f172a', margin: 0 }}>
                                Preview
                            </h3>
                        </div>

                        <div style={{
                            height: '400px',
                            background: '#f8fafc',
                            position: 'relative',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden',
                        }}>
                            {/* Document preview */}
                            <div style={{
                                width: '280px',
                                height: '360px',
                                background: 'white',
                                border: '1px solid #e5e7eb',
                                borderRadius: '4px',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                position: 'relative',
                                overflow: 'hidden',
                            }}>
                                {/* Fake document lines */}
                                <div style={{ padding: '1.5rem' }}>
                                    {[...Array(12)].map((_, i) => (
                                        <div
                                            key={i}
                                            style={{
                                                height: '8px',
                                                background: '#e5e7eb',
                                                borderRadius: '2px',
                                                marginBottom: '8px',
                                                width: i === 0 ? '60%' : i === 11 ? '40%' : '100%',
                                            }}
                                        />
                                    ))}
                                </div>

                                {/* Watermark overlay */}
                                {settings.enabled && (
                                    <div style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        display: 'flex',
                                        alignItems: settings.position === 'footer' ? 'flex-end' : 'center',
                                        justifyContent: 'center',
                                        pointerEvents: 'none',
                                    }}>
                                        <div style={{
                                            color: settings.color,
                                            opacity: settings.opacity,
                                            fontSize: `${settings.fontSize * 0.6}px`,
                                            fontWeight: 500,
                                            textAlign: 'center',
                                            transform: settings.position === 'diagonal' ? 'rotate(-45deg)' : 'none',
                                            padding: settings.position === 'footer' ? '0.5rem' : 0,
                                            whiteSpace: settings.position === 'tiled' ? 'pre-wrap' : 'nowrap',
                                            maxWidth: settings.position === 'tiled' ? '200%' : 'none',
                                        }}>
                                            {settings.position === 'tiled'
                                                ? `${generatePreviewText()}\n${generatePreviewText()}\n${generatePreviewText()}`
                                                : generatePreviewText()
                                            }
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #e5e7eb' }}>
                            <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: 0 }}>
                                {settings.enabled
                                    ? 'Watermark will be applied to all downloaded files'
                                    : 'Watermark is currently disabled'
                                }
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
