import React, { useState, useEffect } from 'react';
import { useToast } from './ui/Toast';
import { authAPI } from '../services/api';
import TabContent from './TabContent';

const LoginForm = ({ onLoginSuccess }) => {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('login');
  const [forgotPasswordStep, setForgotPasswordStep] = useState(1); // 1: email gönder, 2: şifre sıfırla
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    password_confirmation: '',
    token: '',
    remember_me: false
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [countdown, setCountdown] = useState(0);
  const [canResendCode, setCanResendCode] = useState(false);

  // Countdown timer effect
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else if (countdown === 0 && forgotPasswordStep === 2) {
      setCanResendCode(true);
    }
    return () => clearTimeout(timer);
  }, [countdown, forgotPasswordStep]);

  // Auto-login with remember token
  useEffect(() => {
    const checkRememberToken = async () => {
      // Check if user is already authenticated
      const existingToken = localStorage.getItem('auth_token');
      const existingUser = localStorage.getItem('user');
      
      if (existingToken && existingUser) {
        // User is already logged in, skip auto-login
        return;
      }
      
      const rememberToken = localStorage.getItem('remember_token');
      const rememberTokenExpires = localStorage.getItem('remember_token_expires');
      
      if (rememberToken && rememberTokenExpires) {
        const expirationDate = new Date(rememberTokenExpires);
        const now = new Date();
        
        // Check if token is still valid
        if (now < expirationDate) {
          try {
            console.log('Attempting auto-login with remember token...');
            const response = await authAPI.autoLogin({
              remember_token: rememberToken
            });
            
            if (response.data.success) {
              localStorage.setItem('auth_token', response.data.token);
              localStorage.setItem('user', JSON.stringify(response.data.user));
              toast.success('Otomatik giriş yapıldı!');
              onLoginSuccess(response.data.user);
            }
          } catch (error) {
            console.log('Auto-login failed:', error);
            // Clear invalid remember token
            localStorage.removeItem('remember_token');
            localStorage.removeItem('remember_token_expires');
          }
        } else {
          // Clear expired remember token
          localStorage.removeItem('remember_token');
          localStorage.removeItem('remember_token_expires');
        }
      }
    };

    checkRememberToken();
  }, [onLoginSuccess, toast]);

  // Load saved credentials when component mounts
  useEffect(() => {
    const loadSavedCredentials = () => {
      const savedEmail = localStorage.getItem('saved_email');
      const savedPassword = localStorage.getItem('saved_password');
      const rememberMe = localStorage.getItem('remember_me') === 'true';
      
      if (savedEmail && rememberMe) {
        setFormData(prev => ({
          ...prev,
          email: savedEmail,
          password: savedPassword || '',
          remember_me: rememberMe
        }));
      }
    };

    loadSavedCredentials();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 6;
  };

  const validateAdminEmail = (email) => {
    const adminEmails = ['info@aorkuneren.com', 'admin@aorkuneren.com'];
    return adminEmails.includes(email);
  };

  // Buton durumlarını kontrol eden fonksiyonlar
  const isLoginButtonDisabled = () => {
    return !formData.email || !formData.password || !validateEmail(formData.email) || !validatePassword(formData.password);
  };

  const isForgotPasswordButtonDisabled = () => {
    return !formData.email || !validateEmail(formData.email) || !validateAdminEmail(formData.email);
  };

  const isVerifyCodeButtonDisabled = () => {
    return !formData.token || formData.token.length !== 6 || !/^\d{6}$/.test(formData.token);
  };

  const isResetPasswordButtonDisabled = () => {
    return !formData.password || !formData.password_confirmation || 
           !validatePassword(formData.password) || 
           formData.password !== formData.password_confirmation;
  };

  const validateForm = (type) => {
    const newErrors = {};

    if (type === 'login') {
      if (!formData.email) {
        newErrors.email = 'E-posta adresi gereklidir';
      } else if (!validateEmail(formData.email)) {
        newErrors.email = 'Geçerli bir e-posta adresi girin';
      }

      if (!formData.password) {
        newErrors.password = 'Şifre gereklidir';
      } else if (!validatePassword(formData.password)) {
        newErrors.password = 'Şifre en az 6 karakter olmalıdır';
      }
    } else if (type === 'forgot') {
      if (!formData.email) {
        newErrors.email = 'E-posta adresi gereklidir';
      } else if (!validateEmail(formData.email)) {
        newErrors.email = 'Geçerli bir e-posta adresi girin';
      } else if (!validateAdminEmail(formData.email)) {
        newErrors.email = 'Sadece yetkili e-posta adresleri kullanılabilir';
      }
    } else if (type === 'reset') {
      if (!formData.password) {
        newErrors.password = 'Yeni şifre gereklidir';
      } else if (!validatePassword(formData.password)) {
        newErrors.password = 'Şifre en az 6 karakter olmalıdır';
      }

      if (!formData.password_confirmation) {
        newErrors.password_confirmation = 'Şifre tekrarı gereklidir';
      } else if (formData.password !== formData.password_confirmation) {
        newErrors.password_confirmation = 'Şifreler eşleşmiyor';
      }

      if (!formData.token) {
        newErrors.token = 'Sıfırlama kodu gereklidir';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!validateForm('login')) {
      setLoading(false);
      return;
    }

    try {
      const response = await authAPI.login({
        email: formData.email,
        password: formData.password,
        remember_me: formData.remember_me
      });

      if (response.data.success) {
        localStorage.setItem('auth_token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // Store remember token and credentials if remember me is enabled
        if (formData.remember_me && response.data.remember_token) {
          localStorage.setItem('remember_token', response.data.remember_token);
          localStorage.setItem('saved_email', formData.email);
          localStorage.setItem('saved_password', formData.password);
          localStorage.setItem('remember_me', 'true');
          // Set expiration date (30 days from now)
          const expirationDate = new Date();
          expirationDate.setDate(expirationDate.getDate() + 30);
          localStorage.setItem('remember_token_expires', expirationDate.toISOString());
        } else {
          // Clear remember token and saved credentials if not using remember me
          localStorage.removeItem('remember_token');
          localStorage.removeItem('remember_token_expires');
          localStorage.removeItem('saved_email');
          localStorage.removeItem('saved_password');
          localStorage.removeItem('remember_me');
        }
        
        toast.success('Giriş başarılı!');
        setTimeout(() => {
          onLoginSuccess(response.data.user);
        }, 1000);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Giriş yapılırken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!validateForm('forgot')) {
      setLoading(false);
      return;
    }

    try {
      const response = await authAPI.forgotPassword({
        email: formData.email
      });

            if (response.data.success) {
              toast.success('6 haneli kod e-posta adresinize gönderildi (60 saniye geçerli)');
              setForgotPasswordStep(2); // İkinci aşamaya geç
              setCountdown(60); // 60 saniye geri sayım başlat
              setCanResendCode(false);
            }
    } catch (error) {
      toast.error(error.response?.data?.message || 'E-posta gönderilirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!validateForm('reset')) {
      setLoading(false);
      return;
    }

    try {
      const response = await authAPI.resetPassword({
        email: formData.email,
        password: formData.password,
        password_confirmation: formData.password_confirmation,
        token: formData.token
      });

      if (response.data.success) {
        toast.success('Şifreniz başarıyla sıfırlandı. Giriş sayfasına yönlendiriliyorsunuz...');
        setTimeout(() => {
          setActiveTab('login');
          setForgotPasswordStep(1); // İlk aşamaya dön
          setFormData({ email: '', password: '', password_confirmation: '', token: '' });
        }, 2000);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Şifre sıfırlanırken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'forgot') {
      setForgotPasswordStep(1); // Şifremi unuttum tab'ına geçerken ilk aşamaya dön
      setCountdown(0);
      setCanResendCode(false);
    }
    setErrors({}); // Hataları temizle
    setFormData({ ...formData, password: '', password_confirmation: '', token: '' }); // Şifre ve token alanlarını temizle
  };

  const handleCodeVerification = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!validateForm('verifyCode')) {
      setLoading(false);
      return;
    }

    try {
      // Backend'de token doğrulama endpoint'i yok, bu yüzden sadece frontend'de kontrol ediyoruz.
      // Gerçek uygulamada bu adım için bir API çağrısı yapılmalı.
      // Şimdilik, sadece token'ın doğru formatta olduğunu varsayalım.
      // Backend'deki resetPassword endpoint'i token'ı doğrulayacak.
      toast.success('Kod doğrulandı. Yeni şifrenizi belirleyebilirsiniz.');
      setForgotPasswordStep(3); // Üçüncü aşamaya geç
    } catch (error) {
      toast.error(error.response?.data?.message || 'Kod doğrulanırken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setCanResendCode(false);
    setCountdown(60);

    try {
      const response = await authAPI.forgotPassword({
        email: formData.email
      });

            if (response.data.success) {
              toast.success('Yeni 6 haneli kod e-posta adresinize gönderildi (60 saniye geçerli)');
            }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Kod tekrar gönderilirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const tabItems = [
    { id: 'login', label: 'Giriş Yap' },
    { id: 'forgot', label: 'Şifremi Unuttum' }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-6 px-4 sm:py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 sm:space-y-8">
        {/* Logo ve Başlık */}
        <div className="text-center">
          {/* Logo */}
          <div className="mx-auto h-12 w-12 bg-gray-900 rounded-lg flex items-center justify-center">
            <span className="text-white text-xl font-bold">B</span>
          </div>
          
          {/* Ana Başlık */}
          <h1 className="mt-4 sm:mt-6 text-center text-2xl sm:text-3xl font-extrabold text-gray-800">
            BungApp'e Giriş Yap
          </h1>
          
          {/* Alt Başlık */}
          <p className="mt-2 text-center text-sm text-gray-600">
            Hesabınıza erişim sağlayın
          </p>
        </div>

        {/* Tab Container */}
        <div className="mt-8">
          <div className="bg-gray-100 p-1 rounded-lg">
            <div className="tab-container">
              {tabItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  className={`tab-button ${activeTab === item.id ? 'active' : 'inactive'}`}
                  style={{ flex: 1 }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>


        {/* Form Container */}
        <TabContent
          activeTab={activeTab}
          formData={formData}
          setFormData={setFormData}
          loading={loading}
          errors={errors}
          handleInputChange={handleInputChange}
          handleLogin={handleLogin}
          handleForgotPassword={handleForgotPassword}
          handleVerifyCode={handleCodeVerification}
          handleResendCode={handleResendCode}
          handleResetPassword={handleResetPassword}
          forgotPasswordStep={forgotPasswordStep}
          setForgotPasswordStep={setForgotPasswordStep}
          validateForm={validateForm}
          countdown={countdown}
          canResendCode={canResendCode}
          isLoginButtonDisabled={isLoginButtonDisabled}
          isForgotPasswordButtonDisabled={isForgotPasswordButtonDisabled}
          isVerifyCodeButtonDisabled={isVerifyCodeButtonDisabled}
          isResetPasswordButtonDisabled={isResetPasswordButtonDisabled}
        />

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-gray-500">© 2024 WebAdam - BungApp</p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;