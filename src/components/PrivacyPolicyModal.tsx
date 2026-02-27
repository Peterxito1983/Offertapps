// src/components/PrivacyPolicyModal.tsx

import React, { useState } from 'react';
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonButtons,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonToggle,
  IonCheckbox,
  IonCard,
  IonCardContent,
  IonText
} from '@ionic/react';
import { close, document, shield, checkmark } from 'ionicons/icons';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept?: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({
  isOpen,
  onClose,
  onAccept
}) => {
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const handleScroll = () => {
    // Scroll detection removed as requested
  };

  const handleAccept = () => {
    setAcceptedPrivacy(true);
    setAcceptedTerms(true);
    if (onAccept) {
      onAccept();
    }
    onClose();
  };

  return (
    <IonModal
      isOpen={isOpen}
      onDidDismiss={onClose}
    >
      <IonHeader>
        <IonToolbar>
          <IonTitle>Políticas de Privacidad y Términos</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={onClose}>
              <IonIcon icon={close} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent
        className="ion-padding"
        onIonScroll={handleScroll}
      >
        <IonCard>
          <IonCardContent>
            <IonText>
              <h2>Política de Privacidad</h2>
              <p><strong>Fecha de vigencia:</strong> {new Date().toLocaleDateString()}</p>

              <h3>1. Introducción</h3>
              <p>
                En OffertApps, nos comprometemos a proteger y respetar su privacidad.
                Esta Política de Privacidad explica cómo recopilamos, usamos, divulgamos
                y protegemos su información personal cuando utiliza nuestra aplicación
                móvil y servicios relacionados ("Servicios").
              </p>

              <h3>2. Información que Recopilamos</h3>
              <p>
                <strong>Información de registro:</strong> nombre, dirección de correo electrónico,
                contraseña, rol (usuario, empresa, administrador)
              </p>
              <p>
                <strong>Información de ubicación:</strong> recopilamos datos de ubicación precisa (GPS)
                para mostrar ofertas cercanas a usted y permitir el uso del mapa interactivo.
                Esta información solo se procesa mientras la aplicación está en uso.
              </p>
              <p>
                <strong>Información de perfil:</strong> nombre de usuario, foto de perfil,
                nivel de usuario (bronce, plata, oro), puntos acumulados
              </p>
              <p>
                <strong>Información de uso:</strong> páginas visitadas, ofertas vistas,
                tiempo de permanencia, interacciones con la aplicación
              </p>


              <h3>3. Cómo Usamos Su Información</h3>
              <p>
                Utilizamos su información para proporcionar y mejorar nuestros Servicios,
                personalizar su experiencia, gestionar su cuenta y mantener la seguridad
                de nuestros Servicios.
              </p>

              <h3>4. Derechos de Privacidad</h3>
              <p>
                Dependiendo de su ubicación, usted puede tener derechos de acceso,
                rectificación, eliminación y portabilidad de sus datos personales.
              </p>

              <h2>Términos de Servicio</h2>

              <h3>1. Aceptación de los Términos</h3>
              <p>
                Al descargar, instalar o utilizar la aplicación OffertApps, usted acepta
                plenamente estos Términos de servicio y nuestra Política de Privacidad.
              </p>

              <h3>2. Uso Aceptable</h3>
              <p>
                Al usar la Aplicación, usted acepta no violar ninguna ley aplicable,
                publicar contenido ilegal, ofensivo o engañoso, o interferir con el
                funcionamiento de la Aplicación.
              </p>

              <h3>3. Limitación de Responsabilidad</h3>
              <p>
                EN LA MEDIDA MÁXIMA PERMITIDA POR LA LEY, OFFERTAPPS NO SERÁ RESPONSABLE
                POR NINGÚN DAÑO INDIRECTO, INCIDENTAL, ESPECIAL, CONSECUENTE O PUNITIVO.
              </p>
            </IonText>
          </IonCardContent>
        </IonCard>

        <div style={{ padding: '8px', backgroundColor: '#ffffff', borderRadius: '24px', margin: '16px 0', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <IonItem
            button
            detail={false}
            onClick={() => setAcceptedPrivacy(!acceptedPrivacy)}
            style={{ '--padding-start': '16px', '--inner-padding-end': '16px', '--background': acceptedPrivacy ? 'rgba(79, 70, 229, 0.05)' : 'white' }}
          >
            <IonLabel style={{ whiteSpace: 'normal', fontWeight: '700', color: '#1e293b' }}>
              Acepto la Política de Privacidad
            </IonLabel>
            <IonCheckbox
              slot="end"
              checked={acceptedPrivacy}
              onIonChange={e => {
                e.stopPropagation();
                setAcceptedPrivacy(e.detail.checked);
              }}
              style={{ '--size': '24px' }}
            />
          </IonItem>

          <IonItem
            button
            detail={false}
            onClick={() => setAcceptedTerms(!acceptedTerms)}
            style={{ '--padding-start': '16px', '--inner-padding-end': '16px', '--background': acceptedTerms ? 'rgba(79, 70, 229, 0.05)' : 'white' }}
          >
            <IonLabel style={{ whiteSpace: 'normal', fontWeight: '700', color: '#1e293b' }}>
              Acepto los Términos de Servicio
            </IonLabel>
            <IonCheckbox
              slot="end"
              checked={acceptedTerms}
              onIonChange={e => {
                e.stopPropagation();
                setAcceptedTerms(e.detail.checked);
              }}
              style={{ '--size': '24px' }}
            />
          </IonItem>
        </div>



        <IonButton
          expand="block"
          onClick={handleAccept}
          style={{
            marginTop: '24px',
            '--height': '56px',
            '--background': 'var(--ion-color-primary)',
            fontWeight: '700'
          }}
        >
          <IonIcon icon={checkmark} slot="start" />
          Aceptar Todo y Continuar
        </IonButton>
      </IonContent>
    </IonModal>
  );
};