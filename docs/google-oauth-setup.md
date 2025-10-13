# Google OAuth Integration for FarmLab

This document provides instructions for setting up Google OAuth integration with FarmLab.

## Setup Instructions

1. **Create Google OAuth Credentials**:

   - Go to the [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Navigate to "APIs & Services" > "Credentials"
   - Click "Create Credentials" and select "OAuth client ID"
   - Select "Web application" as the application type
   - Add your application name
   - Add authorized JavaScript origins:
     - `http://localhost:3000` (for local development)
     - Your production domain (when deployed)
   - Add authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google` (for local development)
     - `https://yourdomain.com/api/auth/callback/google` (for production)
   - Click "Create" to generate your client ID and client secret

2. **Update Environment Variables**:

   Add the following to your `.env.local` file:

   ```
   # Google OAuth
   GOOGLE_CLIENT_ID=your_client_id_here
   GOOGLE_CLIENT_SECRET=your_client_secret_here
   ```

3. **Testing the Integration**:

   - Start your development server with `npm run dev`
   - Visit `http://localhost:3000/auth/register`
   - Click "Continue with Google"
   - You should be prompted to select a Google account
   - After authentication, you'll be redirected to the profile completion page if your profile is incomplete, or to the dashboard if your profile is already complete.

## Flow Description

The authentication flow works as follows:

1. User clicks "Continue with Google" on the registration or sign-in page
2. User authenticates with Google
3. If this is the user's first time signing in with Google:
   - A new user record is created with basic information from Google
   - User is redirected to complete their profile
4. If the user has signed in before but hasn't completed their profile:
   - User is redirected to complete their profile
5. If the user has a complete profile:
   - User is redirected to the appropriate dashboard based on their role

## Troubleshooting

- **"Error: Configuration"**: Verify that your environment variables are set correctly
- **"Error: OAuthAccountNotLinked"**: This means the email is already registered with another authentication method. The user should sign in with the original method they used to create the account.
- **"Error: AccessDenied"**: The user does not have permission to access the requested resource.

For any other issues, check the server logs for more detailed error information.