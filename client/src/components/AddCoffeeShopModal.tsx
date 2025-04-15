import { useState, useEffect, useRef } from 'react';
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
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Rating } from '@/components/ui/rating';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

// Form schema for basic information
const basicInfoSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  address: z.string().min(5, { message: "Please enter a valid address" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  phone: z.string().optional(),
  website: z.string().optional(),
  openingTime: z.string().min(1, { message: "Please enter opening time" }),
  closingTime: z.string().min(1, { message: "Please enter closing time" }),
  weekdayHours: z.string().min(1, { message: "Please enter weekday hours" }),
  weekendHours: z.string().min(1, { message: "Please enter weekend hours" }),
  imageUrl: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

// Form schema for features and details
const featuresSchema = z.object({
  hasWifi: z.boolean().default(false),
  hasPowerOutlets: z.boolean().default(false),
  hasOutdoorSeating: z.boolean().default(false),
  petFriendly: z.boolean().default(false),
  wheelchairAccessible: z.boolean().default(false),
  noiseLevel: z.string().default("Medium"),
  tags: z.string(),
  popularItems: z.string().optional(),
});

// Form schema for reviews
const reviewSchema = z.object({
  initialRating: z.number().min(1, { message: "Please provide a rating" }).max(5),
  initialReview: z.string().min(10, { message: "Review must be at least 10 characters" }),
  reviewerName: z.string().min(2, { message: "Please provide your name" }),
});

// Combined schema for the entire form
const addCoffeeShopSchema = basicInfoSchema.merge(featuresSchema).merge(reviewSchema);

type AddCoffeeShopFormValues = z.infer<typeof addCoffeeShopSchema>;

interface AddCoffeeShopModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddCoffeeShopModal: React.FC<AddCoffeeShopModalProps> = ({ isOpen, onClose }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentTab, setCurrentTab] = useState("basic");
  const [placeDetails, setPlaceDetails] = useState<google.maps.places.PlaceResult | null>(null);
  const [isGoogleApiLoaded, setIsGoogleApiLoaded] = useState(false);
  const autoCompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  
  // Fetch Google Maps API key
  const { data: mapsKeyData } = useQuery({
    queryKey: ['mapsApiKey'],
    queryFn: async () => {
      const response = await fetch('/api/get-maps-key');
      if (!response.ok) {
        throw new Error('Failed to fetch Google Maps API key');
      }
      return response.json();
    }
  });
  
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
      imageUrl: '',
      latitude: undefined,
      longitude: undefined,
      hasWifi: false,
      hasPowerOutlets: false,
      hasOutdoorSeating: false,
      petFriendly: false,
      wheelchairAccessible: false,
      noiseLevel: 'Medium',
      tags: 'Coffee, Pastries',
      popularItems: '',
      initialRating: 5,
      initialReview: '',
      reviewerName: '',
    },
  });

  // Initialize Google Places Autocomplete
  useEffect(() => {
    if (mapsKeyData?.key && !isGoogleApiLoaded && inputRef.current) {
      // Check if Google Maps API is already loaded
      if (window.google && window.google.maps && window.google.maps.places) {
        initAutocomplete();
        setIsGoogleApiLoaded(true);
      } else {
        console.log("Google Maps API not loaded yet");
      }
    }
  }, [mapsKeyData, isGoogleApiLoaded, inputRef.current]);

  const initAutocomplete = () => {
    if (!inputRef.current) return;

    try {
      autoCompleteRef.current = new window.google.maps.places.Autocomplete(
        inputRef.current,
        { types: ['establishment'] }
      );

      autoCompleteRef.current.addListener('place_changed', async () => {
        if (!autoCompleteRef.current) return;
        
        const place = autoCompleteRef.current.getPlace();
        if (!place.geometry) return;

        // Get place details
        setPlaceDetails(place);
        
        // Update form fields with place data
        form.setValue('name', place.name || '');
        form.setValue('address', place.formatted_address || '');
        form.setValue('latitude', place.geometry.location?.lat() || undefined);
        form.setValue('longitude', place.geometry.location?.lng() || undefined);
        
        // Set phone and website if available
        if (place.formatted_phone_number) {
          form.setValue('phone', place.formatted_phone_number);
        }
        
        if (place.website) {
          form.setValue('website', place.website);
        }

        // Set hours if available
        if (place.opening_hours) {
          const weekdayText = place.opening_hours.weekday_text;
          if (weekdayText && weekdayText.length > 0) {
            // Extract weekday and weekend hours
            const weekdayHours = weekdayText.slice(0, 5).join(', ');
            const weekendHours = weekdayText.slice(5).join(', ');
            
            form.setValue('weekdayHours', weekdayHours);
            form.setValue('weekendHours', weekendHours);
          }
        }

        // Set image URL if available
        if (place.photos && place.photos.length > 0) {
          const photoUrl = place.photos[0].getUrl();
          form.setValue('imageUrl', photoUrl);
        }

        // Create description from place types and vicinity
        const types = place.types?.map(type => type.replace(/_/g, ' ')).join(', ');
        const description = `${place.name} is a ${types} located at ${place.vicinity}. It offers a cozy atmosphere for coffee lovers.`;
        form.setValue('description', description);

        // Set tags based on place types
        if (place.types) {
          const tags = place.types
            .filter(type => !['point_of_interest', 'establishment'].includes(type))
            .map(type => type.replace(/_/g, ' '))
            .join(', ');
          form.setValue('tags', tags || 'Coffee, Cafe');
        }
      });
    } catch (error) {
      console.error('Error initializing Google Places Autocomplete:', error);
    }
  };

  const addCoffeeShopMutation = useMutation({
    mutationFn: async (data: AddCoffeeShopFormValues) => {
      // Transform tags and popularItems from string to array for the API
      const formattedData = {
        ...data,
        tags: data.tags.split(',').map(tag => tag.trim()),
        popularItems: data.popularItems ? data.popularItems.split(',').map(item => item.trim()) : [],
        // Include initial review data
        reviews: [{
          authorName: data.reviewerName,
          rating: data.initialRating,
          comment: data.initialReview,
          date: new Date().toISOString().split('T')[0]
        }]
      };
      
      // Remove fields that are only used in the form
      delete formattedData.initialRating;
      delete formattedData.initialReview;
      delete formattedData.reviewerName;
      
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

  const handleNextTab = () => {
    if (currentTab === "basic") {
      const basicInfoResult = basicInfoSchema.safeParse(form.getValues());
      if (basicInfoResult.success) {
        setCurrentTab("features");
      } else {
        // Trigger validation to show errors
        form.trigger(["name", "address", "description", "openingTime", "closingTime", "weekdayHours", "weekendHours"]);
      }
    } else if (currentTab === "features") {
      const featuresResult = featuresSchema.safeParse(form.getValues());
      if (featuresResult.success) {
        setCurrentTab("review");
      } else {
        // Trigger validation to show errors
        form.trigger(["tags"]);
      }
    }
  };

  const handlePreviousTab = () => {
    if (currentTab === "features") {
      setCurrentTab("basic");
    } else if (currentTab === "review") {
      setCurrentTab("features");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#7C5A43]">Add New Coffee Shop</DialogTitle>
          <DialogDescription>
            Fill in the details below to add a new coffee shop to our directory.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-6 bg-[#f8f3ee]">
            <TabsTrigger value="basic" className={currentTab === "basic" ? "bg-[#7C5A43] text-white" : ""}>
              Basic Info
            </TabsTrigger>
            <TabsTrigger value="features" className={currentTab === "features" ? "bg-[#7C5A43] text-white" : ""}>
              Features & Details
            </TabsTrigger>
            <TabsTrigger value="review" className={currentTab === "review" ? "bg-[#7C5A43] text-white" : ""}>
              Add Review
            </TabsTrigger>
          </TabsList>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <TabsContent value="basic" className="space-y-4">
                <div className="space-y-2">
                  <FormLabel className="font-medium text-[#7C5A43]">Search for a Coffee Shop</FormLabel>
                  <div className="relative">
                    <input
                      ref={inputRef}
                      placeholder="Search for a coffee shop..."
                      className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#7C5A43]"
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      Start typing to get suggestions from Google Places
                    </div>
                  </div>
                </div>

                {placeDetails?.photos && placeDetails.photos.length > 0 && (
                  <div className="mt-4">
                    <img 
                      src={placeDetails.photos[0].getUrl()} 
                      alt={placeDetails.name || "Coffee shop"} 
                      className="w-full h-40 object-cover rounded-md"
                    />
                  </div>
                )}
  
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
                
                <div className="flex justify-end pt-4">
                  <Button 
                    type="button" 
                    className="bg-[#7C5A43] hover:bg-[#6a4c39]"
                    onClick={handleNextTab}
                  >
                    Next: Features & Details
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="features" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
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
                            <FormDescription>Free WiFi for customers?</FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="hasPowerOutlets"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-2 bg-muted/20 rounded-md">
                          <FormControl>
                            <Checkbox 
                              checked={field.value} 
                              onCheckedChange={field.onChange} 
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Power Outlets</FormLabel>
                            <FormDescription>Accessible power outlets?</FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="hasOutdoorSeating"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-2 bg-muted/20 rounded-md">
                          <FormControl>
                            <Checkbox 
                              checked={field.value} 
                              onCheckedChange={field.onChange} 
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Outdoor Seating</FormLabel>
                            <FormDescription>Has outdoor seating area?</FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="petFriendly"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-2 bg-muted/20 rounded-md">
                          <FormControl>
                            <Checkbox 
                              checked={field.value} 
                              onCheckedChange={field.onChange} 
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Pet Friendly</FormLabel>
                            <FormDescription>Allows pets inside?</FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                <FormField
                  control={form.control}
                  name="wheelchairAccessible"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-2 bg-muted/20 rounded-md">
                      <FormControl>
                        <Checkbox 
                          checked={field.value} 
                          onCheckedChange={field.onChange} 
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Wheelchair Accessible</FormLabel>
                        <FormDescription>Is the shop accessible for wheelchair users?</FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="noiseLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Noise Level</FormLabel>
                      <FormControl>
                        <select
                          className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#7C5A43]"
                          {...field}
                        >
                          <option value="Quiet">Quiet</option>
                          <option value="Medium">Medium</option>
                          <option value="Loud">Loud</option>
                        </select>
                      </FormControl>
                      <FormMessage />
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
                
                <div className="flex justify-between pt-4">
                  <Button 
                    type="button" 
                    variant="outline"
                    className="border-[#7C5A43] text-[#7C5A43]"
                    onClick={handlePreviousTab}
                  >
                    Back to Basic Info
                  </Button>
                  <Button 
                    type="button" 
                    className="bg-[#7C5A43] hover:bg-[#6a4c39]"
                    onClick={handleNextTab}
                  >
                    Next: Add Review
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="review" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Add Your Review</CardTitle>
                    <CardDescription>
                      Share your experience with this coffee shop
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="initialRating"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Rating</FormLabel>
                          <FormControl>
                            <div className="flex items-center">
                              <Rating 
                                value={field.value} 
                                onChange={field.onChange} 
                                max={5} 
                              />
                              <span className="ml-2 text-sm text-gray-500">
                                {field.value} of 5 stars
                              </span>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="reviewerName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Your Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="initialReview"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Your Review</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Share your thoughts about this coffee shop..." 
                              {...field} 
                              className="min-h-[150px]" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
                
                <div className="flex justify-between pt-4">
                  <Button 
                    type="button" 
                    variant="outline"
                    className="border-[#7C5A43] text-[#7C5A43]"
                    onClick={handlePreviousTab}
                  >
                    Back to Features
                  </Button>
                  <Button 
                    type="submit" 
                    className="bg-[#7C5A43] hover:bg-[#6a4c39]"
                    disabled={addCoffeeShopMutation.isPending}
                  >
                    {addCoffeeShopMutation.isPending ? 'Adding...' : 'Add Coffee Shop'}
                  </Button>
                </div>
              </TabsContent>
            </form>
          </Form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AddCoffeeShopModal;