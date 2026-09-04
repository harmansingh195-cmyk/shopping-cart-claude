# Modern Shopping Cart

A lightweight Spring Boot shopping cart demo with a modern storefront UI and product search functionality. The app serves a product catalog from a REST endpoint and renders the storefront in the browser using plain JavaScript.

## Features

- Product catalog loaded from `/api/products`
- Modern responsive shopping-cart layout
- Add-to-cart actions and total calculation

## Tech Stack

- Java 17+
- Spring Boot 3.3.5
- Maven
- HTML/CSS/JavaScript
- Playwright for UI and browser testing



## Prerequisites

- Java JDK 17 or newer
- Maven installed and available on your `PATH`
- Optional: Node.js/npm for Playwright test execution

## Run the application

From the project root:

```bash
mvn spring-boot:run
```

Then open:

```text
http://localhost:8080
```

## API

The backend exposes the following endpoint:

```text
GET /api/products
```

Example response:

```json
[
  { "id": 1, "name": "Laptop", "price": 55999, "image": "💻" }
]
```


## License

This project is currently configured without a dedicated custom license and uses the package default license entry defined in `package.json`.
