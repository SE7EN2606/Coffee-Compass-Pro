import { useState } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

// Form schema
const addCoffeeShopSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  address: z.string().min(5, { message: "Please enter a valid address" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  phone: z.string().optional(),
  website: z.string().optional(),
  openingTime: z.string().min(1, { message: "Please enter opening time" }),
  closingTime: z.string().min(1, { message: "Please enter closing time" }),
  weekdayHours: z.string().min(1, { message: "Please enter weekday hours" }),
  weekendHours: z.string().min(1, { message: "Please enter weekend hours" }),
  hasWifi: z.boolean().default(false),
  tags: z.string(),
  popularItems: z.string().optional(),
});

type AddCoffeeShopFormValues = z.infer<typeof addCoffeeShopSchema>;

interface AddCoffeeShopModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddCoffeeShopModal: React.FC<AddCoffeeShopModalProps> = ({ isOpen, onClose }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const form = useForm<AddCoffeeShopFormValues>({
    resolver: zodResolver(addCoffeeShopSchema),
    defaultValues: {
      name: '',
      address: '',
      description: '',
      phone: '',
      website: '',
      openingTime: '8AM',
      closingTime: '8PM',
      weekdayHours: '8AM - 8PM',
      weekendHours: '9AM - 6PM',
      hasWifi: false,
      tags: 'Coffee, Pastries',
      popularItems: '',
    },
  });

  const addCoffeeShopMutation = useMutation({
    mutationFn: async (data: AddCoffeeShopFormValues) => {
      // Transform tags and popularItems from string to array for the API
      const formattedData = {
        ...data,
        tags: data.tags.split(',').map(tag => tag.trim()),
        popularItems: data.popularItems ? data.popularItems.split(',').map(item => item.trim()) : []
      };
      
      const response = await fetch('/api/coffee-shops', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formattedData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to add coffee shop');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Success!',
        description: 'Coffee shop added successfully!',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/coffee-shops'] });
      onClose();
      form.reset();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to add coffee shop. Please try again.',
        variant: 'destructive',
      });
      console.error('Failed to add coffee shop:', error);
    },
  });

  const onSubmit = (data: AddCoffeeShopFormValues) => {
    addCoffeeShopMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#7C5A43]">Add New Coffee Shop</DialogTitle>
          <DialogDescription>
            Fill in the details below to add a new coffee shop to our directory.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Coffee Shop Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder="123 Coffee St, City" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe the coffee shop..." {...field} className="min-h-[100px]" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="(555) 123-4567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="www.example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="openingTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Opening Time</FormLabel>
                    <FormControl>
                      <Input placeholder="8AM" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="closingTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Closing Time</FormLabel>
                    <FormControl>
                      <Input placeholder="8PM" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="weekdayHours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weekday Hours</FormLabel>
                    <FormControl>
                      <Input placeholder="8AM - 8PM" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="weekendHours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weekend Hours</FormLabel>
                    <FormControl>
                      <Input placeholder="9AM - 6PM" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="hasWifi"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-2 bg-muted/20 rounded-md">
                  <FormControl>
                    <Checkbox 
                      checked={field.value} 
                      onCheckedChange={field.onChange} 
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Has WiFi</FormLabel>
                    <FormDescription>Does this coffee shop provide WiFi for customers?</FormDescription>
                  </div>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <Input placeholder="Specialty Coffee, Pastries, Vegan Options" {...field} />
                  </FormControl>
                  <FormDescription>
                    Separate tags with commas
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="popularItems"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Popular Items (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Signature Latte, Avocado Toast, Cold Brew" {...field} />
                  </FormControl>
                  <FormDescription>
                    Separate items with commas
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter className="mt-6">
              <Button 
                variant="outline" 
                onClick={() => onClose()} 
                type="button"
                className="border-[#7C5A43] text-[#7C5A43]"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-[#7C5A43] hover:bg-[#6a4c39]"
                disabled={addCoffeeShopMutation.isPending}
              >
                {addCoffeeShopMutation.isPending ? 'Adding...' : 'Add Coffee Shop'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddCoffeeShopModal;