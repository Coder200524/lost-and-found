import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import SwipeClient from '@/components/SwipeClient';

export default async function SwipePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login?callbackUrl=/swipe');
  }

  return <SwipeClient />;
}
