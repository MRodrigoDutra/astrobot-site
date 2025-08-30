import React, { useState, useRef, useEffect } from 'react';
import { MapPin, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/useDebounce';
// @ts-ignore
import * as tzlookup from 'tz-lookup';

// Environment variable for Geoapify API key
const GEOAPIFY_API_KEY = import.meta.env.VITE_GEOAPIFY_API_KEY || 'YOUR_API_KEY_HERE';

export interface Place {
  city: string;
  admin?: string;
  country: string;
  countryCode: string;
  lat: number;
  lon: number;
  timezone: string;
  provider: string;
  placeId: string;
}

interface PlaceSuggestion {
  properties: {
    formatted: string;
    name?: string;
    city?: string;
    state?: string;
    country?: string;
    country_code?: string;
    lat: number;
    lon: number;
    place_id: string;
    timezone?: { name?: string };
  };
}

interface PlaceAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onPlaceSelect: (place: Place | null) => void;
  placeholder?: string;
  className?: string;
  error?: string;
}

export function PlaceAutocomplete({ 
  value, 
  onChange, 
  onPlaceSelect, 
  placeholder = "Ex: São Paulo, SP", 
  className,
  error 
}: PlaceAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const debouncedSearchTerm = useDebounce(value, 250);

  useEffect(() => {
    if (debouncedSearchTerm.length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    const searchPlaces = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(debouncedSearchTerm)}&type=city&limit=7&lang=pt&apiKey=${GEOAPIFY_API_KEY}`
        );
        
        if (!response.ok) throw new Error('Search failed');
        
        const data = await response.json();
        setSuggestions(data.features || []);
        setIsOpen(true);
        setSelectedIndex(-1);
      } catch (error) {
        console.error('Place search error:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    searchPlaces();
  }, [debouncedSearchTerm]);

  const formatSuggestion = (suggestion: PlaceSuggestion) => {
    const { properties } = suggestion;
    const city = properties.city || properties.name || '';
    const admin = properties.state || '';
    const country = properties.country || '';
    
    return `${city}${admin ? `, ${admin}` : ''}, ${country}`;
  };

  const getTimezone = (lat: number, lon: number, apiTimezone?: string): string => {
    if (apiTimezone) return apiTimezone;
    
    try {
      return tzlookup(lat, lon) || 'UTC';
    } catch (error) {
      console.warn('Timezone lookup failed:', error);
      return 'UTC';
    }
  };

  const selectSuggestion = (suggestion: PlaceSuggestion) => {
    const { properties } = suggestion;
    const formatted = formatSuggestion(suggestion);
    
    onChange(formatted);
    
    const place: Place = {
      city: properties.city || properties.name || '',
      admin: properties.state || undefined,
      country: properties.country || '',
      countryCode: properties.country_code || '',
      lat: properties.lat,
      lon: properties.lon,
      timezone: getTimezone(properties.lat, properties.lon, properties.timezone?.name),
      provider: 'geoapify',
      placeId: properties.place_id,
    };
    
    onPlaceSelect(place);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          selectSuggestion(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleBlur = (e: React.FocusEvent) => {
    // Delay closing to allow click on suggestions
    setTimeout(() => {
      if (!listRef.current?.contains(document.activeElement)) {
        setIsOpen(false);
      }
    }, 150);
  };

  return (
    <div className="relative">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-cosmic-gold" />
        <Input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            onPlaceSelect(null); // Clear selection when typing
          }}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={cn(
            "pl-10 border-primary/30 focus:border-primary/50 bg-input/50 backdrop-blur-sm",
            error && "border-destructive",
            className
          )}
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-autocomplete="list"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {isOpen && suggestions.length > 0 && (
        <ul
          ref={listRef}
          className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-auto rounded-md bg-popover/95 backdrop-blur-md border border-primary/20 shadow-cosmic"
          role="listbox"
        >
          {suggestions.map((suggestion, index) => (
            <li
              key={suggestion.properties.place_id}
              className={cn(
                "px-3 py-2 cursor-pointer text-sm hover:bg-primary/10 transition-colors",
                selectedIndex === index && "bg-primary/20"
              )}
              onClick={() => selectSuggestion(suggestion)}
              role="option"
              aria-selected={selectedIndex === index}
            >
              {formatSuggestion(suggestion)}
            </li>
          ))}
        </ul>
      )}

      {isOpen && suggestions.length === 0 && !isLoading && value.length >= 2 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-md bg-popover/95 backdrop-blur-md border border-primary/20 shadow-cosmic">
          <div className="px-3 py-2 text-sm text-muted-foreground">
            Nenhuma cidade encontrada
          </div>
        </div>
      )}
    </div>
  );
}