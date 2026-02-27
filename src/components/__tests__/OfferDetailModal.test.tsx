import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { OfferDetailModal } from '../OfferDetailModal';
import { Offer, Company, Review } from '../../types';

// Mock de Ionic
jest.mock('@ionic/react', () => ({
  ...jest.requireActual('@ionic/react'),
  IonModal: ({ children, isOpen, onDidDismiss }: any) => (
    <div data-testid="modal" style={{ display: isOpen ? 'block' : 'none' }}>
      <button data-testid="close-button" onClick={onDidDismiss}>Cerrar</button>
      {children}
    </div>
  ),
  IonHeader: ({ children }: any) => <header>{children}</header>,
  IonToolbar: ({ children }: any) => <div>{children}</div>,
  IonTitle: ({ children }: any) => <h1>{children}</h1>,
  IonButtons: ({ children }: any) => <div>{children}</div>,
  IonButton: ({ children, onClick }: any) => <button onClick={onClick}>{children}</button>,
  IonContent: ({ children }: any) => <div>{children}</div>,
  IonItem: ({ children }: any) => <div>{children}</div>,
  IonLabel: ({ children, position }: any) => <label data-position={position}>{children}</label>,
  IonTextarea: ({ value, onIonChange, placeholder }: any) => (
    <textarea 
      value={value} 
      onChange={(e) => onIonChange({ detail: { value: e.target.value } })} 
      placeholder={placeholder} 
    />
  ),
  IonRange: ({ min, max, step, value, onIonChange }: any) => (
    <input 
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onIonChange({ detail: { value: parseInt(e.target.value) } })}
    />
  ),
  IonCard: ({ children }: any) => <div>{children}</div>,
  IonCardHeader: ({ children }: any) => <header>{children}</header>,
  IonCardTitle: ({ children }: any) => <h3>{children}</h3>,
  IonCardContent: ({ children }: any) => <div>{children}</div>,
  IonList: ({ children }: any) => <ul>{children}</ul>,
  IonIcon: ({ icon }: any) => <span>{icon}</span>,
  IonGrid: ({ children }: any) => <div>{children}</div>,
  IonRow: ({ children }: any) => <div>{children}</div>,
  IonCol: ({ children }: any) => <div>{children}</div>,
}));

// Mock de ionicons
jest.mock('ionicons/icons', () => ({
  close: 'close-icon'
}));

describe('OfferDetailModal', () => {
  const mockOffer: Offer = {
    id: 'offer-1',
    companyId: 'company-1',
    title: 'Oferta de prueba',
    description: 'Descripción de la oferta de prueba',
    imageUrl: 'https://example.com/image.jpg',
    discount: '50%',
    category: 'Tecnología',
    offerType: 'descuento',
    isRecurring: false
  };

  const mockCompany: Company = {
    id: 'company-1',
    name: 'Empresa de prueba',
    logoUrl: 'https://example.com/logo.jpg',
    branches: [{
      id: 'branch-1',
      name: 'Sucursal Central',
      address: 'Calle Principal 123',
      city: 'Ciudad',
      whatsapp: '123456789',
      mapUrl: 'https://example.com/map',
      openingHours: 'Lun-Vie 9:00-18:00'
    }],
    subscriptionPlan: 'premium',
    isVerified: true
  };

  const mockReviews: Review[] = [
    {
      id: 'review-1',
      offerId: 'offer-1',
      companyId: 'company-1',
      userId: 'user-1',
      userName: 'Usuario 1',
      rating: 4,
      comment: 'Muy buena oferta',
      date: new Date().toISOString()
    }
  ];

  const mockOnClose = jest.fn();
  const mockOnAddReview = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('debería renderizar correctamente con oferta, empresa y reseñas', () => {
    render(
      <OfferDetailModal
        offer={mockOffer}
        company={mockCompany}
        reviews={mockReviews}
        onClose={mockOnClose}
        onAddReview={mockOnAddReview}
        isOpen={true}
      />
    );

    expect(screen.getByText(mockOffer.title)).toBeInTheDocument();
    expect(screen.getByText(mockOffer.description)).toBeInTheDocument();
    expect(screen.getByText(mockCompany.name)).toBeInTheDocument();
    expect(screen.getByText(mockReviews[0].comment)).toBeInTheDocument();
  });

  test('debería permitir al usuario dejar una nueva reseña', async () => {
    render(
      <OfferDetailModal
        offer={mockOffer}
        company={mockCompany}
        reviews={mockReviews}
        onClose={mockOnClose}
        onAddReview={mockOnAddReview}
        isOpen={true}
      />
    );

    // Seleccionar el input de calificación y cambiar a 5 estrellas
    const ratingInput = screen.getByRole('slider');
    fireEvent.change(ratingInput, { target: { value: 5 } });

    // Seleccionar el textarea de comentario y escribir un comentario
    const commentTextarea = screen.getByPlaceholderText('Escribe tu opinión sobre esta oferta o la tienda...');
    fireEvent.change(commentTextarea, { target: { value: 'Excelente oferta!' } });

    // Hacer clic en el botón de enviar reseña
    const submitButton = screen.getByText('Enviar Reseña');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnAddReview).toHaveBeenCalledWith(
        expect.objectContaining({
          offerId: mockOffer.id,
          companyId: mockCompany.id,
          rating: 5,
          comment: 'Excelente oferta!',
          userName: 'Usuario Actual'
        })
      );
    });
  });

  test('debería deshabilitar el botón de enviar cuando no hay comentario', () => {
    render(
      <OfferDetailModal
        offer={mockOffer}
        company={mockCompany}
        reviews={mockReviews}
        onClose={mockOnClose}
        onAddReview={mockOnAddReview}
        isOpen={true}
      />
    );

    const submitButton = screen.getByText('Enviar Reseña');
    expect(submitButton).toBeDisabled();
  });
});