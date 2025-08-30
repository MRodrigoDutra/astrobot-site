import React from 'react';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MuiDatePickerProps {
  value: Date | null;
  onChange: (date: Date | null) => void;
  className?: string;
  error?: boolean;
  helperText?: string;
  placeholder?: string;
}

// Create a dark theme for MUI DatePicker to match our design
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: 'hsl(263, 70%, 50.4%)', // cosmic-purple
    },
    background: {
      paper: 'hsl(240, 10%, 3.9%)', // card background
      default: 'hsl(240, 10%, 3.9%)',
    },
    text: {
      primary: 'hsl(0, 0%, 98%)', // foreground
      secondary: 'hsl(240, 5%, 64.9%)', // muted-foreground
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: 'hsl(240, 10%, 3.9%)',
          backdropFilter: 'blur(12px)',
          border: '1px solid hsl(263, 70%, 50.4%, 0.2)',
          borderRadius: '12px',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: 'hsl(240, 3.7%, 15.9%, 0.5)',
            backdropFilter: 'blur(4px)',
            borderRadius: '8px',
            '& fieldset': {
              borderColor: 'hsl(263, 70%, 50.4%, 0.3)',
            },
            '&:hover fieldset': {
              borderColor: 'hsl(263, 70%, 50.4%, 0.5)',
            },
            '&.Mui-focused fieldset': {
              borderColor: 'hsl(263, 70%, 50.4%)',
            },
          },
          '& .MuiInputLabel-root': {
            color: 'hsl(240, 5%, 64.9%)',
          },
          '& .MuiInputBase-input': {
            color: 'hsl(0, 0%, 98%)',
            fontSize: '14px',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          color: 'hsl(0, 0%, 98%)',
          '&:hover': {
            backgroundColor: 'hsl(263, 70%, 50.4%, 0.1)',
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: 'hsl(0, 0%, 98%)',
          '&:hover': {
            backgroundColor: 'hsl(263, 70%, 50.4%, 0.1)',
          },
        },
      },
    },
  },
});

export function MuiDatePicker({ 
  value, 
  onChange, 
  className, 
  error, 
  helperText, 
  placeholder = "Selecione uma data" 
}: MuiDatePickerProps) {
  return (
    <ThemeProvider theme={darkTheme}>
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
        <DatePicker
          value={value}
          onChange={onChange}
          views={['year', 'month', 'day']}
          minDate={new Date(1900, 0, 1)}
          maxDate={new Date()}
          format="dd/MM/yyyy"
          slots={{
            openPickerIcon: () => <CalendarIcon className="h-4 w-4" />,
          }}
          slotProps={{
            textField: {
              placeholder,
              error,
              helperText,
              fullWidth: true,
              className: cn("border-primary/30 focus:border-primary/50", className),
            },
            popper: {
              placement: 'bottom-start',
            },
          }}
        />
      </LocalizationProvider>
    </ThemeProvider>
  );
}