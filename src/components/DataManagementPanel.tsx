// src/components/DataManagementPanel.tsx

import React, { useState, useEffect } from 'react';
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonButton,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonText,
  IonToast,
  IonAlert
} from '@ionic/react';
import { 
  person, 
  trash, 
  document, 
  checkmark, 
  informationCircle, 
  close 
} from 'ionicons/icons';
import { dataManagementService } from '../services/dataManagementService';

interface DataManagementPanelProps {
  userId: string;
  userEmail: string;
}

export const DataManagementPanel: React.FC<DataManagementPanelProps> = ({ 
  userId, 
  userEmail 
}) => {
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState<'access' | 'deletion' | 'history'>('access');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showDeletionAlert, setShowDeletionAlert] = useState(false);
  const [loading, setLoading] = useState(false);

  // Cargar historial de solicitudes
  const [requestHistory, setRequestHistory] = useState<any[]>([]);

  useEffect(() => {
    loadRequestHistory();
  }, [userId]);

  const loadRequestHistory = async () => {
    try {
      setLoading(true);
      const history = await dataManagementService.getDataRequestHistory(userId);
      setRequestHistory(history);
    } catch (error) {
      console.error('Error al cargar historial:', error);
      showToastMessage('Error al cargar el historial de solicitudes');
    } finally {
      setLoading(false);
    }
  };

  const showToastMessage = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
  };

  const handleRequestDataAccess = async () => {
    try {
      setLoading(true);
      const requestId = await dataManagementService.requestDataAccess(userId);
      showToastMessage('Solicitud de acceso a datos enviada exitosamente');
      loadRequestHistory(); // Actualizar historial
    } catch (error) {
      console.error('Error al solicitar acceso a datos:', error);
      showToastMessage('Error al solicitar acceso a datos');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestDataDeletion = async () => {
    try {
      setLoading(true);
      const requestId = await dataManagementService.requestDataDeletion(userId, userEmail);
      showToastMessage('Solicitud de eliminación de datos enviada exitosamente');
      loadRequestHistory(); // Actualizar historial
    } catch (error) {
      console.error('Error al solicitar eliminación de datos:', error);
      showToastMessage('Error al solicitar eliminación de datos');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDeletion = async () => {
    setShowDeletionAlert(false);
    await handleRequestDataDeletion();
  };

  const openModal = (contentType: 'access' | 'deletion' | 'history') => {
    setModalContent(contentType);
    setShowModal(true);
  };

  return (
    <>
      <IonCard>
        <IonCardHeader>
          <IonCardTitle>Gestión de Datos Personales</IonCardTitle>
        </IonCardHeader>
        
        <IonCardContent>
          <IonList>
            <IonListHeader>
              <h3>Opciones de Privacidad</h3>
            </IonListHeader>
            
            <IonItem button onClick={() => openModal('access')}>
              <IonIcon icon={document} slot="start" color="primary" />
              <IonLabel>
                <h2>Solicitar Acceso a Mis Datos</h2>
                <p>Solicite una copia de sus datos personales</p>
              </IonLabel>
            </IonItem>
            
            <IonItem button onClick={() => openModal('deletion')}>
              <IonIcon icon={trash} slot="start" color="danger" />
              <IonLabel>
                <h2>Solicitar Eliminación de Datos</h2>
                <p>Solicite la eliminación de sus datos personales</p>
              </IonLabel>
            </IonItem>
            
            <IonItem button onClick={() => openModal('history')}>
              <IonIcon icon={informationCircle} slot="start" color="medium" />
              <IonLabel>
                <h2>Historial de Solicitudes</h2>
                <p>Ver historial de solicitudes de datos</p>
              </IonLabel>
            </IonItem>
          </IonList>
          
          <div style={{ marginTop: '16px' }}>
            <IonButton 
              expand="block" 
              fill="outline"
              onClick={() => openModal('history')}
            >
              Ver Historial Completo
            </IonButton>
          </div>
        </IonCardContent>
      </IonCard>

      {/* Modal para solicitudes */}
      <IonModal 
        isOpen={showModal} 
        onDidDismiss={() => setShowModal(false)}
      >
        <IonHeader>
          <IonToolbar>
            <IonTitle>
              {modalContent === 'access' && 'Acceso a Datos Personales'}
              {modalContent === 'deletion' && 'Eliminación de Datos Personales'}
              {modalContent === 'history' && 'Historial de Solicitudes'}
            </IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={() => setShowModal(false)}>
                <IonIcon icon={close} />
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>

        <IonContent className="ion-padding">
          {modalContent === 'access' && (
            <div>
              <IonCard>
                <IonCardContent>
                  <IonText>
                    <h2>Solicitar Acceso a Datos Personales</h2>
                    <p>
                      Puede solicitar una copia de todos sus datos personales 
                      que tenemos almacenados en nuestros sistemas.
                    </p>
                    <p>
                      Esta solicitud incluirá información como su perfil, 
                      historial de ofertas guardadas, y preferencias.
                    </p>
                  </IonText>
                  
                  <div style={{ marginTop: '16px' }}>
                    <IonButton 
                      expand="block" 
                      onClick={handleRequestDataAccess}
                      disabled={loading}
                    >
                      <IonIcon icon={document} slot="start" />
                      {loading ? 'Procesando...' : 'Solicitar Acceso'}
                    </IonButton>
                  </div>
                </IonCardContent>
              </IonCard>
            </div>
          )}

          {modalContent === 'deletion' && (
            <div>
              <IonCard color="danger">
                <IonCardContent>
                  <IonText color="light">
                    <h2>Advertencia Importante</h2>
                    <p>
                      <IonIcon icon={informationCircle} /> 
                      La eliminación de sus datos personales es irreversible.
                    </p>
                    <p>
                      Esta acción eliminará permanentemente su cuenta, 
                      perfil, ofertas guardadas y todas las interacciones 
                      asociadas a su cuenta.
                    </p>
                    <p>
                      <strong>¿Está completamente seguro?</strong>
                    </p>
                  </IonText>
                  
                  <div style={{ marginTop: '16px' }}>
                    <IonButton 
                      expand="block" 
                      color="danger"
                      onClick={() => setShowDeletionAlert(true)}
                      disabled={loading}
                    >
                      <IonIcon icon={trash} slot="start" />
                      {loading ? 'Procesando...' : 'Confirmar Eliminación'}
                    </IonButton>
                  </div>
                </IonCardContent>
              </IonCard>
            </div>
          )}

          {modalContent === 'history' && (
            <div>
              <IonCard>
                <IonCardHeader>
                  <IonCardTitle>Historial de Solicitudes</IonCardTitle>
                </IonCardHeader>
                
                <IonCardContent>
                  {loading ? (
                    <IonText color="medium">
                      <p>Cargando historial...</p>
                    </IonText>
                  ) : requestHistory.length === 0 ? (
                    <IonText color="medium">
                      <p>No hay solicitudes de datos registradas.</p>
                    </IonText>
                  ) : (
                    <IonList>
                      {requestHistory.map((request, index) => (
                        <IonItem key={index}>
                          <IonLabel>
                            <h3>
                              {request.type === 'deletion' && 'Eliminación de Datos'}
                              {request.type === 'access' && 'Acceso a Datos'}
                              {request.type === 'correction' && 'Corrección de Datos'}
                            </h3>
                            <p>
                              <strong>Estado:</strong> {request.status} • 
                              <strong> Fecha:</strong> {new Date(request.requestedAt).toLocaleDateString()}
                            </p>
                            {request.processedAt && (
                              <p>
                                <strong>Procesado:</strong> {new Date(request.processedAt).toLocaleDateString()}
                              </p>
                            )}
                          </IonLabel>
                          <IonIcon 
                            icon={request.status === 'completed' ? checkmark : informationCircle} 
                            color={request.status === 'completed' ? 'success' : 'warning'} 
                          />
                        </IonItem>
                      ))}
                    </IonList>
                  )}
                </IonCardContent>
              </IonCard>
            </div>
          )}
        </IonContent>
      </IonModal>

      {/* Alerta de confirmación para eliminación */}
      <IonAlert
        isOpen={showDeletionAlert}
        onDidDismiss={() => setShowDeletionAlert(false)}
        header="Confirmar Eliminación"
        subHeader="Esta acción es irreversible"
        message="¿Está completamente seguro de que desea eliminar todos sus datos personales? Esta acción no se puede deshacer y perderá permanentemente su cuenta y todos los datos asociados."
        backdropDismiss={false}
        buttons={[
          {
            text: 'Cancelar',
            role: 'cancel',
            handler: () => {
              setShowDeletionAlert(false);
            }
          },
          {
            text: 'Eliminar',
            cssClass: 'alert-button-confirm',
            handler: handleConfirmDeletion
          }
        ]}
      />

      {/* Toast para notificaciones */}
      <IonToast
        isOpen={showToast}
        message={toastMessage}
        duration={3000}
        onDidDismiss={() => setShowToast(false)}
      />
    </>
  );
};