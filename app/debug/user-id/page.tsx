// app/debug/user-id/page.tsx
import { auth, currentUser } from '@clerk/nextjs/server';

export default async function DebugPage() {
  const { userId } = await auth();
  const user = await currentUser();
  
  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Your Clerk User ID</h1>
      <p><strong>User ID:</strong> {userId}</p>
      <p><strong>Email:</strong> {user?.emailAddresses[0]?.emailAddress}</p>
      <p><strong>Name:</strong> {user?.firstName} {user?.lastName}</p>
      
      <hr />
      <p>Copy this to your .env.local:</p>
      <code style={{ background: '#f0f0f0', padding: '10px', display: 'block' }}>
        ADMIN_USER_IDS={userId}
      </code>
    </div>
  );
}