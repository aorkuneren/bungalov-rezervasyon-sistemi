import React from 'react';
import { Button, Input, PasswordInput, Checkbox } from './ui';

const TabContent = ({ 
  activeTab, 
  formData, 
  setFormData, 
  loading, 
  errors, 
  handleInputChange, 
  handleLogin, 
  handleForgotPassword, 
  handleVerifyCode,
  handleResendCode,
  handleResetPassword,
  forgotPasswordStep,
  setForgotPasswordStep,
  validateForm,
  countdown,
  canResendCode,
  isLoginButtonDisabled,
  isForgotPasswordButtonDisabled,
  isVerifyCodeButtonDisabled,
  isResetPasswordButtonDisabled
}) => {


  const renderLoginContent = () => (
    <form onSubmit={handleLogin} className="mt-8 space-y-6">
      {/* E-posta Input */}
      <div className="form-group">
        <Input
          label="E-posta Adresi"
          type="email"
          name="email"
          placeholder="E-posta adresinizi girin"
          value={formData.email}
          onChange={handleInputChange}
          error={errors.email}
          size="lg"
        />
      </div>

      {/* Şifre Input */}
      <div className="form-group">
        <PasswordInput
          label="Şifre"
          name="password"
          placeholder="Şifrenizi girin"
          value={formData.password}
          onChange={handleInputChange}
          error={errors.password}
          size="lg"
        />
      </div>

      {/* Beni Hatırla Checkbox */}
      <div className="form-group">
        <Checkbox
          label="Beni Hatırla"
          name="remember_me"
          checked={formData.remember_me || false}
          onChange={(e) => {
            setFormData({
              ...formData,
              remember_me: e.target.checked
            });
          }}
          size="md"
          
        />
      </div>

      {/* Giriş Butonu */}
      <div className="form-actions">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={loading}
          disabled={loading || isLoginButtonDisabled()}
          className="w-full"
        >
          {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
        </Button>
      </div>
    </form>
  );

  const renderForgotPasswordContent = () => {
    // Step 1: Email input and send code
    if (forgotPasswordStep === 1) {
      return (
        <div className="mt-8 space-y-6">
          {/* E-posta Input */}
          <div className="form-group">
            <Input
              label="E-posta Adresi"
              type="email"
              name="email"
              placeholder="E-posta adresinizi girin"
              value={formData.email}
              onChange={handleInputChange}
              error={errors.email}
              size="lg"
            />
          </div>

          {/* Şifre Sıfırlama Butonu */}
          <div className="form-actions">
            <Button
              variant="primary"
              size="lg"
              loading={loading}
              disabled={loading || isForgotPasswordButtonDisabled()}
              onClick={handleForgotPassword}
              className="w-full"
            >
              {loading ? 'Gönderiliyor...' : 'Şifremi Sıfırla'}
            </Button>
          </div>
        </div>
      );
    }

    // Step 2: Code verification
    if (forgotPasswordStep === 2) {
      return (
        <div className="mt-8 space-y-6">
          {/* Header */}
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-800">Kod Doğrulama</h3>
            <p className="mt-1 text-sm text-gray-600">
              E-postanıza gönderilen 6 haneli kodu girin (60 saniye geçerli)
            </p>
            {countdown > 0 && (
              <p className="mt-2 text-sm text-blue-600 font-medium">
                Kod tekrar gönderilebilir: {countdown} saniye
              </p>
            )}
          </div>

          {/* 6 Haneli Kod */}
          <div className="form-group">
            <Input
              label="6 Haneli Kod"
              type="text"
              name="token"
              value={formData.token}
              onChange={handleInputChange}
              placeholder="123456"
              error={errors.token}
              size="lg"
              maxLength="6"
            />
          </div>

          {/* Kod Onayla Butonu */}
          <div className="form-actions">
            <Button
              variant="primary"
              size="lg"
              loading={loading}
              disabled={loading || isVerifyCodeButtonDisabled()}
              onClick={handleVerifyCode}
              className="w-full"
            >
              {loading ? 'Doğrulanıyor...' : 'Kodu Onayla'}
            </Button>
          </div>

          {/* Tekrar Gönder Butonu */}
          {countdown === 0 && (
            <div className="form-actions">
              <Button
                variant="secondary"
                size="md"
                className="w-full"
                onClick={handleResendCode}
                disabled={loading || !canResendCode}
              >
                Kodu Tekrar Gönder
              </Button>
            </div>
          )}

          {/* Geri Dön Butonu */}
          <div className="form-actions">
            <Button
              variant="secondary"
              size="md"
              className="w-full"
              onClick={() => {
                setForgotPasswordStep(1);
                setFormData(prev => ({ ...prev, token: '' }));
              }}
              disabled={loading}
            >
              ← Geri Dön
            </Button>
          </div>
        </div>
      );
    }

    // Step 3: New password
    return (
      <div className="mt-8 space-y-6">
        {/* Header */}
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-800">Yeni Şifre Belirle</h3>
          <p className="mt-1 text-sm text-gray-600">
            Yeni şifrenizi belirleyin
          </p>
        </div>

        {/* Yeni Şifre Input */}
        <div className="form-group">
          <PasswordInput
            label="Yeni Şifre"
            name="password"
            placeholder="Yeni şifrenizi girin"
            value={formData.password}
            onChange={handleInputChange}
            error={errors.password}
            size="lg"
          />
        </div>

        {/* Şifre Tekrar Input */}
        <div className="form-group">
          <PasswordInput
            label="Yeni Şifre (Tekrar)"
            name="password_confirmation"
            placeholder="Şifrenizi tekrar girin"
            value={formData.password_confirmation}
            onChange={handleInputChange}
            error={errors.password_confirmation}
            size="lg"
          />
        </div>

        {/* Kaydet Butonu */}
        <div className="form-actions">
          <Button
            variant="primary"
            size="lg"
            loading={loading}
            disabled={loading || isResetPasswordButtonDisabled()}
            onClick={handleResetPassword}
            className="w-full"
          >
            {loading ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>
        </div>

        {/* Geri Dön Butonu */}
        <div className="form-actions">
          <Button
            variant="secondary"
            size="md"
            className="w-full"
            onClick={() => {
              setForgotPasswordStep(2);
              setFormData(prev => ({ ...prev, password: '', password_confirmation: '' }));
            }}
            disabled={loading}
          >
            ← Geri Dön
          </Button>
        </div>
      </div>
    );
  };

  return (
    <>
      {activeTab === 'login' ? renderLoginContent() : renderForgotPasswordContent()}
    </>
  );
};

export default TabContent;