import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import GeminiMatcherClient from '@/components/GeminiMatcherClient';

export const metadata: Metadata = {
  title: 'Gemini AI Campus Matcher | FinDora',
  description: 'Semantic matching for lost and found items on SVKM campus powered by Gemini AI.',
};

export default async function MatchPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login?callbackUrl=/match');
  }

  return <GeminiMatcherClient />;
}
