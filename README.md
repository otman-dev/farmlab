````markdown
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## MongoDB Configuration

This application requires a MongoDB database connection. Follow these steps to set up your MongoDB configuration:

1. Create a MongoDB database (either locally or using a cloud service like MongoDB Atlas)
2. Create a `.env.local` file in the root directory with the following content:

```
MONGODB_URI=mongodb://<username>:<password>@<host>:<port>/<database>
# Or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority

NEXTAUTH_SECRET=your_nextauth_secret_key_here
NEXTAUTH_URL=http://localhost:3000
```

3. Replace the placeholders with your actual MongoDB credentials:
   - `<username>`: Your MongoDB username
   - `<password>`: Your MongoDB password
   - `<host>`: Your MongoDB host (localhost for local development)
   - `<port>`: Your MongoDB port (typically 27017)
   - `<database>`: Your database name (e.g., farmLab)

4. For local MongoDB development without authentication, you can use:
```
MONGODB_URI=mongodb://localhost:27017/farmLab
```

5. Make sure to secure your MongoDB server with proper authentication for production environments.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
