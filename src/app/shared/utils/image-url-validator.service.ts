import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class ImageUrlValidatorService {

  validate(): ValidatorFn {
    const urlRegExp = new RegExp('[(http(s)?):\/\/(www\.)?a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&\/\/=]*)');
    const relAbsPathsRegExp = new RegExp('\.\.?\/[^\n"?:*<>|]+\.[A-z0-9]+');
    return (imgUrlControl: AbstractControl): ValidationErrors | null => {
      const validExpression = relAbsPathsRegExp.test(imgUrlControl?.value) || urlRegExp.test(imgUrlControl?.value);
      const isImgUrlValid = validExpression;
      return isImgUrlValid ? null : { invalidImgUrl: true };
    };
  }
}
