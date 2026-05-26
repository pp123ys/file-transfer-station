import api from './index';

export const sendVerificationCode = async (email) => {
  return api.post('/api/auth/send-verification-code', { email });
};

export const completeEmail = async (email, verificationCode) => {
  return api.put('/api/auth/complete-email', { 
    email, 
    verification_code: verificationCode 
  });
};

export const getEmailConfig = async () => {
  return api.get('/api/admin/settings/email');
};

export const updateEmailConfig = async (config) => {
  return api.put('/api/admin/settings/email', config);
};

export const testEmail = async (email) => {
  return api.post('/api/admin/settings/test-email', null, { 
    params: { email } 
  });
};