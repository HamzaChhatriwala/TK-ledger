# Toy Kingdom Ledger

A secure, lightweight web application to manage customers, invoices/bills, and payments for Toy Kingdom.

**👋 New to React Native Web?** Start with [GETTING_STARTED.md](./GETTING_STARTED.md) for a complete step-by-step guide!

## Tech Stack

- **Frontend**: Expo for Web (React Native components, TypeScript) - **This is a React Native Web app!**
- **Backend**: Supabase (Postgres, Auth, Storage, Edge Functions)
- **State Management**: React Query
- **Testing**: Jest + React Testing Library

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/HamzaChhatriwala/TK-ledger.git
cd TK-ledger
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your Supabase credentials:
```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Set up Supabase database:
   - Create a new Supabase project
   - Run the migrations in `supabase/migrations/` in order (see [SUPABASE_SETUP.md](./SUPABASE_SETUP.md))
   - Set up admin user (see [ADMIN_SETUP.md](./ADMIN_SETUP.md))

5. Start the development server:
```bash
npm run web
```

## Features

### MVP Features

- ✅ Customer Management (CRUD, search, soft-delete)
- ✅ Invoice Management (create, list, filters, status management)
- ✅ Payment Management (record payments, allocate to invoices, auto-reconciliation)
- ✅ Ledger View (customer-specific ledger with running balance, outstanding receivables)
- ✅ Authentication & Role-Based Access (Admin, Cashier, Viewer)
- ✅ Audit Trail (automatic logging of all changes)

## Documentation

- [GETTING_STARTED.md](./GETTING_STARTED.md) - Complete setup guide for beginners
- [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) - Database setup instructions
- [ADMIN_SETUP.md](./ADMIN_SETUP.md) - How to create admin users
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment guide

## Project Structure

```
tk-ledger/
├── app/                    # Expo Router app directory
│   ├── (auth)/            # Authentication screens
│   └── (tabs)/            # Main app tabs
├── components/            # React Native components
│   ├── ui/               # Reusable UI components
│   ├── forms/             # Form components
│   ├── lists/             # List/table components
│   └── layout/            # Layout components
├── lib/                   # Utilities & config
│   ├── supabase/         # Supabase client, RPC wrappers
│   ├── hooks/            # Custom React hooks
│   └── utils/            # Helpers (formatting, validation)
├── types/                 # TypeScript definitions
└── supabase/              # Supabase config
    └── migrations/       # SQL migrations
```

## Available Scripts

- `npm run web` - Start web development server
- `npm start` - Start Expo development server
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

Private - Toy Kingdom Internal Use Only

## Support

For issues or questions, please open an issue on GitHub.

