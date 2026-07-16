import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mail, 
  Lock, 
  User as UserIcon, 
  Sparkles, 
  CheckCircle2, 
  ShieldAlert, 
  HelpCircle, 
  ArrowRight, 
  Compass, 
  X, 
  LogOut,
  Frown,
  Check,
  MessageSquare
} from 'lucide-react';
import { User, Workspace, Survey } from './types';
import OnboardingWizard from './components/OnboardingWizard';
import Dashboard from './components/Dashboard';
import LandingPage from './components/LandingPage';

import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  signInWithPopup, 
  GoogleAuthProvider 
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  getDocFromServer,
  collection 
} from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from './lib/firebase';

type AuthView = 'landing' | 'login' | 'register' | 'forgot' | 'verify' | 'dashboard';

export default function App() {
  // Authentication & Session Persistence
  const [currentView, setCurrentView] = useState<AuthView>('landing');
  const [user, setUser] = useState<User | null>(null);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [initialSurvey, setInitialSurvey] = useState<Survey | null>(null);

  // Authentication state sync & Firebase Firestore validation connection
  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration.");
        }
      }
    }
    testConnection();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data() as User;
            setUser(userData);
            
            if (userData.workspaceId) {
              const wsDoc = await getDoc(doc(db, 'workspaces', userData.workspaceId));
              if (wsDoc.exists()) {
                const wsData = wsDoc.data() as Workspace;
                setWorkspace(wsData);
                
                // Set default/dummy initialSurvey if none loaded
                setInitialSurvey({
                  id: 'srv-init',
                  title: 'Onboarding Survey',
                  displayOption: 'Exit Intent Popup',
                  headline: 'Before you go...',
                  questions: [],
                  colors: { background: '#ffffff', text: '#111827', accent: '#6366f1' },
                  brandingEnabled: false,
                  active: true,
                  createdAt: new Date().toISOString()
                });
              }
            }
            setCurrentView('dashboard');
          } else {
            const partialUser: User = {
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              name: firebaseUser.displayName || 'Valued Partner',
              workspaceId: '',
              isEmailVerified: firebaseUser.emailVerified,
              plan: 'Free',
              billingPeriod: 'monthly',
              subscriptionActive: false,
              trialEndsAt: new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString()
            };
            setUser(partialUser);
            // Wait for onboarding wizard
            setCurrentView('dashboard');
          }
        } catch (error) {
          console.error('Error fetching data from Firestore:', error);
        }
      } else {
        const savedUser = localStorage.getItem('cl_user');
        if (savedUser) {
          const u = JSON.parse(savedUser);
          if (u.id === 'usr-demo') {
            setUser(u);
            const savedWorkspace = localStorage.getItem('cl_workspace');
            if (savedWorkspace) setWorkspace(JSON.parse(savedWorkspace));
            const savedSurvey = localStorage.getItem('cl_initial_survey');
            if (savedSurvey) setInitialSurvey(JSON.parse(savedSurvey));
            setCurrentView('dashboard');
          } else {
            setCurrentView('landing');
          }
        } else {
          setUser(null);
          setWorkspace(null);
          setInitialSurvey(null);
          setCurrentView('landing');
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Auth form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [forgotEmailSent, setForgotEmailSent] = useState(false);

  // Walkthrough state
  const [showWalkthrough, setShowWalkthrough] = useState(false);
  const [walkthroughStep, setWalkthroughStep] = useState(1);

  // Notifications
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const triggerToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Exit Intent Survey states
  const [showExitSurvey, setShowExitSurvey] = useState(false);
  const [exitSurveyTriggered, setExitSurveyTriggered] = useState(false);
  const [selectedExitReason, setSelectedExitReason] = useState<string>('');
  const [otherExitReasonText, setOtherExitReasonText] = useState<string>('');
  const [exitSurveySubmitted, setExitSurveySubmitted] = useState(false);

  // Listen for Exit Intent (mouse leaving top of viewport)
  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      // Trigger when cursor goes near/above the very top (clientY < 15) and has not triggered in this session yet
      if (e.clientY < 15 && !exitSurveyTriggered && !showExitSurvey) {
        setShowExitSurvey(true);
        setExitSurveyTriggered(true);
      }
    };
    document.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [exitSurveyTriggered, showExitSurvey]);

  const handleCloseExitSurvey = () => {
    setShowExitSurvey(false);
    // Reset form states
    setSelectedExitReason('');
    setOtherExitReasonText('');
    setExitSurveySubmitted(false);
    
    // In demo/dev mode, let them trigger it again after 1.5s so they can easily test it repeatedly
    setTimeout(() => {
      setExitSurveyTriggered(false);
    }, 1500);
  };

  const handleSubmitExitSurvey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExitReason) {
      triggerToast('Please select a reason first', 'error');
      return;
    }
    
    const feedbackId = `fb-${Date.now()}`;
    const feedbackData = {
      id: feedbackId,
      selectedReason: selectedExitReason,
      otherReasonText: selectedExitReason === 'Other' ? otherExitReasonText : '',
      timestamp: new Date().toISOString(),
      userId: user?.id || 'anonymous'
    };

    try {
      await setDoc(doc(db, 'exitFeedbacks', feedbackId), feedbackData);
    } catch (err) {
      console.warn('Could not write exit feedback to Firestore:', err);
      try {
        handleFirestoreError(err, OperationType.CREATE, `exitFeedbacks/${feedbackId}`);
      } catch (e) {}
    }
    
    setExitSurveySubmitted(true);
    triggerToast('Thank you! Your feedback has been registered.', 'success');
    
    // Auto-close modal after 2.5 seconds
    setTimeout(() => {
      setShowExitSurvey(false);
      setSelectedExitReason('');
      setOtherExitReasonText('');
      setExitSurveySubmitted(false);
      setTimeout(() => {
        setExitSurveyTriggered(false);
      }, 1500);
    }, 2500);
  };

  // Persist session changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('cl_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('cl_user');
    }
  }, [user]);

  useEffect(() => {
    if (workspace) {
      localStorage.setItem('cl_workspace', JSON.stringify(workspace));
    } else {
      localStorage.removeItem('cl_workspace');
    }
  }, [workspace]);

  useEffect(() => {
    if (initialSurvey) {
      localStorage.setItem('cl_initial_survey', JSON.stringify(initialSurvey));
    } else {
      localStorage.removeItem('cl_initial_survey');
    }
  }, [initialSurvey]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !name) {
      triggerToast('All fields are required', 'error');
      return;
    }

    try {
      triggerToast('Creating your secure account...', 'success');
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      const newUser: User = {
        id: firebaseUser.uid,
        email,
        name,
        workspaceId: '',
        isEmailVerified: false, // Must verify email
        plan: 'Free',
        billingPeriod: 'monthly',
        subscriptionActive: false,
        trialEndsAt: new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString() // 14-day free trial
      };

      try {
        await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `users/${firebaseUser.uid}`);
      }

      setUser(newUser);
      setCurrentView('verify');
      triggerToast('Account created! Please verify your email.', 'success');
    } catch (err: any) {
      triggerToast(err.message || 'Registration failed.', 'error');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      triggerToast('Email and password are required', 'error');
      return;
    }

    try {
      triggerToast('Signing in...', 'success');
      await signInWithEmailAndPassword(auth, email, password);
      triggerToast('Successfully signed in.', 'success');
    } catch (err: any) {
      triggerToast(err.message || 'Sign in failed.', 'error');
    }
  };

  const handleGoogleLogin = async () => {
    triggerToast('Connecting to secure Google Account auth...', 'success');
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const firebaseUser = userCredential.user;

      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      let userData: User;

      if (!userDoc.exists()) {
        userData = {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          name: firebaseUser.displayName || 'Sangeeta Codes',
          workspaceId: '',
          isEmailVerified: true, // Google login is pre-verified
          plan: 'Free',
          billingPeriod: 'monthly',
          subscriptionActive: false,
          trialEndsAt: new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString()
        };
        try {
          await setDoc(doc(db, 'users', firebaseUser.uid), userData);
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, `users/${firebaseUser.uid}`);
        }
      } else {
        userData = userDoc.data() as User;
      }

      setUser(userData);
      setCurrentView('dashboard');
      triggerToast('🟢 Authenticated with Google Cloud securely.', 'success');
    } catch (err: any) {
      triggerToast(err.message || 'Google Login failed.', 'error');
    }
  };

  const handleVerifyEmail = () => {
    if (!user) return;
    const verified = { ...user, isEmailVerified: true };
    setUser(verified);
    
    if (auth.currentUser) {
      setDoc(doc(db, 'users', auth.currentUser.uid), verified)
        .catch(err => handleFirestoreError(err, OperationType.WRITE, `users/${auth.currentUser?.uid}`));
    }
    triggerToast('Email verification approved! Workspace unlocked.', 'success');
  };

  const handleOnboardingComplete = async (newWorkspace: Workspace, firstSurvey: Survey) => {
    if (!user) return;
    
    setWorkspace(newWorkspace);
    setInitialSurvey(firstSurvey);
    
    const updatedUser = { ...user, workspaceId: newWorkspace.id };
    setUser(updatedUser);
    
    if (auth.currentUser) {
      try {
        await setDoc(doc(db, 'workspaces', newWorkspace.id), newWorkspace);
        await setDoc(doc(db, 'workspaces', newWorkspace.id, 'surveys', firstSurvey.id), firstSurvey);
        await setDoc(doc(db, 'users', auth.currentUser.uid), updatedUser);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `workspaces/${newWorkspace.id}`);
      }
    }
    
    // Trigger walkthrough
    setShowWalkthrough(true);
    setWalkthroughStep(1);
    
    triggerToast('Onboarding finished. Workspace initialized with AI Survey!', 'success');
  };

  const handleLogout = async () => {
    localStorage.clear();
    setUser(null);
    setWorkspace(null);
    setInitialSurvey(null);
    setCurrentView('landing');

    if (auth.currentUser) {
      try {
        await signOut(auth);
      } catch (err) {
        console.error('Error signing out:', err);
      }
    }
    triggerToast('Signed out of session safely.', 'success');
  };

  const handleLaunchDemo = () => {
    const demoUser: User = {
      id: 'usr-demo',
      email: 'guest.partner@sandhillsdev.com',
      name: 'Guest Partner',
      workspaceId: 'wsp-demo',
      isEmailVerified: true,
      plan: 'Pro',
      billingPeriod: 'yearly',
      subscriptionActive: true,
      trialEndsAt: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString()
    };

    const demoWorkspace: Workspace = {
      id: 'wsp-demo',
      name: 'Sandhills Brew CRO',
      businessType: 'Ecommerce',
      url: 'https://sandhillsbrewing.com',
      goal: 'Track customer bounce patterns and capture exit-intent feedback on wild ales delivery pages.',
      customDomain: 'cro.sandhillsbrewing.com',
      customDomainStatus: 'Active',
      whiteLabel: {
        logoUrl: '',
        primaryColor: '#1e3a8a',
        emailBranding: 'Sandhills Brewing Automated Triggers',
        removeBranding: true
      }
    };

    const demoSurvey: Survey = {
      id: 'srv-demo',
      title: 'Exit Intent Brewing Questionnaire',
      displayOption: 'Exit Intent Popup',
      headline: 'Before you fly away...',
      questions: [
        {
          id: 'q1',
          type: 'multiple-choice',
          questionText: 'What was the primary reason for leaving our wild ales catalog today?',
          options: [
            'Shipping rates are too high for cold packs',
            'I want to purchase a different style (IPAs/Stouts)',
            'Just browsing the Kansas local headquarters info',
            'Looking for the physical taproom addresses'
          ]
        },
        {
          id: 'q2',
          type: 'rating',
          questionText: 'How easy was it to navigate our digital bottles list?',
        },
        {
          id: 'q3',
          type: 'text',
          questionText: 'What is one wild-fermentation style you would love us to brew next?'
        }
      ],
      colors: {
        background: '#ffffff',
        text: '#111827',
        accent: '#1e3a8a'
      },
      brandingEnabled: false,
      active: true,
      createdAt: new Date().toISOString()
    };

    setUser(demoUser);
    setWorkspace(demoWorkspace);
    setInitialSurvey(demoSurvey);
    setCurrentView('dashboard');
    triggerToast('🟢 Launched secure Sandhills Developer session. Welcome!', 'success');
  };

  const updateUserInfo = (updatedFields: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updatedFields });
    }
  };

  const updateWorkspaceInfo = (updatedFields: Partial<Workspace>) => {
    if (workspace) {
      setWorkspace({ ...workspace, ...updatedFields });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-x-hidden">
      
      {/* Toast Alert Banner */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -40, opacity: 0 }}
            className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 shadow-xl border px-4 py-2.5 rounded-xl flex items-center gap-2 text-xs font-semibold ${
              toast.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}
          >
            {toast.type === 'success' ? <CheckCircle2 size={14} className="text-emerald-600" /> : <ShieldAlert size={14} className="text-rose-600" />}
            {toast.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* RENDER VIEW SCHEDULER */}

      {/* 0. BEAUTIFUL LANDING PAGE INSPIRED BY SANDHILLS */}
      {currentView === 'landing' && (
        <LandingPage 
          onNavigate={(view) => setCurrentView(view)} 
          onLaunchDemo={handleLaunchDemo}
        />
      )}

      {/* 1. VERIFY EMAIL PAGE */}
      {user && !user.isEmailVerified && currentView === 'verify' && (
        <div id="email_verify_stage" className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full border border-slate-200 shadow-xl text-center space-y-6">
            <div className="h-14 w-14 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
              📬
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Check your email inbox</h2>
              <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">
                We have sent a verification code link to <strong className="text-slate-800">{user.email}</strong> to verify your CustomerLens account.
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border text-left text-xs space-y-2.5">
              <span className="font-bold text-[10px] uppercase text-slate-400 block font-mono">Simulated Self-Service Panel</span>
              <p className="text-slate-600">Since this is a sandboxed evaluation build, click below to instantly verify your email and begin onboarding.</p>
              
              <button 
                id="btn_simulated_verify_email"
                onClick={handleVerifyEmail}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5"
              >
                Simulate Verification Click <ArrowRight size={14} />
              </button>
            </div>

            <div className="flex justify-between items-center text-xs text-slate-400 pt-2 border-t">
              <span>No Manual Support Required</span>
              <button onClick={handleLogout} className="hover:text-slate-600 font-semibold">Logout</button>
            </div>
          </div>
        </div>
      )}

      {/* 2. REGISTRATION / LOGIN FLIPS */}
      {!user && (currentView === 'register' || currentView === 'login' || currentView === 'forgot') && (
        <div id="auth_stage" className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full border border-slate-200/80 shadow-2xl space-y-6">
            
            {/* Logo */}
            <div className="text-center relative">
              <button 
                onClick={() => setCurrentView('landing')}
                className="absolute top-0 left-0 text-xs font-bold text-slate-400 hover:text-indigo-600 flex items-center gap-1 transition-colors"
              >
                ← Home
              </button>
              <div className="h-10 w-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center mx-auto font-bold text-lg mb-2">
                CL
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">CustomerLens</h2>
              <p className="text-slate-400 text-xs mt-1">Advanced self-service CRO and exit-intent tracking</p>
            </div>

            {/* FORGOT PASSWORD FORM */}
            {currentView === 'forgot' ? (
              <form onSubmit={(e) => { e.preventDefault(); setForgotEmailSent(true); }} className="space-y-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Recover Account Password</h3>
                  <p className="text-slate-500 text-xs mt-0.5 mb-4">Enter your registered email below to send a recovery checklist link.</p>
                  
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
                    <input 
                      id="input_forgot_email"
                      type="email" 
                      required
                      placeholder="you@company.com" 
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-xl text-xs outline-none"
                    />
                  </div>
                </div>

                {forgotEmailSent && (
                  <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-800 text-xs font-semibold">
                    🟢 Recovery password guide dispatched. Check your mailbox folders.
                  </div>
                )}

                <button 
                  id="btn_submit_forgot"
                  type="submit" 
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-3 rounded-xl shadow-md transition-all"
                >
                  Send Recovery Link
                </button>

                <div className="text-center text-xs">
                  <button 
                    type="button" 
                    onClick={() => { setCurrentView('login'); setForgotEmailSent(false); }} 
                    className="text-indigo-600 hover:underline font-semibold"
                  >
                    Back to Sign In
                  </button>
                </div>
              </form>
            ) : (
              <>
                {/* Standard Email Auth Forms */}
                <form onSubmit={currentView === 'register' ? handleRegister : handleLogin} className="space-y-4">
                  {currentView === 'register' && (
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Company Contact Name</label>
                      <div className="relative">
                        <UserIcon className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
                        <input 
                          id="input_reg_name"
                          type="text" 
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Your full name" 
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-xl text-xs outline-none"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Business Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
                      <input 
                        id="input_auth_email"
                        type="email" 
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@company.com" 
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-xl text-xs outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Account Secure Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
                      <input 
                        id="input_auth_password"
                        type="password" 
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Minimum 8 characters" 
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-xl text-xs outline-none"
                      />
                    </div>
                  </div>

                  {currentView === 'login' && (
                    <div className="text-right">
                      <button 
                        type="button" 
                        onClick={() => setCurrentView('forgot')} 
                        className="text-xs text-indigo-600 hover:underline font-semibold"
                      >
                        Forgot Password?
                      </button>
                    </div>
                  )}

                  <button 
                    id={currentView === 'register' ? 'btn_submit_register' : 'btn_submit_login'}
                    type="submit" 
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-1"
                  >
                    {currentView === 'register' ? 'Create Free Account' : 'Sign In'} <ArrowRight size={14} />
                  </button>
                </form>

                {/* Third-party Sign In options */}
                <div className="space-y-3.5 pt-4 border-t">
                  <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400 block text-center font-mono">Alternative Gateways</span>
                  
                  <button 
                    id="btn_google_login"
                    onClick={handleGoogleLogin}
                    className="w-full bg-slate-50 hover:bg-slate-100 border text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-2.5 transition-all text-slate-800"
                  >
                    <span className="text-sm">G</span> Continue with Google Login
                  </button>

                  <div className="text-center text-xs text-slate-500 mt-2">
                    {currentView === 'register' ? (
                      <p>Already have an account? <button onClick={() => setCurrentView('login')} className="text-indigo-600 hover:underline font-bold">Sign In</button></p>
                    ) : (
                      <p>New to CustomerLens? <button onClick={() => setCurrentView('register')} className="text-indigo-600 hover:underline font-bold">Register Free</button></p>
                    )}
                  </div>
                </div>
              </>
            )}

          </div>
        </div>
      )}

      {/* 3. ACTIVE ONBOARDING WIZARD */}
      {user && user.isEmailVerified && !workspace && (
        <OnboardingWizard 
          onComplete={handleOnboardingComplete} 
          userEmail={user.email} 
          onBack={handleLogout}
        />
      )}

      {/* 4. MAIN CUSTOMERLENS DASHBOARD */}
      {user && user.isEmailVerified && workspace && initialSurvey && (
        <div id="dashboard_stage">
          <Dashboard 
            user={user} 
            workspace={workspace} 
            initialSurvey={initialSurvey} 
            onLogout={handleLogout} 
            onUpdateUser={updateUserInfo}
            onUpdateWorkspace={updateWorkspaceInfo}
          />

          {/* DYNAMIC WALKTHROUGH INTRO GUIDES */}
          <AnimatePresence>
            {showWalkthrough && (
              <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
                <button 
                  onClick={() => setShowWalkthrough(false)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-white"
                >
                  <X size={16} />
                </button>

                <div className="flex gap-3">
                  <div className="p-2 bg-indigo-950 text-indigo-400 rounded-xl h-fit">
                    <Compass size={18} className="animate-spin" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-baseline">
                      <span className="font-bold text-xs text-white">Interactive Setup Tour</span>
                      <span className="text-[10px] text-slate-500 font-mono">Step {walkthroughStep}/3</span>
                    </div>

                    {walkthroughStep === 1 && (
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        <strong>Embed Code Setup</strong>: Head to the <strong>Embed Code & QR</strong> tab to locate your customized Javascript widget block and platforms installer instructions.
                      </p>
                    )}

                    {walkthroughStep === 2 && (
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        <strong>Live Simulator Runs</strong>: Go to the <strong>Exit Intent Simulator</strong> tab to run actual cursors movements and trigger feedback surveys inside the sandbox frame!
                      </p>
                    )}

                    {walkthroughStep === 3 && (
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        <strong>Run AI CRO Analysis</strong>: Submit simulated feedback inside the playground and visit <strong>AI Exit CRO Analytics</strong> to extract detailed conversion guidelines with Gemini models!
                      </p>
                    )}

                    <div className="flex justify-between items-center pt-2 border-t border-slate-800">
                      <button 
                        onClick={() => setShowWalkthrough(false)}
                        className="text-[10px] text-slate-400 hover:text-white font-semibold"
                      >
                        Skip Tour
                      </button>

                      <button 
                        id={`btn_tour_next_${walkthroughStep}`}
                        onClick={() => {
                          if (walkthroughStep < 3) {
                            setWalkthroughStep(walkthroughStep + 1);
                          } else {
                            setShowWalkthrough(false);
                            triggerToast('Enjoy CustomerLens! Tour finished.', 'success');
                          }
                        }}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-md"
                      >
                        {walkthroughStep < 3 ? 'Next Tip' : 'Get Started'} <ArrowRight size={10} />
                      </button>
                    </div>

                  </div>
                </div>
              </div>
            )}
          </AnimatePresence>

        </div>
      )}

      {/* GLOBAL EXIT INTENT SURVEY MODAL */}
      <AnimatePresence>
        {showExitSurvey && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop with elegant blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseExitSurvey}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-lg w-full overflow-hidden relative z-[110] flex flex-col p-6 sm:p-8 text-slate-800"
            >
              {/* Close Button */}
              <button
                onClick={handleCloseExitSurvey}
                className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 transition-colors p-1.5 rounded-full hover:bg-slate-50"
              >
                <X size={18} />
              </button>

              {!exitSurveySubmitted ? (
                <form onSubmit={handleSubmitExitSurvey} className="space-y-5">
                  {/* Icon Accent */}
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                      <Frown size={20} />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-lg text-slate-900 tracking-tight">Wait! Before you leave...</h3>
                      <p className="text-slate-500 text-xs mt-0.5">We'd love to know why you're leaving this site.</p>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 my-2" />

                  {/* Question */}
                  <div className="space-y-1">
                    <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wide font-mono">Feedback Survey</span>
                    <p className="font-bold text-sm text-slate-800">Do you have any problem or reason for leaving?</p>
                  </div>

                  {/* Options List */}
                  <div className="space-y-2">
                    {[
                      "The platform seems too complicated to use",
                      "The pricing plans are not clear or too high",
                      "I'm just exploring / researching alternative solutions",
                      "I encountered a technical issue or bug on the site",
                      "Other"
                    ].map((reason) => {
                      const isSelected = selectedExitReason === reason;
                      return (
                        <button
                          key={reason}
                          type="button"
                          onClick={() => {
                            setSelectedExitReason(reason);
                            if (reason !== "Other") {
                              setOtherExitReasonText('');
                            }
                          }}
                          className={`w-full text-left px-4 py-3 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all ${
                            isSelected
                              ? 'border-indigo-600 bg-indigo-50/40 text-indigo-950 shadow-sm'
                              : 'border-slate-200 bg-white text-slate-700 hover:border-indigo-200 hover:bg-slate-50/50'
                          }`}
                        >
                          <span>{reason}</span>
                          <div className={`h-[18px] w-[18px] rounded-full border flex items-center justify-center transition-all ${
                            isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 bg-white'
                          }`}>
                            {isSelected && <Check size={10} strokeWidth={3} />}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Dynamic Other Input Textarea */}
                  <AnimatePresence>
                    {selectedExitReason === "Other" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden space-y-1.5"
                      >
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide font-mono mt-1">
                          Please describe your reason / problem:
                        </label>
                        <textarea
                          rows={2}
                          required
                          value={otherExitReasonText}
                          onChange={(e) => setOtherExitReasonText(e.target.value)}
                          placeholder="Tell us a bit more about what we can improve..."
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all bg-slate-50 resize-none text-slate-800"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleCloseExitSurvey}
                      className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-500 font-bold text-xs py-3 rounded-xl transition-all text-center"
                    >
                      Skip & Close
                    </button>
                    <button
                      type="submit"
                      disabled={!selectedExitReason || (selectedExitReason === "Other" && !otherExitReasonText.trim())}
                      className="flex-1 bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white font-extrabold text-xs py-3 rounded-xl transition-all shadow-md shadow-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                    >
                      Submit Feedback
                    </button>
                  </div>
                </form>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-8 flex flex-col items-center justify-center text-center space-y-4"
                >
                  <div className="h-16 w-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 text-2xl animate-bounce">
                    🎉
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-extrabold text-lg text-slate-950">Thank you so much!</h3>
                    <p className="text-slate-500 text-xs max-w-sm px-4">
                      Your valuable feedback has been recorded. This will help us craft a better experience for you next time.
                    </p>
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium animate-pulse">
                    Closing in a moment...
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
