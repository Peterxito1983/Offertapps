import React, { lazy, Suspense } from 'react';
import { IonRouterOutlet, IonLoading } from '@ionic/react';
import { Redirect, Route } from 'react-router-dom';

// Importaciones lazy para code splitting
const UserView = lazy(() => import('../views/UserView'));
const CompanyView = lazy(() => import('../views/CompanyView'));
const AdminView = lazy(() => import('../views/AdminView'));
const AuthView = lazy(() => import('../views/AuthView'));

// Componente de carga para Suspense
const LoadingComponent = () => (
  <IonLoading
    isOpen={true}
    message={'Cargando...'}
  />
);

interface LazyRouteProps {
  currentUser: any;
  offers: any[];
  companies: any[];
  reviews: any[];
  onAddReview: (review: any) => void;
  onDeleteOffer: (id: string) => void;
  onDeleteReview: (id: string) => void;
  onUpdateCompanyStatus: (id: string, isVerified: boolean) => void;
  onDeleteCompany: (id: string) => void;
  onAddOffer: (offer: any) => void;
  onUpdateOffer: (offer: any) => void;
  onDeleteOfferFromCompany: (id: string) => void;
  onReplyReview: (reviewId: string, reply: string) => void;
}

export const LazyRoutes: React.FC<LazyRouteProps> = ({
  currentUser,
  offers,
  companies,
  reviews,
  onAddReview,
  onDeleteOffer,
  onDeleteReview,
  onUpdateCompanyStatus,
  onDeleteCompany,
  onAddOffer,
  onUpdateOffer,
  onDeleteOfferFromCompany,
  onReplyReview
}) => {
  return (
    <IonRouterOutlet>
      <Route exact path="/auth">
        <Suspense fallback={<LoadingComponent />}>
          {currentUser ? (
            <Redirect to={
              currentUser.role === 'company' 
                ? "/company" 
                : currentUser.role === 'admin' 
                  ? "/admin" 
                  : "/user"
            } /> 
            ) : (
            <AuthView />
          )}
        </Suspense>
      </Route>

      <Route exact path="/user">
        <Suspense fallback={<LoadingComponent />}>
          {!currentUser ? (
            <Redirect to="/auth" /> 
          ) : (
            <UserView 
              offers={offers} 
              companies={companies} 
              onAddReview={onAddReview} 
            />
          )}
        </Suspense>
      </Route>

      <Route exact path="/company">
        <Suspense fallback={<LoadingComponent />}>
          {!currentUser ? (
            <Redirect to="/auth" /> 
          ) : currentUser.role === 'company' ? (
            <CompanyView
              offers={offers}
              reviews={reviews}
              companyId={currentUser.companyId || ''}
              onAddOffer={onAddOffer}
              onUpdateOffer={onUpdateOffer}
              onDeleteOffer={onDeleteOfferFromCompany}
              onReplyReview={onReplyReview}
            />
          ) : (
            <Redirect to="/user" />
          )}
        </Suspense>
      </Route>

      <Route exact path="/admin">
        <Suspense fallback={<LoadingComponent />}>
          {!currentUser ? (
            <Redirect to="/auth" /> 
          ) : currentUser.role === 'admin' ? (
            <AdminView
              companies={companies}
              offers={offers}
              reviews={reviews}
              onDeleteOffer={onDeleteOffer}
              onDeleteReview={onDeleteReview}
              onUpdateCompanyStatus={onUpdateCompanyStatus}
              onDeleteCompany={onDeleteCompany}
            />
          ) : (
            <Redirect to="/user" />
          )}
        </Suspense>
      </Route>

      <Route exact path="/">
        <Redirect to="/auth" />
      </Route>
    </IonRouterOutlet>
  );
};