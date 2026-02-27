import { IonCard, IonCardContent, IonText } from '@ionic/react';
import { KpiData } from '../types';

interface KpiCardProps {
    kpi: KpiData & { color?: string };
    icon: React.ReactNode;
}

const ArrowUpIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18" />
    </svg>
);

const ArrowDownIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3" />
    </svg>
);

export const KpiCard: React.FC<KpiCardProps> = ({ kpi, icon }) => {
    const isPositive = kpi.growth >= 0;

    return (
        <div style={{
            backgroundColor: 'white',
            borderRadius: '24px',
            padding: '24px',
            boxShadow: 'var(--offertapps-shadow-md)',
            border: '1px solid rgba(0,0,0,0.03)',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{
                    backgroundColor: kpi.color ? `${kpi.color}15` : 'rgba(99, 102, 241, 0.08)',
                    padding: '12px',
                    borderRadius: '16px',
                    color: kpi.color || 'var(--ion-color-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <div style={{ fontSize: '24px' }}>{icon}</div>
                </div>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 8px',
                    borderRadius: '8px',
                    backgroundColor: isPositive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    color: isPositive ? 'var(--ion-color-success)' : 'var(--ion-color-danger)',
                    fontSize: '0.8rem',
                    fontWeight: '700'
                }}>
                    {isPositive ? <ArrowUpIcon /> : <ArrowDownIcon />}
                    {Math.abs(kpi.growth)}%
                </div>
            </div>

            <div style={{ marginTop: '20px' }}>
                <p style={{
                    margin: 0,
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    color: '#64748b',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                }}>
                    {kpi.title}
                </p>
                <h2 style={{
                    margin: '4px 0 0 0',
                    fontSize: '2rem',
                    fontWeight: '900',
                    color: 'var(--ion-color-dark)',
                    letterSpacing: '-0.02em'
                }}>
                    {kpi.value}
                </h2>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: '#94a3b8', fontWeight: '500' }}>
                    Comparado con el mes anterior
                </p>
            </div>
        </div>
    );
};
