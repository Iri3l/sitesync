# Changelog

All notable changes to SiteSync will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-01-06

### Added
- Initial release of SiteSync
- Site Diary module with daily entries, photos, weather, and worker tracking
- Snags management with priorities, status tracking, and photo attachments
- Stock management with inventory tracking, transactions, and alerts
- Role-based access control (Manager, Supervisor, User)
- Authentication system with email/password
- AI-powered delivery note processing using OpenAI GPT-4 Vision
- PDF and Excel export functionality for Snags and Stock
- File upload system for snag photos
- Multi-site support
- User profile management
- Responsive design with Tailwind CSS and shadcn/ui components

### Features
- **Manager Role**: Full access to all features including site creation, snag management, stock management, and exports
- **Supervisor Role**: Limited access with ability to add photos, change snag status, and record stock transactions
- **User Role**: View-only access to sites, snags, and stock for assigned sites
- Site-specific filtering for supervisors and users
- Real-time stock level alerts
- Transaction history tracking
- Photo management for snags

### Technical
- Next.js 14+ with App Router
- TypeScript for type safety
- Prisma ORM with MySQL/PostgreSQL support
- NextAuth.js for authentication
- OpenAI API integration
- PDFKit for PDF generation
- XLSX for Excel export

[1.0.0]: https://github.com/Iri3l/sitemanager/releases/tag/v1.0.0

