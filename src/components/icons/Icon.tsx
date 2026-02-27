import React from 'react';

export const Icon = ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className} style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {children}
    </div>
);
