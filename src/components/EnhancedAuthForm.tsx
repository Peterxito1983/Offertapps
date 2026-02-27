import React, { useState } from 'react';
import {
  IonContent,
  IonLabel,
  IonSegment,
  IonSegmentButton,
  IonToggle,
  IonLoading,
  IonToast,
  IonIcon,
  IonButton,
  IonCheckbox,
  IonItem,
  IonText,
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonList,
  IonRadioGroup,
  IonRadio,
  IonDatetime,
  IonChip
} from '@ionic/react';
import { person, business, eye, eyeOff, checkmark, time, calendar, location } from 'ionicons/icons';
import { Role } from '../types';
import { signUp, signIn } from '../services/authService';
import { uploadCompanyLogo } from '../services/storageService';
import { ValidatedInput } from './EnhancedFormComponents';
import { PrivacyPolicyModal } from './PrivacyPolicyModal';

// Reglas de validación comunes
const emailValidation = {
  validate: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
  errorMessage: 'Por favor ingresa un correo electrónico válido'
};

const passwordValidation = {
  validate: (value: string) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{6,}$/.test(value),
  errorMessage: 'La contraseña debe tener al menos 6 caracteres, incluyendo mayúscula, minúscula y número'
};

const nameValidation = {
  validate: (value: string) => value.length >= 2,
  errorMessage: 'El nombre debe tener al menos 2 caracteres'
};

interface EnhancedAuthFormProps {
  onSuccess: (role: Role) => void;
}

