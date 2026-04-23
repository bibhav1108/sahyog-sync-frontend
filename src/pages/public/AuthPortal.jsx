import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import API from "../../services/api";
import logo from "../../assets/logo.png";

/**
 * AUTH PORTAL MODES
 */
const MODES = {
  LOGIN: "LOGIN",
  FORGOT: "FORGOT",
  PICK_ROLE: "PICK_ROLE",
  VOLUNTEER_REG: "VOLUNTEER_REG",
  NGO_REG: "NGO_REG",
};

/**
 * 🩺 VALIDATION HELPERS
 */
const validateEmail = (email) => {
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};

const validatePhone = (phone) => {
  return String(phone).match(/^\+?[\d\s-]{10,}$/);
};

const validatePassword = (password) => {
  if (password.length < 8) return "Password must be at least 8 characters long";
  if (!/[a-zA-Z]/.test(password)) return "Password must contain at least one letter";
  if (!/\d/.test(password)) return "Password must contain at least one number";
  return null;
};

const AuthPortal = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [mode, setMode] = useState(MODES.LOGIN);

  // Sync mode with URL path
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const type = params.get("type");

    if (location.pathname === "/register" || location.pathname === "/register-volunteer") {
      if (type === "ngo") {
        setMode(MODES.NGO_REG);
      } else if (type === "volunteer") {
        setMode(MODES.VOLUNTEER_REG);
      } else {
        setMode(MODES.PICK_ROLE);
      }
    } else if (location.pathname === "/login") {
      setMode(MODES.LOGIN);
    }
  }, [location.pathname, location.search]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Shared Form States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Transition helper
  const switchMode = (newMode) => {
    setError("");
    setSuccess("");
    setMode(newMode);
  };

  return (
    <div className="h-screen w-full bg-surface flex overflow-hidden font-inter selection:bg-primary/30 relative">
      {/* 🔮 DECORATIVE BACKGROUND ELEMENTS */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-primary/10 blur-[120px] rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-azure/10 blur-[100px] rounded-full translate-x-1/3 translate-y-1/3 pointer-events-none" />

      {/* ⬅️ LEFT PANEL: BRANDING (Visible on Large Screens) */}
      <div className="hidden lg:flex lg:w-1/2 p-20 flex-col justify-between relative bg-primaryGradient">
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-4 group">
            <img src={logo} alt="Sahyog Sync" className="h-20 w-20 object-contain transition-transform group-hover:scale-110 drop-shadow-md" />
            <span className="text-3xl font-outfit font-black text-white tracking-tighter">Sahyog Sync</span>
          </Link>

          <div className="mt-24 space-y-8 max-w-lg">
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-6xl font-outfit font-extrabold text-white leading-[1.1]"
            >
              Unified Action. <br />
              <span className="text-white">Social Impact.</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg text-white/80 leading-relaxed"
            >
              Whether you are a ground volunteer or a coordinating foundation, 
              manage resources and respond to missions with unprecedented precision.
            </motion.p>
          </div>
        </div>

      </div>

      {/* ➡️ RIGHT PANEL: INTERACTIVE AUTH CARD */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
        {/* MOBILE LOGO */}
        <div className="absolute top-8 left-8 lg:hidden">
          <Link to="/" className="flex items-center gap-3">
            <img src={logo} alt="logo" className="h-12 w-12 object-contain" />
            <span className="text-xl font-outfit font-bold text-primary">Sahyog Sync</span>
          </Link>
        </div>

        <motion.div 
           className="w-full max-w-md"
        >
          <div className="bg-surface_lowest p-8 md:p-10 rounded-[32px] shadow-[0_10px_50px_rgba(0,0,0,0.08)] border border-white/50 relative overflow-hidden">
            
            {/* 🔝 FORM HEADER / SWITCHER */}
            <AnimatePresence mode="wait">
              {mode === MODES.LOGIN && (
                <motion.div 
                   key="login-header"
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, y: -10 }}
                   className="mb-8"
                >
                  <h2 className="text-3xl font-outfit font-black text-on_surface uppercase tracking-tight">Welcome Back</h2>
                  <p className="text-on_surface_variant mt-1 text-sm">Sign in to your Sahyog account</p>
                </motion.div>
              )}
              {mode === MODES.PICK_ROLE && (
                <motion.div 
                   key="signup-header"
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, y: -10 }}
                   className="mb-8 text-center"
                >
                  <h2 className="text-3xl font-outfit font-black text-on_surface uppercase tracking-tight">Join the Mission</h2>
                  <p className="text-on_surface_variant mt-1 text-sm">Select how you want to contribute</p>
                </motion.div>
              )}
              {mode === MODES.VOLUNTEER_REG && (
                <motion.div 
                   key="vol-header"
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, y: -10 }}
                   className="mb-8"
                >
                  <button onClick={() => switchMode(MODES.PICK_ROLE)} className="text-xs font-bold text-primary flex items-center gap-1 mb-2 hover:underline">
                    <span className="material-symbols-outlined text-sm">arrow_back</span> Back to roles
                  </button>
                  <h2 className="text-3xl font-outfit font-black text-on_surface uppercase tracking-tight">Volunteer</h2>
                  <p className="text-on_surface_variant mt-1 text-sm">Individual Registration</p>
                </motion.div>
              )}
              {mode === MODES.NGO_REG && (
                <motion.div 
                   key="ngo-header"
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, y: -10 }}
                   className="mb-8"
                >
                  <button onClick={() => switchMode(MODES.PICK_ROLE)} className="text-xs font-bold text-primary flex items-center gap-1 mb-2 hover:underline">
                    <span className="material-symbols-outlined text-sm">arrow_back</span> Back to roles
                  </button>
                  <h2 className="text-3xl font-outfit font-black text-on_surface uppercase tracking-tight">NGO Partner</h2>
                  <p className="text-on_surface_variant mt-1 text-sm">Organization Registration</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ERROR / SUCCESS ALERTS */}
            <AnimatePresence>
               {error && (
                 <motion.div 
                   initial={{ height: 0, opacity: 0 }}
                   animate={{ height: "auto", opacity: 1 }}
                   className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl font-medium flex items-center gap-2"
                 >
                   <span className="material-symbols-outlined text-lg">error</span>
                   {error}
                 </motion.div>
               )}
               {success && (
                 <motion.div 
                   initial={{ height: 0, opacity: 0 }}
                   animate={{ height: "auto", opacity: 1 }}
                   className="mb-6 p-4 bg-green-50 border border-green-100 text-green-600 text-sm rounded-xl font-medium flex items-center gap-2"
                 >
                   <span className="material-symbols-outlined text-lg">check_circle</span>
                   {success}
                 </motion.div>
               )}
            </AnimatePresence>

            {/* 🧩 FORM CONTENT VIEWS */}
            <div className="relative">
              <AnimatePresence mode="wait">
                {mode === MODES.LOGIN && (
                  <LoginForm key="login" setEmail={setEmail} setPassword={setPassword} email={email} password={password} setError={setError} setLoading={setLoading} loading={loading} setMode={setMode} MODES={MODES} />
                )}
                {mode === MODES.PICK_ROLE && (
                  <RolePicker key="roles" setMode={setMode} MODES={MODES} />
                )}
                {mode === MODES.FORGOT && (
                  <ForgotPassForm key="forgot" email={email} setEmail={setEmail} setError={setError} setSuccess={setSuccess} setLoading={setLoading} loading={loading} setMode={setMode} MODES={MODES} />
                )}
                {mode === MODES.VOLUNTEER_REG && (
                  <VolunteerRegForm key="vol-reg" setError={setError} setSuccess={setSuccess} setLoading={setLoading} loading={loading} switchMode={switchMode} MODES={MODES} />
                )}
                {mode === MODES.NGO_REG && (
                  <NGORegForm key="ngo-reg" setError={setError} setSuccess={setSuccess} setLoading={setLoading} loading={loading} switchMode={switchMode} MODES={MODES} />
                )}
              </AnimatePresence>
            </div>

            {/* 🔗 GLOBAL FOOTER LINKS */}
            <div className="mt-8 pt-6 border-t border-on_surface/5 text-center transition-all">
               {mode === MODES.LOGIN ? (
                 <p className="text-sm text-on_surface_variant">
                   Don't have an account?{" "}
                   <button onClick={() => switchMode(MODES.PICK_ROLE)} className="text-primary font-bold hover:underline">Sign up</button>
                 </p>
               ) : (
                 <p className="text-sm text-on_surface_variant">
                   Already a member?{" "}
                   <button onClick={() => switchMode(MODES.LOGIN)} className="text-primary font-bold hover:underline">Sign in</button>
                 </p>
               )}
            </div>
          </div>

        </motion.div>
      </div>
    </div>
  );
};

