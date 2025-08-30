import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { CalendarIcon, Clock, MapPin, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { MuiDatePicker } from '@/components/MuiDatePicker';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { PlaceAutocomplete, Place } from '@/components/PlaceAutocomplete';
import cosmicBackground from '@/assets/cosmic-background.jpg';

// 24h time validation regex - strict format HH:mm
const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

const formSchema = z.object({
  birthDate: z.date({
    required_error: "A data de nascimento é obrigatória.",
  }).refine(date => {
    const now = new Date();
    const minDate = new Date(1900, 0, 1);
    return date >= minDate && date <= now;
  }, "Data deve estar entre 1900 e hoje."),
  
  birthTime: z.string()
    .min(1, "A hora de nascimento é obrigatória.")
    .regex(timeRegex, "Formato inválido. Use HH:mm (exemplo: 14:30)."),
  
  birthPlace: z.string()
    .min(1, "A cidade de nascimento é obrigatória."),
  
  place: z.object({
    city: z.string(),
    admin: z.string().optional(),
    country: z.string(),
    countryCode: z.string(),
    lat: z.number(),
    lon: z.number(),
    timezone: z.string(),
    provider: z.string(),
    placeId: z.string(),
  }).optional(),
});

type FormData = z.infer<typeof formSchema>;

export function AstrologyForm() {
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
  });

  // Detect mobile for native date input fallback
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Watch form values for submit button state
  const watchedValues = form.watch();
  const isFormValid = form.formState.isValid && selectedPlace && selectedPlace.timezone;

  function onSubmit(data: FormData) {
    if (!selectedPlace) {
      form.setError('birthPlace', { 
        message: 'Selecione uma cidade das sugestões.' 
      });
      return;
    }

    const payload = {
      birthDate: format(data.birthDate, 'yyyy-MM-dd'),
      birthTime: data.birthTime,
      place: {
        city: selectedPlace.city,
        admin: selectedPlace.admin || "",
        country: selectedPlace.country,
        countryCode: selectedPlace.countryCode,
        lat: selectedPlace.lat,
        lon: selectedPlace.lon,
        timezone: selectedPlace.timezone,
        provider: selectedPlace.provider,
        placeId: selectedPlace.placeId,
      }
    };

    console.log('Payload do mapa astral:', payload);
    // Here you would send the payload to your backend
  }

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center p-4"
      style={{ backgroundImage: `url(${cosmicBackground})` }}
    >
      <div className="absolute inset-0 bg-background/40 backdrop-blur-sm" />
      
      <Card className="relative w-full max-w-md bg-card/80 backdrop-blur-md border border-primary/20 shadow-cosmic">
        <CardHeader className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="h-6 w-6 text-cosmic-gold" />
            <CardTitle className="text-2xl font-bold bg-gradient-cosmic bg-clip-text text-transparent">
              Gere seu Mapa Astral
            </CardTitle>
            <Sparkles className="h-6 w-6 text-cosmic-gold" />
          </div>
          <CardDescription className="text-muted-foreground">
            Descubra os segredos das estrelas inserindo seus dados de nascimento
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Birth Date Field */}
              <FormField
                control={form.control}
                name="birthDate"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-foreground font-medium flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-cosmic-blue" />
                      Data de Nascimento
                    </FormLabel>
                    
                    {isMobile ? (
                      // Mobile: Use native date input
                      <FormControl>
                        <Input
                          type="date"
                          value={field.value ? format(field.value, 'yyyy-MM-dd') : ''}
                          onChange={(e) => {
                            const date = e.target.value ? new Date(e.target.value + 'T00:00:00') : null;
                            field.onChange(date);
                          }}
                          min="1900-01-01"
                          max={format(new Date(), 'yyyy-MM-dd')}
                          className="border-primary/30 focus:border-primary/50 bg-input/50 backdrop-blur-sm"
                        />
                      </FormControl>
                    ) : (
                      // Desktop: Use MUI DatePicker
                      <FormControl>
                        <MuiDatePicker
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Selecione uma data"
                          error={!!form.formState.errors.birthDate}
                          helperText={form.formState.errors.birthDate?.message}
                        />
                      </FormControl>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Birth Time Field */}
              <FormField
                control={form.control}
                name="birthTime"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-foreground font-medium flex items-center gap-2">
                      <Clock className="h-4 w-4 text-cosmic-violet" />
                      Hora de Nascimento
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="time"
                        step="60"
                        placeholder="14:30"
                        {...field}
                        className="border-primary/30 focus:border-primary/50 bg-input/50 backdrop-blur-sm"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Birth Place Field with Autocomplete */}
              <FormField
                control={form.control}
                name="birthPlace"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-foreground font-medium flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-cosmic-gold" />
                      Cidade de Nascimento
                    </FormLabel>
                    <FormControl>
                      <PlaceAutocomplete
                        value={field.value || ''}
                        onChange={field.onChange}
                        onPlaceSelect={(place) => {
                          setSelectedPlace(place);
                          if (place) {
                            form.clearErrors('birthPlace');
                          }
                        }}
                        placeholder="Ex: São Paulo, SP"
                        error={form.formState.errors.birthPlace?.message}
                      />
                    </FormControl>
                    <FormMessage />
                    
                    {selectedPlace && (
                      <div className="text-xs text-muted-foreground bg-muted/30 rounded-md p-2">
                        📍 {selectedPlace.city}, {selectedPlace.country} • 🌍 {selectedPlace.timezone}
                      </div>
                    )}
                  </FormItem>
                )}
              />

              {/* Submit Button */}
              <Button 
                type="submit" 
                disabled={!isFormValid}
                className={cn(
                  "w-full font-semibold py-3 shadow-cosmic transition-all duration-300",
                  isFormValid 
                    ? "bg-gradient-cosmic hover:opacity-90 text-primary-foreground hover:shadow-mystical" 
                    : "bg-muted text-muted-foreground cursor-not-allowed"
                )}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Calcular Mapa
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}