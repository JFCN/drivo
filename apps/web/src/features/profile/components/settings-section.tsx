import type { ReactNode } from 'react';

type SettingsSectionProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export const SettingsSection = ({ title, description, children }: SettingsSectionProps) => {
  return (
    <section className="grid gap-5 md:grid-cols-[17.5rem_minmax(0,1fr)] md:gap-10">
      <div>
        <h2 className="text-title-3">{title}</h2>
        <p className="mt-2 text-body text-text-secondary">{description}</p>
      </div>
      {children}
    </section>
  );
};

type SettingsCardProps = {
  footerText?: string;
  footerAction?: ReactNode;
  children: ReactNode;
};

export const SettingsCard = ({ footerText, footerAction, children }: SettingsCardProps) => {
  return (
    <div className="overflow-hidden rounded-card bg-surface">
      <div className="grid gap-x-4 gap-y-5 p-6">{children}</div>
      {(footerText || footerAction) && (
        <div className="flex items-center justify-between gap-4 bg-white/[0.025] px-6 py-4">
          <p className="text-callout font-normal text-text-tertiary">{footerText}</p>
          {footerAction}
        </div>
      )}
    </div>
  );
};
