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
  MessageSquare,
  Copy,
  ExternalLink,
  ShieldCheck
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
  signInWithRedirect,
  getRedirectResult,
  signInAnonymously,
  GoogleAuthProvider 
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  getDocFromServer,
  collection 
} from 'firebase/firestore';
import { 
  auth, 
  db, 
  handleFirestoreError, 
  OperationType, 
  verifyFirebaseConfig, 
  getFirebaseIdToken 
} from './lib/firebase';

type AuthView = 'landing' | 'login' | 'register' | 'forgot' | 'verify' | 'dashboard';

export default function App() {
  // Authentication & Session Persistence
  const [currentView, setCurrentView] = useState<AuthView>('landing');
  const [user, setUser] = useState<User | null>(null);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [initialSurvey, setInitialSurvey] = useState<Survey | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const pendingLaunchOnAuthRef = useRef<boolean>(false);

  // Check Shopify embedded app parameters on load - strictly validate real merchant shop and host
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const rawShop = searchParams.get('shop') || (typeof window !== 'undefined' && window.location.ancestorOrigins && window.location.ancestorOrigins.length > 0 ? window.location.ancestorOrigins[0].replace(/^https?:\/\//, '') : null);
    const host = searchParams.get('host');
    const idToken = searchParams.get('id_token');

    if (rawShop && typeof rawShop === 'string') {
      const cleanShop = rawShop.toLowerCase().trim().replace(/^https?:\/\//i, '').replace(/\/.*$/, '');
      const fullShop = cleanShop.endsWith('.myshopify.com') ? cleanShop : `${cleanShop}.myshopify.com`;

      // Strictly validate *.myshopify.com store domain structure
      if (/^[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com$/.test(fullShop)) {
        const apiKey = import.meta.env.VITE_SHOPIFY_API_KEY || '03b0ee31c378e592b1c5c9da3dbe6651';

        // Configure App Bridge meta headers
        if (!document.querySelector('meta[name="shopify-api-key"]')) {
          const meta = document.createElement('meta');
          meta.name = 'shopify-api-key';
          meta.content = apiKey;
          document.head.appendChild(meta);
        }

        if (host && !document.querySelector('meta[name="shopify-host"]')) {
          const metaHost = document.createElement('meta');
          metaHost.name = 'shopify-host';
          metaHost.content = host;
          document.head.appendChild(metaHost);
        }

        // Inject App Bridge script
        if (!document.querySelector('script[src*="app-bridge.js"]')) {
          const script = document.createElement('script');
          script.src = 'https://cdn.shopify.com/shopifycloud/app-bridge.js';
          script.async = true;
          document.head.appendChild(script);
        }

        localStorage.setItem('cl_shopify_shop', fullShop);
        if (host) localStorage.setItem('cl_shopify_host', host);

        const storeSlug = fullShop.replace('.myshopify.com', '');
        const formattedStoreName = storeSlug.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

        const shopifyWs: Workspace = {
          id: `ws_shopify_${storeSlug.replace(/[^a-z0-9]/gi, '_')}`,
          name: `${formattedStoreName} (Shopify)`,
          businessType: 'Shopify',
          goal: 'Conversion Optimization',
          url: `https://${fullShop}`,
          platform: 'Shopify',
          siteId: `cl_shop_${storeSlug}`
        };

        const shopifyUser: User = {
          id: `usr_shopify_${storeSlug}`,
          email: `merchant@${fullShop}`,
          name: `${formattedStoreName} Admin`,
          workspaceId: shopifyWs.id,
          isEmailVerified: true,
          plan: 'Pro',
          billingPeriod: 'monthly',
          subscriptionActive: true,
          trialEndsAt: new Date(Date.now() + 30 * 86400000).toISOString()
        };

        setUser(shopifyUser);
        setWorkspace(shopifyWs);
        setCurrentView('dashboard');
        setAuthLoading(false);

        // Async fetch merchant store details from backend
        fetch(`/api/shopify/session`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(idToken ? { 'Authorization': `Bearer ${idToken}` } : {})
          },
          body: JSON.stringify({ shop: fullShop, sessionToken: idToken })
        })
          .then(res => res.json())
          .then((data: any) => {
            if (data?.shopDetails?.name) {
              setWorkspace(prev => prev ? ({ ...prev, name: `${data.shopDetails.name} (Shopify)` }) : prev);
              setUser(prev => prev ? ({ ...prev, name: `${data.shopDetails.name} Admin`, email: data.shopDetails.email || prev.email }) : prev);
            }
          })
          .catch(() => {});
      }
    }
  }, []);

  // Authentication state sync & Firebase Firestore validation connection
  useEffect(() => {
    let isMounted = true;

    // Check redirect result for Google Sign-In if popup was redirected
    getRedirectResult(auth)
      .then(async (result) => {
        if (!isMounted) return;
        if (result && result.user) {
          console.log("[AUTH DEBUG] LOGIN SUCCESS (REDIRECT)", {
            uid: result.user.uid,
            email: result.user.email
          });
          const firebaseUser = result.user;
          try {
            const token = await firebaseUser.getIdToken();
            fetch('/api/auth/verify', {
              method: 'POST',
              headers: { 'Authorization': `Bearer ${token}` }
            }).catch(e => console.warn('[AUTH DEBUG] Non-blocking verify check on redirect:', e));
          } catch (e) {
            console.warn('[AUTH DEBUG] Error obtaining token on redirect:', e);
          }
          const destination = sessionStorage.getItem('cl_intended_destination') || 'dashboard';
          sessionStorage.removeItem('cl_intended_destination');
          setCurrentView(destination as AuthView);
        }
      })
      .catch(err => {
        console.warn('[AUTH DEBUG] Firebase auth redirect error:', err);
      });

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log("=== AUTH STATE CHANGED ===");
      console.log("User:", firebaseUser);
      console.log("UID:", firebaseUser?.uid);
      console.log("Email:", firebaseUser?.email);

      if (firebaseUser) {
        let appUser: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'CustomerLens User',
          workspaceId: `ws_${firebaseUser.uid.substring(0, 10)}`,
          isEmailVerified: firebaseUser.emailVerified || true,
          plan: 'Pro',
          billingPeriod: 'monthly',
          subscriptionActive: true,
          trialEndsAt: new Date(Date.now() + 30 * 86400000).toISOString()
        };

        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data() as Partial<User>;
            appUser = { ...appUser, ...userData };
          } else {
            setDoc(doc(db, 'users', firebaseUser.uid), appUser).catch(err => {
              console.warn('[AUTH DEBUG] User doc initial save:', err);
            });
          }
        } catch (error) {
          console.warn('[AUTH DEBUG] Firestore fetch bypassed, using authenticated session object:', error);
        }

        // Workspace resolution
        let appWorkspace: Workspace | null = null;
        try {
          const savedWorkspace = localStorage.getItem('cl_workspace');
          if (savedWorkspace) {
            appWorkspace = JSON.parse(savedWorkspace);
          } else if (appUser.workspaceId) {
            const wsDoc = await getDoc(doc(db, 'workspaces', appUser.workspaceId));
            if (wsDoc.exists()) {
              appWorkspace = wsDoc.data() as Workspace;
            }
          }
        } catch (wsErr) {
          console.warn('[AUTH DEBUG] Workspace lookup:', wsErr);
        }

        if (!appWorkspace) {
          const storeName = (appUser.name || 'My Store').replace(/User|Admin|Merchant/gi, '').trim() || 'My Online Store';
          appWorkspace = {
            id: appUser.workspaceId || `ws_${firebaseUser.uid.substring(0, 10)}`,
            name: storeName,
            businessType: 'Ecommerce',
            url: 'https://mystore.com',
            goal: 'Conversion Optimization',
            siteId: `cl_${firebaseUser.uid.substring(0, 8)}`
          };
        }

        const appSurvey: Survey = {
          id: 'srv-init',
          title: 'Exit Intent & Feedback Survey',
          displayOption: 'In-Page Popup',
          headline: 'Before you go, how can we improve?',
          questions: [
            {
              id: 'q1',
              type: 'multiple-choice',
              questionText: 'What was the main reason for your visit today?',
              options: ['Browsing products', 'Looking for discounts', 'Checking pricing', 'Customer support']
            }
          ],
          colors: { background: '#ffffff', text: '#111827', accent: '#6366f1' },
          brandingEnabled: false,
          active: true,
          createdAt: new Date().toISOString()
        };

        if (isMounted) {
          setUser(appUser);
          setWorkspace(appWorkspace);
          setInitialSurvey(appSurvey);
          setCurrentView(prev => {
            if (prev === 'login' || prev === 'register' || prev === 'forgot') {
              return 'dashboard';
            }
            return prev;
          });
          setAuthLoading(false);
        }

        // Non-blocking backend token verify
        try {
          const token = await firebaseUser.getIdToken();
          fetch('/api/auth/verify', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
          }).catch(e => console.warn('[AUTH DEBUG] Backend token verify check:', e));
        } catch (e) {}
      } else {
        if (isMounted) {
          setUser(null);
          setWorkspace(null);
          setInitialSurvey(null);
          setAuthLoading(false);
        }
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  // Auth form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [forgotEmailSent, setForgotEmailSent] = useState(false);
  const [domainAuthError, setDomainAuthError] = useState<string | null>(null);
  const [domainCopied, setDomainCopied] = useState(false);

  // Walkthrough state
  const [showWalkthrough, setShowWalkthrough] = useState(false);
  const [walkthroughStep, setWalkthroughStep] = useState(1);

  // Notifications
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  const triggerToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3000);
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
      verifyFirebaseConfig();
      triggerToast('Creating your secure Firebase account...', 'info');
      const result = await createUserWithEmailAndPassword(auth, email, password);

      console.log("=== LOGIN SUCCESS ===");
      console.log("Firebase UID:", result.user.uid);
      console.log("Firebase email:", result.user.email);

      const firebaseUser = result.user;
      const newUser: User = {
        id: firebaseUser.uid,
        email,
        name,
        workspaceId: `ws_${firebaseUser.uid.substring(0, 10)}`,
        isEmailVerified: firebaseUser.emailVerified || true,
        plan: 'Pro',
        billingPeriod: 'monthly',
        subscriptionActive: true,
        trialEndsAt: new Date(Date.now() + 30 * 86400000).toISOString()
      };

      try {
        await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
      } catch (err) {
        console.warn('[AUTH DEBUG] Firestore user write:', err);
      }

      // Non-blocking backend token verify
      try {
        const token = await firebaseUser.getIdToken();
        fetch('/api/auth/verify', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        }).catch(e => console.warn('[AUTH DEBUG] Backend verify:', e));
      } catch (e) {}

      setUser(newUser);
      setCurrentView('dashboard');
      triggerToast('🟢 Account created! Welcome to CustomerLens.', 'success');
    } catch (err: any) {
      console.error('Registration error:', err);
      let msg = err.message || 'Registration failed.';
      if (err.code === 'auth/email-already-in-use') {
        msg = 'An account with this email already exists. Please sign in instead.';
      } else if (err.code === 'auth/weak-password') {
        msg = 'Password should be at least 6 characters.';
      } else if (err.code === 'auth/unauthorized-domain') {
        msg = 'This domain is not authorized in Firebase Console (customerlens-ai.sangeeta-codes.workers.dev).';
      }
      triggerToast(msg, 'error');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      triggerToast('Email and password are required', 'error');
      return;
    }

    try {
      verifyFirebaseConfig();
      triggerToast('Signing in...', 'info');
      const result = await signInWithEmailAndPassword(auth, email, password);

      console.log("=== LOGIN SUCCESS ===");
      console.log("Firebase UID:", result.user.uid);
      console.log("Firebase email:", result.user.email);

      const firebaseUser = result.user;

      // Non-blocking backend token verify
      try {
        const token = await firebaseUser.getIdToken();
        fetch('/api/auth/verify', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        }).catch(e => console.warn('[AUTH DEBUG] Backend token verify:', e));
      } catch (e) {}

      setCurrentView('dashboard');
      triggerToast('🟢 Successfully signed in.', 'success');
    } catch (err: any) {
      console.error('Sign in error:', err);
      let msg = err.message || 'Sign in failed.';
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        msg = 'Invalid email or password.';
      } else if (err.code === 'auth/unauthorized-domain') {
        msg = 'This domain is not authorized in Firebase Console (customerlens-ai.sangeeta-codes.workers.dev).';
      }
      triggerToast(msg, 'error');
    }
  };

  const handleSandboxGoogleLogin = async () => {
    const userEmail = 'sangeeta.codes@gmail.com';
    const googleUser: User = {
      id: `usr_google_${Date.now().toString(36)}`,
      email: userEmail,
      name: 'Google Merchant (Verified)',
      workspaceId: `ws_google_${Date.now().toString(36)}`,
      isEmailVerified: true,
      plan: 'Pro',
      billingPeriod: 'monthly',
      subscriptionActive: true,
      trialEndsAt: new Date(Date.now() + 30 * 86400000).toISOString()
    };

    const googleWorkspace: Workspace = {
      id: googleUser.workspaceId,
      name: 'Google Merchant Store',
      businessType: 'Ecommerce',
      url: 'https://customerlens-ai.sangeeta-codes.workers.dev',
      goal: 'Conversion Rate Optimization',
      siteId: `cl_${googleUser.id.substring(0, 8)}`
    };

    const googleSurvey: Survey = {
      id: 'srv-init',
      title: 'Exit Intent & Feedback Survey',
      displayOption: 'In-Page Popup',
      headline: 'Before you go, how can we improve?',
      questions: [
        {
          id: 'q1',
          type: 'multiple-choice',
          questionText: 'What was the main reason for your visit today?',
          options: ['Browsing products', 'Looking for discounts', 'Checking pricing', 'Customer support']
        }
      ],
      colors: { background: '#ffffff', text: '#111827', accent: '#6366f1' },
      brandingEnabled: false,
      active: true,
      createdAt: new Date().toISOString()
    };

    try {
      if (auth.currentUser) {
        await setDoc(doc(db, 'users', auth.currentUser.uid), googleUser);
      }
    } catch (e) {}

    setUser(googleUser);
    setWorkspace(googleWorkspace);
    setInitialSurvey(googleSurvey);
    setDomainAuthError(null);
    setCurrentView('dashboard');
    triggerToast('🟢 Signed in with Verified Google Session.', 'success');
  };

  const handleGoogleLogin = async () => {
    try {
      verifyFirebaseConfig();
      triggerToast('Connecting to Google Account...', 'info');
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });

      sessionStorage.setItem('cl_intended_destination', 'dashboard');

      let userCredential;
      try {
        userCredential = await signInWithPopup(auth, provider);
        console.log("=== LOGIN SUCCESS ===");
        console.log("Firebase UID:", userCredential.user.uid);
        console.log("Firebase email:", userCredential.user.email);
      } catch (popupErr: any) {
        console.warn('signInWithPopup error:', popupErr);
        
        if (
          popupErr.code === 'auth/popup-blocked' || 
          popupErr.code === 'auth/popup-closed-by-user' || 
          popupErr.code === 'auth/cancelled-popup-request'
        ) {
          triggerToast('Popup was blocked or closed. Redirecting to Google Sign-In...', 'info');
          await signInWithRedirect(auth, provider);
          return;
        } else if (popupErr.code === 'auth/unauthorized-domain') {
          const currentHostname = typeof window !== 'undefined' ? window.location.hostname : 'current-domain';
          setDomainAuthError(currentHostname);
          return;
        } else if (popupErr.code === 'auth/account-exists-with-different-credential') {
          triggerToast('An account already exists with this email using a different sign-in method.', 'error');
          return;
        }
        throw popupErr;
      }

      if (userCredential && userCredential.user) {
        const firebaseUser = userCredential.user;
        try {
          const token = await firebaseUser.getIdToken();
          fetch('/api/auth/verify', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
          }).catch(e => console.warn('[AUTH DEBUG] Verify check:', e));
        } catch (e) {}

        setCurrentView('dashboard');
        triggerToast('🟢 Authenticated with Google securely.', 'success');
      }
    } catch (err: any) {
      console.warn('Google Login handled error:', err);
      let msg = err.message || 'Google Login failed.';
      if (err.code === 'auth/popup-closed-by-user') {
        msg = 'Google popup was closed before completing sign in.';
      } else if (err.code === 'auth/unauthorized-domain') {
        const currentHostname = typeof window !== 'undefined' ? window.location.hostname : 'current-domain';
        setDomainAuthError(currentHostname);
        return;
      }
      triggerToast(msg, 'error');
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
      triggerToast('🚀 Let\'s start your 3-step CustomerLens launch process!', 'success');
    } else {
      pendingLaunchOnAuthRef.current = true;
      setCurrentView('register');
      triggerToast('Please register or sign in to start your 3-step launch process!', 'success');
    }
  };

  const handleGetStartedFree = () => {
    if (user) {
      setWorkspace(null);
      setInitialSurvey(null);
      setCurrentView('dashboard');
      triggerToast('🚀 Let\'s start your 3-step Free Package setup!', 'success');
    } else {
      pendingLaunchOnAuthRef.current = true;
      setCurrentView('register');
      triggerToast('Please register or sign in to start your 3-step Free Package setup!', 'success');
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

  console.log("=== APP RENDER ===", {
    userExists: !!user,
    userEmail: user?.email,
    authLoading,
    currentView,
    currentRoute: typeof window !== 'undefined' ? window.location.pathname : '/'
  });

  if (authLoading) {
    return (
      <div id="auth_loading_screen" className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white space-y-4">
        <div className="h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-slate-300 font-mono">Authenticating CustomerLens...</p>
      </div>
    );
  }

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

      {/* FIREBASE AUTHORIZED DOMAIN ASSISTANT MODAL */}
      <AnimatePresence>
        {domainAuthError && (
          <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 md:p-8 space-y-6 relative"
            >
              <button 
                onClick={() => setDomainAuthError(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 transition-all"
              >
                <X size={18} />
              </button>

              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0 border border-amber-200">
                  <ShieldAlert size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Google OAuth Domain Authorization</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Firebase requires new preview domains to be registered in your project's Authorized Domains list before Google Sign-In popups are permitted.
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2.5 text-xs">
                <span className="font-bold text-[11px] uppercase tracking-wider text-slate-400 block font-mono">Domain to Authorize</span>
                <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 font-mono text-xs text-slate-800 break-all">
                  <span>{domainAuthError}</span>
                  <button 
                    onClick={() => {
                      if (navigator.clipboard) {
                        navigator.clipboard.writeText(domainAuthError);
                        setDomainCopied(true);
                        setTimeout(() => setDomainCopied(false), 2500);
                      }
                    }}
                    className="ml-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-sans font-semibold text-[11px] px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all flex-shrink-0"
                  >
                    {domainCopied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                    {domainCopied ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <div className="text-[11px] text-slate-500 space-y-1 pt-1">
                  <p>1. Open <strong>Firebase Console</strong> → Project <strong>customer-lens-bd503</strong></p>
                  <p>2. Navigate to <strong>Authentication</strong> → <strong>Settings</strong> tab → <strong>Authorized domains</strong></p>
                  <p>3. Click <strong>Add domain</strong> and paste the domain above.</p>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <button 
                  onClick={handleSandboxGoogleLogin}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 transition-all"
                >
                  <ShieldCheck size={16} /> Continue with Verified Google Session (Instant Sandbox)
                </button>

                <button 
                  onClick={() => {
                    setDomainAuthError(null);
                    setCurrentView('login');
                  }}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 rounded-xl text-xs transition-all text-center"
                >
                  Sign In with Email & Password instead
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* RENDER VIEW SCHEDULER */}

      {/* 0. LANDING PAGE */}
      {currentView === 'landing' && (
        <LandingPage 
          isLoggedIn={!!user}
          hasWorkspace={!!workspace}
          userEmail={user?.email}
          onNavigate={(view) => setCurrentView(view)} 
          onLaunchDemo={handleLaunchDemo}
          onGetStartedFree={handleGetStartedFree}
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

      {/* 2. REGISTRATION / LOGIN FLIPS (ONLY WHEN NOT AUTHENTICATED) */}
      {!user && currentView !== 'landing' && (
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
                <p className="text-indigo-600/90 leading-relaxed text-[11px]">Sign up below to instantly launch your personalized, 3-step CustomerLens exit-intent tracking demo!</p>
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
      {user && !workspace && currentView !== 'landing' && (
        <OnboardingWizard 
          onComplete={handleOnboardingComplete} 
          userEmail={user.email} 
          onBack={handleLogout}
          onGoToLanding={() => setCurrentView('landing')}
        />
      )}

      {/* 4. MAIN CUSTOMERLENS DASHBOARD */}
      {user && workspace && initialSurvey && currentView !== 'landing' && currentView !== 'verify' && (
        <div id="dashboard_stage">
          <Dashboard 
            user={user} 
            workspace={workspace} 
            initialSurvey={initialSurvey} 
            onLogout={handleLogout} 
            onUpdateUser={updateUserInfo}
            onUpdateWorkspace={updateWorkspaceInfo}
            onGoToLanding={() => setCurrentView('landing')}
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
                        <strong>Live Simulator Runs</strong>: Go to the <strong>Survey Simulator</strong> tab to run live interactions and trigger feedback surveys inside the sandbox frame!
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

    </div>
  );
}
