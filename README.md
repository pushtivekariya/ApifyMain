# Apify Actor Runner

This is a dynamic web application that allows users to integrate with the Apify platform, dynamically map input fields for Apify actors, and execute a single run based on user input, with real-time results.

## Features

-   **API Key Input:** Securely prompt the user to enter their Apify API key.
-   **Actor Listing:** Fetch and display a list of Apify actors accessible to the user.
-   **Dynamic Schema Mapping:** When an actor is selected, its input schema is dynamically fetched and presented as a key-value input UI.
-   **Single Execution:** Execute a chosen actor with the user-provided inputs.
-   **Real-time Status & Results:** Display real-time execution progress, errors, and the final output or a link to the result on Apify Console.

## Project Structure

The project is organized as a monorepo with separate `frontend` (React) and `backend` (Node.js/Express) applications.

```
/Apify/
├── frontend/             # React application
│   ├── public/
│   ├── src/
│   │   ├── components/   # Reusable React components
│   │   ├── App.js        # Main React application component
│   │   ├── App.css       # Styling for the application
│   │   └── index.js      # React entry point
│   ├── package.json
│   └── ...
├── backend/              # Node.js/Express application
│   ├── routes/           # API routes (e.g., apify.js)
│   ├── app.js            # Main Express application
│   ├── package.json
│   └── ...
├── .gitignore            # Git ignore file
├── README.md             # This README file
```

## Setup and Running the Application

Follow these steps to set up and run the application locally.

### Prerequisites

-   Node.js (LTS version recommended)
-   npm (comes with Node.js)
-   An Apify account and an [Apify API Token](https://console.apify.com/account/api-token)

### 1. Clone the Repository (if not already done)

```bash
git clone https://github.com/pushtivekariya/ApifyMain.git
cd Apify
```

### 2. Backend Setup

Navigate to the `backend` directory and install dependencies:

```bash
cd backend
npm install
```

Start the backend server:

```bash
npm run start
# or, for development with auto-restarts (install nodemon first: npm install -g nodemon)
# nodemon app.js
```

The backend server will typically run on `http://localhost:4000`.

### 3. Frontend Setup

Open a **new terminal window**, navigate to the `frontend` directory, and install dependencies:

```bash
cd frontend
npm install
```

Start the React development server:

```bash
npm run dev
```

This will usually open the application in your browser at `http://localhost:5173` (or another available port).

## How to Use the Application

1.  **Enter API Key:** On the initial screen, enter your Apify API Token into the provided input field and click "Submit".
2.  **Select an Actor:** After successful API key submission, a list of actors you have access to will be displayed. Click on an actor's name to select it.
3.  **Map Input Schema:** Once an actor is selected, its input schema will be dynamically rendered. Fill in the required values for the input fields.
    *   **Note:** For fields of type `object` or `array`, you must enter valid JSON. Ensure your JSON is correctly formatted.
4.  **Run Actor:** Click the "Run Actor" button. The application will display the execution status in real-time.
5.  **View Results:** Once the actor run succeeds, the results from its default dataset will be displayed, or a link to the Apify Console run will be provided.

## Tested Actor

This application was primarily tested with the following Apify public actor (you can find it in the Apify Store):

**Actor Name:** `apify/website-content-crawler`
**Actor ID (if needed):** `apify/website-content-crawler`

**Example Input for `apify/website-content-crawler`:**

```json
{
    "startUrls": [
        {
            "url": "https://www.apify.com"
        }
    ],
    "globs": [
        {
            "glob": "https://www.apify.com/"
        }
    ],
    "maxRequestsPerCrawl": 1,
    "maxDepth": 0
}
```

*   **Note:** The `inputSchema` for this actor will dynamically generate fields for `startUrls`, `globs`, `maxRequestsPerCrawl`, `maxDepth`, etc. For `startUrls` and `globs` (which are arrays of objects), you will need to enter valid JSON in the textarea field for those inputs.

## Assumptions Made

-   The Apify API Key provided by the user is valid and has sufficient permissions to list actors, fetch schemas, and run actors.
-   The backend runs on `http://localhost:3000` and the frontend on `http://localhost:5173`.
-   The application focuses on single actor execution and does not persist user data (API keys, run history) beyond the current session.
-   Basic error handling and loading states are implemented for a better user experience.
-   Complex JSON schema types (`object`, `array`) are handled with a basic `textarea` for raw JSON input, requiring the user to provide valid JSON.

--- 