import { Button } from '@/components/ui/button';
import {
  ReactHookForm,
  ReactHookFormDatePicker,
  ReactHookFormField,
  ReactHookFormSelect,
} from '@/components/react-hook-form';
import { useTradeApi, useTradeGroupApi } from '@/hooks';
import { CREATE_TRADE_SCHEMA, type CreateTradeSchema } from '@/schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import type { FC } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

type TradeFormProps = {
  readonly onSuccess?: () => void;
};

export const TradeForm: FC<TradeFormProps> = ({ onSuccess }) => {
  const { getTradeGroups } = useTradeGroupApi();
  const { createTrade } = useTradeApi();

  const { data: tradeGroupsResponse, isLoading: isLoadingGroups } = getTradeGroups();
  const tradeGroups = tradeGroupsResponse?.data ?? [];

  const form = useForm<CreateTradeSchema>({
    resolver: zodResolver(CREATE_TRADE_SCHEMA),
    mode: 'onChange',
    defaultValues: {
      symbol: '',
      strikePrice: undefined,
      expiryDate: '',
      tradeType: undefined,
      optionType: undefined,
      quantity: 1,
      costBasis: undefined,
      currentValue: undefined,
      notes: '',
      tradeGroupUuid: undefined,
    },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      const cleanedData = {
        ...data,
        notes: data.notes || undefined,
        tradeGroupUuid: data.tradeGroupUuid || undefined,
      };
      await createTrade.mutateAsync({ body: cleanedData });
      toast.success('Trade created successfully');
      form.reset({
        symbol: '',
        strikePrice: undefined,
        expiryDate: '',
        tradeType: undefined,
        optionType: undefined,
        quantity: 1,
        costBasis: undefined,
        currentValue: undefined,
        notes: '',
        tradeGroupUuid: undefined,
      });
      onSuccess?.();
    } catch (error) {
      console.error('Failed to create trade:', error);

      // Handle backend validation errors
      if (error instanceof Error && 'response' in error) {
        const response = (error as any).response;
        if (response?.status === 400 && response?.data?.message) {
          const messages = Array.isArray(response.data.message)
            ? response.data.message
            : [response.data.message];

          // Map backend errors to form fields
          messages.forEach((msg: string) => {
            const lowerMsg = msg.toLowerCase();
            if (lowerMsg.includes('symbol')) {
              form.setError('symbol', { message: msg });
            } else if (lowerMsg.includes('strike')) {
              form.setError('strikePrice', { message: msg });
            } else if (lowerMsg.includes('expiry')) {
              form.setError('expiryDate', { message: msg });
            } else if (lowerMsg.includes('type') && lowerMsg.includes('trade')) {
              form.setError('tradeType', { message: msg });
            } else if (lowerMsg.includes('type') && lowerMsg.includes('option')) {
              form.setError('optionType', { message: msg });
            } else if (lowerMsg.includes('quantity')) {
              form.setError('quantity', { message: msg });
            } else if (lowerMsg.includes('cost')) {
              form.setError('costBasis', { message: msg });
            } else if (lowerMsg.includes('value')) {
              form.setError('currentValue', { message: msg });
            }
          });
        }
        toast.error('Failed to create trade. Please check the form for errors.');
      } else {
        toast.error('Failed to create trade. Please try again.');
      }
    }
  });

  const groupOptions = tradeGroups.map((group) => ({
    value: group.uuid,
    label: `${group.name} - ${group.strategyType.replace(/_/g, ' ')}`,
  }));

  return (
    <ReactHookForm form={form} onSubmit={onSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            <ReactHookFormField
              name="symbol"
              label="Symbol"
              placeholder="e.g., AAPL"
              type="text"
              required
              disabled={createTrade.isPending}
            />

            <ReactHookFormField
              name="strikePrice"
              label="Strike Price"
              placeholder="e.g., 450.00"
              type="number"
              step="0.01"
              required
              disabled={createTrade.isPending}
            />

            <ReactHookFormDatePicker
              name="expiryDate"
              label="Expiry Date"
              placeholder="Select expiry date"
              required
              disabled={createTrade.isPending}
            />

            <ReactHookFormSelect
              name="tradeType"
              label="Trade Type"
              placeholder="Select type"
              required
              options={[
                { value: 'BUY', label: 'Buy' },
                { value: 'SELL', label: 'Sell' },
              ]}
              isDisabled={createTrade.isPending}
            />

            <ReactHookFormSelect
              name="optionType"
              label="Option Type"
              placeholder="Select option type"
              required
              options={[
                { value: 'CALL', label: 'Call' },
                { value: 'PUT', label: 'Put' },
              ]}
              isDisabled={createTrade.isPending}
            />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <ReactHookFormField
              name="quantity"
              label="Quantity"
              placeholder="e.g., 10"
              type="number"
              step="1"
              required
              disabled={createTrade.isPending}
            />

            <ReactHookFormField
              name="costBasis"
              label="Cost Basis"
              placeholder="e.g., -500.00"
              type="number"
              step="0.01"
              required
              disabled={createTrade.isPending}
            />

            <ReactHookFormField
              name="currentValue"
              label="Current Value"
              placeholder="e.g., -480.00"
              type="number"
              step="0.01"
              required
              disabled={createTrade.isPending}
            />

            <ReactHookFormSelect
              name="tradeGroupUuid"
              label="Trade Group"
              placeholder={isLoadingGroups ? 'Loading groups...' : 'Select group (optional)'}
              options={groupOptions}
              isDisabled={createTrade.isPending || isLoadingGroups}
            />

            <ReactHookFormField
              name="notes"
              label="Notes"
              placeholder="Trade reasoning or notes..."
              as="textarea"
              rows={3}
              disabled={createTrade.isPending}
            />
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <Button
            type="submit"
            disabled={createTrade.isPending}
            className="flex-1"
          >
            {createTrade.isPending ? 'Creating...' : 'Create Trade'}
          </Button>

          <Button
            type="button"
            variant="secondary"
            onClick={() => form.reset({
              symbol: '',
              strikePrice: undefined,
              expiryDate: '',
              tradeType: undefined,
              optionType: undefined,
              quantity: 1,
              costBasis: undefined,
              currentValue: undefined,
              notes: '',
              tradeGroupUuid: undefined,
            })}
            disabled={createTrade.isPending}
          >
            Reset
          </Button>
        </div>
      </ReactHookForm>
  );
};
