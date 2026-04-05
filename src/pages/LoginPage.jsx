import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { USERS } from '../auth/users';

const fieldVariants = {
  hidden: { opacity: 0, y: 10 },
  show: (index) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.18 + index * 0.08,
      duration: 0.35,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isQuickLogin, setIsQuickLogin] = useState(false);

  const submitLogin = async (submittedEmail, submittedPassword) => {
    if (isLoading) return;

    setError('');
    setIsLoading(true);

    const result = await onLogin({
      email: submittedEmail,
      password: submittedPassword,
    });

    if (!result?.ok) {
      setError(result?.error || 'Unable to sign in.');
    }

    setIsLoading(false);
    setIsQuickLogin(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await submitLogin(email, password);
  };

  const handleQuickLogin = (user) => {
    if (isLoading) return;

    setError('');
    setEmail(user.email);
    setPassword(user.password);
    setIsQuickLogin(true);

    setTimeout(() => {
      submitLogin(user.email, user.password);
    }, 500);
  };

  return (
    <div className="login-screen">
      <motion.div
        className="login-card"
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 140, damping: 18, mass: 0.65 }}
      >
        <div className="login-brand">
          <div className="login-brand-mark">F</div>
          <div>
            <h1>FinFlow</h1>
            <p>Secure mock access to your finance command center</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="login-form" autoComplete="on">
          <motion.label custom={0} variants={fieldVariants} initial="hidden" animate="show" className="login-field">
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@company.com"
              required
            />
          </motion.label>

          <motion.label custom={1} variants={fieldVariants} initial="hidden" animate="show" className="login-field">
            <span>Password</span>
            <div className="password-wrap">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </motion.label>

          <motion.button
            custom={2}
            variants={fieldVariants}
            initial="hidden"
            animate="show"
            type="submit"
            className="login-submit"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="login-loading">
                <span className="spinner" />
                {isQuickLogin ? 'Quick signing in...' : 'Signing in...'}
              </span>
            ) : (
              'Sign In'
            )}
          </motion.button>
        </form>

        <AnimatePresence mode="wait">
          {error && (
            <motion.p
              key={error}
              className="login-error"
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ type: 'spring', stiffness: 300, damping: 17 }}
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        <motion.div
          className="quick-login"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.36, duration: 0.35 }}
        >
          <div className="quick-login-label">Quick Login</div>
          <div className="quick-login-buttons">
            {USERS.map((user) => (
              <button
                key={user.email}
                type="button"
                onClick={() => handleQuickLogin(user)}
                disabled={isLoading}
                className="quick-login-btn"
              >
                {user.name}
              </button>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
