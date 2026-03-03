import { Pipe, PipeTransform } from '@angular/core';

/**
 * Pipe para capitalizar a primeira letra de cada palavra
 * 
 * Uso: {{ texto | capitalize }}
 * 
 * Exemplo:
 * - "mesa de jantar" → "Mesa De Jantar"
 * - "sofá retrátil 3 lugares" → "Sofá Retrátil 3 Lugares"
 */
@Pipe({
  name: 'capitalize',
  standalone: true
})
export class CapitalizePipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) return '';
    
    return value
      .toLowerCase()
      .split(' ')
      .map(word => {
        if (word.length === 0) return word;
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join(' ');
  }
}
