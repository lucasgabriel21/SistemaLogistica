import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';

export const DatePickerWithRange = ({ className, ...props }) => {
  return (
    <Button variant="outline" className={className} {...props}>
      <Calendar className="mr-2 h-4 w-4" />
      Selecionar período
    </Button>
  );
};
