\# Wholesale Order Processing and Supplier Portal



\## Project Overview

The Wholesale Order Processing and Supplier Portal is a web-based application that helps buyers place wholesale orders and allows suppliers to manage orders and update their status.



\## Technologies Used

\- \*\*Frontend:\*\* React, Vite, HTML, CSS, JavaScript

\- \*\*Backend:\*\* Node.js, Express.js

\- \*\*Database:\*\* MySQL

\- \*\*Version Control:\*\* Git and GitHub



\## Main Features

\- User login and authentication

\- Product listing

\- Wholesale order placement

\- Buyer order history

\- Supplier management

\- Supplier order management

\- Order status tracking



\## Project Structure

\- `src/` — Backend application files

\- `frontend/` — React frontend application

\- `tests/` — Test files



\## Prerequisites

\- Node.js and npm

\- MySQL Server



\## Setup Instructions



\### 1. Clone the Repository

```bash

git clone https://github.com/pavanisirisetti9/wholesale-order-processing.git

cd wholesale-order-processing

```



\### 2. Backend Setup

Open the backend project directory, install the dependencies, configure the database connection using your local environment variables, and start the server.



```bash

npm install

npm start

```



\### 3. Frontend Setup

Open a separate terminal in the `frontend` directory and run:



```bash

cd frontend

npm install

npm run dev

```



Open the local URL displayed by Vite in your browser.



\## Database

Create the MySQL database and tables required by the application before starting the backend. Configure the database credentials in the local environment file. Do not upload passwords or secret environment variables to GitHub.



\## Note

The exact environment variables and database setup depend on the backend configuration.





\### Environment Configuration



1\. Copy `.env.example` to a new file named `.env`.

2\. Update the database credentials in `.env`.

3\. Set a strong, unique `JWT\_SECRET`.

4\. Make sure MySQL is running and the `wholesale\_portal` database and required tables exist.

5\. Never upload the actual `.env` file to GitHub.

