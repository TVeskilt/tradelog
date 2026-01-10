import { Form } from '@/components/ui/form';
import { cn } from '@/lib/utils';
import type { PropsWithChildren } from 'react';
import { type FieldValues, type UseFormReturn } from 'react-hook-form';

export type ReactHookFormProps<T extends FieldValues = FieldValues> = PropsWithChildren<{
  readonly onSubmit?: () => void;
  readonly form: UseFormReturn<T>;
  readonly className?: string;
}>;

export const ReactHookForm = <T extends FieldValues = FieldValues>({
  children,
  onSubmit,
  form,
  className,
}: ReactHookFormProps<T>) => {
  return (
    <Form {...form}>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit?.();
        }}
        className={cn('grid gap-y-6', className)}
        noValidate
      >
        {children}
      </form>
    </Form>
  );
};
