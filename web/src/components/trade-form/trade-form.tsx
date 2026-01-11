import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  ReactHookForm,
  ReactHookFormDatePicker,
  ReactHookFormField,
  ReactHookFormSelect,
} from '@/components/react-hook-form';
import { useTradeApi, useTradeGroupApi } from '@/hooks';
import { CREATE_TRADE_SCHEMA, type CreateTradeSchema } from '@/schemas';
import type { ApiError } from '@/types/api-error';
import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';
import type { FC } from 'react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

type TradeFormProps = {
  readonly onSuccess?: () => void;
};

type StrategyGroup = {
  name: string;
  strategyType: 'CALENDAR_SPREAD' | 'RATIO_CALENDAR_SPREAD' | 'CUSTOM';
  notes: string;
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

  const handleCreateSingleTrade = form.handleSubmit(async (data) => {
    try {
      const cleanedData = {
        ...data,
        notes: data.notes || undefined,
        tradeGroupUuid: undefined,
      };
      await createTrade.mutateAsync({ body: cleanedData });
      toast.success('Trade created successfully');
      form.reset(DEFAULT_TRADE_VALUES);
      onSuccess?.();
    } catch (error) {
      console.error('Failed to create trade:', error);
      const apiError = error as ApiError;
      if (apiError.response?.status === 400 && apiError.response?.data?.message) {
        const messages = Array.isArray(apiError.response.data.message)
          ? apiError.response.data.message
          : [apiError.response.data.message];

        const fieldMap: Record<string, keyof CreateTradeSchema> = {
          symbol: 'symbol',
          strike: 'strikePrice',
          expiry: 'expiryDate',
          quantity: 'quantity',
          cost: 'costBasis',
          value: 'currentValue',
          notes: 'notes',
        };

        messages.forEach((msg: string) => {
          const lowerMsg = msg.toLowerCase();
          if (lowerMsg.includes('type') && lowerMsg.includes('trade')) {
            form.setError('tradeType', { message: msg });
            return;
          }
          if (lowerMsg.includes('type') && lowerMsg.includes('option')) {
            form.setError('optionType', { message: msg });
            return;
          }
          for (const [keyword, field] of Object.entries(fieldMap)) {
            if (lowerMsg.includes(keyword)) {
              form.setError(field, { message: msg });
              return;
            }
          }
        });
        toast.error('Failed to create trade. Please check the form for errors.');
      } else {
        toast.error('Failed to create trade. Please try again.');
      }
    }
  });

  const handleCreateStrategy = async () => {
    if (tradesList.length < 2) {
      toast.error('Strategy must have at least 2 trades');
      return;
    }

    if (!strategyGroup.name.trim()) {
      toast.error('Strategy name is required');
      return;
    }

    try {
      await createStrategy.mutateAsync({
        body: {
          group: {
            name: strategyGroup.name,
            strategyType: strategyGroup.strategyType,
            notes: strategyGroup.notes || undefined,
          },
          trades: tradesList,
        },
      });
      toast.success(`Strategy '${strategyGroup.name}' created with ${tradesList.length} trades`);
      setTradesList([]);
      setStrategyGroup(DEFAULT_STRATEGY_GROUP);
      form.reset(DEFAULT_TRADE_VALUES);
      onSuccess?.();
    } catch (error) {
      console.error('Failed to create strategy:', error);
      toast.error('Failed to create strategy. Please try again.');
    }
  };

  const isSubmitting = createTrade.isPending || createStrategy.isPending;

  const formatTradeLineItem = (trade: CreateTradeSchema): string => {
    const formattedDate = new Date(trade.expiryDate).toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: '2-digit',
    });
    return `${trade.symbol} $${trade.strikePrice} ${trade.optionType} ${formattedDate} - ${trade.tradeType} ${trade.quantity} @ $${trade.costBasis}`;
  };

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
          <div className="space-y-4 p-4 border rounded-lg bg-blue-50">
            <h3 className="font-semibold text-lg">Strategy Details</h3>

            <div className="space-y-2">
              <Label htmlFor="strategy-name">
                Strategy Name <span className="text-red-500">*</span>
              </Label>
              <input
                id="strategy-name"
                type="text"
                placeholder="e.g., AAPL Calendar Spread Feb-15"
                className="w-full px-3 py-2 border rounded-md"
                value={strategyGroup.name}
                onChange={(e) => setStrategyGroup((prev) => ({ ...prev, name: e.target.value }))}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="strategy-type">
                Strategy Type <span className="text-red-500">*</span>
              </Label>
              <select
                id="strategy-type"
                className="w-full px-3 py-2 border rounded-md"
                value={strategyGroup.strategyType}
                onChange={(e) =>
                  setStrategyGroup((prev) => ({
                    ...prev,
                    strategyType: e.target.value as StrategyGroup['strategyType'],
                  }))
                }
                disabled={isSubmitting}
              >
                <option value="CUSTOM">Custom</option>
                <option value="CALENDAR_SPREAD">Calendar Spread</option>
                <option value="RATIO_CALENDAR_SPREAD">Ratio Calendar Spread</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="strategy-notes">Notes (optional)</Label>
              <Textarea
                id="strategy-notes"
                placeholder="Strategy notes..."
                rows={2}
                value={strategyGroup.notes}
                onChange={(e) => setStrategyGroup((prev) => ({ ...prev, notes: e.target.value }))}
                disabled={isSubmitting}
              />
            </div>
          </div>
        )}

        {isStrategyMode && tradesList.length > 0 && (
          <div className="space-y-2">
            <Label>Trades in strategy: {tradesList.length}</Label>
            <div className="space-y-2">
              {tradesList.map((trade, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 border rounded-md"
                >
                  <span className="text-sm font-mono">{formatTradeLineItem(trade)}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveTrade(index)}
                    disabled={isSubmitting}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
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
