// Get the modal
const mobileModal = document.querySelector('.mobile .modal');
const desktopModal = document.querySelector('.desktop .modal');

// Get the button that opens the modal
const mobileOpenBtn = document.querySelector('.mobile .nav-icon.basket');
const desktopOpenBtn = document.querySelector('.desktop .nav-icon.basket');

// Get the <span> element that closes the modal
const mobileCloseBtn = document.querySelector('.mobile div.close');
const desktopCloseBtn = document.querySelector('.desktop div.close');

// When the user clicks the button, open the modal 
mobileOpenBtn.onclick = () => {
    mobileModal.style.display = 'block';

    const checkItAll = document.querySelector('.mobile div.modal-body input#select_all');
    const table = document.querySelector('.mobile table.table.table-borderless');
    const inputs = Array.from(table.querySelectorAll('.mobile .modal-content .modal-body .table thead>tr>th>input[name=\'select-row\']'));
    const subTotalEl = document.querySelector('.mobile .modal-content .modal-body .table tbody>tr.subtotal').children[1];
    const totalEl = document.querySelector('.mobile .modal-content>div.modal-footer').children[1];

    if (table.querySelectorAll('.mobile .modal-content .modal-body .table thead>tr').length != 0) {
        // console.log(table.querySelectorAll('.desktop .modal-content .modal-body .table thead>tr').length !== 0);
        cartCalc();
    }
    // console.log(subTotalEl);

    checkItAll.addEventListener('change', () => {
        if (checkItAll.checked) {
            inputs.forEach(input => {
                input.checked = true;
            });
        } else {
            inputs.forEach(input => {
                input.checked = false;
            });
        }
    });

    const removeItemBtn = document.querySelector('.mobile .modal-content .modal-body .header>input.remove-item');
    removeItemBtn.addEventListener('click', removeSelected);

    function removeSelected() {
        // const checked = inputs.filter((item) => item.checked == true);
        let rows = Array.from(table.querySelectorAll('.mobile .modal-content .modal-body .table thead>tr'));
        const selectedItems = rows.filter((item) => item.children[0].children[0].checked == true);
        selectedItems.forEach((item) => item.remove());
        checkItAll.checked = false;
        rows = Array.from(table.querySelectorAll('.mobile .modal-content .modal-body .table thead>tr'));
        // console.log(rows);
        if (rows.length != 0) {
            return cartCalc();            
        }
        subTotalEl.textContent = '$0.00';
        totalEl.textContent = '$0.00';
    }
    function cartCalc() {
        const rows = Array.from(table.querySelectorAll('.mobile .modal-content .modal-body .table thead>tr'));
        const values = rows.map((item) => Number(item.children[4].textContent.split('$')[1]));
        const subTotal = values.reduce((acc, currV) => acc += currV).toFixed(2);
        const shipping = Number(document.querySelector('.mobile .modal-content .modal-body .table tbody>tr.shipping').children[1].textContent.split('$')[1]);
        const discount = Number(document.querySelector('.mobile .modal-content .modal-body .table tbody>tr.discount').children[1].textContent.split('-$')[1]);
        subTotalEl.textContent = `$${subTotal}`;
        const sumTotal = (Number(subTotal) + shipping - discount).toFixed(2);
        // console.log(sumTotal);
        totalEl.textContent = `$${sumTotal}`;
    }
};

desktopOpenBtn.onclick = () => {
    desktopModal.style.display = 'block';

    const checkItAll = document.querySelector('.desktop div.modal-body input#select_all');
    const table = document.querySelector('.desktop table.table.table-borderless');
    const inputs = Array.from(table.querySelectorAll('.desktop .modal-content .modal-body .table thead>tr>th>input[name=\'select-row\']'));
    const subTotalEl = document.querySelector('.desktop .modal-content .modal-body .table tbody>tr.subtotal').children[1];
    const totalEl = document.querySelector('.desktop .modal-content>div.modal-footer').children[1];
    
    if (table.querySelectorAll('.desktop .modal-content .modal-body .table thead>tr').length != 0) {
        // console.log(table.querySelectorAll('.desktop .modal-content .modal-body .table thead>tr').length !== 0);
        cartCalc();
    }
    // console.log(subTotalEl);

    checkItAll.addEventListener('change', () => {
        if (checkItAll.checked) {
            inputs.forEach(input => {
                input.checked = true;
            });
        } else {
            inputs.forEach(input => {
                input.checked = false;
            });
        }
    });

    const removeItemBtn = document.querySelector('.desktop .modal-content .modal-body .header>input.remove-item');
    removeItemBtn.addEventListener('click', removeSelected);

    function removeSelected() {
        // const checked = inputs.filter((item) => item.checked == true);
        let rows = Array.from(table.querySelectorAll('.desktop .modal-content .modal-body .table thead>tr'));
        const selectedItems = rows.filter((item) => item.children[0].children[0].checked == true);
        selectedItems.forEach((item) => item.remove());
        checkItAll.checked = false;
        rows = Array.from(table.querySelectorAll('.desktop .modal-content .modal-body .table thead>tr'));
        // console.log(rows);
        if (rows.length != 0) {
            return cartCalc();            
        }
        subTotalEl.textContent = '$0.00';
        totalEl.textContent = '$0.00';
    }
    function cartCalc() {
        const rows = Array.from(table.querySelectorAll('.desktop .modal-content .modal-body .table thead>tr'));
        const values = rows.map((item) => Number(item.children[4].textContent.split('$')[1]));
        const subTotal = values.reduce((acc, currV) => acc += currV).toFixed(2);
        const shipping = Number(document.querySelector('.desktop .modal-content .modal-body .table tbody>tr.shipping').children[1].textContent.split('$')[1]);
        const discount = Number(document.querySelector('.desktop .modal-content .modal-body .table tbody>tr.discount').children[1].textContent.split('-$')[1]);
        subTotalEl.textContent = `$${subTotal}`;
        const sumTotal = (Number(subTotal) + shipping - discount).toFixed(2);
        // console.log(sumTotal);
        totalEl.textContent = `$${sumTotal}`;
    }
};

// When the user clicks on <span> (x), close the modal
mobileCloseBtn.onclick = () => mobileModal.style.display = 'none';
desktopCloseBtn.onclick = () => desktopModal.style.display = 'none';

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (e) {
    if (e.target == mobileModal || e.target == desktopModal) {
        mobileModal.style.display = 'none';
        desktopModal.style.display = 'none';
    }
}
