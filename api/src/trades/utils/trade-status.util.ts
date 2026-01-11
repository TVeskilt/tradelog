import { TradeStatus } from '@prisma/client';
import { differenceInDays } from 'date-fns';

export class TradeStatusUtil {
  static calculateDaysUntilExpiry(expiryDate: Date): number {
    return differenceInDays(expiryDate, new Date());
  }

  static deriveStatusFromDays(daysUntilExpiry: number): TradeStatus {
    if (daysUntilExpiry < 0) {
      return TradeStatus.CLOSED;
    }

    if (daysUntilExpiry <= 7) {
      return TradeStatus.CLOSING_SOON;
    }

    return TradeStatus.OPEN;
  }
}
