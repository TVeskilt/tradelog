import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { FC } from 'react';
import { TradeForm } from './trade-form';

type TradeFormModalProps = {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
};

export const TradeFormModal: FC<TradeFormModalProps> = ({ open, onOpenChange }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Trade</DialogTitle>
          <DialogDescription>
            Enter options trade details for portfolio tracking
          </DialogDescription>
        </DialogHeader>
        <TradeForm onSuccess={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
};
