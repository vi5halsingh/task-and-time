import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { getErrorMessage } from '../services/api.js';

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const errors: typeof fieldErrors = {};
    const nameTrimmed = name.trim();
    const emailTrimmed = email.trim();

    if (!nameTrimmed) {
      errors.name = 'Full name is required';
    } else if (nameTrimmed.length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }

    if (!emailTrimmed) {
      errors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      });
      navigate('/', { replace: true });
    } catch (err) {
      setServerError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-7 h-7 rounded bg-zinc-900 flex items-center justify-center text-white text-xs font-semibold tracking-wider">
            ST
          </div>
          <span className="text-base font-semibold text-zinc-900 tracking-tight">
            Suntek Tracker
          </span>
        </div>

        <h1 className="text-xl font-semibold text-zinc-900 text-center tracking-tight">
          Create an account
        </h1>
        <p className="mt-1 text-sm text-zinc-500 text-center">
          Get started tracking your tasks and focused time.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 border border-zinc-200 rounded-md sm:px-8">
          {serverError && (
            <div
              role="alert"
              className="mb-6 p-3 text-xs rounded-md bg-red-50 border border-red-200 text-red-700 flex items-start"
            >
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-xs font-medium text-zinc-700 mb-1"
              >
                Full name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (fieldErrors.name) {
                    setFieldErrors((prev) => ({ ...prev, name: undefined }));
                  }
                }}
                placeholder="Jane Doe"
                className={`w-full text-sm px-3 py-2 bg-white border rounded-md text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 transition-colors ${
                  fieldErrors.name
                    ? 'border-red-400 focus:border-red-500 focus:ring-red-500'
                    : 'border-zinc-300 focus:border-zinc-900 focus:ring-zinc-900'
                }`}
              />
              {fieldErrors.name && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.name}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-xs font-medium text-zinc-700 mb-1"
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.email) {
                    setFieldErrors((prev) => ({ ...prev, email: undefined }));
                  }
                }}
                placeholder="name@example.com"
                className={`w-full text-sm px-3 py-2 bg-white border rounded-md text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 transition-colors ${
                  fieldErrors.email
                    ? 'border-red-400 focus:border-red-500 focus:ring-red-500'
                    : 'border-zinc-300 focus:border-zinc-900 focus:ring-zinc-900'
                }`}
              />
              {fieldErrors.email && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-medium text-zinc-700 mb-1"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErrors.password) {
                    setFieldErrors((prev) => ({ ...prev, password: undefined }));
                  }
                }}
                placeholder="At least 8 characters"
                className={`w-full text-sm px-3 py-2 bg-white border rounded-md text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 transition-colors ${
                  fieldErrors.password
                    ? 'border-red-400 focus:border-red-500 focus:ring-red-500'
                    : 'border-zinc-300 focus:border-zinc-900 focus:ring-zinc-900'
                }`}
              />
              {fieldErrors.password && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.password}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-xs font-medium text-zinc-700 mb-1"
              >
                Confirm password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (fieldErrors.confirmPassword) {
                    setFieldErrors((prev) => ({
                      ...prev,
                      confirmPassword: undefined,
                    }));
                  }
                }}
                placeholder="Repeat password"
                className={`w-full text-sm px-3 py-2 bg-white border rounded-md text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 transition-colors ${
                  fieldErrors.confirmPassword
                    ? 'border-red-400 focus:border-red-500 focus:ring-red-500'
                    : 'border-zinc-300 focus:border-zinc-900 focus:ring-zinc-900'
                }`}
              />
              {fieldErrors.confirmPassword && (
                <p className="mt-1 text-xs text-red-600">
                  {fieldErrors.confirmPassword}
                </p>
              )}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full inline-flex justify-center items-center px-4 py-2 text-sm font-medium text-white bg-zinc-900 hover:bg-zinc-800 rounded-md transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubmitting ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating account...
                  </span>
                ) : (
                  'Create account'
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 pt-5 border-t border-zinc-100 text-center">
            <p className="text-xs text-zinc-500">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-medium text-zinc-900 hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
