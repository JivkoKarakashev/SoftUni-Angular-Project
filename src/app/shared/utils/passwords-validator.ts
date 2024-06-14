import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export function passwordsValidator(): ValidatorFn {
    return (passControl: AbstractControl): ValidationErrors | null => {
      const passFormCtrl = passControl.get('pass')?.value;
      const rePassFormCtrl = passControl.get('rePass')?.value;
      const areValid = passFormCtrl?.value == rePassFormCtrl?.value;
      return areValid ? null : { matchPasswordsValidator: true };
    };
  }