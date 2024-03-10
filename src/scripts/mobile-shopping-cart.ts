// export function mobileModal() {

//     interface MyHTMLElement extends HTMLElement {
//         checked: boolean
//     }

//     // Get the modal
//     const mobileModal: HTMLElement | null = document.querySelector('.mobile .modal');

//     // Get the button that opens the modal
//     const mobileOpenBtn: HTMLElement | null = document.querySelector('.mobile .nav-icon.basket');

//     // Get the <span> element that closes the modal
//     const mobileCloseBtn: HTMLElement | null = document.querySelector('.mobile div.close');

//     // When the user clicks the button, open the modal
//     if (mobileOpenBtn) {
//         mobileOpenBtn.addEventListener('click', () => {
//             if (mobileModal) {
//                 mobileModal.style.display = 'block';
//             }

//             const checkItAll: MyHTMLElement | null = document.querySelector('.mobile div.modal-body input#mobile-select_all');
//             const table: HTMLElement | null = document.querySelector('.mobile table.table.table-borderless');
//             const subTotalEl: Element | undefined = document.querySelector('.mobile .modal-content .modal-body .table tbody>tr.subtotal')?.children[1];
//             const totalEl: Element | undefined = document.querySelector('.mobile .modal-content>div.modal-footer')?.children[1];
//             if (table) {
//                 const inputs: MyHTMLElement[] = Array.from(table.querySelectorAll('.mobile .modal-content .modal-body .table thead>tr>th>input[name=\'select-row\']'));
//                 if (table.querySelectorAll('.mobile .modal-content .modal-body .table thead>tr').length != 0) {
//                     // console.log(table.querySelectorAll('.desktop .modal-content .modal-body .table thead>tr').length !== 0);
//                     cartCalc();
//                 }
//                 if (checkItAll) {
//                     checkItAll.addEventListener('change', () => {
//                         if (checkItAll.checked) {
//                             inputs.forEach(input => {
//                                 input.checked = true;
//                             });
//                         } else {
//                             inputs.forEach(input => {
//                                 input.checked = false;
//                             });
//                         }
//                     });
//                 }
//             }

//             const removeItemBtn: HTMLElement | null = document.querySelector('.mobile .modal-content .modal-body .header>input.remove-item');
//             if (removeItemBtn) {
//                 removeItemBtn.addEventListener('click', removeSelected);
//             }

//             function removeSelected() {
//                 // const checked = inputs.filter((item) => item.checked == true);
//                 if (table && checkItAll) {
//                     let rows: HTMLElement[] = Array.from(table.querySelectorAll('.mobile .modal-content .modal-body .table thead>tr'));
//                     const selectedItems: HTMLElement | HTMLElement[] = rows.filter((item) => (item.children[0].children[0] as MyHTMLElement).checked == true);
//                     selectedItems.forEach((item) => item.remove());
//                     checkItAll.checked = false;
//                     rows = Array.from(table.querySelectorAll('.mobile .modal-content .modal-body .table thead>tr'));
//                     // console.log(rows);
//                     if (rows.length != 0) {
//                         return cartCalc();
//                     }
//                 }
//                 if (subTotalEl && totalEl) {
//                     subTotalEl.textContent = '$0.00';
//                     totalEl.textContent = '$0.00';
//                 }
//             }
//             function cartCalc() {
//                 if (table) {
//                     const rows: HTMLElement[] = Array.from(table.querySelectorAll('.mobile .modal-content .modal-body .table thead>tr'));
//                     const values = rows.map((item) => Number(item.children[4].textContent?.split('$')[1]));
//                     const subTotal = values.reduce((acc, currV) => acc += currV).toFixed(2);
//                     const shipping = Number((document.querySelector('.mobile .modal-content .modal-body .table tbody>tr.shipping')?.children[1].textContent as string).split('$')[1]);
//                     const discount = Number((document.querySelector('.mobile .modal-content .modal-body .table tbody>tr.discount')?.children[1].textContent as string).split('-$')[1]);
//                     if (subTotalEl && totalEl) {
//                         subTotalEl.textContent = `$${subTotal}`;
//                         const sumTotal = (Number(subTotal) + shipping - discount).toFixed(2);
//                         // console.log(sumTotal);
//                         totalEl.textContent = `$${sumTotal}`;
//                     }
//                 }
//             }
//         });
//     }

//     // When the user clicks on <span> (x), close the modal
//     if (mobileCloseBtn && mobileModal) {
//         mobileCloseBtn.addEventListener('click', () => mobileModal.style.display = 'none');
//     }

//     // When the user clicks anywhere outside of the modal, close it
//     window.addEventListener('click', (e) => {
//         if (mobileModal && e.target == mobileModal) {
//             mobileModal.style.display = 'none';
//         }
//     });
// }