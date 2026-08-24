import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import waygoLogo from '../waygo-logo.png';
import loginChennaiBg from '../login-chennai-bg.png';
import {
  Bus,
  Train,
  Zap,
  Car,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Phone,
  User,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Clock,
  KeyRound,
  Info,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../components/UI/Toast.js';
import { TransitBackground } from '../components/UI/TransitBackground.js';

type AuthTab = 'signin' | 'register';
type OtpPurpose = 'REGISTRATION' | 'LOGIN' | 'PASSWORD_RESET';

export const AuthPage: React.FC = () => {
  const {
    login,
    register,
    verifyRegistrationOtp,
    requestLoginOtp,
    verifyLoginOtp,
    requestResetOtp,
    resetPassword,
    resendOtp,
    demoLogin,
    user,
  } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  // Main UI State
  const [activeTab, setActiveTab] = useState<AuthTab>('signin');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sign In Form State
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Error & Wrong Password Recovery State
  const [loginError, setLoginError] = useState<string | null>(null);
  const [wrongPasswordContext, setWrongPasswordContext] = useState<{
    show: boolean;
    userId?: string;
    maskedDestination?: string;
    hasEmail?: boolean;
    hasPhone?: boolean;
  }>({ show: false });

  // Account Lockout State
  const [lockoutState, setLockoutState] = useState<{
    isLocked: boolean;
    remainingSeconds: number;
    userId?: string;
    maskedDestination?: string;
  }>({ isLocked: false, remainingSeconds: 0 });

  // Create Account Form State
  const [regName, setRegName] = useState('');
  const [regContactType, setRegContactType] = useState<'email' | 'phone' | 'both'>('email');
  const [regEmail, setRegEmail] = useState('');
  const [regCountryCode, setRegCountryCode] = useState('+91');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);

  // OTP Verification Modal State
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [otpPurpose, setOtpPurpose] = useState<OtpPurpose>('REGISTRATION');
  const [otpUserId, setOtpUserId] = useState('');
  const [otpMaskedDestination, setOtpMaskedDestination] = useState('');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState<number>(30);
  const [otpExpirySeconds, setOtpExpirySeconds] = useState<number>(300); // 5 mins
  const [devOtpCode, setDevOtpCode] = useState<string | null>(null);
  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Forgot Password Modal State
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotStep, setForgotStep] = useState<'IDENTIFIER' | 'OTP' | 'NEW_PASSWORD'>('IDENTIFIER');
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [forgotUserId, setForgotUserId] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [showForgotNewPassword, setShowForgotNewPassword] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);

  // Countdown timer for Lockout
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (lockoutState.isLocked && lockoutState.remainingSeconds > 0) {
      timer = setInterval(() => {
        setLockoutState((prev) => {
          if (prev.remainingSeconds <= 1) {
            return { ...prev, isLocked: false, remainingSeconds: 0 };
          }
          return { ...prev, remainingSeconds: prev.remainingSeconds - 1 };
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [lockoutState.isLocked, lockoutState.remainingSeconds]);

  // Countdown timer for OTP Resend & Expiry
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (otpModalOpen) {
      timer = setInterval(() => {
        setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
        setOtpExpirySeconds((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [otpModalOpen]);

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: 'None', color: 'bg-slate-700' };
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[a-z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(pass)) score++;

    if (score <= 2) return { score: 1, label: 'Weak', color: 'bg-rose-500', width: 'w-1/3' };
    if (score <= 4) return { score: 2, label: 'Moderate', color: 'bg-amber-500', width: 'w-2/3' };
    return { score: 3, label: 'Strong', color: 'bg-emerald-500', width: 'w-full' };
  };

  const passwordStrength = getPasswordStrength(regPassword);

  // =========================================================================
  // HANDLERS: SIGN IN
  // =========================================================================
  const handlePasswordSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setWrongPasswordContext({ show: false });

    if (!loginIdentifier.trim()) {
      setLoginError('Please enter your email address or phone number.');
      return;
    }
    if (!loginPassword) {
      setLoginError('Please enter your password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await login(loginIdentifier, loginPassword);

      if (result.locked) {
        setLockoutState({
          isLocked: true,
          remainingSeconds: result.remainingSeconds || 900,
          userId: result.userId,
          maskedDestination: result.maskedDestination,
        });
        setLoginError(result.message);
        return;
      }

      if (!result.success) {
        setLoginError(result.message || 'Wrong password. Please try again.');
        if (result.canLoginWithOtp) {
          setWrongPasswordContext({
            show: true,
            userId: result.userId,
            maskedDestination: result.maskedDestination,
            hasEmail: result.hasEmail,
            hasPhone: result.hasPhone,
          });
        }
        return;
      }

      showToast('Welcome back to WayGo!', 'success');
      navigate('/');
    } catch (err: any) {
      setLoginError(err.message || 'Unable to sign in. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartOtpLogin = async (channelPref?: 'EMAIL' | 'SMS') => {
    const ident = loginIdentifier.trim();
    if (!ident) {
      setLoginError('Please enter your email address or phone number to receive an OTP.');
      return;
    }

    setIsSubmitting(true);
    setLoginError(null);
    try {
      const res = await requestLoginOtp(ident, channelPref);
      if (res.success) {
        setOtpUserId(res.data.userId);
        setOtpMaskedDestination(res.data.maskedDestination);
        setOtpPurpose('LOGIN');
        setDevOtpCode(res.data.otpResult?.devOtp || null);
        setOtpDigits(['', '', '', '', '', '']);
        setResendCooldown(30);
        setOtpExpirySeconds(300);
        setOtpError(null);
        setOtpModalOpen(true);
        showToast(`One-time login code sent to ${res.data.maskedDestination}`, 'info');
      } else {
        setLoginError(res.message || 'Could not send login OTP.');
      }
    } catch (err: any) {
      setLoginError(err.message || 'Error requesting login OTP.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoSignIn = async () => {
    setIsSubmitting(true);
    try {
      await demoLogin();
      showToast('Signed in with Demo Explorer Account.', 'success');
      navigate('/');
    } catch (err: any) {
      showToast(err.message || 'Failed to start demo session.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // =========================================================================
  // HANDLERS: CREATE ACCOUNT
  // =========================================================================
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    if (!regName.trim()) {
      setRegError('Please enter your full name.');
      return;
    }

    const emailValue = regContactType === 'phone' ? '' : regEmail.trim();
    const phoneValue =
      regContactType === 'email' ? '' : `${regCountryCode}${regPhone.replace(/\D/g, '')}`;

    if (!emailValue && !phoneValue) {
      setRegError('Please enter a valid email address or phone number.');
      return;
    }

    if (passwordStrength.score < 2) {
      setRegError('Your password does not meet the security requirements.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setRegError('Passwords do not match.');
      return;
    }

    if (!agreeTerms) {
      setRegError('Please accept the Terms and Privacy Policy.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await register({
        name: regName.trim(),
        email: emailValue || undefined,
        phoneNumber: phoneValue || undefined,
        password: regPassword,
      });

      if (res.success) {
        setOtpUserId(res.data.userId);
        setOtpMaskedDestination(res.data.maskedDestination);
        setOtpPurpose('REGISTRATION');
        setDevOtpCode(res.data.otpResult?.devOtp || null);
        setOtpDigits(['', '', '', '', '', '']);
        setResendCooldown(30);
        setOtpExpirySeconds(300);
        setOtpError(null);
        setOtpModalOpen(true);
        showToast(`Verification code sent to ${res.data.maskedDestination}`, 'info');
      } else {
        setRegError(res.message || 'Registration failed.');
      }
    } catch (err: any) {
      setRegError(err.message || 'Registration failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // =========================================================================
  // HANDLERS: OTP VERIFICATION
  // =========================================================================
  const handleOtpDigitChange = (index: number, value: string) => {
    const cleanVal = value.replace(/\D/g, '');
    if (!cleanVal && value !== '') return;

    const newDigits = [...otpDigits];
    newDigits[index] = cleanVal.slice(-1);
    setOtpDigits(newDigits);

    // Auto move focus to next box
    if (cleanVal && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length > 0) {
      const newDigits = [...otpDigits];
      for (let i = 0; i < 6; i++) {
        newDigits[i] = pasted[i] || '';
      }
      setOtpDigits(newDigits);
      const nextFocus = Math.min(pasted.length, 5);
      otpInputsRef.current[nextFocus]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const fullCode = otpDigits.join('').trim();
    if (fullCode.length !== 6) {
      setOtpError('Please enter all 6 digits of the verification code.');
      return;
    }

    setOtpError(null);
    setIsSubmitting(true);

    try {
      if (otpPurpose === 'REGISTRATION') {
        const res = await verifyRegistrationOtp(otpUserId, fullCode);
        if (res.success) {
          setOtpModalOpen(false);
          showToast('Account verified! Welcome to WayGo.', 'success');
          navigate('/');
        } else {
          setOtpError(res.message || 'The OTP is incorrect.');
        }
      } else if (otpPurpose === 'LOGIN') {
        const res = await verifyLoginOtp(otpUserId, fullCode);
        if (res.success) {
          setOtpModalOpen(false);
          showToast('Signed in successfully!', 'success');
          navigate('/');
        } else {
          setOtpError(res.message || 'The OTP is incorrect.');
        }
      } else if (otpPurpose === 'PASSWORD_RESET') {
        // Handled in forgot password modal
      }
    } catch (err: any) {
      setOtpError(err.message || 'Verification failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setIsSubmitting(true);
    setOtpError(null);

    try {
      const res = await resendOtp(otpUserId, otpPurpose);
      if (res.success) {
        setResendCooldown(30);
        setOtpExpirySeconds(300);
        setDevOtpCode(res.data?.devOtp || null);
        showToast('A new OTP has been dispatched.', 'success');
      } else {
        setOtpError(res.message || 'Failed to resend OTP.');
      }
    } catch (err: any) {
      setOtpError(err.message || 'Failed to resend OTP.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // =========================================================================
  // HANDLERS: FORGOT PASSWORD
  // =========================================================================
  const handleForgotRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotIdentifier.trim()) {
      setForgotError('Please enter your registered email or phone number.');
      return;
    }
    setForgotError(null);
    setIsSubmitting(true);

    try {
      const res = await requestResetOtp(forgotIdentifier.trim());
      if (res.success && res.userId) {
        setForgotUserId(res.userId);
        setDevOtpCode(res.otpResult?.devOtp || null);
        setOtpDigits(['', '', '', '', '', '']);
        setForgotStep('OTP');
        showToast('Password reset code dispatched.', 'info');
      } else {
        showToast(res.message || 'If an account exists, a reset code was sent.', 'info');
        setForgotStep('OTP');
      }
    } catch (err: any) {
      setForgotError(err.message || 'Failed to process password reset.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotVerifyOtp = async () => {
    const fullCode = otpDigits.join('').trim();
    if (fullCode.length !== 6) {
      setForgotError('Please enter the complete 6-digit OTP.');
      return;
    }
    setForgotError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/auth/verify-reset-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: forgotUserId, code: fullCode }),
      });
      const data = await res.json();
      if (data.success) {
        setForgotStep('NEW_PASSWORD');
      } else {
        setForgotError(data.message || 'Invalid or expired OTP.');
      }
    } catch (err: any) {
      setForgotError(err.message || 'Failed to verify OTP.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotNewPassword) {
      setForgotError('Please enter a new password.');
      return;
    }
    if (forgotNewPassword !== forgotConfirmPassword) {
      setForgotError('Passwords do not match.');
      return;
    }

    setForgotError(null);
    setIsSubmitting(true);

    try {
      const fullCode = otpDigits.join('').trim();
      const res = await resetPassword({
        userId: forgotUserId,
        code: fullCode,
        newPassword: forgotNewPassword,
      });

      if (res.success) {
        setForgotModalOpen(false);
        showToast('Password changed successfully. You can now sign in.', 'success');
        setActiveTab('signin');
        setLoginPassword('');
      } else {
        setForgotError(res.message || 'Password reset failed.');
      }
    } catch (err: any) {
      setForgotError(err.message || 'Failed to reset password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 relative isolate overflow-hidden bg-[#030712]">
      {/* Cinematic Chennai image with animated 3D depth */}
      <div className="waygo-login-cinematic-bg" aria-hidden="true">
        {/* Blurred depth layer */}
        <div
          className="waygo-login-bg-blur"
          style={{
            backgroundImage: `url(${loginChennaiBg})`,
          }}
        />

        {/* Main Chennai skyline layer */}
        <div
          className="waygo-login-bg-image"
          style={{
            backgroundImage: `url(${loginChennaiBg})`,
          }}
        />

        {/* Animated lighting and readability layers */}
        <div className="waygo-login-bg-light-sweep" />
        <div className="waygo-login-bg-vignette" />
      </div>

      {/* Moving routes, station lights and particles */}
      <TransitBackground variant="login" />

      {/* Center Branding Header */}
      <div className="relative z-10 text-center mb-6 max-w-lg mx-auto">
        <img
          src={waygoLogo}
          alt="WayGo logo"
          className="w-20 h-20 object-contain mx-auto mb-3 drop-shadow-[0_0_20px_rgba(59,130,246,0.45)] animate-float"
        />
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          WayGo
        </h1>
        <p className="text-sm sm:text-base font-medium text-blue-200/90 mt-1">
          Compare routes. Save time. Travel smart.
        </p>

        {/* Mini Transit Mode Badges */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 mt-3">
          <span className="flex items-center gap-1 text-[11px] font-medium bg-blue-500/20 text-blue-300 border border-blue-400/30 px-2.5 py-1 rounded-full backdrop-blur-sm">
            <Bus className="w-3.5 h-3.5 text-blue-400" /> Bus
          </span>
          <span className="flex items-center gap-1 text-[11px] font-medium bg-purple-500/20 text-purple-300 border border-purple-400/30 px-2.5 py-1 rounded-full backdrop-blur-sm">
            <Train className="w-3.5 h-3.5 text-purple-400" /> Train
          </span>
          <span className="flex items-center gap-1 text-[11px] font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2.5 py-1 rounded-full backdrop-blur-sm">
            <Zap className="w-3.5 h-3.5 text-emerald-400" /> Metro
          </span>
          <span className="flex items-center gap-1 text-[11px] font-medium bg-amber-500/20 text-amber-300 border border-amber-400/30 px-2.5 py-1 rounded-full backdrop-blur-sm">
            <Car className="w-3.5 h-3.5 text-amber-400" /> Auto
          </span>
        </div>
      </div>

      {/* Main Glass Card */}
      <div className="relative z-10 w-full max-w-md bg-navy-800/90 dark:bg-navy-900/95 backdrop-blur-xl rounded-3xl border border-navy-700/80 shadow-2xl overflow-hidden">
        {/* Accessible Navigation Tabs */}
        <div className="flex border-b border-navy-700 bg-navy-900/50 p-1.5" role="tablist">
          <button
            role="tab"
            aria-selected={activeTab === 'signin'}
            onClick={() => {
              setActiveTab('signin');
              setLoginError(null);
              setRegError(null);
            }}
            className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all duration-200 ${
              activeTab === 'signin'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-navy-800'
            }`}
          >
            Sign In
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'register'}
            onClick={() => {
              setActiveTab('register');
              setLoginError(null);
              setRegError(null);
            }}
            className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all duration-200 ${
              activeTab === 'register'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-navy-800'
            }`}
          >
            Create Account
          </button>
        </div>

        <div className="p-6 sm:p-7">
          {/* ========================================================= */}
          {/* TAB 1: SIGN IN FORM */}
          {/* ========================================================= */}
          {activeTab === 'signin' && (
            <form onSubmit={handlePasswordSignIn} className="space-y-4">
              {/* Lockout Warning Banner */}
              {lockoutState.isLocked && (
                <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs space-y-2">
                  <div className="flex items-center gap-2 font-bold text-amber-400">
                    <Clock className="w-4 h-4 shrink-0" />
                    <span>Password Login Temporarily Locked</span>
                  </div>
                  <p>
                    Locked for 5 failed attempts. Time remaining:{' '}
                    <strong>
                      {Math.floor(lockoutState.remainingSeconds / 60)}m{' '}
                      {lockoutState.remainingSeconds % 60}s
                    </strong>
                  </p>
                  <button
                    type="button"
                    onClick={() => handleStartOtpLogin()}
                    className="w-full mt-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-navy-900 font-bold transition flex items-center justify-center gap-1.5"
                  >
                    <KeyRound className="w-4 h-4" />
                    <span>Login Using OTP (Bypass Lockout)</span>
                  </button>
                </div>
              )}

              {/* General Login Error Message */}
              {loginError && !wrongPasswordContext.show && (
                <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{loginError}</span>
                </div>
              )}

              {/* Wrong Password Contextual Recovery Banner */}
              {wrongPasswordContext.show && (
                <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-xs space-y-3">
                  <div className="flex items-center gap-2 text-rose-400 font-bold">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>Wrong password. Please try again.</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    Would you like to receive a one-time password on your registered contact destination (
                    <strong className="text-blue-300">{wrongPasswordContext.maskedDestination}</strong>
                    )?
                  </p>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setWrongPasswordContext({ show: false })}
                      className="py-2 px-3 rounded-xl bg-navy-700 hover:bg-navy-600 text-slate-200 font-semibold text-center transition"
                    >
                      Try Password Again
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStartOtpLogin()}
                      className="py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-center transition shadow-sm"
                    >
                      Login with OTP
                    </button>
                  </div>
                </div>
              )}

              {/* Identifier Input (Email or Phone) */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Email address or phone number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="e.g. user@example.com or 9876543210"
                    className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-navy-900/80 border border-navy-700 text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotIdentifier(loginIdentifier);
                      setForgotStep('IDENTIFIER');
                      setForgotError(null);
                      setForgotModalOpen(true);
                    }}
                    className="text-xs text-blue-400 hover:text-blue-300 font-medium transition"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter your account password"
                    className="w-full pl-10 pr-10 py-3 rounded-xl bg-navy-900/80 border border-navy-700 text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 transition"
                    aria-label="Toggle password visibility"
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-navy-700 bg-navy-900 text-blue-600 focus:ring-blue-500 focus:ring-offset-navy-800"
                  />
                  <span>Remember Me</span>
                </label>
              </div>

              {/* Primary Sign In Button */}
              <button
                type="submit"
                disabled={isSubmitting || lockoutState.isLocked}
                className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition-all transform active:scale-[0.99] flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span>Signing In...</span>
                ) : (
                  <>
                    <span>Sign In to WayGo</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Divider */}
              <div className="relative my-4 flex items-center justify-center">
                <div className="border-t border-navy-700 w-full" />
                <span className="bg-navy-800 px-3 text-[11px] uppercase font-bold text-slate-500 tracking-wider">
                  Or continue with
                </span>
                <div className="border-t border-navy-700 w-full" />
              </div>

              {/* OTP Login and Explore Demo Actions */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleStartOtpLogin()}
                  disabled={isSubmitting}
                  className="py-2.5 px-3 rounded-xl bg-navy-700/80 hover:bg-navy-700 border border-navy-600 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                >
                  <KeyRound className="w-3.5 h-3.5 text-blue-400" />
                  <span>Login with OTP</span>
                </button>

                <button
                  type="button"
                  onClick={handleDemoSignIn}
                  disabled={isSubmitting}
                  className="py-2.5 px-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5 transition"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Explore Demo</span>
                </button>
              </div>

              {/* Switch to Create Account */}
              <div className="text-center pt-2">
                <p className="text-xs text-slate-400">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setActiveTab('register')}
                    className="text-blue-400 hover:text-blue-300 font-bold transition underline underline-offset-2"
                  >
                    Create Account
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* ========================================================= */}
          {/* TAB 2: CREATE ACCOUNT FORM */}
          {/* ========================================================= */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              {/* Registration Error Message */}
              {regError && (
                <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{regError}</span>
                </div>
              )}

              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-navy-900/80 border border-navy-700 text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>
              </div>

              {/* Registration Method Toggle */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Register Using
                </label>
                <div className="grid grid-cols-3 gap-1 bg-navy-900/60 p-1 rounded-xl border border-navy-700 text-xs">
                  <button
                    type="button"
                    onClick={() => setRegContactType('email')}
                    className={`py-1.5 rounded-lg font-semibold transition ${
                      regContactType === 'email' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Email
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegContactType('phone')}
                    className={`py-1.5 rounded-lg font-semibold transition ${
                      regContactType === 'phone' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Phone
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegContactType('both')}
                    className={`py-1.5 rounded-lg font-semibold transition ${
                      regContactType === 'both' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Both
                  </button>
                </div>
              </div>

              {/* Email Address */}
              {(regContactType === 'email' || regContactType === 'both') && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      required={regContactType === 'email'}
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-navy-900/80 border border-navy-700 text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    />
                  </div>
                </div>
              )}

              {/* Mobile Phone Number with Country Code */}
              {(regContactType === 'phone' || regContactType === 'both') && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Mobile Phone Number
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={regCountryCode}
                      onChange={(e) => setRegCountryCode(e.target.value)}
                      className="w-24 px-2 py-2.5 rounded-xl bg-navy-900/80 border border-navy-700 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="+91">🇮🇳 +91</option>
                      <option value="+1">🇺🇸 +1</option>
                      <option value="+44">🇬🇧 +44</option>
                      <option value="+971">🇦🇪 +971</option>
                      <option value="+65">🇸🇬 +65</option>
                    </select>
                    <div className="relative flex-1">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Phone className="w-4 h-4" />
                      </div>
                      <input
                        type="tel"
                        required={regContactType === 'phone'}
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="98765 43210"
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-navy-900/80 border border-navy-700 text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Password Input */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Min 8 chars with uppercase, number & symbol"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-navy-900/80 border border-navy-700 text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 transition"
                  >
                    {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {regPassword && (
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Strength:</span>
                      <span className={`font-bold ${passwordStrength.score === 3 ? 'text-emerald-400' : passwordStrength.score === 2 ? 'text-amber-400' : 'text-rose-400'}`}>
                        {passwordStrength.label}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-navy-900 rounded-full overflow-hidden">
                      <div className={`h-full ${passwordStrength.color} ${passwordStrength.width} transition-all duration-300`} />
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password Input */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showRegConfirmPassword ? 'text' : 'password'}
                    required
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="Re-enter your password"
                    className={`w-full pl-10 pr-10 py-2.5 rounded-xl bg-navy-900/80 border text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                      regConfirmPassword && regConfirmPassword !== regPassword
                        ? 'border-rose-500'
                        : 'border-navy-700'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 transition"
                  >
                    {showRegConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Terms and Privacy Policy Checkbox */}
              <div className="flex items-start gap-2 pt-1">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-navy-700 bg-navy-900 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="terms" className="text-xs text-slate-300 leading-snug cursor-pointer select-none">
                  I agree to the <span className="text-blue-400">Terms of Service</span> and <span className="text-blue-400">Privacy Policy</span>.
                </label>
              </div>

              {/* Create Account Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition flex items-center justify-center gap-2"
              >
                {isSubmitting ? <span>Creating Account...</span> : <span>Create Account</span>}
              </button>

              {/* Return to Sign In Link */}
              <div className="text-center pt-2">
                <p className="text-xs text-slate-400">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setActiveTab('signin')}
                    className="text-blue-400 hover:text-blue-300 font-bold transition underline underline-offset-2"
                  >
                    Return to Sign In
                  </button>
                </p>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* OTP VERIFICATION MODAL */}
      {/* ========================================================================= */}
      {otpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-navy-900 border border-navy-700 rounded-3xl p-6 sm:p-7 shadow-2xl text-slate-100 space-y-5">
            <div className="text-center space-y-1.5">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30 mb-1">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Verify your identity</h3>
              <p className="text-xs text-slate-400">
                Enter the 6-digit code sent to{' '}
                <strong className="text-blue-300 font-semibold">{otpMaskedDestination}</strong>
              </p>
            </div>

            {/* Development Mode OTP Helper Card */}
            {devOtpCode && (
              <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-center space-y-1">
                <span className="text-[11px] font-bold uppercase text-emerald-400 tracking-wider flex items-center justify-center gap-1">
                  <Info className="w-3.5 h-3.5" /> Development Mode OTP
                </span>
                <p className="text-xl font-mono font-extrabold text-emerald-300 tracking-widest">
                  {devOtpCode}
                </p>
                <p className="text-[10px] text-slate-400">For rapid local demonstration & testing</p>
              </div>
            )}

            {/* OTP Error */}
            {otpError && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{otpError}</span>
              </div>
            )}

            {/* 6 Individual Digit Inputs */}
            <div className="flex items-center justify-center gap-2 sm:gap-3 py-2">
              {otpDigits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => (otpInputsRef.current[idx] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                  onPaste={handleOtpPaste}
                  className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-bold rounded-xl bg-navy-800 border-2 border-navy-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-white focus:outline-none transition"
                />
              ))}
            </div>

            {/* Expiry and Resend Controls */}
            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>
                  Expires in {Math.floor(otpExpirySeconds / 60)}:
                  {(otpExpirySeconds % 60).toString().padStart(2, '0')}
                </span>
              </span>

              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resendCooldown > 0 || isSubmitting}
                className="text-blue-400 hover:text-blue-300 disabled:text-slate-500 font-semibold transition"
              >
                {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend Code'}
              </button>
            </div>

            {/* Verify Button */}
            <button
              type="button"
              onClick={handleVerifyOtp}
              disabled={isSubmitting || otpDigits.join('').length !== 6}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-sm shadow-md shadow-blue-600/30 transition"
            >
              {isSubmitting ? 'Verifying Code...' : 'Verify OTP & Continue'}
            </button>

            {/* Return to Sign In */}
            <button
              type="button"
              onClick={() => setOtpModalOpen(false)}
              className="w-full py-2 text-xs text-slate-400 hover:text-slate-200 transition text-center"
            >
              Cancel & Return to Sign In
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FORGOT PASSWORD MODAL */}
      {/* ========================================================================= */}
      {forgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-navy-900 border border-navy-700 rounded-3xl p-6 sm:p-7 shadow-2xl text-slate-100 space-y-4">
            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-white">Reset Your Password</h3>
              <p className="text-xs text-slate-400">
                {forgotStep === 'IDENTIFIER' && 'Enter your registered email or phone to receive a reset code'}
                {forgotStep === 'OTP' && 'Enter the verification code sent to your contact'}
                {forgotStep === 'NEW_PASSWORD' && 'Choose a new secure password for your account'}
              </p>
            </div>

            {forgotError && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{forgotError}</span>
              </div>
            )}

            {/* Step 1: Identifier */}
            {forgotStep === 'IDENTIFIER' && (
              <form onSubmit={handleForgotRequestOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">
                    Email address or phone number
                  </label>
                  <input
                    type="text"
                    required
                    value={forgotIdentifier}
                    onChange={(e) => setForgotIdentifier(e.target.value)}
                    placeholder="e.g. user@example.com or +919876543210"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-navy-800 border border-navy-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow transition"
                >
                  {isSubmitting ? 'Sending Code...' : 'Send Reset Code'}
                </button>
              </form>
            )}

            {/* Step 2: Enter OTP */}
            {forgotStep === 'OTP' && (
              <div className="space-y-4">
                {devOtpCode && (
                  <div className="p-2 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-center">
                    <span className="text-[10px] text-emerald-400 font-bold">Dev Reset OTP: </span>
                    <strong className="text-emerald-300 font-mono">{devOtpCode}</strong>
                  </div>
                )}
                <div className="flex items-center justify-center gap-2">
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => (otpInputsRef.current[idx] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      className="w-10 h-12 text-center text-lg font-bold rounded-xl bg-navy-800 border border-navy-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={handleForgotVerifyOtp}
                  disabled={isSubmitting || otpDigits.join('').length !== 6}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow transition"
                >
                  Verify Code
                </button>
              </div>
            )}

            {/* Step 3: New Password */}
            {forgotStep === 'NEW_PASSWORD' && (
              <form onSubmit={handleForgotResetPassword} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showForgotNewPassword ? 'text' : 'password'}
                      required
                      value={forgotNewPassword}
                      onChange={(e) => setForgotNewPassword(e.target.value)}
                      placeholder="Min 8 chars, uppercase, number & symbol"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-navy-800 border border-navy-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowForgotNewPassword(!showForgotNewPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400"
                    >
                      {showForgotNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={forgotConfirmPassword}
                    onChange={(e) => setForgotConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-navy-800 border border-navy-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow transition"
                >
                  Save New Password & Sign In
                </button>
              </form>
            )}

            <button
              type="button"
              onClick={() => setForgotModalOpen(false)}
              className="w-full py-1.5 text-xs text-slate-400 hover:text-slate-200 transition text-center"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
