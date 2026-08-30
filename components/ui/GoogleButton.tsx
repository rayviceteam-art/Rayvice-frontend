'use client';

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { getApiErrorMessage } from '@/lib/api-client';

interface GoogleButtonProps {
  text?: string;
  className?: string;
}

export function GoogleButton({ text = 'Continue with Google', className = '' }: GoogleButtonProps) {
  const { loginWithGoogle } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (typeof window !== 'undefined' && event.origin !== window.location.origin) return;
      if (event.data?.type === 'GOOGLE_AUTH_SUCCESS') {
        setIsLoading(false);
        toast.success('Successfully authenticated with Google.');
        router.push('/dashboard');
      }
    }
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [router]);

  async function handleGoogleClick() {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

    if (!clientId) {
      toast.error('Google Sign-In requires NEXT_PUBLIC_GOOGLE_CLIENT_ID to be set in environment variables.');
      return;
    }

    setIsLoading(true);

    try {
      const redirectUri = typeof window !== 'undefined' ? `${window.location.origin}/dashboard` : '';
      const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(
        clientId
      )}&redirect_uri=${encodeURIComponent(
        redirectUri
      )}&response_type=token%20id_token&scope=openid%20email%20profile&nonce=${Date.now()}`;

      const isMobile = typeof window !== 'undefined' && (window.innerWidth < 768 || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent));

      if (isMobile) {
        window.location.href = googleAuthUrl;
        return;
      }

      const width = 500;
      const height = 600;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;

      const popup = window.open(
        googleAuthUrl,
        'google_oauth_popup',
        `width=${width},height=${height},left=${left},top=${top},status=no,toolbar=no,menubar=no`
      );

      if (!popup) {
        window.location.href = googleAuthUrl;
        return;
      }

      const checkPopup = setInterval(async () => {
        try {
          if (!popup || popup.closed) {
            clearInterval(checkPopup);
            setIsLoading(false);
            return;
          }

          const currentUrl = popup.location.href;
          if (currentUrl && currentUrl.includes('id_token=')) {
            clearInterval(checkPopup);
            const params = new URLSearchParams(popup.location.hash.substring(1));
            const idToken = params.get('id_token');
            const accessToken = params.get('access_token');
            popup.close();

            if (idToken || accessToken) {
              await loginWithGoogle({ idToken: idToken || undefined, accessToken: accessToken || undefined });
              toast.success('Successfully authenticated with Google.');
              router.push('/dashboard');
            }
          }
        } catch {
          // Cross-origin access pending redirect
        }
      }, 500);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Google sign-in failed. Please try again.'));
      setIsLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleGoogleClick}
      disabled={isLoading}
      className={`group relative flex w-full items-center justify-center gap-3 rounded-control border border-border bg-white px-4 py-2.5 text-sm font-semibold text-text-primary shadow-sm transition-all hover:bg-ash-100 hover:border-ash-300 hover:shadow active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      {isLoading ? (
        <Loader2 className="h-5 w-5 animate-spin text-charcoal" />
      ) : (
        <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
      )}
      <span>{text}</span>
    </button>
  );
}
