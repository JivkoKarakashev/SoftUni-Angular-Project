import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { DropdownList, dropdownList, dropdownSettings } from 'src/app/config/multiselect-dropdown-config';
import { CapitalizeCategoryService } from 'src/app/shared/utils/capitalize-category.service';
import { ImageUrlValidatorService } from 'src/app/shared/utils/image-url-validator.service';
import { CatalogCategory, CatalogCategorySelectOption, CatalogSubcategorySelectOption, catalogCategorySelectOptions, catalogSubcategorySelectOptions } from 'src/app/types/catalog';
import { CatalogManagerService } from '../catalog-manager.service';
import { Subscription, catchError } from 'rxjs';
import { ToastrMessageHandlerService } from 'src/app/shared/utils/toastr-message-handler.service';
import { Router } from '@angular/router';
import { ErrorsService } from 'src/app/shared/errors/errors.service';
import { InvertColorService } from 'src/app/shared/utils/invert-color.service';

@Component({
  selector: 'app-product-create',
  templateUrl: './product-create.component.html',
  styleUrls: ['./product-create.component.css']
})
export class ProductCreateComponent implements OnInit, OnDestroy {
  public form: FormGroup = this.fb.group({
    image: ['', [Validators.required, this.imgUrlValidator.validate()]],
    altImges: this.fb.array([], [Validators.required,]),
    cat: ['', [Validators.required,]],
    subCat: ['', [Validators.required,]],
    description: ['', [Validators.required,]],
    size: ['', [Validators.required,]],
    color: this.fb.array([], [Validators.required]),
    brand: ['', [Validators.required,]],
    quantity: ['', [Validators.required,]],
    price: ['', [Validators.required,]]
  });

  get image() {
    return this.form.get('image') as FormControl;
  }

  get altImages() {
    return this.form.get('altImges') as FormArray;
  }

  get category() {
    return this.form.get('cat') as FormControl;
  }
  get categoryId() {
    return this.form.get('cat')?.value as CatalogCategory;
  }

  get subcategory() {
    return this.form.get('subCat') as FormControl;
  }

  get description() {
    return this.form.get('description') as FormControl;
  }

  get size() {
    return this.form.get('size') as FormControl;
  }

  get colors() {
    return this.form.get('color') as FormArray;
  }

  get brand() {
    return this.form.get('brand') as FormControl;
  }

  get quantity() {
    return this.form.get('quantity') as FormControl;
  }

  get price() {
    return this.form.get('price') as FormControl;
  }

  public dropdownList: DropdownList[] = [];
  public dropdownSettings!: IDropdownSettings;
  public altImagesFbArr: string[] = [];
  public colorsFbArr: string[] = [];
  public categories: CatalogCategorySelectOption[] = [];
  private subCategories: CatalogSubcategorySelectOption[] = [];
  public subCategoriesByCategory: CatalogSubcategorySelectOption[] = [];

  private unsubscriptionArray: Subscription[] = [];
  public loading = false;
  public httpErrorsArr: HttpErrorResponse[] = [];

  constructor(
    private fb: FormBuilder,
    private imgUrlValidator: ImageUrlValidatorService,
    public capitalizeCategoryService: CapitalizeCategoryService,
    private catalogManagerService: CatalogManagerService,
    private toastrMessageHandler: ToastrMessageHandlerService,
    private router: Router,
    private errorsService: ErrorsService,
    private invertColor: InvertColorService
  ) { }

  ngOnInit(): void {
    // console.log('Publish FORM Initialized!');
    this.dropdownList = [...dropdownList];
    this.dropdownSettings = { ...dropdownSettings };
    this.categories = [...catalogCategorySelectOptions];
    this.subCategories = [...catalogSubcategorySelectOptions];
  }

  ngOnDestroy(): void {
    this.unsubscriptionArray.forEach((subscription) => {
      subscription.unsubscribe();
      // console.log('UnsubArray = 1');
    });
    // console.log('UnsubArray = 1');
  }

  onSubmit() {
    if (this.form.invalid) {
      return;
    }
    this.loading = true;
    const { image, cat, subCat, description, brand, quantity, price } = this.form.value;
    const altImages = [...this.altImagesFbArr];
    const sizeArr = this.size.value as DropdownList[];
    const size = sizeArr.map(sz => sz._name);
    const color = [...this.colorsFbArr].map(col => this.invertColor.colorNameByHex(col)[1].toLocaleLowerCase());

    const createSub = this.catalogManagerService.createItem({ image, altImages, cat, subCat, description, size, color, brand, quantity, price })
      .pipe(
        catchError(err => { throw err; })
      )
      .subscribe(
        {
          next: (itm) => {
            this.loading = false;
            this.toastrMessageHandler.showSuccess('Item was created successfully!');
            const { _id, cat, subCat } = itm;
            this.form.reset();
            this.router.navigate([`/catalog/${cat}/${subCat}/${_id}`]);
          },
          error: (err) => {
            this.loading = false;
            const errMsg: string = err.error.message;
            this.errorsService.sethttpErrorsArrState([...this.httpErrorsArr, { ...err }]);
            this.httpErrorsArr = [...this.httpErrorsArr, { ...err }];
            this.toastrMessageHandler.showError(errMsg);
          }
        }
      );
    this.unsubscriptionArray.push(createSub);
  }

  addAltImageUrl() {
    this.altImagesFbArr.push('');
    this.altImages.push(this.fb.group({
      altImage: ['', [Validators.required, this.imgUrlValidator.validate()]]
    }));
  }

  onImgUrlsChange(i: number) {
    this.altImagesFbArr[i] = this.altImages.at(i).get('altImage')?.value.trim();
  }

  removeAltImageUrl(i: number) {
    this.altImagesFbArr = this.altImagesFbArr.filter(imgUrl => imgUrl !== this.altImagesFbArr[i]);
    this.altImages.removeAt(i);
  }

  addColorPicker() {
    const col = '#000000';
    this.colorsFbArr.push(col);
    this.colors.push(this.fb.group({
      pickedColor: [col]
    }))
  }

  onColorChange(currCol: string, i: number) {
    this.colors.controls[i].patchValue({ 'pickedColor': currCol });
  }

  removeColor(i: number) {
    this.colorsFbArr = this.colorsFbArr.filter((_, idx) => idx !== i);
    this.colors.removeAt(i);
  }

  onCategoryChange() {
    const categoryId = this.categoryId || '';
    this.subCategoriesByCategory = this.subCategories.filter(cat => cat._categoryId === categoryId);
  }
}