export const EnhancedAuthForm: React.FC<EnhancedAuthFormProps> = ({ onSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [role, setRole] = useState<Role>(Role.USER);
  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastColor, setToastColor] = useState('success');

  // Company Specific Fields
  const [companyAddress, setCompanyAddress] = useState('');
  const [companyCity, setCompanyCity] = useState('');
  const [companyWhatsapp, setCompanyWhatsapp] = useState('');
  const [companyHours, setCompanyHours] = useState('');
  const [companyLogoFile, setCompanyLogoFile] = useState<File | null>(null);
  const [companyLogoPreview, setCompanyLogoPreview] = useState<string | null>(null);

  // Estados para el selector de horario
  const [showSchedulePicker, setShowSchedulePicker] = useState(false);
  const [selectedDaysType, setSelectedDaysType] = useState<'l-v' | 'l-s' | 'todos' | 'personalizado'>('l-v');
  const [openTime, setOpenTime] = useState('08:00');
  const [closeTime, setCloseTime] = useState('18:00');

  const getDaysText = (type: string) => {
    switch (type) {
      case 'l-v': return 'Lun-Vie';
      case 'l-s': return 'Lun-Sab';
      case 'todos': return 'Todos los días';
      default: return 'Horario personalizado';
    }
  };

  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${minutes} ${ampm}`;
  };

  const updateSchedule = () => {
    const days = getDaysText(selectedDaysType);
    const schedule = `${days} ${formatTime(openTime)} - ${formatTime(closeTime)}`;
    setCompanyHours(schedule);
    setShowSchedulePicker(false);
  };

  const showToastMessage = (message: string, color: string = 'success') => {
    setToastMessage(message);
    setToastColor(color);
    setShowToast(true);
  };

  const handleAuth = async () => {
    if (mode === 'register') {
      if (!emailValidation.validate(email)) return showToastMessage('Correo electrónico inválido', 'danger');
      if (!passwordValidation.validate(password)) return showToastMessage('Contraseña no cumple con los requisitos', 'danger');
      if (!nameValidation.validate(name)) return showToastMessage('Nombre muy corto', 'danger');
      if (password !== confirmPassword) return showToastMessage('Las contraseñas no coinciden', 'danger');
    } else {
      if (!emailValidation.validate(email)) return showToastMessage('Correo electrónico inválido', 'danger');
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        const userProfile = await signIn(email, password);
        onSuccess(userProfile.role);
      } else {
        if (!acceptedPrivacy || !acceptedTerms) {
          setShowPrivacyModal(true);
          setLoading(false);
          return;
        }

        let logoUrl = '';
        // Validaciones específicas de empresa
        if (role === Role.COMPANY) {
          if (!companyAddress.trim()) return showToastMessage('La dirección de la empresa es obligatoria', 'danger');
          if (!companyCity.trim()) return showToastMessage('La ciudad es obligatoria', 'danger');
          if (!companyWhatsapp.trim()) return showToastMessage('El número de WhatsApp es obligatorio', 'danger');
          if (!companyHours.trim()) return showToastMessage('El horario de atención es obligatorio', 'danger');

          if (companyLogoFile) {
            try {
              logoUrl = await uploadCompanyLogo(companyLogoFile);
            } catch (uploadErr: any) {
              console.error('Error al subir logo:', uploadErr);
              showToastMessage('Error crítico al subir el logo: ' + (uploadErr.message || 'Error desconocido'), 'danger');
              setLoading(false);
              return;
            }
          }
        }

        console.log('Intentando registro con:', email, role);
        await signUp(email, password, name, role, role === Role.COMPANY ? {
          address: companyAddress,
          city: companyCity,
          whatsapp: companyWhatsapp,
          openingHours: companyHours,
          logoUrl: logoUrl
        } : undefined);

        console.log('Registro exitoso');
        onSuccess(role);
      }
    } catch (err: any) {
      console.error('Error en proceso de autenticación:', err);
      let errorMessage = 'Error inesperado';

      if (err.code === 'auth/email-already-in-use') errorMessage = 'Este correo ya está registrado';
      else if (err.code === 'auth/invalid-email') errorMessage = 'Formato de correo inválido';
      else if (err.code === 'auth/weak-password') errorMessage = 'La contraseña es muy débil';
      else if (err.message) errorMessage = err.message;

      showToastMessage(errorMessage, 'danger');
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonContent className="ion-padding">
      <div style={{
        maxWidth: '500px',
        margin: '0 auto',
        padding: '40px 16px',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100%'
      }}>
        {/* Header de Bienvenida */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '80px',
            height: '80px',
            backgroundColor: 'var(--ion-color-primary)',
            borderRadius: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 12px 24px rgba(79, 70, 229, 0.3)',
            color: 'white'
          }}>
            <img src="/icons/icon-512.webp" alt="OffertApps Logo" style={{ width: '80px', height: '80px', objectFit: 'contain' }} />
          </div>
          <h1 style={{
            fontSize: '2.2rem',
            fontWeight: '900',
            margin: '0',
            color: 'var(--ion-color-dark)',
            letterSpacing: '-0.05em'
          }}>
            {mode === 'login' ? 'OffertApps' : 'Únete a nosotros'}
          </h1>
          <p style={{ color: '#64748b', marginTop: '8px', fontWeight: '500' }}>
            {mode === 'login' ? 'Ingresa para ver las mejores ofertas' : 'Crea tu cuenta gratis en segundos'}
          </p>
        </div>

        {/* Card Contenedora */}
        <div style={{
          width: '100%',
          maxWidth: '450px',
          backgroundColor: 'white',
          borderRadius: '32px',
          padding: '32px',
          boxShadow: 'var(--offertapps-shadow-lg)',
          border: '1px solid rgba(255,255,255,0.5)'
        }}>
          {/* Selector de Modo (Login/Register) */}
          <div style={{
            backgroundColor: 'var(--ion-color-light)',
            padding: '6px',
            borderRadius: '16px',
            display: 'flex',
            marginBottom: '32px'
          }}>
            <button
              onClick={() => setMode('login')}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '12px',
                border: 'none',
                backgroundColor: mode === 'login' ? 'white' : 'transparent',
                color: mode === 'login' ? 'var(--ion-color-primary)' : '#64748b',
                fontWeight: '700',
                fontSize: '0.9rem',
                boxShadow: mode === 'login' ? '0 4px 10px rgba(0,0,0,0.05)' : 'none',
                transition: 'all 0.2s ease',
                cursor: 'pointer'
              }}
            >
              Iniciar Sesión
            </button>
            <button
              onClick={() => setMode('register')}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '12px',
                border: 'none',
                backgroundColor: mode === 'register' ? 'white' : 'transparent',
                color: mode === 'register' ? 'var(--ion-color-primary)' : '#64748b',
                fontWeight: '700',
                fontSize: '0.9rem',
                boxShadow: mode === 'register' ? '0 4px 10px rgba(0,0,0,0.05)' : 'none',
                transition: 'all 0.2s ease',
                cursor: 'pointer'
              }}
            >
              Registrarse
            </button>
          </div>

          {/* Formulario Dinámico */}
          {mode === 'register' && (
            <>
              <ValidatedInput
                value={name}
                onValueChange={setName}
                label="Nombre Completo"
                placeholder="Ej. Juan Pérez"
                validations={[nameValidation]}
                required
              />

              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  color: 'var(--ion-color-slate-700)',
                  marginBottom: '12px'
                }}>
                  ¿Eres un usuario o una empresa?
                </label>
                <IonSegment
                  value={role}
                  onIonChange={e => setRole(e.detail.value as any)}
                  style={{ '--background': 'var(--ion-color-light)', borderRadius: '14px' }}
                >
                  <IonSegmentButton value={Role.USER}>
                    <IonIcon icon={person} style={{ fontSize: '18px' }} />
                    <IonLabel style={{ fontSize: '0.8rem' }}>Usuario</IonLabel>
                  </IonSegmentButton>
                  <IonSegmentButton value={Role.COMPANY}>
                    <IonIcon icon={business} style={{ fontSize: '18px' }} />
                    <IonLabel style={{ fontSize: '0.8rem' }}>Empresa</IonLabel>
                  </IonSegmentButton>
                </IonSegment>
              </div>

              {role === Role.COMPANY && (
                <div style={{
                  marginTop: '16px',
                  padding: '16px',
                  backgroundColor: 'rgba(79, 70, 229, 0.05)',
                  borderRadius: '20px',
                  border: '1px dashed rgba(79, 70, 229, 0.2)',
                  marginBottom: '24px'
                }}>
                  <p style={{
                    fontSize: '0.8rem',
                    fontWeight: '700',
                    color: 'var(--ion-color-primary)',
                    marginBottom: '16px',
                    textAlign: 'center',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Datos de la Empresa
                  </p>

                  <ValidatedInput
                    value={companyAddress}
                    onValueChange={setCompanyAddress}
                    label="Dirección de la Empresa"
                    placeholder="Ej. Calle 123 # 45-67"
                    required
                  />

                  <ValidatedInput
                    value={companyCity}
                    onValueChange={setCompanyCity}
                    label="Ciudad"
                    placeholder="Ej. Bogotá, Medellín..."
                    required
                  />

                  <ValidatedInput
                    value={companyWhatsapp}
                    onValueChange={setCompanyWhatsapp}
                    label="Número de WhatsApp"
                    placeholder="Ej. +57 300 123 4567"
                    required
                  />

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '0.85rem',
                      fontWeight: '700',
                      color: 'var(--ion-color-slate-700)',
                      marginBottom: '8px'
                    }}>
                      Horario de Atención
                    </label>
                    <div
                      onClick={() => setShowSchedulePicker(true)}
                      style={{
                        padding: '14px 16px',
                        backgroundColor: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <IonIcon icon={time} style={{ color: 'var(--ion-color-primary)', fontSize: '20px' }} />
                        <span style={{ fontSize: '0.9rem', color: companyHours ? '#1e293b' : '#94a3b8', fontWeight: companyHours ? '600' : '500' }}>
                          {companyHours || 'Seleccionar días y horas...'}
                        </span>
                      </div>
                      <IonIcon icon={checkmark} style={{ color: companyHours ? 'var(--ion-color-success)' : '#94a3b8' }} />
                    </div>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '0.85rem',
                      fontWeight: '700',
                      color: 'var(--ion-color-slate-700)',
                      marginBottom: '12px'
                    }}>
                      Logotipo de la Empresa
                    </label>
                    <div
                      onClick={() => document.getElementById('company-logo-input')?.click()}
                      style={{
                        width: '100%',
                        height: '100px',
                        border: '2px dashed #cbd5e1',
                        borderRadius: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        overflow: 'hidden',
                        position: 'relative',
                        backgroundColor: '#f8fafc'
                      }}
                    >
                      {companyLogoPreview ? (
                        <img
                          src={companyLogoPreview}
                          alt="Logo Preview"
                          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        />
                      ) : (
                        <>
                          <IonIcon icon={business} style={{ fontSize: '24px', color: '#94a3b8', marginBottom: '4px' }} />
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '600' }}>Subir Logo (JPG, PNG)</span>
                        </>
                      )}
                      <input
                        id="company-logo-input"
                        type="file"
                        accept="image/jpeg,image/png,image/jpg"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setCompanyLogoFile(file);
                            const reader = new FileReader();
                            reader.onload = (re) => setCompanyLogoPreview(re.target?.result as string);
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          <ValidatedInput
            value={email}
            onValueChange={setEmail}
            label="Correo Electrónico"
            placeholder="tu@correo.com"
            type="email"
            validations={[emailValidation]}
            required
          />

          <div style={{ position: 'relative' }}>
            <ValidatedInput
              value={password}
              onValueChange={setPassword}
              label="Contraseña"
              placeholder="Mínimo 6 caracteres"
              type={showPassword ? 'text' : 'password'}
              validations={[passwordValidation]}
              required
            />
            <button
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '16px',
                top: '40px',
                backgroundColor: 'transparent',
                border: 'none',
                color: '#94a3b8',
                padding: '8px',
                cursor: 'pointer',
                zIndex: 10
              }}
            >
              <IonIcon icon={showPassword ? eyeOff : eye} style={{ fontSize: '20px' }} />
            </button>
          </div>

          {mode === 'register' && (
            <>
              <ValidatedInput
                value={confirmPassword}
                onValueChange={setConfirmPassword}
                label="Confirmar Contraseña"
                placeholder="••••••••"
                type={showPassword ? 'text' : 'password'}
                required
              />

              <div style={{
                marginTop: '16px',
                marginBottom: '24px',
                backgroundColor: '#ffffff',
                borderRadius: '24px',
                border: '1px solid #e2e8f0',
                overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                position: 'relative',
                zIndex: 100
              }}>
                <IonItem
                  button
                  detail={false}
                  onClick={() => setAcceptedPrivacy(!acceptedPrivacy)}
                  style={{ '--padding-start': '16px', '--inner-padding-end': '16px', '--background': acceptedPrivacy ? 'rgba(79, 70, 229, 0.05)' : 'white' }}
                >
                  <IonLabel style={{ whiteSpace: 'normal' }}>
                    <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#1e293b' }}>Política de Privacidad</div>
                    <div
                      onClick={(e) => { e.stopPropagation(); setShowPrivacyModal(true); }}
                      style={{ fontSize: '0.8rem', color: 'var(--ion-color-primary)', fontWeight: '600', marginTop: '4px', textDecoration: 'underline' }}
                    >
                      Ver documento legal
                    </div>
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
                  <IonLabel style={{ whiteSpace: 'normal' }}>
                    <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#1e293b' }}>Términos de Servicio</div>
                    <div
                      onClick={(e) => { e.stopPropagation(); setShowPrivacyModal(true); }}
                      style={{ fontSize: '0.8rem', color: 'var(--ion-color-primary)', fontWeight: '600', marginTop: '4px', textDecoration: 'underline' }}
                    >
                      Ver documento legal
                    </div>
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
            </>
          )}

          <div style={{ marginTop: '32px' }}>
            <IonButton
              expand="block"
              onClick={handleAuth}
              disabled={loading}
              style={{
                '--height': '56px',
                '--background': 'var(--ion-color-primary)',
                '--box-shadow': '0 8px 16px rgba(79, 70, 229, 0.25)',
                fontSize: '1rem',
                letterSpacing: '-0.01em',
                fontWeight: '700'
              }}
            >
              {loading ? 'Procesando...' : (mode === 'login' ? 'Entrar ahora' : 'Crear mi cuenta')}
            </IonButton>
          </div>
        </div>

        {/* Footer simple con tag de versión */}
        <div style={{ marginTop: '40px', textAlign: 'center' }}>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: '600', letterSpacing: '0.05em', textTransform: 'lowercase', margin: '0' }}>
            offertapps
          </p>
        </div>
      </div>

      <IonLoading
        isOpen={loading}
        message={mode === 'register' ? "Creando cuenta..." : "Iniciando sesión..."}
      />
      <IonToast
        isOpen={showToast}
        message={toastMessage}
        duration={3000}
        color={toastColor as any}
        onDidDismiss={() => setShowToast(false)}
      />

      <PrivacyPolicyModal
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
        onAccept={() => {
          setAcceptedPrivacy(true);
          setAcceptedTerms(true);
        }}
      />

      <IonModal isOpen={showSchedulePicker} onDidDismiss={() => setShowSchedulePicker(false)} initialBreakpoint={0.75} breakpoints={[0, 0.75, 0.9]}>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Configurar Horario</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={() => setShowSchedulePicker(false)}>Cerrar</IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <div className="ion-padding" style={{ backgroundColor: '#f8fafc', height: '100%' }}>
          <p style={{ fontWeight: '700', fontSize: '0.9rem', marginBottom: '16px', color: '#475569' }}>Selecciona los días:</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
            <IonChip outline={selectedDaysType !== 'l-v'} color="primary" onClick={() => setSelectedDaysType('l-v')}>Lun-Vie</IonChip>
            <IonChip outline={selectedDaysType !== 'l-s'} color="primary" onClick={() => setSelectedDaysType('l-s')}>Lun-Sab</IonChip>
            <IonChip outline={selectedDaysType !== 'todos'} color="primary" onClick={() => setSelectedDaysType('todos')}>Todos los días</IonChip>
          </div>

          <p style={{ fontWeight: '700', fontSize: '0.9rem', marginBottom: '16px', color: '#475569' }}>Horario de apertura:</p>
          <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '8px', marginBottom: '24px' }}>
            <IonItem lines="none">
              <IonLabel>Abre a las:</IonLabel>
              <input type="time" value={openTime} onChange={e => setOpenTime(e.target.value)} style={{ border: 'none', padding: '8px', fontSize: '1.2rem', fontWeight: '700', color: 'var(--ion-color-primary)' }} />
            </IonItem>
          </div>

          <p style={{ fontWeight: '700', fontSize: '0.9rem', marginBottom: '16px', color: '#475569' }}>Horario de cierre:</p>
          <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '8px', marginBottom: '32px' }}>
            <IonItem lines="none">
              <IonLabel>Cierra a las:</IonLabel>
              <input type="time" value={closeTime} onChange={e => setCloseTime(e.target.value)} style={{ border: 'none', padding: '8px', fontSize: '1.2rem', fontWeight: '700', color: 'var(--ion-color-primary)' }} />
            </IonItem>
          </div>

          <IonButton expand="block" onClick={updateSchedule} style={{ '--height': '56px', fontWeight: '700' }}>
            Confirmar Horario
          </IonButton>
        </div>
      </IonModal>
    </IonContent>
  );
};