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

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# GearNest Client

The frontend application for **GearNest**, an equipment rental platform.

> This README is a starting template based on the GearNest project
> requirements discussed during development. Verify environment-variable
> names, routes, and implemented features against the current source
> code before publishing.

## Tech Stack

-   Next.js App Router
-   React and TypeScript
-   Tailwind CSS and daisyUI
-   Better Auth, if configured in this application
-   Motion (`motion/react`) for animations
-   Recharts for charts, where used
-   Lucide React
-   Vercel deployment

## Platform Features

The client is designed to support role-based experiences:

-   **Customer:** browse equipment, view details, manage favorites and
    bookings, and update profile information.
-   **Owner:** manage equipment listings, incoming rental requests, and
    rental analytics.
-   **Admin:** manage platform users, equipment, bookings, and
    analytics.

It also supports responsive layouts, authentication-aware navigation,
and the existing GearNest light/dark theme.

## Getting Started

### Prerequisites

-   Node.js (use the version supported by the project)
-   npm, pnpm, yarn, or bun
-   A running GearNest backend API
-   OAuth credentials if Google sign-in is enabled

### Installation

``` bash
git clone <CLIENT_REPOSITORY_URL>
cd <CLIENT_PROJECT_DIRECTORY>
npm install
```

### Environment Variables

Create `.env.local` in the client root. Example:

``` env
NEXT_PUBLIC_API_URL=https://your-backend-domain.example
```

Use the exact variable names referenced by your source code. Add any
other required public configuration values.

**Important:** Replace the example URL with your deployed backend URL.
Never expose private API keys, OAuth client secrets, database
credentials, or JWT secrets through `NEXT_PUBLIC_` variables. Do not
commit `.env.local`.

### Development

``` bash
npm run dev
```

Open http://localhost:3000.

### Production Build

``` bash
npm run build
npm run start
```

Run `npm run lint` if the project defines a lint script. Check
`package.json` for the exact available scripts.

## Backend Connection

The client communicates with the GearNest server through its API. For
production:

1.  Confirm the backend is deployed and reachable.
2.  Set the client API URL to the deployed backend, not `localhost`.
3.  Configure the backend to allow the deployed frontend origin.
4.  Confirm protected requests send the required session cookie or
    bearer token.
5.  Ensure the client and server authentication URLs and callback
    settings agree.

To debug missing data, inspect the browser developer tools' **Network**
and **Console** tabs. Check the request URL, status code, and response
body.

## Authentication and Google Sign-In

If Better Auth and Google sign-in are enabled:

1.  Configure the production authentication URL.
2.  Add the exact OAuth callback URL used by the authentication handler
    to Google Cloud Console.
3.  Set the Google client ID and secret in the environment where the
    auth handler runs.
4.  Configure allowed origins/trusted origins as required.
5.  Redeploy after changing environment variables.

The callback URL depends on where Better Auth is hosted. Confirm it from
the actual configuration; do not assume it is always the frontend or
backend URL.

## Deployment

The frontend can be deployed to [Vercel](https://vercel.com/):

1.  Import the client repository.
2.  Set the correct project root directory.
3.  Add all required production environment variables.
4.  Deploy and verify the production API URL and authentication
    configuration.

Pushes to the connected Git branch can trigger automatic deployments.

## Suggested Structure

Actual folders may differ.

``` text
src/
├── app/
├── components/
├── hooks/
├── lib/
├── services/
├── types/
└── utils/
```

## Development Guidelines

-   Keep API requests in the existing service/API layer.
-   Use verified authentication context to identify the current user.
-   Never trust a browser-supplied user ID to scope private data.
-   Provide loading, error, and empty states for data-driven pages.
-   Enforce authorization on the backend; hiding frontend buttons is not
    security.
-   Preserve the existing GearNest theme implementation.

## Troubleshooting

  -----------------------------------------------------------------------
  Problem                             Check
  ----------------------------------- -----------------------------------
  API data is missing                 Production API URL, backend health,
                                      endpoint path, Network response

  `404` from API                      Route path and API base URL

  `401` from API                      Session/token handling and auth
                                      configuration

  `403` from API                      Role permissions and resource
                                      ownership

  CORS error                          Backend allowed origins and
                                      credentials configuration

  Google sign-in fails                OAuth client settings, exact
                                      callback URL, allowed origins,
                                      production variables

  Changes do not appear               Redeploy and verify the connected
                                      Git branch
  -----------------------------------------------------------------------

## Security

-   Keep secrets out of client-side code and Git.
-   Only expose browser-safe values through `NEXT_PUBLIC_` variables.
-   Enforce permissions on the server.
-   Never log access tokens or sensitive user data.

## License

Add the license and usage terms applicable to this project.

