import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import PostClient from '@/components/PostClient';

export default async function PostItemPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login?callbackUrl=/post');
  }

  return <PostClient />;
}
