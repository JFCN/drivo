import { Button } from './button';
import { Icon } from './icon';

type ErrorStateProps = {
  title?: string;
  message: string;
  onRetry?: () => void;
  retrying?: boolean;
};

export const ErrorState = ({ title = 'Não foi possível carregar', message, onRetry, retrying }: ErrorStateProps) => {
  return (
    <div role="alert" className="flex flex-col items-center px-6 py-16 text-center">
      <span className="grid size-12 place-items-center rounded-full bg-danger/15 text-danger">
        <Icon name="error" className="size-6" />
      </span>
      <h2 className="mt-4 text-title-3">{title}</h2>
      <p className="mt-1 max-w-sm text-body text-text-secondary">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="md" className="mt-6" onClick={onRetry} loading={retrying}>
          <Icon name="refresh" className="size-4" />
          Tentar novamente
        </Button>
      )}
    </div>
  );
};
