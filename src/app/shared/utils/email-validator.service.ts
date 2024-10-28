import { Injectable } from "@angular/core";
import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

@Injectable({
  providedIn: "root"
})
export class EmailValidaorService {

  validate(): ValidatorFn {
    const regExp = new RegExp('^[a-z0-9]+([._-]?[a-z0-9]+)+@[a-z0-9]+([._-]?[a-z0-9]+)+\\.[a-z]{2,3}$');

    return (emailControl: AbstractControl): ValidationErrors | null => {
      const validExpression = regExp.test(emailControl?.value);
      const isEmailValid = validExpression;
      return isEmailValid ? null : { invalidEmail: true };
    };
  }
}