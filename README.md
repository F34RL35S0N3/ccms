# Cygnus Competition Management System (CCMS)

Single Source of Truth untuk seluruh aktivitas kompetisi tim Cygnus.

## Features

- **Dashboard** - Overview statistik, deadline, progress, dan aktivitas
- **Competition Management** - Kelola seluruh kompetisi dengan workflow
- **Task Management** - Kanban board mirip Jira/Trello
- **Deadline Center** - Pantau deadline dengan countdown dan warning system
- **Calendar** - Timeline dan jadwal kompetisi
- **Team Management** - Profil anggota dan skill mapping
- **Document Center** - Pusat penyimpanan dokumen dengan versioning
- **Knowledge Base** - Tips, strategi, template, dan lessons learned
- **Analytics** - Visualisasi data dan performa tim
- **Notification System** - Email, WhatsApp, Telegram notifications

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion
- **Backend**: Next.js Server Actions, Prisma ORM
- **Database**: PostgreSQL
- **Auth**: NextAuth.js
- **Charts**: Recharts
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 16+

### Installation

1. Clone repository
```bash
git clone <repository-url>
cd ccms
```

2. Install dependencies
```bash
npm install
```

3. Setup environment variables
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Setup database
```bash
npx prisma generate
npx prisma db push
npx prisma db seed
```

5. Run development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Docker Deployment

```bash
docker-compose up -d
```

## Project Structure

```
ccms/
├── app/                    # Next.js App Router
│   ├── (dashboard)/        # Dashboard layout group
│   ├── api/                # API routes
│   ├── globals.css         # Global styles
│   └── layout.tsx          # Root layout
├── components/             # React components
│   ├── ui/                 # shadcn/ui components
│   ├── layout/             # Layout components
│   ├── dashboard/          # Dashboard components
│   └── ...
├── lib/                    # Utilities
│   ├── utils.ts            # Helper functions
│   ├── db.ts               # Prisma client
│   └── mock-data.ts        # Mock data
├── types/                  # TypeScript types
├── prisma/                 # Prisma schema
└── public/                 # Static assets
```

## License

MIT License
