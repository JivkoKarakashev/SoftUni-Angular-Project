import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export function passwordsValidator(): ValidatorFn {
    return (passControl: AbstractControl): ValidationErrors | null => {
      const passFormCtrl: string = passControl?.value['pass'];
      const rePassFormCtrl: string = passControl?.value['rePass'];
      const areValid: boolean = passFormCtrl != '' && rePassFormCtrl != '' && passFormCtrl == rePassFormCtrl;
      return areValid ? null : { matchPasswordsValidator: true };
    };
  }