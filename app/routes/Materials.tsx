import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { MaterialList } from './Materials/components/MaterialList';
import { ServiceList } from './Materials/components/ServiceList';
import { CategoryList } from './Materials/components/CategoryList';
import { UnitList } from './Materials/components/UnitList';
import { WarehouseList } from './Materials/components/WarehouseList';
import { VariantList } from './Materials/components/VariantList';

type MaterialTab = 'items' | 'service' | 'category' | 'unit' | 'warehouses' | 'variants';

export function Materials() {
  const [activeTab, setActiveTab] = useState<MaterialTab>('items');

  const tabs = [
    { id: 'items', label: 'Items' },
    { id: 'service', label: 'Service' },
    { id: 'category', label: 'Category' },
    { id: 'unit', label: 'Unit' },
    { id: 'warehouses', label: 'Warehouses' },
    { id: 'variants', label: 'Inventory Variants' },
  ];

  return (
    <div className="space-y-6">
      {/* Sub-tabs */}
      <div className="border-b border-slate-200 overflow-x-auto">
        <nav className="flex gap-8 min-w-max">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as MaterialTab)}
              className={cn(
                "pb-4 text-sm font-medium transition-colors relative whitespace-nowrap",
                activeTab === tab.id 
                  ? "text-blue-600 border-b-2 border-blue-600" 
                  : "text-slate-500 hover:text-slate-700"
              )}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Page Header Area */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 capitalize">
            {activeTab === 'items' ? 'Materials & Inventory' : 
             activeTab === 'variants' ? 'Inventory Variants' : 
             activeTab.replace('-', ' ')}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage your {activeTab === 'items' ? 'inventory items' : activeTab} and configurations.
          </p>
        </div>
      </div>

      {/* Tab Content */}
      <div className="mt-4">
        {activeTab === 'items' && <MaterialList />}
        {activeTab === 'service' && <ServiceList />}
        {activeTab === 'category' && <CategoryList />}
        {activeTab === 'unit' && <UnitList />}
        {activeTab === 'warehouses' && <WarehouseList />}
        {activeTab === 'variants' && <VariantList />}
      </div>
    </div>
  );
}
