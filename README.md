# DocuGuard: AI-Powered Forgery Detection

Welcome to DocuGuard! This is a web application built with Next.js that uses Artificial Intelligence to analyze documents and detect potential signs of forgery. Users can upload a document, and the application provides a fraud confidence score along with a detailed report of the analysis.

## Tech Stack

This project is built with a modern, robust, and scalable tech stack:

- **Framework**: [Next.js](https://nextjs.org/) (using the App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **UI**: [React](https://react.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [ShadCN UI](https://ui.shadcn.com/)
- **Generative AI**: [Firebase Genkit](https://firebase.google.com/docs/genkit)
- **Icons**: [Lucide React](https://lucide.dev/guide/packages/lucide-react)

## Project Structure

Here's a breakdown of the key directories and files in the project:

- **/src/app/**: Contains the core application routes and pages.
  - `page.tsx`: The homepage where users can upload documents.
  - `analysis/[id]/page.tsx`: The page that displays the forgery analysis results.
  - `layout.tsx`: The main layout for the application.
  - `globals.css`: Global styles and Tailwind CSS configuration.
- **/src/components/**: Contains reusable React components.
  - `ui/`: Auto-generated UI components from ShadCN UI.
  - `layout/`: Components related to the app's layout, like the header.
- **/src/ai/**: Contains all the AI-related logic, powered by Genkit.
  - `flows/`: Defines the AI "flows" that perform specific tasks like generating reports or explaining scores.
  - `genkit.ts`: Configures the Genkit instance and the AI model being used.
- **/src/lib/**: Contains library code, utilities, and static data.
  - `utils.ts`: Utility functions, like `cn` for combining CSS classes.
  - `placeholder-images.json`: A JSON file to manage placeholder image data.
- **/public/**: For static assets like images. (Not used in this version).
- `package.json`: Lists the project dependencies and scripts.
- `tailwind.config.ts`: Configuration file for Tailwind CSS.
- `next.config.ts`: Configuration file for Next.js.

## How to Run the Project

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended)
- [npm](https://www.npmjs.com/) (usually comes with Node.js)

### Installation and Running

1.  **Install Dependencies**:
    Open your terminal in the project root and run the following command to install all the necessary packages defined in `package.json`:
    ```bash
    npm install
    ```

2.  **Run the Development Server**:
    Once the dependencies are installed, start the Next.js development server:
    ```bash
    npm run dev
    ```

3.  **Open in Browser**:
    The application will be running at [http://localhost:9002](http://localhost:9002).

## How It Works

The application flow is straightforward:

1.  **File Upload**: On the homepage (`src/app/page.tsx`), the user can drag-and-drop or browse to select a document file (PDF, JPG, PNG).
2.  **Initiate Analysis**: After selecting a file, the user clicks the "Analyse Document" button. This action simulates an upload and redirects the user to the analysis page (`/analysis/[id]`).
3.  **AI Analysis**: The analysis page (`src/app/analysis/[id]/page.tsx`) triggers several asynchronous AI flows defined in `/src/ai/flows/`:
    - A random `confidenceScore` is generated for demonstration purposes.
    - `summarizeDocumentFindings`: Creates a brief summary of the findings.
    - `generateFraudReport`: Generates a detailed, structured report.
    - `explainConfidenceScore`: Explains the factors that contributed to the score.
4.  **Display Results**: The page displays the results as they are returned from the AI flows. This includes:
    - The document preview with highlighted "suspect areas".
    - A circular progress bar representing the fraud confidence score.
    - An accordion component containing the Analysis Summary, Full Report, and Score Explanation.

The AI functionality is powered by **Genkit**, which orchestrates calls to a Large Language Model (in this case, a Google Gemini model). The prompts and expected output schemas (using Zod) are clearly defined in each flow file, ensuring structured and reliable AI responses.
