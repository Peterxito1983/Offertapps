
export enum Role {
    ADMIN = 'admin',
    COMPANY = 'company',
    USER = 'user',
}

export enum UserLevel {
    BRONCE = 'Bronce',
    PLATA = 'Plata',
    ORO = 'Oro',
}

export interface User {
    id: string;
    name: string;
    email: string;
    level: UserLevel;
    points: number;
    favorites: string[]; // Array of offer IDs
    avatarUrl: string;
    notificationPreferences?: {
        offers: boolean;
        promotions: boolean;
        reminders: boolean;
        tracking: boolean;
    };
}

export interface Branch {
    id: string;
    name: string;
    address: string;
    city: string;
    whatsapp: string;
    mapUrl: string;
    openingHours: string;
    latitude?: number;
    longitude?: number;
}

export interface Company {
    id: string;
    name: string;
    logoUrl: string;
    address: string;
    city: string;
    whatsapp: string;
    openingHours: string;
    branches: Branch[];
    subscriptionPlan: 'basico' | 'premium';
    isVerified: boolean;
    paymentStatus?: 'pending' | 'active' | 'expired' | 'cancelled';
    subscriptionStartDate?: string;
    subscriptionEndDate?: string;
    lastPaymentDate?: string;
    nextPaymentDue?: string;
    facebookUrl?: string;
    instagramUrl?: string;
    tiktokUrl?: string;
    xUrl?: string;
    createdAt?: string;
    updatedAt?: string;
}

export type OfferType = 'descuento' | '2x1' | 'lanzamiento' | 'compra-compartida';
export type OfferCategory = 'Comida' | 'Moda' | 'Tecnología' | 'Servicios' | 'Viajes' | 'Hogar' | 'Todos';

export const CATEGORIES: OfferCategory[] = ['Todos', 'Comida', 'Moda', 'Tecnología', 'Servicios', 'Viajes', 'Hogar'];

export interface Offer {
    id: string;
    companyId: string;
    title: string;
    description: string;
    imageUrl: string;
    discount: string;
    validUntil?: Date; // For flash offers
    isRecurring: boolean;
    branchId?: string;
    category: OfferCategory;
    offerType: OfferType;
    socialMediaPosted?: boolean; // Legacy
    instagramPosted?: boolean;
    facebookPosted?: boolean;
    tiktokPosted?: boolean;
    socialMediaPostId?: string;
    socialMediaError?: string;
    lastSocialUpdate?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface Review {
    id: string;
    offerId: string;
    companyId: string;
    userId: string;
    userName: string;
    rating: number;
    comment: string;
    date: string;
    reply?: string;
    replyDate?: string;
}

export interface KpiData {
    title: string;
    value: string;
    growth: number;
}

export interface CampaignData {
    channels: Array<'meta' | 'tiktok' | 'google' | 'whatsapp' | 'instagram'>;
    budget: 'low' | 'medium' | 'high';
    budgetAmount: number;
    durationDays: number;
    status: 'draft' | 'pending' | 'active' | 'completed' | 'error';
    externalId?: string;
    error?: string;
}

export interface Campaign extends CampaignData {
    id: string;
    offerId: string;
    companyId: string;
    createdAt: string;
    updatedAt: string;
}

export interface Interaction {
    id: string;
    companyId: string;
    userId: string;
    userName: string;
    offerId: string;
    offerTitle: string;
    action: 'Click WhatsApp' | 'Guardó Oferta' | 'Visualización' | 'Compartió';
    timestamp: string;
}

export type NotificationType = 'offers' | 'promotions' | 'reminders' | 'tracking';

export interface AppNotification {
    id: string;
    userId: string;
    type: NotificationType;
    title: string;
    body: string;
    timestamp: string;
    read: boolean;
    data?: any;
}
