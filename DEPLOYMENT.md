# DocuGuard: Deployment Guide for Vercel

This guide provides step-by-step instructions on how to deploy the DocuGuard application to [Vercel](https://vercel.com).

## Features Overview

### Frontend Features
- **Next.js & React**: A modern, fast, and scalable frontend using the App Router.
- **File Upload**: Drag-and-drop or browse to upload documents for analysis.
- **Dynamic Analysis Page**: Displays forgery confidence score, highlighted suspect areas, and detailed AI-generated reports.
- **Admin Dashboard**: A secure area for administrators to view user and document data stored in Firebase.
- **Responsive Design**: The UI is fully responsive and built with Tailwind CSS and ShadCN UI.

### Backend & AI Features
- **Firebase Authentication**: Securely manages user and admin sign-in. It uses anonymous authentication for regular users and email/password for admins.
- **Firestore Database**: Stores all user information, uploaded document metadata, and analysis results.
- **Genkit & Google AI**: The backend uses Firebase Genkit with the Gemini model to perform all AI-driven analysis, including summarizing findings, generating reports, and explaining the confidence score.
- **Serverless Functions**: Genkit flows are deployed as serverless functions, ensuring scalability and efficiency.

---

## Deployment to Vercel

Follow these steps to get your project live on Vercel.

### Step 1: Push to a Git Repository

Vercel deploys directly from a Git repository.
1.  Create a new repository on a provider like [GitHub](https://github.com/), [GitLab](https://gitlab.com/), or [Bitbucket](https://bitbucket.org/).
2.  Follow the instructions to push your local project code to the new repository.

### Step 2: Create a New Vercel Project

1.  **Sign up or Log in** to your [Vercel account](https://vercel.com/login).
2.  From your dashboard, click **"Add New..."** -> **"Project"**.
3.  **Import your Git Repository** that you created in Step 1. Vercel will automatically detect that it's a Next.js project.

### Step 3: Configure Environment Variables

This is the most critical step. Vercel needs your Firebase and Google AI API keys to connect to the backend services. You'll add these in the **"Environment Variables"** section of your Vercel project settings.

#### A. Get Firebase Configuration

1.  Go to the [Firebase Console](https://console.firebase.google.com/).
2.  Select your project (or create a new one).
3.  Go to **Project Settings** (click the gear icon ⚙️ next to "Project Overview").
4.  In the "General" tab, scroll down to **"Your apps"**.
5.  Find your web app and click on the **"SDK setup and configuration"** section.
6.  Select **"Config"**. You will see a `firebaseConfig` object.

#### B. Add Firebase Variables to Vercel

Add the following environment variables in Vercel, copying the values from your `firebaseConfig` object.

| Vercel Variable Name                  | Firebase Config Key  | Example Value                       |
| ------------------------------------- | -------------------- | ----------------------------------- |
| `NEXT_PUBLIC_FIREBASE_API_KEY`        | `apiKey`             | `AIzaSy...`                         |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`    | `authDomain`         | `your-project-id.firebaseapp.com`   |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID`     | `projectId`          | `your-project-id`                   |
| `NEXT_PUBLIC_FIREBASE_APP_ID`         | `appId`              | `1:1234...`                         |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`| `messagingSenderId`| `1234...`                           |

**Note**: The `NEXT_PUBLIC_` prefix is required to expose these variables to the client-side code in Next.js.

#### C. Get Google AI API Key for Genkit

1.  Go to the [Google AI Studio](https://aistudio.google.com/app/apikey).
2.  Click **"Create API key"** to generate a new key.
3.  Copy the key.

#### D. Add Google AI Variable to Vercel

Add the following environment variable to your Vercel project. This one is a server-side secret and **must not** have the `NEXT_PUBLIC_` prefix.

| Vercel Variable Name | Description                    | Example Value      |
| -------------------- | ------------------------------ | ------------------ |
| `GEMINI_API_KEY`     | Your Google AI (Gemini) API Key. | `AIzaSy...`        |

### Step 4: Deploy

1.  After configuring the environment variables, go to the **"Deployments"** tab in your Vercel project.
2.  Trigger a new deployment for the `main` branch.
3.  Vercel will build and deploy your application. Once finished, you'll be given a public URL to your live site!

### Step 5: (Required) Add Your Vercel URL to Firebase Auth

To ensure Firebase Authentication works on your live site, you must add your Vercel deployment URL to the list of authorized domains.

1.  Go back to the [Firebase Console](https://console.firebase.google.com/).
2.  Navigate to **Authentication** -> **Settings** -> **Authorized domains**.
3.  Click **"Add domain"** and enter the domain Vercel provided (e.g., `docuguard-your-name.vercel.app`).

Your DocuGuard application is now fully deployed and configured!
