import React, { useState, useEffect } from 'react';
import { 
  supabase,
  Material, 
} from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Plus, 
  Search, 
  Columns, 
  MoreHorizontal,
  Edit2,
  Trash2,
  IndianRupee,
  FileText,
  Settings,
  Layers,
  RefreshCw,
} from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useMaterialsData } from '../hooks/useMaterials';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';

export function MaterialList() {
  const { queries, mutations } = useMaterialsData();
  const { data: materials, isLoading } = queries.materials;
  const { data: categories } = queries.categories;
  const { data: units } = queries.units;
  const { data: companyVariants } = queries.variants;

  const [searchTerm, setSearchTerm] = useState('');
  const [hideInactive, setHideInactive] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [usesVariant, setUsesVariant] = useState(false);
  const [variantPricingRows, setVariantPricingRows] = useState<any[]>([]);
  
  // Column Visibility State
  const [visibleColumns, setVisibleColumns] = useState<string[]>(['Name', 'Code', 'Category', 'Unit', 'Variants', 'Price', 'Status']);
  
  const allColumns = ['Name', 'Display Name', 'Item Code', 'Category', 'Sub Category', 'Unit', 'Sale Price', 'Purchase Price', 'GST Rate', 'HSN Code', 'Size', 'Pressure Class', 'Schedule Type', 'Material', 'End Connection', 'Variants', 'Status'];

  const toggleColumn = (columnId: string) => {
    setVisibleColumns(prev => 
      prev.includes(columnId) 
        ? prev.filter(id => id !== columnId) 
        : [...prev, columnId]
    );
  };

  const { data: variantPricing } = useQuery({
    queryKey: ['variant-pricing', editingMaterial?.id],
    queryFn: async () => {
      if (!editingMaterial?.id) return [];
      const { data, error } = await supabase
        .from('item_variant_pricing')
        .select('*')
        .eq('item_id', editingMaterial.id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!editingMaterial?.id && editingMaterial.uses_variant,
  });

  useEffect(() => {
    if (variantPricing) {
      setVariantPricingRows(variantPricing);
    } else if (!editingMaterial) {
      setVariantPricingRows([]);
    }
  }, [variantPricing, editingMaterial]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    const materialData = {
      name: data.name as string,
      display_name: data.display_name as string,
      item_code: data.item_code as string || null,
      category: data.category as string,
      sub_category: data.sub_category as string,
      unit: data.unit as string,
      sale_price: parseFloat(data.sale_price as string) || 0,
      purchase_price: parseFloat(data.purchase_price as string) || 0,
      gst_rate: parseFloat(data.gst_rate as string) || 0,
      hsn_code: data.hsn_code as string,
      size: data.size as string,
      pressure_class: data.pressure_class as string,
      schedule_type: data.schedule_type as string,
      material: data.material as string,
      end_connection: data.end_connection as string,
      uses_variant: usesVariant,
      is_active: true,
      stock: editingMaterial?.stock || 0,
      variantPricing: usesVariant ? variantPricingRows : []
    };

    if (editingMaterial) {
      mutations.updateMaterial.mutate({ id: editingMaterial.id, ...materialData }, {
        onSuccess: () => setIsDialogOpen(false)
      });
    } else {
      mutations.addMaterial.mutate(materialData, {
        onSuccess: () => setIsDialogOpen(false)
      });
    }
  };

  const filteredMaterials = materials?.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (m.item_code?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    const matchesCategory = selectedCategory === 'all' || m.category === selectedCategory;
    const matchesStatus = !hideInactive || m.is_active;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Search items..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-11 md:h-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox 
              id="hide-inactive" 
              checked={hideInactive} 
              onCheckedChange={(checked) => setHideInactive(!!checked)} 
            />
            <Label htmlFor="hide-inactive" className="text-sm cursor-pointer">Hide Inactive</Label>
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[180px] h-11 md:h-9 bg-slate-50">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories?.map(cat => (
                <SelectItem key={cat.id} value={cat.category_name}>{cat.category_name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 text-slate-600 hidden md:flex h-9">
                <Columns className="w-4 h-4" /> Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 max-h-96 overflow-y-auto">
              <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {allColumns.map((col) => (
                <div 
                  key={col} 
                  className="flex items-center gap-2 px-2 py-1.5 cursor-pointer hover:bg-slate-50 rounded-sm"
                  onClick={() => toggleColumn(col)}
                >
                  <Checkbox checked={visibleColumns.includes(col)} />
                  <span className="text-sm">{col}</span>
                </div>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="outline" size="sm" className="gap-2 text-slate-600 hidden md:flex h-9">
            <RefreshCw className="w-4 h-4" /> Bulk Price Update
          </Button>

          <Button 
            className="bg-blue-600 hover:bg-blue-700 gap-2 h-11 md:h-9 flex-1 md:flex-none font-semibold shadow-lg shadow-blue-600/20"
            onClick={() => {
              setEditingMaterial(null);
              setUsesVariant(false);
              setVariantPricingRows([]);
              setIsDialogOpen(true);
            }}
          >
            <Plus className="w-4 h-4" /> Add New Item
          </Button>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
              <DialogHeader className="p-6 pb-2">
                <DialogTitle className="text-2xl font-bold">{editingMaterial ? 'Edit' : 'Add New'} Inventory Item</DialogTitle>
              </DialogHeader>
              
              <div className="flex-1 overflow-y-auto p-6 pt-0 custom-scrollbar">
                <form id="material-form" onSubmit={handleSubmit} className="py-4">
                  <div className="space-y-10">
                    <section className="space-y-4">
                      <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                        <div className="p-2 bg-blue-50 rounded-lg">
                          <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">General Information</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50 p-6 rounded-xl border border-slate-100">
                        <div className="space-y-2">
                          <Label htmlFor="name">Item Name *</Label>
                          <Input id="name" name="name" defaultValue={editingMaterial?.name || ''} placeholder="e.g. Gate Valve" required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="display_name">Display Name (Internal)</Label>
                          <Input id="display_name" name="display_name" defaultValue={editingMaterial?.display_name || ''} placeholder="e.g. GV-2024-Red" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="item_code">Part Number / Code</Label>
                          <Input id="item_code" name="item_code" defaultValue={editingMaterial?.item_code || ''} placeholder="e.g. ITEM-001" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="category">Primary Category *</Label>
                          <Select name="category" defaultValue={editingMaterial?.category}>
                            <SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger>
                            <SelectContent>
                              {categories?.map(cat => (
                                <SelectItem key={cat.id} value={cat.category_name}>{cat.category_name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="sub_category">Sub-Category</Label>
                          <Input id="sub_category" name="sub_category" defaultValue={editingMaterial?.sub_category || ''} placeholder="e.g. Industrial Valves" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="unit">Base Unit of Measure *</Label>
                          <Select name="unit" defaultValue={editingMaterial?.unit}>
                            <SelectTrigger><SelectValue placeholder="Select Unit" /></SelectTrigger>
                            <SelectContent>
                              {units?.map(u => (
                                <SelectItem key={u.id} value={u.unit_code}>{u.unit_name} ({u.unit_code})</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </section>

                    <section className="space-y-4">
                      <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                        <div className="p-2 bg-emerald-50 rounded-lg">
                          <IndianRupee className="w-5 h-5 text-emerald-600" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">Pricing & Tax Details</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-emerald-50/20 p-6 rounded-xl border border-emerald-100/50">
                        <div className="space-y-2">
                          <Label htmlFor="sale_price">Standard Sale Price (₹)</Label>
                          <div className="relative">
                            <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input id="sale_price" name="sale_price" type="number" step="0.01" defaultValue={editingMaterial?.sale_price || 0} className="pl-9" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="purchase_price">Standard Purchase Price (₹)</Label>
                          <div className="relative">
                            <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input id="purchase_price" name="purchase_price" type="number" step="0.01" defaultValue={editingMaterial?.purchase_price || 0} className="pl-9" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="gst_rate">GST Rate (%)</Label>
                          <Select name="gst_rate" defaultValue={editingMaterial?.gst_rate?.toString() || "18"}>
                            <SelectTrigger><SelectValue placeholder="Tax %" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="0">0% (Exempt)</SelectItem>
                              <SelectItem value="5">5%</SelectItem>
                              <SelectItem value="12">12%</SelectItem>
                              <SelectItem value="18">18%</SelectItem>
                              <SelectItem value="28">28%</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="hsn_code">HSN / SAC Code</Label>
                          <Input id="hsn_code" name="hsn_code" defaultValue={editingMaterial?.hsn_code || ''} placeholder="e.g. 8481" />
                        </div>
                      </div>
                    </section>

                    <section className="space-y-4">
                      <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                        <div className="p-2 bg-amber-50 rounded-lg">
                          <Settings className="w-5 h-5 text-amber-600" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">Technical Specifications</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-slate-50/50 p-6 rounded-xl border border-slate-100">
                        <div className="space-y-2">
                          <Label htmlFor="size">Size / Dimensions</Label>
                          <Input id="size" name="size" defaultValue={editingMaterial?.size || ''} placeholder="e.g. 2 inch" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="pressure_class">Pressure Class</Label>
                          <Input id="pressure_class" name="pressure_class" defaultValue={editingMaterial?.pressure_class || ''} placeholder="e.g. Class 150" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="schedule_type">Schedule Type</Label>
                          <Input id="schedule_type" name="schedule_type" defaultValue={editingMaterial?.schedule_type || ''} placeholder="e.g. SCH 40" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="material">Body Material</Label>
                          <Input id="material" name="material" defaultValue={editingMaterial?.material || ''} placeholder="e.g. Stainless Steel" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="end_connection">End Connection</Label>
                          <Input id="end_connection" name="end_connection" defaultValue={editingMaterial?.end_connection || ''} placeholder="e.g. Flanged" />
                        </div>
                      </div>
                    </section>

                    <section className="space-y-4">
                      <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                        <div className="p-2 bg-purple-50 rounded-lg">
                          <Layers className="w-5 h-5 text-purple-600" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">Inventory Variants</h3>
                      </div>
                      <div className="bg-white border rounded-xl p-6 space-y-4 shadow-sm border-slate-200">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label className="text-base font-bold">Enable Variants</Label>
                            <p className="text-sm text-slate-500">Allow multiple makes (e.g. Jindal, Tata) for this item with custom pricing.</p>
                          </div>
                          <Checkbox 
                            checked={usesVariant} 
                            onCheckedChange={(checked) => {
                              setUsesVariant(!!checked);
                              if (checked && variantPricingRows.length === 0) {
                                setVariantPricingRows(companyVariants?.map(v => ({
                                  company_variant_id: v.id,
                                  variant_name: v.variant_name,
                                  make: '',
                                  sale_price: editingMaterial?.sale_price || 0,
                                  purchase_price: editingMaterial?.purchase_price || 0
                                })) || []);
                              }
                            }} 
                          />
                        </div>

                        {usesVariant && (
                          <div className="space-y-4 pt-4 border-t border-slate-100">
                            {variantPricingRows.map((row, idx) => (
                              <div key={row.company_variant_id} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-lg items-end border border-slate-100">
                                <div className="space-y-1">
                                  <Label className="text-[10px] uppercase text-slate-500 font-bold">Make / Brand</Label>
                                  <Input 
                                    placeholder="e.g. Jindal"
                                    value={row.make || ''}
                                    onChange={(e) => {
                                      const newRows = [...variantPricingRows];
                                      newRows[idx].make = e.target.value;
                                      setVariantPricingRows(newRows);
                                    }}
                                  />
                                </div>
                                <div className="space-y-1">
                                  <Label className="text-[10px] uppercase text-slate-500 font-bold">Sale Price (₹)</Label>
                                  <Input 
                                    type="number"
                                    value={row.sale_price || 0}
                                    onChange={(e) => {
                                      const newRows = [...variantPricingRows];
                                      newRows[idx].sale_price = parseFloat(e.target.value);
                                      setVariantPricingRows(newRows);
                                    }}
                                  />
                                </div>
                                <div className="space-y-1">
                                  <Label className="text-[10px] uppercase text-slate-500 font-bold">Purchase Price (₹)</Label>
                                  <Input 
                                    type="number"
                                    value={row.purchase_price || 0}
                                    onChange={(e) => {
                                      const newRows = [...variantPricingRows];
                                      newRows[idx].purchase_price = parseFloat(e.target.value);
                                      setVariantPricingRows(newRows);
                                    }}
                                  />
                                </div>
                                <div className="flex items-center h-10 px-2 text-xs font-bold text-blue-600 bg-blue-50 rounded border border-blue-100">
                                  {row.variant_name}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </section>
                  </div>
                </form>
              </div>

              <DialogFooter className="p-6 pt-4 border-t bg-slate-50/50 rounded-b-lg">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Discard Changes</Button>
                <Button 
                  form="material-form"
                  type="submit" 
                  className="bg-blue-600 hover:bg-blue-700 min-w-[140px] font-bold" 
                  disabled={mutations.addMaterial.isPending || mutations.updateMaterial.isPending}
                >
                  {editingMaterial ? 'Update Inventory' : 'Add to Inventory'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="hidden md:block rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 border-b border-slate-200">
              {visibleColumns.includes('Name') && <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Name</TableHead>}
              {visibleColumns.includes('Display Name') && <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Display Name</TableHead>}
              {visibleColumns.includes('Item Code') && <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Code</TableHead>}
              {visibleColumns.includes('Category') && <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Category</TableHead>}
              {visibleColumns.includes('Sub Category') && <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Sub Category</TableHead>}
              {visibleColumns.includes('Unit') && <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Unit</TableHead>}
              {visibleColumns.includes('Sale Price') && <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Sale Price</TableHead>}
              {visibleColumns.includes('Purchase Price') && <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Purchase Price</TableHead>}
              {visibleColumns.includes('GST Rate') && <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-500">GST Rate</TableHead>}
              {visibleColumns.includes('HSN Code') && <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-500">HSN Code</TableHead>}
              {visibleColumns.includes('Size') && <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Size</TableHead>}
              {visibleColumns.includes('Pressure Class') && <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Pressure Class</TableHead>}
              {visibleColumns.includes('Schedule Type') && <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Schedule Type</TableHead>}
              {visibleColumns.includes('Material') && <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Material</TableHead>}
              {visibleColumns.includes('End Connection') && <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-500">End Connection</TableHead>}
              {visibleColumns.includes('Variants') && <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Variants</TableHead>}
              {visibleColumns.includes('Status') && <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Status</TableHead>}
              <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-500 text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
               <TableRow><TableCell colSpan={visibleColumns.length + 1} className="text-center py-12 text-slate-500">Fetching inventory items...</TableCell></TableRow>
            ) : filteredMaterials?.length === 0 ? (
              <TableRow><TableCell colSpan={visibleColumns.length + 1} className="text-center py-12 text-slate-500">No items found matching your search.</TableCell></TableRow>
            ) : filteredMaterials?.map(item => (
              <TableRow key={item.id} className="hover:bg-slate-50/50 transition-colors">
                {visibleColumns.includes('Name') && (
                  <TableCell className="font-semibold text-slate-900">
                    <div>{item.name}</div>
                  </TableCell>
                )}
                {visibleColumns.includes('Display Name') && <TableCell className="text-slate-600">{item.display_name || '-'}</TableCell>}
                {visibleColumns.includes('Item Code') && <TableCell className="text-slate-600">{item.item_code}</TableCell>}
                {visibleColumns.includes('Category') && <TableCell className="text-slate-600">{item.category}</TableCell>}
                {visibleColumns.includes('Sub Category') && <TableCell className="text-slate-600">{item.sub_category || '-'}</TableCell>}
                {visibleColumns.includes('Unit') && <TableCell className="text-slate-600 uppercase">{item.unit}</TableCell>}
                {visibleColumns.includes('Sale Price') && <TableCell className="text-slate-600 font-medium text-right">₹{item.sale_price?.toLocaleString()}</TableCell>}
                {visibleColumns.includes('Purchase Price') && <TableCell className="text-slate-600 font-medium text-right">₹{item.purchase_price?.toLocaleString()}</TableCell>}
                {visibleColumns.includes('GST Rate') && <TableCell className="text-slate-600">{item.gst_rate}%</TableCell>}
                {visibleColumns.includes('HSN Code') && <TableCell className="text-slate-600">{item.hsn_code || '-'}</TableCell>}
                {visibleColumns.includes('Size') && <TableCell className="text-slate-600">{item.size || '-'}</TableCell>}
                {visibleColumns.includes('Pressure Class') && <TableCell className="text-slate-600">{item.pressure_class || '-'}</TableCell>}
                {visibleColumns.includes('Schedule Type') && <TableCell className="text-slate-600">{item.schedule_type || '-'}</TableCell>}
                {visibleColumns.includes('Material') && <TableCell className="text-slate-600">{item.material || '-'}</TableCell>}
                {visibleColumns.includes('End Connection') && <TableCell className="text-slate-600">{item.end_connection || '-'}</TableCell>}
                {visibleColumns.includes('Variants') && (
                  <TableCell>
                    {item.uses_variant ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 text-blue-600 text-[10px] font-bold uppercase">
                        <Layers className="w-3 h-3" /> Multi
                      </span>
                    ) : (
                      <span className="text-slate-400 text-xs">-</span>
                    )}
                  </TableCell>
                )}
                {visibleColumns.includes('Status') && (
                  <TableCell>
                    <span className={cn(
                      "px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                      item.is_active ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"
                    )}>
                      {item.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </TableCell>
                )}
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-100"><MoreHorizontal className="w-4 h-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem onClick={() => { setEditingMaterial(item); setUsesVariant(item.uses_variant || false); setIsDialogOpen(true); }}>
                        <Edit2 className="w-4 h-4 mr-2" /> Edit Item
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600 focus:text-red-700 focus:bg-red-50" onClick={() => { if(confirm('Are you sure you want to delete this item?')) mutations.deleteMaterial.mutate(item.id); }}>
                        <Trash2 className="w-4 h-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="md:hidden space-y-3">
        {filteredMaterials?.map(item => (
          <Card key={item.id} className="overflow-hidden border-slate-200 shadow-sm active:bg-slate-50 transition-colors">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-slate-900 leading-tight">{item.name}</h3>
                  <p className="text-[10px] text-slate-500 font-medium uppercase">{item.item_code || 'No Code'} • {item.category}</p>
                </div>
                <Badge variant="secondary" className={cn(
                  "text-[9px] uppercase font-bold",
                  item.is_active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
                )}>
                  {item.is_active ? 'Live' : 'Hidden'}
                </Badge>
              </div>
              <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-50">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block leading-none">Price per {item.unit}</span>
                  <span className="text-base font-bold text-blue-600 leading-none block mt-1">₹{item.sale_price?.toLocaleString()}</span>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" className="h-9 p-0 px-2" onClick={() => { setEditingMaterial(item); setUsesVariant(item.uses_variant || false); setIsDialogOpen(true); }}>
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-9 p-0 px-2 text-red-600" onClick={() => { if(confirm('Delete this item?')) mutations.deleteMaterial.mutate(item.id); }}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
