'use client';

import React, { useState, useEffect } from 'react';
import { fetchJsonWithAuth, getApiUrl } from '@/lib/api';

// Icons
const SearchIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
    </svg>
);

const UserIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </svg>
);

const FileIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
        <polyline points="14 2 14 8 20 8" />
    </svg>
);

const CheckIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

const XIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

interface VerificationRequest {
    id: string;
    user_id: string;
    document_type: string;
    document_path: string;
    status: 'PENDING' | 'VERIFIED' | 'REJECTED';
    review_notes?: string;
    created_at: string;
    user: {
        id: string;
        email: string;
        first_name: string;
        last_name: string;
        institution?: string;
    };
}

export default function VerificationsPage() {
    const [requests, setRequests] = useState<VerificationRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedRequest, setSelectedRequest] = useState<VerificationRequest | null>(null);
    const [reviewNotes, setReviewNotes] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const response = await fetchJsonWithAuth<{ success: boolean; documents: VerificationRequest[] }>(
                getApiUrl('/admin/verification-requests')
            );
            if (response.success) {
                setRequests(response.documents);
            }
        } catch (err) {
            console.error('Fetch error:', err);
            setError('Failed to load verification requests');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleAction = async (status: 'VERIFIED' | 'REJECTED') => {
        if (!selectedRequest) return;

        setActionLoading(true);
        try {
            const response = await fetchJsonWithAuth<any>(
                getApiUrl(`/admin/verification/${selectedRequest.user_id}`),
                {
                    method: 'PUT',
                    body: JSON.stringify({ status, reviewNotes }),
                }
            );

            if (response.success) {
                setRequests(prev => prev.filter(r => r.id !== selectedRequest.id));
                setSelectedRequest(null);
                setReviewNotes('');
            } else {
                alert(response.error || 'Failed to update verification status');
            }
        } catch (err) {
            console.error('Action error:', err);
            alert('Failed to process request');
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                    ID Verifications
                </h1>
                <p style={{ color: '#64748b', marginTop: '0.25rem' }}>
                    Review user identity documents and approve access privileges.
                </p>
            </div>

            {error && (
                <div style={{ padding: '1rem', background: '#fee2e2', color: '#991b1b', borderRadius: '0.5rem' }}>
                    {error}
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: selectedRequest ? '1fr 400px' : '1fr', gap: '2rem', transition: 'grid-template-columns 0.3s' }}>
                {/* List Column */}
                <div style={{
                    background: 'white', borderRadius: '12px', border: '1px solid #e1e4e8', overflow: 'hidden', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>User</th>
                                <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Document Type</th>
                                <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Submitted</th>
                                <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={4} style={{ padding: '3rem', textAlign: 'center' }}>Loading...</td></tr>
                            ) : requests.length > 0 ? (
                                requests.map(req => (
                                    <tr
                                        key={req.id}
                                        onClick={() => setSelectedRequest(req)}
                                        style={{
                                            borderBottom: '1px solid #f1f5f9', cursor: 'pointer',
                                            background: selectedRequest?.id === req.id ? '#f0fdf4' : 'white'
                                        }}
                                    >
                                        <td style={{ padding: '1rem 1.5rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div style={{ width: '32px', height: '32px', background: '#f1f5f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                                                    <UserIcon />
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{req.user?.first_name} {req.user?.last_name}</div>
                                                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{req.user?.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem 1.5rem' }}>
                                            <span style={{ padding: '0.25rem 0.5rem', background: '#f1f5f9', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 500 }}>
                                                {req.document_type.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', color: '#64748b' }}>
                                            {new Date(req.created_at).toLocaleDateString()}
                                        </td>
                                        <td style={{ padding: '1rem 1.5rem' }}>
                                            <button style={{ color: '#059669', background: 'none', border: 'none', fontWeight: 500, cursor: 'pointer' }}>Review</button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan={4} style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>No pending verification requests.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Detail Column */}
                {selectedRequest && (
                    <div style={{
                        background: 'white', borderRadius: '12px', border: '1px solid #e1e4e8', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem',
                        position: 'sticky', top: '2rem', height: 'fit-content', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#0f172a', margin: 0 }}>Review Request</h2>
                            <button onClick={() => setSelectedRequest(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><XIcon /></button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px' }}>
                                <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.5rem' }}>User Details</div>
                                <div style={{ fontWeight: 600, fontSize: '1rem' }}>{selectedRequest.user?.first_name} {selectedRequest.user?.last_name}</div>
                                <div style={{ fontSize: '0.875rem', color: '#475569' }}>{selectedRequest.user?.email}</div>
                                <div style={{ fontSize: '0.875rem', color: '#475569', marginTop: '0.25rem' }}>{selectedRequest.user?.institution || 'No institution'}</div>
                            </div>

                            <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px' }}>
                                <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Document Type</div>
                                <div style={{ fontWeight: 600 }}>{selectedRequest.document_type.replace('_', ' ')}</div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <div style={{ fontSize: '0.875rem', color: '#475569', fontWeight: 500 }}>Evidence Document</div>
                                <a
                                    href={getApiUrl(`/admin/verification/document/${selectedRequest.id}`)}
                                    target="_blank"
                                    rel="noreferrer"
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px',
                                        textDecoration: 'none', color: '#0f172a', background: 'white', transition: 'border-color 0.2s'
                                    }}
                                >
                                    <FileIcon />
                                    <span style={{ flex: 1, fontSize: '0.875rem' }}>View Identity Document</span>
                                    <div style={{ color: '#059669' }}>View →</div>
                                </a>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontSize: '0.875rem', color: '#475569', fontWeight: 500 }}>Review Notes (Optional)</label>
                                <textarea
                                    value={reviewNotes}
                                    onChange={(e) => setReviewNotes(e.target.value)}
                                    placeholder="Add any internal notes or reasons for rejection..."
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', resize: 'none' }}
                                    rows={3}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button
                                    disabled={actionLoading}
                                    onClick={() => handleAction('REJECTED')}
                                    style={{
                                        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                        padding: '0.75rem', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer'
                                    }}
                                >
                                    <XIcon /> Reject
                                </button>
                                <button
                                    disabled={actionLoading}
                                    onClick={() => handleAction('VERIFIED')}
                                    style={{
                                        flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                        padding: '0.75rem', background: '#059669', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer'
                                    }}
                                >
                                    <CheckIcon /> Approve & Verify
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