/**
 * 🔑 LOGIN VIEW
 */
const LoginForm = ({ email, setEmail, password, setPassword, setError, setLoading, loading, setMode, MODES }) => {
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) return setError("Please fill in all fields");

    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append("username", email);
      params.append("password", password);

      const res = await API.post("/auth/login", params, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      const data = res.data;
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("role", data.role);
      localStorage.setItem("org_id", data.org_id || "");

      if (data.role === "SYSTEM_ADMIN") navigate("/admin/dashboard");
      else if (data.role === "VOLUNTEER") navigate("/volunteer/dashboard");
      else if (data.role === "NGO_ADMIN") navigate("/ngo-admin/dashboard");
      else navigate("/ngo/dashboard");
    } catch (err) {
      if (err.response?.status === 403) {
        setError("Your organization registration is currently pending admin approval. Please wait for activation.");
      } else {
        setError(err.response?.data?.detail || "Login failed. Check credentials.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form 
      initial={{ opacity: 0, x: 20 }} 
      animate={{ opacity: 1, x: 0 }} 
      exit={{ opacity: 0, x: -20 }}
      onSubmit={handleLogin} 
      className="space-y-5"
    >
      <AuthInput label="Email or Username" value={email} setValue={setEmail} icon="person" />
      <AuthInput label="Password" value={password} setValue={setPassword} type="password" icon="lock" />
      
      <div className="flex justify-end">
        <button 
           type="button"
           onClick={() => setMode(MODES.FORGOT)}
           className="text-xs font-bold text-primary hover:underline hover:text-primary_container"
        >
          Forgot Password?
        </button>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-4 bg-primaryGradient text-white font-black uppercase tracking-widest rounded-2xl shadow-lg hover:shadow-primary/25 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <div className="auth-spinner" />
            <span>Authenticating...</span>
          </>
        ) : (
          "Sign In"
        )}
      </button>
    </motion.form>
  );
};

