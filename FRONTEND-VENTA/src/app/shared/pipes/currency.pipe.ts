import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'customCurrency',
  standalone: true
})
export class CustomCurrencyPipe implements PipeTransform {
  transform(value: number | string, currency: string = '$'): string {
    if (value === null || value === undefined) return '';
    
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    
    return `${currency} ${numValue.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  }
}