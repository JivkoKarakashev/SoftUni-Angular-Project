import { ValidatorFn } from "@angular/forms";

export function passwordsValidator(
    passCtrlName: string,
    rePassCtrlName: string
  ): ValidatorFn {
    return (control) => {
      const passFormCtrl = control.get(passCtrlName);
      const rePassFormCtrl = control.get(rePassCtrlName);
      const areValid = passFormCtrl?.value == rePassFormCtrl?.value;  
      return areValid ? null : { matchPasswordsValidator: true };
    };
  }