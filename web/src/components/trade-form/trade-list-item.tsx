import { Button } from '@/components/ui/button';
import type { CreateTradeSchema } from '@/schemas';
import { X } from 'lucide-react';
import type { FC } from 'react';

type TradeListItemProps = {
  readonly trade: CreateTradeSchema;
  readonly onRemove: () => void;
  readonly disabled: boolean;
};

const formatTradeLineItem = (trade: CreateTradeSchema): string => {
  const formattedDate = new Date(trade.expiryDate).toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: '2-digit',
  });
  return `${trade.symbol} $${trade.strikePrice} ${trade.optionType} ${formattedDate} - ${trade.tradeType} ${trade.quantity} @ $${trade.costBasis}`;
};

export const TradeListItem: FC<TradeListItemProps> = ({ trade, onRemove, disabled }) => {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 border rounded-md">
      <span className="text-sm font-mono">{formatTradeLineItem(trade)}</span>
      <Button type="button" variant="ghost" size="sm" onClick={onRemove} disabled={disabled}>
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};
