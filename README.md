# Shopping E-Commerce Application

## Overview

Welcome to the Clothing store Application! This is an E-Commerce Single Page Application (SPA) developed with Angular, designed for Users who can create and manage their own listings, ordering items created by other Users and track their status.

## Features

- Browse Clothes Ads: Visitors can easily navigate to different sections like Clothes, Shoes, Accessories, Sportswear with the corresponding subcategories.
- User Registration: Users can register with an email, username, password, phone and shipping address.
- Publish Ads: Registered users have the ability to create their own cloth listings.
- Edit and Delete Ads: Ad authors can easily edit or delete their publications.
- Buy Ads: Every logged-in user should be able to buy an other listings, but not his own.
- Browse profile: Registered users have a profile page with all their sells and purchases.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Application development description](#application-development-description)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [How to run it?](#how-to-run-it)
- [License](#license)
- [Credits](#credits)

## Application development description

1. Developed with Visual Studio Code v.1.86.1 + Node.js v.18.19.0.
2. Used libs:

   - [Angular/cli v.16.2.0](https://www.npmjs.com/package/@angular/cli/v/16.2.0)
   - [Angular-Eslint/Eslint-plugin v.16.3.1](https://www.npmjs.com/package/@angular-eslint/eslint-plugin/v/16.3.1)
   - [Typescript-Eslint/Eslint-plugin v.5.62.0](https://www.npmjs.com/package/@typescript-eslint/eslint-plugin/v/5.62.0)
   - [Canvasjs/Angular-Charts v.1.2.0](https://www.npmjs.com/package/@canvasjs/angular-charts/v/1.2.0)
   - [Multiselect-Dropdown v.1.0.0](https://www.npmjs.com/package/ng-multiselect-dropdown/v/1.0.0)
   - [Color-Picker v.17.0.0](https://www.npmjs.com/package/ngx-color-picker/v/17.0.0)
   - [Slick-Carousel v.15.0.0](https://www.npmjs.com/package/ngx-slick-carousel/v/15.0.0)
   - [Stripe v.16.4.0](https://www.npmjs.com/package/ngx-stripe/v/16.4.0)
   - [Toastr v.17.0.2](https://www.npmjs.com/package/ngx-toastr/v/17.0.2)

3. Browsers used: Mozilla Firefox and Google Chrome(latest versions)+ Addons: axe DevTools®, Angular Dev.Tools, Pesticide.
4. [Images Cloud Container](https://pixabay.com/) cloud API is used for storing the static files like icons and images.

## Usage

1. **Navigation bar:**
   Navigation links change the current page (view). Guests (unauthenticated visitors) see the links to the Home, Login, Register, Catalog, Shopping cart pages.
   The logged-in user navbar contains the links to Home, Publish, Profile, Catalog, Shopping cart pages and a link for the Logout action.

2. **Login User:**
   The Login page is available only for guests (unauthenticated visitors).

   The included REST service comes with the following premade user accounts, which you may use for test purposes:

   ```json
   { "email": "peter@abv.bg", "username": "Peter", "password": "123456" }
   { "email": "george@abv.bg", "username": "George", "password": "123456" }
   { "email": "admin@abv.bg", "username": "Admin", "password": "123456" }
   ```

   **REST Service API Endpoint:**

   - _Method: POST_
   - _Request body:_

   ```json
   {
     "email": "string",
     "password": "string"
   }
   ```

   - _URL: http://localhost:3030/users/login_

   The Login page contains a form for existing user authentication. By providing an email and password, the app login user in the system if there are no empty fields.
   Upon success, the REST service returns information about the existing user along with a property accessToken, which contains the session token for the user, in order to be able to perform authenticated requests.
   After successful login, the user is redirected to the Home page. If there is an error, an appropriate error message is displayed.

3. **Register User:**
   The Register page is available only for guests (unauthenticated visitors).

   **REST Service API Endpoint:**

   - _Method: POST_
   - _Request body:_

   ```json
   {
     "email": "string",
     "username": "string",
     "address": {
       "phone": "string",
       "street_building": "string",
       "city": "string",
       "region": "string",
       "postalCode": "string",
       "country": "string"
     },
     "password": "string"
   }
   ```

   - _URL: http://localhost:3030/users/register_

   The Register page contains a form for new user registration. By providing an email, username, shipping address and password, the app register new user in the system if there are no empty fields.
   Upon success the REST service returns the newly created object with an automatically generated \_id and a property accessToken, which contains the session token for the user, in order to be able to perform authenticated requests.
   After successful registration, the user is redirected to the Home page. If there is an error, an appropriate error message is displayed.

4. **Logout User:**
   The logout action is available only for logged-in users.

   **REST Service API Endpoint:**

   - _Method: GET_
   - _Request headers:_

   ```json
   {
     "X-Authorization": "accessToken"
   }
   ```

   - _URL: http://localhost:3030/users/logout_

   After successful logout, the user is redirected to the Login page.

5. **Home page:**
   All users are welcomed to the Home page, where a slick carousel shows the latest two published items from every catalog subcategories.

6. **Catalog page:**
   This page displays all published listings divided into categories with subcategories. Clicking on the image in the Card leads to the details page for the selected listing.
   If the User is NOT the [Owner] of the listing, a an [Add-to-Cart] button will appear. Once the item is added to the cart, a message ["Already-in-cart"] appears in place of the button. In case the quantity of an item is exhausted, ["This-item-is-sold-out-and-out-of-stock!"] will appear in place of the [Add-button].
   If case the User is the [Owner] of the listing, [Delete] and an [Edit] buttons will be displayed, followed by ["You-are-owner!-You-can't-purchase-this-Item!"] instead. 

   **REST Service API Endpoints:**

   - _Method: GET_
   - _Array of subcategories by category URL: http://localhost:3030/data/{:subcategory}/ - for all listings in the category_
   - _URL: http://localhost:3030/data/{:subcategory}/ - for all listings in the subcategory_

7. **Publish page:**
   The Publish page is available to logged-in users. It contains a form for creating new listings. User can publish listing with POST request, if there are no empty fields and Additional image URLs are equal to the item's colors. One addt'l image for every color option. 

   **REST Service API Endpoint:**

   - _Method: POST_
   - _Request headers:_

   ```json
   {
     "X-Authorization": "accessToken",
     "Content-Type": "application/json"
   }
   ```

   - _Request body:_

   ```json
   {
	 "image": "string (URL address)",
     "altImages": "string (URL address)"[],
     "cat": "string",
     "subCat": "string",
     "description": "string",
     "size": "string or number"[],
     "color": "string"[],
     "brand": "string",
     "quantity": "integer number",
     "price": "integer or floating-point number"
   }
   ```

   - _URL: http://localhost:3030/data/{:subcategory}_

   Upon success, the REST service returns the newly created item.
   After successful creation, the user is redirected to the Details page of currently published item.

8. **Details page:**
   All users are able to view details about listings. Clicking on the Image in the cards leads to the details page for the selected listing. If the currently logged-in user is the creator of the listing, [Edit] and [Delete] buttons are displayed, followed by ["You-are-owner!-You-can't-purchase-this-Item!"].
   Every user [Guset] and [Logged-in] is able to purchase the item, but not his own, by clicking on the [Add-to-cart] button. In case the user is not authenticated on cart fillings up, he will be prompted to complete the authorization process before completing the order.

   **REST Service API Endpoints for Details view:**

   - _Method: GET_
   - _URL: http://localhost:3030/data/{:subcategory}/{:itemId} - for selected item_

9. **Edit Listing**
    The Edit page is available only to logged-in user who is at the same time and author of the listing. Clicking on the [Edit] button of a particular offer, redirects user to the Edit page with all fields filled with the data for the offer. It contains a form with input fields for all relevant properties. The Author of the offer is able to update it by sending the correct filled form with no empty fields in it before the PUT request making.

    **REST Service API Endpoint:**

    - _Method: PUT_
    - _Request headers:_

    ```json
    {
      "X-Authorization": "accessToken",
      "Content-Type": "application/json"
    }
    ```

    - _Request body:_

    ```json
    {
      "image": "string (URL address)",
      "altImages": "string (URL address)"[],
      "cat": "string",
      "subCat": "string",
      "description": "string",
      "size": "string or number"[],
      "color": "string"[],
      "brand": "string",
      "quantity": "integer number",
      "price": "integer or floating-point number"
    }
    ```

    - _URL: http://localhost:3030/data/{:subcategory}/{:itemId}_

    Upon success, the REST service returns the modified item.
    After successful edit request, the user is redirected to the Details page of the currently edited item.

10. **Shopping Cart**
    Every user [Guset] and [Logged-in] is able to purchase other User's listings, but not his own. In case the user is not authenticated on process to cart fillings up, he will be prompted to complete the authorization process before completing the order. In the shopping cart, the user can customize every item by color, size, quantity depending on the available options. Moreover the User can remove from cart one or several items at the same time.
    After completing the order, a payment page is initialized where the user can make a payment with a bank card by entering the card details.
    After successful payment, the user is redirected to a confirmation order page, remaining quantity of the ordered items is recalculated.

    **REST Service API Endpoint:**

    - _Method: POST_
    - _Request headers:_

    ```json
    {
      "X-Authorization": "accessToken",
      "X-Admin": "",
      "Content-Type": "application/json"
    }
    ```

    - _URL: http://localhost:3030/data/orders_ - for an Order placed
    - _URL: http://localhost:3030/data/traded_items_ - for purchased Items
    - _Array of purchase Items by {:itemId} URL: http://localhost:3030/data/{:subcategory}/{:itemId}_ - for Catalog Items quantity update

11. **Delete Listing**
    The delete action is available to logged-in user, who is at the same time and author of the listing. When the author clicks on the [Delete] button of a particular offer, the listing is deleted from the system.

    **REST Service API Endpoint:**

    - _Method: DELETE_
    - _Request headers:_

    ```json
    {
      "X-Authorization": "accessToken",
      "Content-Type": "application/json"
    }
    ```

    - _URL: http://localhost:3030/data/{:subcategory}/{:itemId}_
      Upon success, the REST service returns Object, containing the time of deletion of selected item.
      After successful delete request, the user is redirected to the Catalog subcategory corresponding to the deleted item.

12. **Profile page:**
    The Profile page is available only to authenticated users and contains overview, purchase and sales tabs. 
    - The overview section contains several graphical charts - percentage of purchases and sales, percentage of purchases by category and percentage of sales by category.
    - The purchases section contains all orders that user has made, order status  in case it is from a single merchant and the status for each item in an order in case the order is divided into several deliveries and/or the order is from different merchants. 
    The user has opportunity to filter the orders.
    When merchant confirms and ship the order/separated item, the user will have to confirm its successful receipt via [Confirm-receipt] button.
    - The sales section contains all purchased items that other users as buyers have been ordered for products published by the user as a seller. The user has opportunity to filter the sales.
    The user as a seller of an catalog item, has to accept or reject the order placed by another user as a buyer ot the same item via [Confirm] or [Reject] buttons. When the order is accepted, the user must inform the recipient when it has been packed and shipped. This can be done by changing the order/separaeted item status in the system via [Mark-as-shipped] button.

    **REST Service API Endpoint:**

    - _Method: GET_
    - _Request headers:_

    ```json
    {
      "X-Authorization": "accessToken"
    }
    ```

    - _URL: http://localhost:3030/data/orders?where=\_ownerId%3D%22{:userId}%22_ - for all orders made by the user
    - _URL: http://localhost:3030/data/traded_items?where=orderId%3D%22{:orderId}%22_ - for all purchased items from every one order placed by the user
    - _URL: http://localhost:3030/data/traded_items?where=sellerId%3D%22{:userId}%22_ - for all sold from the user items

    - _Method: PUT_
    - _Request headers:_

    ```json
    {
      "X-Authorization": "accessToken"
    }
    ```

    - Array of purchased/sold Items and their status changes URL: http://localhost:3030/data/traded_items/{:itemId}_ - for changing of the items status to the system.

## Project Structure

- **`/src`**: Contains the E-Commerce Clothing store SPA.

  - `/app`: Angular modules, components, style css, types, business logic, routing, directives, guards, services, interceptors, utils.
    - `/authenticate`: component wrapper that manages authentication in the application.
    - `/catalog`: components with the categories and corresponding subcategories in the catalog.
    - `/catalog-manager`: components for deleting and editing catalog Items.
    - `/category`: component that contains markup with routing links to all categories and subcategories in the catalog.
    - `/checkout`: components used in the payment and order confirmation process.
    - `/config`: contains config constants and interfaces for multiselect-dropdown and slick carousel components.
    - `/core`: header and footer components.
    - `/extract-states`: component wrapper that retrieves app states from local storage in case the page has been reloaded.
    - `/home`: home component.
    - `/interceptors`: attaches access token for authenticated requests and handle some errors in case such arise.
    - `/main`: main component.
    - `/profile`: contains profile component with overview, purchases and sales tabs.
    - `/shared`: directives, errors-handler component, 404-not found component, guard service, loading spinner component, product-details component, shopping cart component, state-management services, utils services.
    - `/types`: used data types, constants and interfaces.
    - `/user`: authentication components - user login and register.
    - `/assets`: Static assets, icons, images and base and shared style css files.
    - `/environments`: environment variables setup.

- **`/server`**: Contains REST API Service with data folder. In this folder are stored .json files with premade data.

## How to run it?

1. **Prerequisites:**

- _`Node.js`_: Make sure you have [Node.js](https://nodejs.org/) and npm installed on your machine. You can download them from https://nodejs.org/.

- _`VSCode`_: [Install Visual Studio Code](https://code.visualstudio.com/) (VSCode) if you haven't already. You can download it from https://code.visualstudio.com/.

2. **Steps**

- **Clone the Repository:**
  - Clone project repository to your local machine using a version control tool like Git. Open your terminal and run:
  ```bash
  git clone https://github.com/JivkoKarakashev/SoftUni-Angular-Project.git
  ```
  - Navigate to the root folder of the project:
  ```bash
  cd SoftUni-Angular-Project
  ```
- **Install Client Dependencies:**
  - Navigate to the root directory of the project and install the dependencies for the client.
    - In the 'root' directory, install client dependencies by running:
    ```bash
    npm install
    ```
- **Start the Server:**
  - Navigate to the server directory of the project and start the Node.js server. 
    - Navigate to the root directory and run:
      ```bash
	    cd server
	    ``` 
    - In the 'server' directory run:
      ```bash
	    node server.js
	    ```
    This will start the RESTful API Service, and you should see output 'Server started on port 3030. You can make requests to http://localhost:3030/' indicating that the service API is running. It should be accessible at http://localhost:3030.
- **Start the Client Development Server:**
  - Open a new terminal window and navigate to the root directory. Start the Angular development server:
    ```bash
	  npm run start
	  ```
    This will start the development server, and you should see output indicating that the development server is running and listening. It should be accessible at http://localhost:4200.

## License

This project is licensed under the MIT License - see the [LICENSE](https://opensource.org/license/mit/) file for details.

## Credits

This documentation is writen with the help of [ChatGPT](https://chatgpt.openai.com)
