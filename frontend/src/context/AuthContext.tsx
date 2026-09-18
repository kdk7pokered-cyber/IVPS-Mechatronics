import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  User, RegisterResponse, GoogleAuthResponse,
  OAuthAuthorizeResponse, OAuthCallbackRequest, OAuthCompleteRegistrationRequest, OAuthAuthResponse
} from '../types';
import { api } from '../services/api';
import { useToast } from './ToastContext';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (data: any) => Promise<RegisterResponse>;
  verifyOtp: (email: string, otp: string) => Promise<void>;
  resendOtp: (email: string) => Promise<{ success: boolean; message: string; dev_otp?: string }>;
  loginWithGoogle: (data: {
    id_token?: string;
    code?: string;
    role?: 'buyer' | 'broker';
    phone?: string;
    company?: string;
  }) => Promise<GoogleAuthResponse>;
  completeGoogleRegistration: (data: {
    google_sub: string;
    email: string;
    name: string;
    role: 'buyer' | 'broker';
    phone?: string;
    company?: string;
    business_description?: string;
    profile_image?: string;
  }) => Promise<{ access_token: string; token_type: string; user: User }>;
  initiateOAuth: (provider: 'google' | 'yahoo', role?: 'buyer' | 'broker') => Promise<OAuthAuthorizeResponse>;
  handleOAuthCallback: (data: OAuthCallbackRequest) => Promise<OAuthAuthResponse>;
  completeOAuthRegistration: (data: OAuthCompleteRegistrationRequest) => Promise<OAuthAuthResponse>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('ivps_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { showToast } = useToast();

  const refreshUser = async () => {
    const savedToken = localStorage.getItem('ivps_token');
    if (!savedToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    try {
      const u = await api.getMe();
      setUser(u);
    } catch {
      localStorage.removeItem('ivps_token');
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const res = await api.login(email, pass);
      localStorage.setItem('ivps_token', res.access_token);
      setToken(res.access_token);
      setUser(res.user);
      showToast(`Welcome back, ${res.user.name}!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Login failed', 'error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: any): Promise<RegisterResponse> => {
    setIsLoading(true);
    try {
      const res = await api.register(data);
      showToast(res.message || 'Verification code sent to your email.', 'info');
      return res;
    } catch (err: any) {
      showToast(err.message || 'Registration failed', 'error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async (email: string, otp: string) => {
    setIsLoading(true);
    try {
      const res = await api.verifyOtp(email, otp);
      localStorage.setItem('ivps_token', res.access_token);
      setToken(res.access_token);
      setUser(res.user);
      showToast(`Account verified! Welcome to IVPS Mechatronics, ${res.user.name}.`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Verification failed', 'error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const resendOtp = async (email: string) => {
    try {
      const res = await api.resendOtp(email);
      showToast(res.message || 'New verification code sent.', 'info');
      return res;
    } catch (err: any) {
      showToast(err.message || 'Could not resend OTP', 'error');
      throw err;
    }
  };

  const loginWithGoogle = async (data: {
    id_token?: string;
    code?: string;
    role?: 'buyer' | 'broker';
    phone?: string;
    company?: string;
  }): Promise<GoogleAuthResponse> => {
    setIsLoading(true);
    try {
      const res = await api.loginWithGoogle(data);
      if (res.access_token && res.user) {
        localStorage.setItem('ivps_token', res.access_token);
        setToken(res.access_token);
        setUser(res.user);
        showToast(`Welcome back, ${res.user.name}! (Google Verified)`, 'success');
      }
      return res;
    } catch (err: any) {
      showToast(err.message || 'Google authentication failed', 'error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const completeGoogleRegistration = async (data: {
    google_sub: string;
    email: string;
    name: string;
    role: 'buyer' | 'broker';
    phone?: string;
    company?: string;
    business_description?: string;
    profile_image?: string;
  }) => {
    setIsLoading(true);
    try {
      const res = await api.completeGoogleRegistration(data);
      localStorage.setItem('ivps_token', res.access_token);
      setToken(res.access_token);
      setUser(res.user);
      showToast(`Welcome to IVPS Mechatronics, ${res.user.name}! Account verified with Google.`, 'success');
      return res;
    } catch (err: any) {
      showToast(err.message || 'Failed to complete Google registration', 'error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const initiateOAuth = async (provider: 'google' | 'yahoo', role?: 'buyer' | 'broker'): Promise<OAuthAuthorizeResponse> => {
    try {
      const res = await api.getOAuthAuthorizeUrl(provider, role);
      return res;
    } catch (err: any) {
      showToast(err.message || `Failed to initiate ${provider.toUpperCase()} authentication`, 'error');
      throw err;
    }
  };

  const handleOAuthCallback = async (data: OAuthCallbackRequest): Promise<OAuthAuthResponse> => {
    setIsLoading(true);
    try {
      const res = await api.handleOAuthCallback(data);
      if (res.access_token && res.user) {
        localStorage.setItem('ivps_token', res.access_token);
        setToken(res.access_token);
        setUser(res.user);
        const providerName = (res.provider || data.provider).toUpperCase();
        showToast(`Welcome back, ${res.user.name}! (${providerName} Verified)`, 'success');
      }
      return res;
    } catch (err: any) {
      showToast(err.message || 'OAuth authentication failed', 'error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const completeOAuthRegistration = async (data: OAuthCompleteRegistrationRequest): Promise<OAuthAuthResponse> => {
    setIsLoading(true);
    try {
      const res = await api.completeOAuthRegistration(data);
      if (res.access_token && res.user) {
        localStorage.setItem('ivps_token', res.access_token);
        setToken(res.access_token);
        setUser(res.user);
        const providerName = (res.provider || data.provider).toUpperCase();
        showToast(`Welcome to IVPS Mechatronics, ${res.user.name}! Account verified with ${providerName}.`, 'success');
      }
      return res;
    } catch (err: any) {
      showToast(err.message || 'Failed to complete OAuth registration', 'error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('ivps_token');
    setToken(null);
    setUser(null);
    showToast('You have been logged out.', 'info');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        verifyOtp,
        resendOtp,
        loginWithGoogle,
        completeGoogleRegistration,
        initiateOAuth,
        handleOAuthCallback,
        completeOAuthRegistration,
        logout,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
