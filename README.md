# Marketplace App

The Marketplace App is an internal platform designed to facilitate the buying, selling, and exchange of assets within an organization. Built with a modern tech stack, it offers a seamless user experience, robust functionality, and secure transactions. Key features include user profiles, asset listings, comments, ratings, and administrative tools for managing content and users.

---

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Getting Started (Local Development)](#getting-started-local-development)
- [Deployment (GCP with Firebase)](#deployment-gcp-with-firebase)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- **User Profiles**: Manage personal information, track activity, and view ratings.
- **Asset Listings**: Create, view, and manage asset listings with detailed descriptions and images.
- **Comments and Ratings**: Engage with assets through comments and rate user interactions.
- **Admin Tools**: Administrative features for managing users, assets, and content moderation.
- **Secure Authentication**: User authentication and authorization powered by Firebase.
- **Real-time Updates**: Live updates for comments, ratings, and asset changes using Firestore.

---

## Technologies Used

- **Frontend**: Vue.js 3, Vuetify 3
- **Backend**: Firebase (Firestore, Authentication, Storage, Hosting)
- **Development Tools**: Vite, Firebase Emulators, Node.js, npm

---

## Getting Started (Local Development)

To set up the project locally, follow these steps:

### Prerequisites

- **Node.js and npm**: Ensure you have Node.js (v16+) and npm installed.
- **Firebase CLI**: Install the Firebase CLI globally:

    ```bash
    npm install -g firebase-tools
    ```

### Installation

1. **Clone the Repository**:

    ```bash
    git clone https://github.com/your-repo/marketplace-app.git
    cd marketplace-app
    ```

2. **Install Dependencies**:

    ```bash
    npm install
    ```

3. **Set Up Firebase Emulators**:

    The project uses Firebase Emulators for local development. Start the emulators with:

    ```bash
    firebase emulators:start
    ```

    This will run Firestore, Authentication, and other services locally.

4. **Configure Firebase**:

    Create a `.env` file in the root directory with your Firebase configuration:

    ```env
    VITE_FIREBASE_API_KEY=your-api-key
    VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
    VITE_FIREBASE_PROJECT_ID=your-project-id
    VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
    VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
    VITE_FIREBASE_APP_ID=your-app-id
    ```

    Replace the placeholders with your Firebase project’s configuration values.

5. **Run the Development Server**:

    Start the Vite development server:

    ```bash
    npm run dev
    ```

    Access the app at [http://localhost:5173](http://localhost:5173).

---

## Deployment (GCP with Firebase)

To deploy the app on a new GCP account using Firebase, follow these steps:

### Prerequisites

- **GCP Account**: Ensure you have a Google Cloud Platform account.
- **Firebase CLI**: Install the Firebase CLI globally (if not already done):

    ```bash
    npm install -g firebase-tools
    ```

### Deployment Steps

1. **Create a Firebase Project**:

    - Go to the [Firebase Console](https://console.firebase.google.com/).
    - Click "Add project" and follow the prompts to create a new project.
    - Enable the necessary services: Firestore, Authentication, and Storage.

2. **Set Up Firebase Services**:

    - **Firestore**: Create a Firestore database in "Native mode."
    - **Authentication**: Enable authentication methods (e.g., Email/Password, Google).
    - **Storage**: Set up Firebase Storage for asset images or files.

3. **Configure Security Rules**:

    Update Firestore and Storage security rules to match your project’s requirements. Example rules are in `firestore.rules` and `storage.rules`. Deploy rules using:

    ```bash
    firebase deploy --only firestore:rules,storage:rules
    ```

4. **Initialize Firebase in the Project**:

    - Log in to Firebase CLI:

        ```bash
        firebase login
        ```

    - Initialize Firebase in the project directory:

        ```bash
        firebase init
        ```

    - Select "Hosting" and choose your Firebase project.
    - Set the public directory to `dist` (for Vite builds).

5. **Build the Project**:

    Build the Vue.js app for production:

    ```bash
    npm run build
    ```

6. **Deploy to Firebase Hosting**:

    Deploy the app:

    ```bash
    firebase deploy --only hosting
    ```

    Access the deployed app at the provided URL (e.g., `https://your-project-id.web.app`).

---

## Usage

Once the app is running:

1. **Sign Up / Log In**: Create an account or log in using Firebase Authentication.
2. **Create Assets**: List assets with titles, descriptions, and images.
3. **Engage**: Comment on assets, rate users, and manage your profile.
4. **Admin Features**: If you’re an admin, manage users, assets, and content.

---

## Contributing

Contributions are welcome! To contribute:

1. Fork the repository.
2. Create a new branch for your feature or bugfix.
3. Commit your changes and push to your fork.
4. Submit a pull request with a detailed description of your changes.

---

## License

This project is licensed under the MIT License.