import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  ReactHookForm,
  ReactHookFormDatePicker,
  ReactHookFormField,
  ReactHookFormSelect,
} from '@/components/react-hook-form';
import { useTradeApi, useTradeGroupApi } from '@/hooks';
import {
  applyValidationErrorsToForm,
  cleanTradeData,
  extractApiErrorMessages,
  isApiValidationError,
  prepareStrategyPayload,
  validateStrategyCreation,
} from '@/lib';
import { CREATE_TRADE_SCHEMA, type CreateTradeSchema } from '@/schemas';
import type { StrategyGroup } from '@/types/trade-form.types';
import { zodResolver } from '@hookform/resolvers/zod';
import type { FC } from 'react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { StrategySection } from './strategy-section';
import { TradeListItem } from './trade-list-item';

type TradeFormProps = {
  readonly onSuccess?: () => void;
};

const DEFAULT_TRADE_VALUES: Partial<CreateTradeSchema> = {
  symbol: '',
  expiryDate: '',
  quantity: 1,
  notes: '',
};

const DEFAULT_STRATEGY_GROUP: StrategyGroup = {
  name: '',
  strategyType: 'CUSTOM',
  notes: '',
};

export const TradeForm: FC<TradeFormProps> = ({ onSuccess }) => {
  const { createTrade } = useTradeApi();
  const { createStrategy } = useTradeGroupApi();

  const [isStrategyMode, setIsStrategyMode] = useState(false);
  const [strategyGroup, setStrategyGroup] = useState<StrategyGroup>(DEFAULT_STRATEGY_GROUP);
  const [tradesList, setTradesList] = useState<CreateTradeSchema[]>([]);

  const form = useForm<CreateTradeSchema>({
    resolver: zodResolver(CREATE_TRADE_SCHEMA),
    mode: 'onChange',
    defaultValues: DEFAULT_TRADE_VALUES,
  });

  const handleAddTradeToStrategy = form.handleSubmit((data) => {
    setTradesList((prev) => [...prev, data]);
    form.reset(DEFAULT_TRADE_VALUES);
    toast.success('Trade added to strategy');
  });

  const handleRemoveTrade = (index: number) => {
    setTradesList((prev) => prev.filter((_, i) => i !== index));
    toast.success('Trade removed from strategy');
  };

  const resetAllState = () => {
    setTradesList([]);
    setStrategyGroup(DEFAULT_STRATEGY_GROUP);
    form.reset(DEFAULT_TRADE_VALUES);
  };

  const handleCreateSingleTrade = form.handleSubmit(async (data) => {
    try {
      await createTrade.mutateAsync({ body: cleanTradeData(data) });
      toast.success('Trade created successfully');
      form.reset(DEFAULT_TRADE_VALUES);
      onSuccess?.();
    } catch (error) {
      console.error('Failed to create trade:', error);

      if (isApiValidationError(error)) {
        const messages = extractApiErrorMessages(error);
        applyValidationErrorsToForm(messages, form.setError);
        toast.error('Failed to create trade. Please check the form for errors.');
      } else {
        toast.error('Failed to create trade. Please try again.');
      }
    }
  });

  const handleCreateStrategy = async () => {
    const validationError = validateStrategyCreation(strategyGroup, tradesList);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    try {
      const payload = prepareStrategyPayload(strategyGroup, tradesList);
      await createStrategy.mutateAsync({ body: payload });
      toast.success(`Strategy '${strategyGroup.name}' created with ${tradesList.length} trades`);
      resetAllState();
      onSuccess?.();
    } catch (error) {
      console.error('Failed to create strategy:', error);
      toast.error('Failed to create strategy. Please try again.');
    }
  };

  const isSubmitting = createTrade.isPending || createStrategy.isPending;

  return (
    <div className="space-y-6">
      <ReactHookForm
        form={form}
        onSubmit={isStrategyMode ? handleAddTradeToStrategy : handleCreateSingleTrade}
        className="space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <ReactHookFormField
              name="symbol"
              label="Symbol"
              placeholder="e.g., AAPL"
              type="text"
              required
              disabled={isSubmitting}
            />

            <ReactHookFormField
              name="strikePrice"
              label="Strike Price"
              placeholder="e.g., 450.00"
              type="number"
              step="0.01"
              required
              disabled={isSubmitting}
            />

            <ReactHookFormDatePicker
              name="expiryDate"
              label="Expiry Date"
              placeholder="Select expiry date"
              required
              disabled={isSubmitting}
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
              isDisabled={isSubmitting}
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
              isDisabled={isSubmitting}
            />
          </div>

          <div className="space-y-6">
            <ReactHookFormField
              name="quantity"
              label="Quantity"
              placeholder="e.g., 10"
              type="number"
              step="1"
              required
              disabled={isSubmitting}
            />

            <ReactHookFormField
              name="costBasis"
              label="Cost Basis"
              placeholder="e.g., -500.00"
              type="number"
              step="0.01"
              required
              disabled={isSubmitting}
            />

            <ReactHookFormField
              name="currentValue"
              label="Current Value"
              placeholder="e.g., -480.00"
              type="number"
              step="0.01"
              required
              disabled={isSubmitting}
            />

            <ReactHookFormField
              name="notes"
              label="Notes"
              placeholder="Trade reasoning or notes..."
              as="textarea"
              rows={3}
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border">
          <Switch
            id="strategy-mode"
            checked={isStrategyMode}
            onCheckedChange={setIsStrategyMode}
            disabled={isSubmitting}
          />
          <Label htmlFor="strategy-mode" className="font-medium cursor-pointer">
            Build Multi-Leg Strategy
          </Label>
        </div>

        {isStrategyMode && (
          <StrategySection
            strategyGroup={strategyGroup}
            disabled={isSubmitting}
            onChange={(updates) => setStrategyGroup((prev) => ({ ...prev, ...updates }))}
          />
        )}

        {isStrategyMode && tradesList.length > 0 && (
          <div className="space-y-2">
            <Label>Trades in strategy: {tradesList.length}</Label>
            <div className="space-y-2">
              {tradesList.map((trade, index) => (
                <TradeListItem
                  key={index}
                  trade={trade}
                  onRemove={() => handleRemoveTrade(index)}
                  disabled={isSubmitting}
                />
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-4 pt-4">
          {isStrategyMode ? (
            <>
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {tradesList.length === 0 ? 'Add First' : 'Add Another'} Trade to Strategy
              </Button>
              {tradesList.length >= 2 && (
                <Button
                  type="button"
                  onClick={handleCreateStrategy}
                  disabled={isSubmitting || !strategyGroup.name.trim()}
                  className="flex-1"
                >
                  {createStrategy.isPending ? 'Creating...' : 'Create Strategy'}
                </Button>
              )}
            </>
          ) : (
            <>
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {createTrade.isPending ? 'Creating...' : 'Create Trade'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => form.reset(DEFAULT_TRADE_VALUES)}
                disabled={isSubmitting}
              >
                Reset
              </Button>
            </>
          )}
        </div>
      </ReactHookForm>
    </div>
  );
};
