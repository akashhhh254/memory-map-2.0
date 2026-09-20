/**
 * Centralized Authentication error parser that transforms technical SDK codes
 * or server errors into clear, actionable, user-friendly messages.
 */
export function getFriendlyAuthErrorMessage(error: any): string {
  if (!error) return 'An unexpected authentication error occurred.';

  const rawMessage = typeof error === 'string' ? error : error.message || '';
  let code = typeof error === 'string' ? error : error.code || '';

  // Extract auth code if embedded in error message (e.g. Firebase: Error (auth/invalid-credential).)
  const codeMatch = rawMessage.match(/auth\/([a-zA-Z0-9-]+)/);
  if (codeMatch) {
    code = `auth/${codeMatch[1]}`;
  }

  switch (code) {
    case 'auth/popup-closed-by-user':
      return 'Google sign-in was closed before completion.';

    case 'auth/popup-blocked':
      return 'Popup was blocked by your browser. Please allow popups or use email sign-in.';

    case 'auth/cancelled-popup-request':
      return 'Google sign-in request was cancelled.';

    case 'auth/account-exists-with-different-credential':
      return 'An account already exists with this email using a different sign-in method.';

    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection and try again.';

    case 'auth/invalid-credential':
    case 'auth/wrong-password':
      return 'Incorrect email or password. If you are new, click "Sign up free" below to create your account.';

    case 'auth/user-not-found':
      return 'No account was found with this email. Click "Sign up free" to create your vault.';

    case 'auth/email-already-in-use':
      return 'This email address is already registered. Please sign in instead.';

    case 'auth/weak-password':
      return 'Password must be at least 6 characters long.';

    case 'auth/invalid-email':
      return 'Please provide a valid email address.';

    case 'auth/too-many-requests':
      return 'Too many attempts. Access has been temporarily paused. Please try again in a minute.';

    case 'auth/unauthorized-domain':
      return 'Google Authentication running in direct mode for this preview environment.';

    case 'auth/operation-not-allowed':
      return 'Authentication method is being initialized. You can also sign in with email or explore the demo.';

    case 'auth/user-disabled':
      return 'This user account has been deactivated.';

    default:
      if (rawMessage) {
        // Strip technical Firebase prefix if present
        const cleaned = rawMessage
          .replace(/^Firebase:\s*Error\s*\(auth\/[a-zA-Z0-9-]+\)\.?\s*/i, '')
          .replace(/^FirebaseError:\s*/i, '')
          .trim();
        if (cleaned && cleaned.length > 3 && !cleaned.toLowerCase().includes('firebase')) {
          return cleaned;
        }
      }
      return 'Unable to sign in. Please check your details or create a new account below.';
  }
}
