import { db } from './config';
import { createCompany } from './services/companiesService';
import { createOffer } from './services/offersService';
import { Company, Offer } from './types';

/**
 * Script para poblar Realtime Database con datos iniciales
 * Ejecutar una sola vez después de configurar Firebase
 */

const INITIAL_COMPANIES_DATA = [
    {
        name: 'Super Burger Bogotá',
        logoUrl: 'https://picsum.photos/seed/c1/100/100',
        address: 'Calle 100 #15-20',
        city: 'Bogotá',
        whatsapp: '+573001234567',
        openingHours: 'L-D: 11:00 AM - 10:00 PM',
        branches: [{
            id: 'b1',
            name: 'Sede Norte',
            address: 'Calle 100 #15-20',
            city: 'Bogotá',
            whatsapp: '+573001234567',
            mapUrl: '',
            latitude: 4.6835,
            longitude: -74.0432,
            openingHours: 'L-D: 11:00 AM - 10:00 PM'
        }],
        subscriptionPlan: 'premium' as const,
        isVerified: true
    },
    {
        name: 'Pizza Planet Medellín',
        logoUrl: 'https://picsum.photos/seed/c2/100/100',
        address: 'Carrera 43A #5-50',
        city: 'Medellín',
        whatsapp: '+573109876543',
        openingHours: 'L-D: 12:00 PM - 11:00 PM',
        branches: [{
            id: 'b2',
            name: 'El Poblado',
            address: 'Carrera 43A #5-50',
            city: 'Medellín',
            whatsapp: '+573109876543',
            mapUrl: '',
            latitude: 6.2089,
            longitude: -75.5645,
            openingHours: 'L-D: 12:00 PM - 11:00 PM'
        }],
        subscriptionPlan: 'basico' as const,
        isVerified: true
    },
    {
        name: 'Moda Express Cali',
        logoUrl: 'https://picsum.photos/seed/c3/100/100',
        address: 'Avenida 6N #28-10',
        city: 'Cali',
        whatsapp: '+573205554433',
        openingHours: 'L-S: 10:00 AM - 9:00 PM',
        branches: [{
            id: 'b3',
            name: 'Chipichape',
            address: 'Avenida 6N #28-10',
            city: 'Cali',
            whatsapp: '+573205554433',
            mapUrl: '',
            latitude: 3.4735,
            longitude: -76.5265,
            openingHours: 'L-S: 10:00 AM - 9:00 PM'
        }],
        subscriptionPlan: 'premium' as const,
        isVerified: false
    },
    {
        name: 'TecnoTienda Barranquilla',
        logoUrl: 'https://picsum.photos/seed/c4/100/100',
        address: 'Calle 98 #52-115',
        city: 'Barranquilla',
        whatsapp: '+573012223344',
        openingHours: 'L-D: 10:00 AM - 8:00 PM',
        branches: [{
            id: 'b4',
            name: 'Buenavista',
            address: 'Calle 98 #52-115',
            city: 'Barranquilla',
            whatsapp: '+573012223344',
            mapUrl: '',
            latitude: 11.0189,
            longitude: -74.8315,
            openingHours: 'L-D: 10:00 AM - 8:00 PM'
        }],
        subscriptionPlan: 'basico' as const,
        isVerified: true
    },
];

export const seedDatabase = async () => {
    console.log('🌱 Iniciando población de Realtime Database...');

    try {
        // Crear empresas
        console.log('📦 Creando empresas...');
        const companyIds: { [key: string]: string } = {};

        for (let i = 0; i < INITIAL_COMPANIES_DATA.length; i++) {
            const companyData = INITIAL_COMPANIES_DATA[i];
            const companyId = await createCompany(companyData);
            companyIds[`c${i + 1}`] = companyId;
            console.log(`✅ Empresa creada: ${companyData.name} (ID: ${companyId})`);
        }

        // Crear ofertas
        console.log('🎁 Creando ofertas...');
        const offers = [
            {
                companyId: companyIds['c1'],
                branchId: 'b1',
                title: 'Combo Familiar Burger',
                description: '4 Hamburguesas clásicas + Papas + Gaseosa 1.5L.',
                imageUrl: 'https://picsum.photos/seed/o1/400/300',
                discount: '$45.000',
                isRecurring: true,
                category: 'Comida' as const,
                offerType: 'descuento' as const
            },
            {
                companyId: companyIds['c2'],
                branchId: 'b2',
                title: 'Martes 2x1 en Pizza Grande',
                description: 'Aplica para especialidades de la casa.',
                imageUrl: 'https://picsum.photos/seed/o2/400/300',
                discount: '2x1',
                isRecurring: true,
                category: 'Comida' as const,
                offerType: '2x1' as const
            },
            {
                companyId: companyIds['c4'],
                branchId: 'b4',
                title: 'Audífonos Bluetooth Pro',
                description: 'Cancelación de ruido activa, garantía de 1 año.',
                imageUrl: 'https://picsum.photos/seed/o4/400/300',
                discount: '$120.000',
                isRecurring: false,
                category: 'Tecnología' as const,
                offerType: 'descuento' as const
            },
        ];

        for (const offer of offers) {
            const offerId = await createOffer(offer);
            console.log(`✅ Oferta creada: ${offer.title} (ID: ${offerId})`);
        }

        console.log('🎉 ¡Realtime Database poblada exitosamente!');
        console.log(`📊 Total: ${Object.keys(companyIds).length} empresas, ${offers.length} ofertas`);

    } catch (error) {
        console.error('❌ Error al poblar base de datos:', error);
        throw error;
    }
};

// Descomentar para ejecutar
// seedDatabase();
