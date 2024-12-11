import { Directive, ElementRef, HostListener, Optional } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appTrim]'
})
export class TrimDirective {

  constructor(
    private element: ElementRef,
    @Optional() private ngControl: NgControl
    ) { }

  @HostListener('blur', ['$event'])
  onBlur(e: FocusEvent) { this.trimUserInput() }

  private trimUserInput() {
    const value: string = this.element.nativeElement.value;
    // console.log(`${value} - ${value.length}`);
    this.ngControl.control?.setValue(this.element.nativeElement.value = value.trim());
    // console.log(`${this.element.nativeElement.value} - ${this.element.nativeElement.value.length}`);
  }

}