/**
 * 🏷️ ROLE PICKER VIEW
 */
const RolePicker = ({ setMode, MODES }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }} 
      animate={{ opacity: 1, scale: 1 }} 
      exit={{ opacity: 0, scale: 0.95 }}
      className="space-y-4"
    >
      <RoleCard 
         title="Volunteer" 
         desc="I want to contribute my time and skills to missions." 
         icon="volunteer_activism" 
         onClick={() => setMode(MODES.VOLUNTEER_REG)}
      />
      <RoleCard 
         title="Organization" 
         desc="We are an NGO looking to coordinate resources." 
         icon="corporate_fare" 
         onClick={() => setMode(MODES.NGO_REG)}
      />
    </motion.div>
  );
};

const RoleCard = ({ title, desc, icon, onClick }) => (
  <button 
    onClick={onClick}
    className="w-full p-6 bg-surface border border-white/40 rounded-2xl text-left flex items-start gap-4 hover:bg-white hover:shadow-xl hover:border-primary/20 transition-all group"
  >
    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
      <span className="material-symbols-outlined">{icon}</span>
    </div>
    <div className="flex-1">
      <h3 className="font-bold text-on_surface">{title}</h3>
      <p className="text-xs text-on_surface_variant mt-1 leading-relaxed">{desc}</p>
    </div>
    <span className="material-symbols-outlined text-on_surface_variant/30 group-hover:text-primary transition-colors">chevron_right</span>
  </button>
);

