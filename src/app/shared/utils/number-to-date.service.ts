import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NumberToDateService {

  convert(number: number): string {
    return new Date(number).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
}
