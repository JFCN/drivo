import type { Metadata } from 'next';
import { ProfileView } from '@/features/profile/components/profile-view';

export const metadata: Metadata = {
  title: 'Perfil',
};

const ProfilePage = () => {
  return <ProfileView />;
};

export default ProfilePage;
