import type { Metadata } from 'next';
import { RegisterForm } from '@/features/auth/components/register-form';

export const metadata: Metadata = {
  title: 'Criar conta',
};

const RegisterPage = () => {
  return <RegisterForm />;
};

export default RegisterPage;
