import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import ChatClient from '@/components/ChatClient';

export default async function ChatPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login?callbackUrl=/chat');
  }

  return <ChatClient />;
}