/**
 * 🧑‍🤝‍🧑 VOLUNTEER REGISTRATION (OTP FLOW)
 */
const VolunteerRegForm = ({ setError, setSuccess, setLoading, loading, switchMode, MODES }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Email/Username, 2: OTP, 3: Details

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [otp, setOtp] = useState("");
  const [verifiedToken, setVerifiedToken] = useState("");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const handleSendOTP = async () => {
    if (!email || !username) return setError("Email and Username required");
    if (!validateEmail(email)) return setError("Please enter a valid email address");

    try {
      setLoading(true);
      await API.post("/volunteers/register/send-otp", { email, username });
      setStep(2);
      setSuccess("OTP sent to your email!");
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp) return setError("Enter OTP");
    try {
      setLoading(true);
      const res = await API.post("/volunteers/register/verify-otp", { email, otp });
      setVerifiedToken(res.data.verified_token);
      setStep(3);
      setSuccess("Email verified! Finalize your profile.");
    } catch (err) {
      setError(err.response?.data?.detail || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const finishRegistration = async (e) => {
    e.preventDefault();
    setError("");

    if (!name || !phone || !password) return setError("All fields are required");
    if (!validatePhone(phone)) return setError("Please enter a valid phone number (at least 10 digits)");
    
    const passError = validatePassword(password);
    if (passError) return setError(passError);

    try {
      setLoading(true);
      await API.post("/volunteers/register/register", {
        name, username, phone_number: phone, password, verified_token: verifiedToken
      });
      setSuccess("Welcome aboard! Redirecting...");
      setTimeout(() => switchMode(MODES.LOGIN), 2000);
    } catch (err) {
      if (err.response?.status === 422) {
        const details = err.response.data.detail;
        const msg = Array.isArray(details) ? details[0].msg : details;
        setError(msg);
      } else {
        setError(err.response?.data?.detail || "Registration failed. Please check your inputs.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      {step === 1 && (
        <div className="space-y-4">
          <AuthInput label="Username" value={username} setValue={setUsername} icon="alternate_email" />
          <AuthInput label="Email Address" value={email} setValue={setEmail} type="email" icon="mail" />
          <button 
             onClick={handleSendOTP} 
             disabled={loading} 
             className="w-full py-4 bg-primary text-white font-bold rounded-2xl shadow-soft flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                 <div className="auth-spinner" />
                 <span>Verifying Availability...</span>
              </>
            ) : "Send Verification Code"}
          </button>
        </div>
      )}
      {step === 2 && (
        <div className="space-y-4">
          <p className="text-xs text-center text-on_surface_variant">Enter the 6-digit code sent to <b>{email}</b></p>
          <AuthInput label="OTP Code" value={otp} setValue={setOtp} icon="password" />
          <button 
             onClick={handleVerifyOTP} 
             disabled={loading} 
             className="w-full py-4 bg-primary text-white font-bold rounded-2xl shadow-soft flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                 <div className="auth-spinner" />
                 <span>Verifying...</span>
              </>
            ) : "Verify OTP"}
          </button>
        </div>
      )}
      {step === 3 && (
        <form onSubmit={finishRegistration} className="space-y-4">
           <AuthInput label="Full Name" value={name} setValue={setName} icon="person" />
           <AuthInput label="Phone Number" value={phone} setValue={setPhone} icon="phone" />
           <AuthInput label="Create Password" value={password} setValue={setPassword} type="password" icon="lock" />
           <button 
             type="submit" 
             disabled={loading} 
             className="w-full py-4 bg-primary text-white font-bold rounded-2xl shadow-lg flex items-center justify-center gap-2"
           >
             {loading ? (
              <>
                 <div className="auth-spinner" />
                 <span>Creating Account...</span>
              </>
            ) : "Complete Registration"}
           </button>
        </form>
      )}
    </motion.div>
  );
};

