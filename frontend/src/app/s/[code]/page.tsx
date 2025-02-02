'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ShortUrlRedirect({ params }: { params: { code: string } }) {
  const router = useRouter();

  useEffect(() => {
    const redirect = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/shorturl/${params.code}`);
        const data = await response.json();
        
        if (response.ok) {
          router.push(data.redirectUrl);
        } else {
          router.push('/404');
        }
      } catch (error) {
        router.push('/404');
      }
    };

    redirect();
  }, [params.code, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
}