import { ValidatorFn } from "@angular/forms";

export function emailValidator(): ValidatorFn {
    const regExp = new RegExp('[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$');
  
    return (control) => {
      const isEmailInvalid = control.value === '' || regExp.test(control.value);
      return isEmailInvalid ? null : { emailValidator: true };
    };
  }