/**
 * 🏢 NGO ADMIN REGISTRATION (OTP FLOW)
 */
const NGORegForm = ({ setError, setSuccess, setLoading, loading, switchMode, MODES }) => {
  const [step, setStep] = useState(1); 
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [otp, setOtp] = useState("");
  const [verifiedToken, setVerifiedToken] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  const handleSendOTP = async () => {
    if (!email || !username) return setError("Email and Username required");
    if (!validateEmail(email)) return setError("Invalid email address");

    try {
      setLoading(true);
      await API.post("/volunteers/register/send-otp", { email, username });
      setStep(2);
      setSuccess("Verification code sent to your email!");
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp) return setError("Enter code");
    try {
      setLoading(true);
      const res = await API.post("/volunteers/register/verify-otp", { email, otp });
      setVerifiedToken(res.data.verified_token);
      setStep(3);
      setSuccess("Account verified!");
    } catch (err) {
      setError(err.response?.data?.detail || "Invalid code");
    } finally {
      setLoading(false);
    }
  };

  const finishRegistration = async (e) => {
    e.preventDefault();
    if (!name || !password) return setError("All fields required");
    const passError = validatePassword(password);
    if (passError) return setError(passError);

    try {
      setLoading(true);
      await API.post("/ngo-admin/register", {
        full_name: name, username, password, verified_token: verifiedToken
      });
      setSuccess("Admin account created! Log in to set up your NGO.");
      setTimeout(() => switchMode(MODES.LOGIN), 2500);
    } catch (err) {
      if (err.response?.status === 422) {
        const details = err.response.data.detail;
        const msg = Array.isArray(details) ? (details[0].msg || details[0].message) : (details.msg || details);
        setError(msg);
      } else {
        setError(err.response?.data?.detail || "Registration failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      {step === 1 && (
        <div className="space-y-4">
          <AuthInput label="Admin Username" value={username} setValue={setUsername} icon="alternate_email" />
          <AuthInput label="Admin Email" value={email} setValue={setEmail} type="email" icon="mail" />
          <button 
             onClick={handleSendOTP} 
             disabled={loading} 
             className="w-full py-4 bg-primaryGradient text-white font-black uppercase tracking-widest rounded-2xl shadow-lg flex items-center justify-center gap-2"
          >
            {loading ? <div className="auth-spinner" /> : "Verify Email"}
          </button>
        </div>
      )}
      {step === 2 && (
        <div className="space-y-4">
          <p className="text-xs text-center text-on_surface_variant">Enter code sent to <b>{email}</b></p>
          <AuthInput label="Verification Code" value={otp} setValue={setOtp} icon="password" />
          <button 
             onClick={handleVerifyOTP} 
             disabled={loading} 
             className="w-full py-4 bg-primaryGradient text-white font-black uppercase tracking-widest rounded-2xl shadow-lg flex items-center justify-center gap-2"
          >
            {loading ? <div className="auth-spinner" /> : "Confirm Code"}
          </button>
        </div>
      )}
      {step === 3 && (
        <form onSubmit={finishRegistration} className="space-y-4">
           <AuthInput label="Full Administrator Name" value={name} setValue={setName} icon="person" />
           <AuthInput label="Set Secure Password" value={password} setValue={setPassword} type="password" icon="lock" />
           <button 
             type="submit" 
             disabled={loading} 
             className="w-full py-4 bg-primaryGradient text-white font-black uppercase tracking-widest rounded-2xl shadow-lg flex items-center justify-center gap-2"
           >
             {loading ? <div className="auth-spinner" /> : "Initialize Admin Account"}
           </button>
        </form>
      )}
    </motion.div>
  );
};

/**
 * 🔄 FORGOT PASSWORD VIEW
 */
const ForgotPassForm = ({ email, setEmail, setError, setSuccess, setLoading, loading, setMode, MODES }) => {
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [newPass, setNewPass] = useState("");

  const handleSend = async () => {
    const isEmail = validateEmail(email);
    const isPhone = validatePhone(email); // using email state for input

    if (!isEmail && !isPhone) return setError("Please enter a valid email address or phone number");
    
    try {
      setLoading(true);
      const payload = isEmail ? { email } : { phone_number: email };
      const res = await API.post("/auth/forgot-password", payload);
      setSuccess(res.data.message);
      setOtpSent(true);
    } catch { setError("Failed to send OTP"); } finally { setLoading(false); }
  };

  const handleReset = async () => {
    const passError = validatePassword(newPass);
    if (passError) return setError(passError);
    const isEmail = validateEmail(email);
    
    try {
      setLoading(true);
      const payload = { 
        [isEmail ? "email" : "phone_number"]: email,
        otp, 
        new_password: newPass 
      };
      await API.post("/auth/reset-password", payload);
      setSuccess("Password reset success! Redirecting...");
      setTimeout(() => setMode(MODES.LOGIN), 2000);
    } catch { setError("Reset failed"); } finally { setLoading(false); }
  };

  return (
    <div className="space-y-5">
       <AuthInput label="Email or Phone Number" value={email} setValue={setEmail} icon="mail" />
       {!otpSent ? (
         <button onClick={handleSend} disabled={loading} className="w-full py-4 bg-primary text-white font-bold rounded-2xl">
           {loading ? "Processing..." : "Send Reset Code"}
         </button>
       ) : (
         <>
           <AuthInput label="OTP Code" value={otp} setValue={setOtp} icon="password" />
           <AuthInput label="New Password" value={newPass} setValue={setNewPass} type="password" icon="lock" />
           <button onClick={handleReset} disabled={loading} className="w-full py-4 bg-green-600 text-white font-bold rounded-2xl">
             {loading ? "Saving..." : "Reset Password"}
           </button>
         </>
       )}
       <button onClick={() => setMode(MODES.LOGIN)} className="w-full text-xs font-bold text-on_surface_variant">Back to login</button>
    </div>
  );
};

/**
 * 🖋️ SHARED INPUT COMPONENT
 */
const AuthInput = ({ label, value, setValue, type = "text", icon = null, disabled = false }) => {
  const [showPassword, setShowPassword] = useState(false);
  const isActive = value && value.length > 0;
  
  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className="relative group">
      <input
        type={inputType}
        value={value}
        disabled={disabled}
        onChange={(e) => setValue(e.target.value)}
        className="
          peer w-full px-4 pt-6 pb-2 rounded-2xl
          bg-surface_high text-sm border-2 border-transparent
          focus:border-primary/20 focus:outline-none focus:ring-4 focus:ring-primary/5
          transition-all duration-300
        "
      />
      
      {icon && !isPassword && (
        <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-on_surface_variant/20 group-focus-within:text-primary transition-colors text-lg">
          {icon}
        </span>
      )}

      {isPassword && (
        <button
          type="button"
          tabIndex="-1"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-on_surface_variant/40 hover:text-primary transition-colors focus:outline-none"
          title={showPassword ? "Hide password" : "Show password"}
        >
          <span className="material-symbols-outlined text-lg">
            {showPassword ? "visibility" : "visibility_off"}
          </span>
        </button>
      )}

      <label
        className={`
          absolute left-4 transition-all duration-300
          pointer-events-none text-on_surface_variant/60
          ${isActive ? "top-1.5 text-[10px] font-black uppercase tracking-widest text-primary" : "top-1/2 -translate-y-1/2 text-sm"}
          peer-focus:top-1.5 peer-focus:translate-y-0 peer-focus:text-[10px] peer-focus:font-black peer-focus:uppercase peer-focus:tracking-widest peer-focus:text-primary
        `}
      >
        {label}
      </label>
    </div>
  );
};

export default AuthPortal;
