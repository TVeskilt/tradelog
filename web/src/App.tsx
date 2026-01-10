import { Button } from '@/components/ui/button';
import { TradeFormModal } from '@/components/trade-form';
import { AppProvider } from '@/providers';
import { useState } from 'react';
import { Toaster } from 'sonner';

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <AppProvider>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">TradeLog</h1>
              <p className="text-muted-foreground mt-2">Track and manage your options trades</p>
            </div>
            <Button onClick={() => setIsModalOpen(true)}>Add Trade</Button>
          </div>
        </div>
        <TradeFormModal open={isModalOpen} onOpenChange={setIsModalOpen} />
      </div>
      <Toaster position="top-right" richColors />
    </AppProvider>
  );
}

export default App;
