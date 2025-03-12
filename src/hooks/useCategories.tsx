
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Category, NewCategory } from "@/types/category";
import { useToast } from "@/components/ui/use-toast";

export function useCategories() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { 
    data: categories = [], 
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("User not authenticated");
      }

      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', session.user.id)
        .order('name', { ascending: true });

      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch categories",
        });
        throw error;
      }
      
      return data || [];
    },
    staleTime: 30000, // 30 seconds
  });

  const addCategory = useMutation({
    mutationFn: async (newCategory: NewCategory) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("User not authenticated");
      }

      const categoryWithUser = {
        ...newCategory,
        user_id: session.user.id,
      };

      const { data, error } = await supabase
        .from('categories')
        .insert([categoryWithUser])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({
        title: "Success",
        description: "Category added successfully",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to add category",
      });
    },
  });

  const updateCategory = useMutation({
    mutationFn: async (category: Category) => {
      const { error } = await supabase
        .from('categories')
        .update(category)
        .eq('id', category.id);

      if (error) throw error;
      return category;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({
        title: "Success",
        description: "Category updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update category",
      });
    },
  });

  const deleteCategory = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({
        title: "Success",
        description: "Category deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete category",
      });
    },
  });

  // Get all categories including default ones
  const getAllCategories = () => {
    const defaultCategories = ["Family", "Friends", "Work", "Others"];
    const customCategories = categories.map(cat => cat.name);
    
    // Combine and remove duplicates
    const allCategories = [...new Set([...defaultCategories, ...customCategories])];
    return allCategories.sort();
  };

  return {
    categories,
    isLoading,
    error,
    refetch,
    addCategory,
    updateCategory,
    deleteCategory,
    getAllCategories,
  };
}
