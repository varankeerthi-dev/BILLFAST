import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, Material, Service, ItemCategory, ItemUnit, CompanyVariant, Warehouse } from '@/lib/supabase';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export function useMaterialsData() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const orgId = user?.profile?.organisation_id;

  // Queries
  const materialsQuery = useQuery({
    queryKey: ['materials', orgId],
    enabled: !!orgId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('materials')
        .select('*')
        .eq('organisation_id', orgId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Material[];
    },
  });

  const servicesQuery = useQuery({
    queryKey: ['services', orgId],
    enabled: !!orgId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('organisation_id', orgId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Service[];
    },
  });

  const categoriesQuery = useQuery({
    queryKey: ['item-categories', orgId],
    enabled: !!orgId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('item_categories')
        .select('*')
        .eq('organisation_id', orgId)
        .eq('is_active', true)
        .order('category_name', { ascending: true });
      if (error) throw error;
      return data as ItemCategory[];
    },
  });

  const unitsQuery = useQuery({
    queryKey: ['item-units', orgId],
    enabled: !!orgId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('item_units')
        .select('*')
        .eq('organisation_id', orgId)
        .eq('is_active', true)
        .order('unit_name', { ascending: true });
      if (error) throw error;
      return data as ItemUnit[];
    },
  });

  const variantsQuery = useQuery({
    queryKey: ['company-variants', orgId],
    enabled: !!orgId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('company_variants')
        .select('*')
        .eq('organisation_id', orgId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data as CompanyVariant[];
    },
  });

  const warehousesQuery = useQuery({
    queryKey: ['warehouses', orgId],
    enabled: !!orgId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('warehouses')
        .select('*')
        .eq('organisation_id', orgId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data as Warehouse[];
    },
  });

  // Mutations
  const addMaterialMutation = useMutation({
    mutationFn: async (newMaterial: any) => {
      if (!orgId) throw new Error("Organisation ID missing");
      const { variantPricing, ...materialData } = newMaterial;
      const { data, error } = await supabase
        .from('materials')
        .insert([{ ...materialData, organisation_id: orgId }])
        .select();
      
      if (error) throw error;
      const material = data[0];

      if (materialData.uses_variant && variantPricing?.length > 0) {
        const pricingData = variantPricing.map((p: any) => ({
          item_id: material.id,
          organisation_id: orgId,
          company_variant_id: p.company_variant_id,
          make: p.make,
          sale_price: p.sale_price,
          purchase_price: p.purchase_price,
          is_active: true
        }));

        const { error: pricingError } = await supabase
          .from('item_variant_pricing')
          .insert(pricingData);
        
        if (pricingError) throw pricingError;
      }

      return material;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
      toast.success('Item added successfully');
    },
    onError: (error: any) => toast.error(`Error adding item: ${error.message}`),
  });

  const updateMaterialMutation = useMutation({
    mutationFn: async ({ id, variantPricing, ...updates }: any) => {
      const { data, error } = await supabase
        .from('materials')
        .update(updates)
        .eq('id', id)
        .select();
      
      if (error) throw error;

      if (updates.uses_variant) {
        await supabase.from('item_variant_pricing').delete().eq('item_id', id);
        if (variantPricing?.length > 0) {
          const pricingData = variantPricing.map((p: any) => ({
            item_id: id,
            organisation_id: orgId,
            company_variant_id: p.company_variant_id,
            make: p.make,
            sale_price: p.sale_price,
            purchase_price: p.purchase_price,
            is_active: true
          }));
          const { error: pricingError } = await supabase.from('item_variant_pricing').insert(pricingData);
          if (pricingError) throw pricingError;
        }
      } else {
        await supabase.from('item_variant_pricing').delete().eq('item_id', id);
      }
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
      toast.success('Item updated successfully');
    },
    onError: (error: any) => toast.error(`Error updating item: ${error.message}`),
  });

  const deleteMaterialMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('materials').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
      toast.success('Item deleted successfully');
    },
    onError: (error: any) => toast.error(`Error deleting item: ${error.message}`),
  });

  const addServiceMutation = useMutation({
    mutationFn: async (newService: any) => {
      if (!orgId) throw new Error("Organisation ID missing");
      const { data, error } = await supabase.from('services').insert([{ ...newService, organisation_id: orgId }]).select();
      if (error) throw error;
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast.success('Service added successfully');
    },
    onError: (error: any) => toast.error(`Error adding service: ${error.message}`),
  });

  const updateServiceMutation = useMutation({
    mutationFn: async ({ id, ...updates }: any) => {
      const { data, error } = await supabase.from('services').update(updates).eq('id', id).select();
      if (error) throw error;
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast.success('Service updated successfully');
    },
    onError: (error: any) => toast.error(`Error updating service: ${error.message}`),
  });

  const deleteServiceMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('services').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast.success('Service deleted successfully');
    },
    onError: (error: any) => toast.error(`Error deleting service: ${error.message}`),
  });

  const addVariantMutation = useMutation({
    mutationFn: async (newVariant: any) => {
      if (!orgId) throw new Error("Organisation ID missing");
      const { data, error } = await supabase.from('company_variants').insert([{ ...newVariant, organisation_id: orgId }]).select();
      if (error) throw error;
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-variants'] });
      toast.success('Variant added successfully');
    },
    onError: (error: any) => toast.error(`Error adding variant: ${error.message}`),
  });

  const updateVariantMutation = useMutation({
    mutationFn: async ({ id, ...updates }: any) => {
      const { data, error } = await supabase.from('company_variants').update(updates).eq('id', id).select();
      if (error) throw error;
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-variants'] });
      toast.success('Variant updated successfully');
    },
    onError: (error: any) => toast.error(`Error updating variant: ${error.message}`),
  });

  const deleteVariantMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('company_variants').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-variants'] });
      toast.success('Variant deleted successfully');
    },
    onError: (error: any) => toast.error(`Error deleting variant: ${error.message}`),
  });

  const addWarehouseMutation = useMutation({
    mutationFn: async (newWarehouse: any) => {
      if (!orgId) throw new Error("Organisation ID missing");
      const { data, error } = await supabase.from('warehouses').insert([{ ...newWarehouse, organisation_id: orgId }]).select();
      if (error) throw error;
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
      toast.success('Warehouse added successfully');
    },
    onError: (error: any) => toast.error(`Error adding warehouse: ${error.message}`),
  });

  const updateWarehouseMutation = useMutation({
    mutationFn: async ({ id, ...updates }: any) => {
      const { data, error } = await supabase.from('warehouses').update(updates).eq('id', id).select();
      if (error) throw error;
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
      toast.success('Warehouse updated successfully');
    },
    onError: (error: any) => toast.error(`Error updating warehouse: ${error.message}`),
  });

  const deleteWarehouseMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('warehouses').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
      toast.success('Warehouse deleted successfully');
    },
    onError: (error: any) => toast.error(`Error deleting warehouse: ${error.message}`),
  });

  const addUnitMutation = useMutation({
    mutationFn: async (newUnit: any) => {
      if (!orgId) throw new Error("Organisation ID missing");
      const { data, error } = await supabase.from('item_units').insert([{ ...newUnit, organisation_id: orgId }]).select();
      if (error) throw error;
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['item-units'] });
      toast.success('Unit added successfully');
    },
    onError: (error: any) => toast.error(`Error adding unit: ${error.message}`),
  });

  const updateUnitMutation = useMutation({
    mutationFn: async ({ id, ...updates }: any) => {
      const { data, error } = await supabase.from('item_units').update(updates).eq('id', id).select();
      if (error) throw error;
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['item-units'] });
      toast.success('Unit updated successfully');
    },
    onError: (error: any) => toast.error(`Error updating unit: ${error.message}`),
  });

  const deleteUnitMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('item_units').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['item-units'] });
      toast.success('Unit deleted successfully');
    },
    onError: (error: any) => toast.error(`Error deleting unit: ${error.message}`),
  });

  const addCategoryMutation = useMutation({
    mutationFn: async (newCategory: any) => {
      if (!orgId) throw new Error("Organisation ID missing");
      const { data, error } = await supabase.from('item_categories').insert([{ ...newCategory, organisation_id: orgId }]).select();
      if (error) throw error;
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['item-categories'] });
      toast.success('Category added successfully');
    },
    onError: (error: any) => toast.error(`Error adding category: ${error.message}`),
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, ...updates }: any) => {
      const { data, error } = await supabase.from('item_categories').update(updates).eq('id', id).select();
      if (error) throw error;
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['item-categories'] });
      toast.success('Category updated successfully');
    },
    onError: (error: any) => toast.error(`Error updating category: ${error.message}`),
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('item_categories').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['item-categories'] });
      toast.success('Category deleted successfully');
    },
    onError: (error: any) => toast.error(`Error deleting category: ${error.message}`),
  });

  const preloadUnitsMutation = useMutation({
    mutationFn: async () => {
      if (!orgId) throw new Error("Organisation ID missing");
      const standardUnits = [
        { unit_name: 'Numbers', unit_code: 'Nos', is_active: true, organisation_id: orgId },
        { unit_name: 'Kilograms', unit_code: 'Kg', is_active: true, organisation_id: orgId },
        { unit_name: 'Meters', unit_code: 'Mtr', is_active: true, organisation_id: orgId },
        { unit_name: 'Liters', unit_code: 'Ltr', is_active: true, organisation_id: orgId },
        { unit_name: 'Sets', unit_code: 'Set', is_active: true, organisation_id: orgId },
        { unit_name: 'Boxes', unit_code: 'Box', is_active: true, organisation_id: orgId },
        { unit_name: 'Packets', unit_code: 'Pkt', is_active: true, organisation_id: orgId },
        { unit_name: 'Rolls', unit_code: 'Roll', is_active: true, organisation_id: orgId },
        { unit_name: 'Square Feet', unit_code: 'Sqft', is_active: true, organisation_id: orgId },
        { unit_name: 'Cubic Meters', unit_code: 'Cum', is_active: true, organisation_id: orgId },
      ];
      const { error } = await supabase.from('item_units').upsert(standardUnits, { onConflict: 'unit_code,organisation_id' });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['item-units'] });
      toast.success('Standard units preloaded successfully');
    },
    onError: (error: any) => toast.error(`Error preloading units: ${error.message}`),
  });

  return {
    queries: {
      materials: materialsQuery,
      services: servicesQuery,
      categories: categoriesQuery,
      units: unitsQuery,
      variants: variantsQuery,
      warehouses: warehousesQuery,
    },
    mutations: {
      addMaterial: addMaterialMutation,
      updateMaterial: updateMaterialMutation,
      deleteMaterial: deleteMaterialMutation,
      addService: addServiceMutation,
      updateService: updateServiceMutation,
      deleteService: deleteServiceMutation,
      addVariant: addVariantMutation,
      updateVariant: updateVariantMutation,
      deleteVariant: deleteVariantMutation,
      addWarehouse: addWarehouseMutation,
      updateWarehouse: updateWarehouseMutation,
      deleteWarehouse: deleteWarehouseMutation,
      addUnit: addUnitMutation,
      updateUnit: updateUnitMutation,
      deleteUnit: deleteUnitMutation,
      addCategory: addCategoryMutation,
      updateCategory: updateCategoryMutation,
      deleteCategory: deleteCategoryMutation,
      preloadUnits: preloadUnitsMutation,
    }
  };
}
