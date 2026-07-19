import React, { useState, useEffect, useRef } from 'react';
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
import ExitIntentSurvey from './components/ExitIntentSurvey';

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
  const pendingLaunchOnAuthRef = useRef<boolean>(false);

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
            
            if (pendingLaunchOnAuthRef.current) {
              setWorkspace(null);
              setInitialSurvey(null);
              pendingLaunchOnAuthRef.current = false;
              setCurrentView('dashboard');
              triggerToast('🚀 Welcome! Let\'s begin your 5-step launch process.', 'success');
            } else {
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
            }
          } else {
            const partialUser: User = {
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              name: firebaseUser.displayName || 'Valued Partner',
              workspaceId: '',
              isEmailVerified: true, // Always verify for frictionless demo
              plan: 'Free',
              billingPeriod: 'monthly',
              subscriptionActive: false,
              trialEndsAt: new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString()
            };
            setUser(partialUser);
            setWorkspace(null);
            setInitialSurvey(null);
            pendingLaunchOnAuthRef.current = false;
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
  const [exitSurveyViewCount, setExitSurveyViewCount] = useState<number>(0);
  const [triggerReason, setTriggerReason] = useState<string>('Standard Exit Intent');
  const [lastActiveTime, setLastActiveTime] = useState<number>(Date.now());

  // Listen for user actions to detect when they are "doing something"
  useEffect(() => {
    const updateActivity = () => {
      setLastActiveTime(Date.now());
    };
    document.addEventListener('click', updateActivity);
    document.addEventListener('keydown', updateActivity);
    document.addEventListener('submit', updateActivity);
    return () => {
      document.removeEventListener('click', updateActivity);
      document.removeEventListener('keydown', updateActivity);
      document.removeEventListener('submit', updateActivity);
    };
  }, []);

  // Load exit survey view count on startup & reset if months later
  useEffect(() => {
    const stored = localStorage.getItem('cl_exit_survey_views');
    const lastClosed = localStorage.getItem('cl_exit_survey_last_closed');

    if (lastClosed) {
      const timeSinceClosed = Date.now() - parseInt(lastClosed, 10);
      const resetThreshold = 30 * 24 * 60 * 60 * 1000; // 30 days (months later)
      if (timeSinceClosed > resetThreshold) {
        // Reset view limit and closed state since it is months later
        localStorage.removeItem('cl_exit_survey_views');
        localStorage.removeItem('cl_exit_survey_last_closed');
        setExitSurveyViewCount(0);
        return;
      }
    }

    if (stored) {
      setExitSurveyViewCount(parseInt(stored, 10));
    }
  }, []);

  const triggerSurveyWithReason = (reason: string, isManualSimulation = false) => {
    const isNew = !user;
    let currentViews = 0;
    
    // Check persisted 8-hour cooldown (if they closed it, don't show for 8 hours)
    if (!isManualSimulation) {
      const lastClosed = localStorage.getItem('cl_exit_survey_last_closed');
      if (lastClosed) {
        const timeSinceClosed = Date.now() - parseInt(lastClosed, 10);
        const cooldownMs = 8 * 60 * 60 * 1000; // 8 hours cooldown
        if (timeSinceClosed < cooldownMs) {
          console.log(`Exit intent survey within 8-hour cooldown. Skipped.`);
          return;
        }
      }
    }

    if (isNew) {
      const stored = localStorage.getItem('cl_exit_survey_views');
      currentViews = stored ? parseInt(stored, 10) : 0;
      
      // Strict 2-times limit for new guest user
      if (currentViews >= 2 && !isManualSimulation) {
        console.log('Standard exit intent popup skipped - reached 2-time view limit for new guest user.');
        return;
      }

      // Only increment if we are actually opening the survey
      if (!showExitSurvey) {
        const nextViews = currentViews + 1;
        localStorage.setItem('cl_exit_survey_views', String(nextViews));
        setExitSurveyViewCount(nextViews);
      }
    }

    setTriggerReason(reason);
    setShowExitSurvey(true);
    setExitSurveyTriggered(true);
  };

  // Listen for Exit Intent (mouse leaving top of viewport)
  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      if (currentView !== 'landing') return;
      if (exitSurveyTriggered || showExitSurvey) return;

      // DO NOT trigger if user is actively viewing details, checking out or doing actions
      if ((window as any).cl_is_user_actively_engaged) {
        console.log('User is actively buying, viewing details or doing something. Skipping exit intent.');
        return;
      }

      // DO NOT trigger if user is actively focusing an input field (typing or selecting)
      const isInputFocused = document.activeElement && (
        document.activeElement.tagName === 'INPUT' || 
        document.activeElement.tagName === 'TEXTAREA' || 
        document.activeElement.tagName === 'SELECT'
      );
      if (isInputFocused) {
        console.log('User is actively focusing an input. Skipping exit intent.');
        return;
      }

      // DO NOT trigger if they clicked or typed very recently (within last 20 seconds)
      const timeSinceLastInteraction = Date.now() - lastActiveTime;
      if (timeSinceLastInteraction < 20000) {
        console.log('User is actively doing something on the page. Skipping exit intent.');
        return;
      }

      if (e.clientY < 15) {
        const isNew = !user;
        const stored = localStorage.getItem('cl_exit_survey_views');
        const views = stored ? parseInt(stored, 10) : 0;

        if (isNew && views >= 2) {
          console.log('New user exit-intent limit reached. Skipped.');
          return;
        }

        const reason = (isNew && views > 0) ? 'Returning Visitor Hesitation' : 'Standard Exit Intent';
        triggerSurveyWithReason(reason);
      }
    };
    document.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [exitSurveyTriggered, showExitSurvey, user, currentView, lastActiveTime]);

  // AI-Triggered Behavioral Engine: Scrolling confusion pattern detection
  useEffect(() => {
    if (currentView !== 'landing' || showExitSurvey) return;
    let scrollCount = 0;
    let lastScrollY = window.scrollY;
    let lastDir = '';
    
    const handleScroll = () => {
      if ((window as any).cl_is_user_actively_engaged) return;
      const currentScrollY = window.scrollY;
      const dir = currentScrollY > lastScrollY ? 'down' : 'up';
      if (dir !== lastDir) {
        scrollCount++;
        lastDir = dir;
        if (scrollCount >= 6) { // 3 rapid scroll direction changes
          const isInputFocused = document.activeElement && (
            document.activeElement.tagName === 'INPUT' || 
            document.activeElement.tagName === 'TEXTAREA'
          );
          const timeSinceLastInteraction = Date.now() - lastActiveTime;
          if (!isInputFocused && timeSinceLastInteraction > 20000 && !(window as any).cl_is_user_actively_engaged) {
            triggerSurveyWithReason('Scrolled Confused Pattern');
          }
          scrollCount = 0;
        }
      }
      lastScrollY = currentScrollY;
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentView, showExitSurvey, lastActiveTime]);

  // AI-Triggered Behavioral Engine: Hesitation trigger on page
  useEffect(() => {
    if (currentView !== 'landing' || showExitSurvey) return;
    const timer = setTimeout(() => {
      if ((window as any).cl_is_user_actively_engaged) return;
      const isInputFocused = document.activeElement && (
        document.activeElement.tagName === 'INPUT' || 
        document.activeElement.tagName === 'TEXTAREA'
      );
      const timeSinceLastInteraction = Date.now() - lastActiveTime;
      if (!isInputFocused && timeSinceLastInteraction > 20000 && !(window as any).cl_is_user_actively_engaged) {
        triggerSurveyWithReason('Pricing Page Hesitation (45s)');
      }
    }, 45000); // 45 seconds stay
    return () => clearTimeout(timer);
  }, [currentView, showExitSurvey, lastActiveTime]);

  const handleCloseExitSurvey = () => {
    setShowExitSurvey(false);
    // Persist closed state and closed timestamp (no longer reset exitSurveyTriggered so it won't trigger again in the same page-load)
    localStorage.setItem('cl_exit_survey_last_closed', String(Date.now()));
  };

  const handleNewExitSurveySubmit = async (feedback: { reason: string; comment: string }) => {
    const feedbackId = `fb-${Date.now()}`;
    const feedbackData = {
      id: feedbackId,
      selectedReason: feedback.reason,
      otherReasonText: feedback.comment,
      timestamp: new Date().toISOString(),
      userId: user?.id || 'anonymous',
      triggerReason: triggerReason
    };

    try {
      await setDoc(doc(db, 'exitFeedbacks', feedbackId), feedbackData);
    } catch (err) {
      console.warn('Could not write exit feedback to Firestore:', err);
    }
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
        isEmailVerified: pendingLaunchOnAuthRef.current ? true : false,
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
      if (pendingLaunchOnAuthRef.current) {
        setWorkspace(null);
        setInitialSurvey(null);
        pendingLaunchOnAuthRef.current = false;
        setCurrentView('dashboard');
        triggerToast('🟢 Account registered successfully! Let\'s build your AI survey.', 'success');
      } else {
        setCurrentView('verify');
        triggerToast('Account created! Please verify your email.', 'success');
      }
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
    if (user) {
      setWorkspace(null);
      setInitialSurvey(null);
      setCurrentView('dashboard');
      triggerToast('🚀 Let\'s start your 5-step CustomerLens launch process!', 'success');
    } else {
      pendingLaunchOnAuthRef.current = true;
      setCurrentView('register');
      triggerToast('Please register or sign in to start your 5-step launch process!', 'success');
    }
  };

  const handleGetStartedFree = () => {
    if (user) {
      setWorkspace(null);
      setInitialSurvey(null);
      setCurrentView('dashboard');
      triggerToast('🚀 Let\'s start your 5-step Free Package setup!', 'success');
    } else {
      pendingLaunchOnAuthRef.current = true;
      setCurrentView('register');
      triggerToast('Please register or sign in to start your 5-step Free Package setup!', 'success');
    }
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
          onGetStartedFree={handleGetStartedFree}
          onTriggerAISurvey={(reason) => triggerSurveyWithReason(reason, true)}
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

            {pendingLaunchOnAuthRef.current && (
              <div className="bg-indigo-50 border border-indigo-100 text-indigo-800 rounded-2xl p-4 text-xs font-medium text-center space-y-1">
                <p className="font-extrabold text-indigo-900">✨ Secure Sandbox Authorization</p>
                <p className="text-indigo-600/90 leading-relaxed text-[11px]">Sign up below to instantly launch your personalized, 5-step CustomerLens exit-intent tracking demo!</p>
              </div>
            )}

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
          <ExitIntentSurvey 
            onClose={handleCloseExitSurvey}
            onSubmit={handleNewExitSurveySubmit}
            triggerReason={triggerReason}
            isNewUser={!user}
            viewCount={exitSurveyViewCount}
          />
        )}
      </AnimatePresence>

    </div>
  );
}
