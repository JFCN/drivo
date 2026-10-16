import type { ReactNode } from 'react';

type FormSectionProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export const FormSection = ({ title, description, children }: FormSectionProps) => {
  return (
    <section className="rounded-card bg-surface p-6 sm:p-7">
      <h2 className="text-title-3">{title}</h2>
      <p className="mt-0.5 text-body text-text-secondary">{description}</p>
      <div className="mt-6 grid gap-x-4 gap-y-5">{children}</div>
    </section>
  );
};
