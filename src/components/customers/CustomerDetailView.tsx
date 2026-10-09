import React from 'react';
import { CustomerConversation } from '../chat/CustomerConversation';
import { TransactionType } from '../../types';

interface CustomerDetailViewProps {
  customerId: string;
  onBack: () => void;
  onAddEntryForCustomer: (customerId: string, defaultType?: 'sale' | 'payment') => void;
  onOpenScanBillForCustomer?: (customerId: string) => void;
  onOpenVoiceEntryForCustomer?: (customerId: string) => void;
}

export const CustomerDetailView: React.FC<CustomerDetailViewProps> = ({
  customerId,
  onBack,
  onAddEntryForCustomer,
  onOpenScanBillForCustomer,
  onOpenVoiceEntryForCustomer,
}) => {
  return (
    <div className="h-[calc(100vh-8rem)] md:h-[calc(100vh-6rem)] max-w-4xl mx-auto">
      <CustomerConversation
        customerId={customerId}
        onBack={onBack}
        onAddEntry={(type?: TransactionType) => onAddEntryForCustomer(customerId, type as any || 'sale')}
        onOpenScanBill={(mode) => onOpenScanBillForCustomer?.(customerId)}
        onOpenVoiceEntry={() => onOpenVoiceEntryForCustomer?.(customerId)}
        isTwoPanel={false}
      />
    </div>
  );
};
