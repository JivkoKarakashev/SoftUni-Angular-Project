import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, Subscription, catchError, switchMap } from 'rxjs';

import { ImageUrlValidatorService } from 'src/app/shared/utils/image-url-validator.service';
import { CatalogManagerService } from '../catalog-manager.service';
import { Item } from 'src/app/types/item';
import { CatalogCategory, CatalogCategorySelectOption, CatalogSubcategorySelectOption, catalogCategorySelectOptions, catalogSubcategorySelectOptions } from 'src/app/types/catalog';
import { DropdownList, dropdownList, dropdownSettings } from 'src/app/config/multiselect-dropdown-config';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { InvertColorService } from 'src/app/shared/utils/invert-color.service';
import { ToastrMessageHandlerService } from 'src/app/shared/utils/toastr-message-handler.service';
import { ErrorsService } from 'src/app/shared/errors/errors.service';

@Component({
  selector: 'app-product-edit',
  templateUrl: './product-edit.component.html',
  styleUrls: ['./product-edit.component.css']
})
export class ProductEditComponent implements OnInit, OnDestroy {
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

  public item: Item | null = null;
  private itemInitSubCat: string = '';
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
    private catalogManagerService: CatalogManagerService,
    private invertColor: InvertColorService,
    private toastrMessageHandler: ToastrMessageHandlerService,
    private router: Router,
    private errorsService: ErrorsService,
  ) { }

  ngOnInit(): void {
    console.log('Edit FORM INITIALIZED!');
    this.dropdownList = [...dropdownList];
    this.dropdownSettings = { ...dropdownSettings };
    this.categories = [...catalogCategorySelectOptions];
    this.subCategories = [...catalogSubcategorySelectOptions];
    const item = this.catalogManagerService.getCatalogItemToEdit();
    if (item) {
      this.item = { ...item };
      this.itemInitSubCat = item.subCat;
      const { altImages, brand, cat, color, description, image, price, quantity, size, subCat } = item;
      this.image.setValue(image);
      altImages.forEach((img, i) => {
        this.addAltImageUrl(img);
        this.addColorPicker(color[i]);
      });
      this.category.setValue(cat);
      this.onCategoryChange();
      this.subcategory.setValue(subCat);
      this.description.setValue(description);
      this.size.setValue(size);
      this.brand.setValue(brand);
      this.quantity.setValue(quantity);
      this.price.setValue(price);
    }
  }

  ngOnDestroy(): void {
    this.catalogManagerService.resetCatalogItemToEdit();
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
    const size = this.size.value;
    const color: string[] = [];
    this.colorsFbArr.forEach(col => {
      const validHex = /^#([a-fA-F0-9]{3}){1,2}$/g;
      if (validHex.test(col)) {
        color.push(this.invertColor.colorNameByHex(col)[1].toLocaleLowerCase());
      } else {
        color.push(col);
      }
    });
    if (this.item) {
      let editedItem: Observable<Item>;
      const { _createdOn, _id, _ownerId } = this.item;
      if (subCat !== this.itemInitSubCat) {
        editedItem = this.catalogManagerService.deleteItem(this.itemInitSubCat, _id)
          .pipe(
            switchMap(() => {
              return this.catalogManagerService.createItem({ image, altImages, cat, subCat, description, size, color, brand, quantity, price })
            }),
            catchError(err => { throw err; })
          )
      } else {
        editedItem = this.catalogManagerService.editItem({ _createdOn, _id, _ownerId, image, altImages, cat, subCat, description, size, color, brand, quantity, price })
          .pipe(
            catchError(err => { throw err; })
          )
      }
      const editSub = editedItem.subscribe(
        {
          next: (itm) => {
            this.loading = false;
            this.toastrMessageHandler.showSuccess('Item was edited successfully!');
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
      this.unsubscriptionArray.push(editSub);
    }
  }

  addAltImageUrl(imgUrl?: string) {
    imgUrl = imgUrl || '';
    this.altImagesFbArr.push(imgUrl);
    this.altImages.push(this.fb.group({
      altImage: [imgUrl, [Validators.required, this.imgUrlValidator.validate()]]
    }));
  }

  onImgUrlsChange(i: number) {
    this.altImagesFbArr[i] = this.altImages.at(i).get('altImage')?.value.trim();
  }

  removeAltImageUrl(i: number) {
    this.altImagesFbArr = this.altImagesFbArr.filter(imgUrl => imgUrl !== this.altImagesFbArr[i]);
    this.altImages.removeAt(i);
  }

  addColorPicker(col?: string) {
    col = col || '#000000';
    this.colorsFbArr.push(col);
    this.colors.push(this.fb.group({
      pickedColor: [col]
    }))
  }

  onColorChange(currCol: string, i: number) {
    this.colors.controls[i].patchValue({ 'pickedColor': currCol });
  }

  removeColor(i: number) {
    this.colorsFbArr = this.colorsFbArr.filter(col => col !== this.colorsFbArr[i]);
    this.colors.removeAt(i);
  }

  onCategoryChange() {
    const categoryId = this.categoryId || '';
    this.subCategoriesByCategory = this.subCategories.filter(cat => cat._categoryId === categoryId);
  }
}
