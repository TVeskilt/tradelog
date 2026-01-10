import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { FC, HTMLInputTypeAttribute } from 'react';
import { useFormContext } from 'react-hook-form';

type ReactHookFormFieldProps = {
  readonly name: string;
  readonly label?: string;
  readonly placeholder?: string;
  readonly type?: HTMLInputTypeAttribute;
  readonly required?: boolean;
  readonly disabled?: boolean;
  readonly className?: string;
  readonly as?: 'input' | 'textarea';
  readonly rows?: number;
  readonly step?: string | number;
};

export const ReactHookFormField: FC<ReactHookFormFieldProps> = ({
  name,
  label,
  placeholder,
  type,
  required = false,
  disabled = false,
  className,
  as = 'input',
  rows = 3,
  step,
}) => {
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          {label && (
            <FormLabel>
              {label}
              {required && <span className="text-destructive ml-1">*</span>}
            </FormLabel>
          )}
          <FormControl>
            {as === 'input' ? (
              <Input
                {...field}
                type={type}
                placeholder={placeholder}
                required={required}
                className={className}
                disabled={disabled}
                step={step}
                onChange={(e) => {
                  // Handle number inputs
                  if (type === 'number') {
                    const value = e.target.value === '' ? undefined : Number(e.target.value);
                    field.onChange(value);
                  } else {
                    field.onChange(e.target.value);
                  }
                }}
                value={field.value ?? ''}
              />
            ) : (
              <Textarea
                {...field}
                placeholder={placeholder}
                required={required}
                className={className}
                disabled={disabled}
                rows={rows}
                value={field.value ?? ''}
              />
            )}
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
