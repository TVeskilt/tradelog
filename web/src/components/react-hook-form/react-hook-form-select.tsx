import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { ComponentProps, FC } from 'react';
import { useFormContext } from 'react-hook-form';

type ReactHookFormSelectProps = {
  readonly name: string;
  readonly label?: string;
  readonly placeholder?: string;
  readonly required?: boolean;
  readonly className?: string;
  readonly options: (Pick<ComponentProps<typeof SelectItem>, 'value'> & {
    readonly label: string;
  })[];
  readonly isDisabled?: boolean;
};

export const ReactHookFormSelect: FC<ReactHookFormSelectProps> = ({
  name,
  label,
  placeholder,
  required = false,
  options,
  className,
  isDisabled,
}) => {
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name={name}
      disabled={isDisabled}
      render={({ field }) => {
        return (
          <FormItem>
            {label && (
              <FormLabel>
                {label}
                {required && <span className="text-destructive ml-1">*</span>}
              </FormLabel>
            )}
            <Select
              onValueChange={(value) => {
                const lowerValue = value.toLowerCase();
                if (['true', 'false', '1', '0'].includes(lowerValue)) {
                  return field.onChange(lowerValue === 'true' || lowerValue === '1');
                }
                field.onChange(value);
              }}
              required={required}
              value={typeof field.value === 'boolean' ? `${field.value}` : field.value}
              defaultValue={typeof field.value === 'boolean' ? `${field.value}` : field.value}
              disabled={field.disabled}
            >
              <FormControl>
                <SelectTrigger className={cn('w-full cursor-pointer', className)}>
                  <SelectValue placeholder={placeholder} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {options.map((option, i) => (
                  <SelectItem
                    key={`${i}_${option.label}`}
                    value={option.value}
                    className="cursor-pointer"
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
};
