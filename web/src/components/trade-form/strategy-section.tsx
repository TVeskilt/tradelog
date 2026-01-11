import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { StrategyGroup } from '@/types/trade-form.types';
import type { FC } from 'react';

type StrategySectionProps = {
  readonly strategyGroup: StrategyGroup;
  readonly disabled: boolean;
  readonly onChange: (updates: Partial<StrategyGroup>) => void;
};

export const StrategySection: FC<StrategySectionProps> = ({
  strategyGroup,
  disabled,
  onChange,
}) => {
  return (
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
          onChange={(e) => onChange({ name: e.target.value })}
          disabled={disabled}
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
            onChange({
              strategyType: e.target.value as 'CALENDAR_SPREAD' | 'RATIO_CALENDAR_SPREAD' | 'CUSTOM',
            })
          }
          disabled={disabled}
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
          onChange={(e) => onChange({ notes: e.target.value })}
          disabled={disabled}
        />
      </div>
    </div>
  );
};
