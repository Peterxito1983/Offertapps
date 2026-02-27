// src/__tests__/functionality.test.ts

import { 
  signUp, 
  signIn, 
  getCurrentUserProfile 
} from '../services/authService';
import { 
  getCompanies, 
  createCompany, 
  updateCompany, 
  deleteCompany 
} from '../services/companiesService';
import { 
  getOffers, 
  createOffer, 
  updateOffer, 
  deleteOffer 
} from '../services/offersService';
import { 
  getReviewsByOffer, 
  createReview, 
  replyToReview, 
  deleteReview 
} from '../services/reviewsService';
import { Role } from '../types';

// Mock de Firebase para pruebas
jest.mock('firebase/auth', () => ({
  ...jest.requireActual('firebase/auth'),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
}));

jest.mock('firebase/database', () => ({
  ...jest.requireActual('firebase/database'),
  ref: jest.fn(),
  get: jest.fn(),
  set: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  push: jest.fn(),
}));

describe('Pruebas de Funcionalidad', () => {
  const mockUserId = 'test-user-id';
  const mockCompanyId = 'test-company-id';
  const mockOfferId = 'test-offer-id';
  const mockReviewId = 'test-review-id';

  // Mock de funciones de Firebase
  const mockGet = require('firebase/database').get;
  const mockSet = require('firebase/database').set;
  const mockUpdate = require('firebase/database').update;
  const mockRemove = require('firebase/database').remove;
  const mockPush = require('firebase/database').push;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Configurar mocks por defecto
    mockGet.mockResolvedValue({
      exists: () => true,
      val: () => ({ role: 'user', uid: mockUserId })
    });
    
    mockSet.mockResolvedValue(undefined);
    mockUpdate.mockResolvedValue(undefined);
    mockRemove.mockResolvedValue(undefined);
    mockPush.mockReturnValue({ key: 'mock-key' });
  });

  describe('Flujo de Autenticación de Usuarios', () => {
    test('Debe permitir el registro de nuevos usuarios', async () => {
      // Mock para simular éxito en el registro
      const mockUserCredential = {
        user: {
          uid: mockUserId,
          email: 'test@example.com',
          displayName: 'Test User'
        }
      };
      
      const mockAuth = require('firebase/auth');
      mockAuth.createUserWithEmailAndPassword.mockResolvedValue(mockUserCredential);
      mockAuth.updateProfile = jest.fn().mockResolvedValue(undefined);

      const result = await signUp(
        'test@example.com',
        'Password123',
        'Test User',
        Role.USER
      );

      expect(result.email).toBe('test@example.com');
      expect(result.displayName).toBe('Test User');
      expect(result.role).toBe(Role.USER);
    });

    test('Debe permitir inicio de sesión de usuarios existentes', async () => {
      // Mock para simular éxito en el inicio de sesión
      const mockUserCredential = {
        user: {
          uid: mockUserId,
          email: 'test@example.com',
          displayName: 'Test User'
        }
      };
      
      const mockAuth = require('firebase/auth');
      mockAuth.signInWithEmailAndPassword.mockResolvedValue(mockUserCredential);

      // Mock para devolver perfil de usuario existente
      mockGet.mockResolvedValue({
        exists: () => true,
        val: () => ({ 
          uid: mockUserId, 
          email: 'test@example.com', 
          displayName: 'Test User', 
          role: Role.USER,
          createdAt: new Date().toISOString()
        })
      });

      const result = await signIn('test@example.com', 'Password123');

      expect(result.email).toBe('test@example.com');
      expect(result.displayName).toBe('Test User');
      expect(result.role).toBe(Role.USER);
    });

    test('Debe obtener correctamente el perfil del usuario actual', async () => {
      // Mock para devolver perfil de usuario
      mockGet.mockResolvedValue({
        exists: () => true,
        val: () => ({ 
          uid: mockUserId, 
          email: 'test@example.com', 
          displayName: 'Test User', 
          role: Role.USER,
          createdAt: new Date().toISOString()
        })
      });

      const result = await getCurrentUserProfile();

      expect(result?.uid).toBe(mockUserId);
      expect(result?.email).toBe('test@example.com');
      expect(result?.role).toBe(Role.USER);
    });
  });

  describe('Gestión de Empresas', () => {
    test('Debe permitir crear nuevas empresas', async () => {
      const companyData = {
        name: 'Test Company',
        logoUrl: 'https://example.com/logo.png',
        branches: [{
          id: 'branch-1',
          name: 'Main Branch',
          address: '123 Main St',
          city: 'Test City',
          whatsapp: '+1234567890',
          mapUrl: 'https://maps.example.com',
          openingHours: '9AM-5PM'
        }],
        subscriptionPlan: 'basico' as const,
        isVerified: false
      };

      const companyId = await createCompany(companyData);

      expect(companyId).toBe('mock-key');
      expect(mockSet).toHaveBeenCalled();
    });

    test('Debe permitir obtener empresas', async () => {
      const mockCompaniesData = {
        'company-1': {
          name: 'Company 1',
          logoUrl: 'https://example.com/logo1.png',
          branches: [],
          subscriptionPlan: 'basico',
          isVerified: true
        },
        'company-2': {
          name: 'Company 2',
          logoUrl: 'https://example.com/logo2.png',
          branches: [],
          subscriptionPlan: 'premium',
          isVerified: false
        }
      };

      mockGet.mockResolvedValue({
        exists: () => true,
        val: () => mockCompaniesData
      });

      const companies = await getCompanies();

      expect(companies).toHaveLength(2);
      expect(companies[0].name).toBe('Company 1');
      expect(companies[1].name).toBe('Company 2');
    });

    test('Debe permitir actualizar empresas', async () => {
      const updateData = {
        name: 'Updated Company Name',
        isVerified: true
      };

      await updateCompany(mockCompanyId, updateData);

      expect(mockUpdate).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          name: 'Updated Company Name',
          isVerified: true
        })
      );
    });

    test('Debe permitir eliminar empresas', async () => {
      await deleteCompany(mockCompanyId);

      expect(mockRemove).toHaveBeenCalledWith(expect.anything());
    });
  });

  describe('Gestión de Ofertas', () => {
    test('Debe permitir crear nuevas ofertas', async () => {
      const offerData = {
        companyId: mockCompanyId,
        title: 'Test Offer',
        description: 'This is a test offer',
        imageUrl: 'https://example.com/offer.jpg',
        discount: '20% OFF',
        isRecurring: true,
        category: 'Comida' as const,
        offerType: 'descuento' as const
      };

      const offerId = await createOffer(offerData);

      expect(offerId).toBe('mock-key');
      expect(mockSet).toHaveBeenCalled();
    });

    test('Debe permitir obtener ofertas', async () => {
      const mockOffersData = {
        'offer-1': {
          companyId: mockCompanyId,
          title: 'Offer 1',
          description: 'Description 1',
          imageUrl: 'https://example.com/offer1.jpg',
          discount: '10% OFF',
          isRecurring: true,
          category: 'Comida',
          offerType: 'descuento'
        },
        'offer-2': {
          companyId: mockCompanyId,
          title: 'Offer 2',
          description: 'Description 2',
          imageUrl: 'https://example.com/offer2.jpg',
          discount: 'Buy 1 Get 1',
          isRecurring: false,
          category: 'Moda',
          offerType: '2x1'
        }
      };

      mockGet.mockResolvedValue({
        exists: () => true,
        val: () => mockOffersData
      });

      const offers = await getOffers();

      expect(offers).toHaveLength(2);
      expect(offers[0].title).toBe('Offer 1');
      expect(offers[1].title).toBe('Offer 2');
    });

    test('Debe permitir actualizar ofertas', async () => {
      const updateData = {
        title: 'Updated Offer Title',
        discount: '30% OFF'
      };

      await updateOffer(mockOfferId, updateData);

      expect(mockUpdate).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          title: 'Updated Offer Title',
          discount: '30% OFF'
        })
      );
    });

    test('Debe permitir eliminar ofertas', async () => {
      await deleteOffer(mockOfferId);

      expect(mockRemove).toHaveBeenCalledWith(expect.anything());
    });
  });

  describe('Gestión de Reseñas', () => {
    test('Debe permitir crear nuevas reseñas', async () => {
      const reviewData = {
        offerId: mockOfferId,
        companyId: mockCompanyId,
        userId: mockUserId,
        userName: 'Test User',
        rating: 5,
        comment: 'Great offer!',
        date: new Date().toISOString()
      };

      const reviewId = await createReview(reviewData);

      expect(reviewId).toBe('mock-key');
      expect(mockSet).toHaveBeenCalled();
    });

    test('Debe permitir obtener reseñas por oferta', async () => {
      const mockReviewsData = {
        'review-1': {
          offerId: mockOfferId,
          companyId: mockCompanyId,
          userId: mockUserId,
          userName: 'User 1',
          rating: 4,
          comment: 'Good offer',
          date: new Date().toISOString()
        },
        'review-2': {
          offerId: mockOfferId,
          companyId: mockCompanyId,
          userId: 'user-2',
          userName: 'User 2',
          rating: 5,
          comment: 'Excellent!',
          date: new Date().toISOString()
        }
      };

      mockGet.mockResolvedValue({
        exists: () => true,
        val: () => mockReviewsData
      });

      const reviews = await getReviewsByOffer(mockOfferId);

      expect(reviews).toHaveLength(2);
      expect(reviews[0].comment).toBe('Good offer');
      expect(reviews[1].comment).toBe('Excellent!');
    });

    test('Debe permitir responder a reseñas', async () => {
      const replyText = 'Thank you for your feedback!';

      await replyToReview(mockReviewId, replyText);

      expect(mockUpdate).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          reply: replyText
        })
      );
    });

    test('Debe permitir eliminar reseñas', async () => {
      await deleteReview(mockReviewId);

      expect(mockRemove).toHaveBeenCalledWith(expect.anything());
    });
  });

  describe('Flujos Completos de Usuario', () => {
    test('Flujo completo de usuario: registro, creación de reseña', async () => {
      // 1. Registro de usuario
      const mockUserCredential = {
        user: {
          uid: mockUserId,
          email: 'test@example.com',
          displayName: 'Test User'
        }
      };
      
      const mockAuth = require('firebase/auth');
      mockAuth.createUserWithEmailAndPassword.mockResolvedValue(mockUserCredential);
      mockAuth.updateProfile = jest.fn().mockResolvedValue(undefined);

      const user = await signUp(
        'test@example.com',
        'Password123',
        'Test User',
        Role.USER
      );

      expect(user.email).toBe('test@example.com');

      // 2. Creación de reseña
      const reviewData = {
        offerId: mockOfferId,
        companyId: mockCompanyId,
        userId: mockUserId,
        userName: 'Test User',
        rating: 4,
        comment: 'This is a great offer!',
        date: new Date().toISOString()
      };

      const reviewId = await createReview(reviewData);

      expect(reviewId).toBe('mock-key');
    });

    test('Flujo completo de empresa: registro, creación de oferta', async () => {
      // 1. Simular usuario empresa
      mockGet.mockResolvedValueOnce({
        exists: () => true,
        val: () => ({ role: 'company', uid: mockUserId, companyId: mockCompanyId })
      });

      // 2. Creación de oferta
      const offerData = {
        companyId: mockCompanyId,
        title: 'Special Company Offer',
        description: 'Exclusive offer for our customers',
        imageUrl: 'https://example.com/company-offer.jpg',
        discount: '25% OFF',
        isRecurring: true,
        category: 'Servicios' as const,
        offerType: 'descuento' as const
      };

      const offerId = await createOffer(offerData);

      expect(offerId).toBe('mock-key');
      expect(mockSet).toHaveBeenCalled();
    });

    test('Flujo completo de administrador: verificación de empresa', async () => {
      // 1. Simular usuario admin
      mockGet.mockResolvedValueOnce({
        exists: () => true,
        val: () => ({ role: 'admin', uid: mockUserId })
      });

      // 2. Actualizar estado de verificación de empresa
      await updateCompany(mockCompanyId, { isVerified: true });

      expect(mockUpdate).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          isVerified: true
        })
      );
    });
  });

  describe('Validación de Datos', () => {
    test('Las validaciones deben funcionar correctamente en todos los servicios', async () => {
      // Probar validación en creación de empresa
      await expect(createCompany({
        name: 'A', // Nombre demasiado corto
        logoUrl: '',
        branches: [],
        subscriptionPlan: 'basico',
        isVerified: false
      })).rejects.toThrow();

      // Probar validación en creación de oferta
      await expect(createOffer({
        companyId: mockCompanyId,
        title: 'A', // Título demasiado corto
        description: 'Valid description',
        imageUrl: 'https://example.com/image.jpg',
        discount: '20% OFF',
        isRecurring: true,
        category: 'Comida',
        offerType: 'descuento'
      })).rejects.toThrow();

      // Probar validación en creación de reseña
      await expect(createReview({
        offerId: mockOfferId,
        companyId: mockCompanyId,
        userId: mockUserId,
        userName: 'A', // Nombre demasiado corto
        rating: 5,
        comment: 'Valid comment',
        date: new Date().toISOString()
      })).rejects.toThrow();
    });
  });
});