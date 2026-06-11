# 🐔 FarmTrack — Poultry Farm Management System

A full-stack farm management system built for real-world use by a poultry farmer in Lagos, Nigeria.

## Tech Stack

**Backend:** ASP.NET Core 8 Web API, Entity Framework Core, SQL Server, JWT Auth  
**Frontend:** React, Tailwind CSS, Framer Motion, Recharts, Lucide Icons

## Features

- 🥚 Daily egg production tracking
- 🐓 Flock & bird batch management
- 💰 Egg sales & payment tracking
- 🐔 Bird sales (old layers & retired birds)
- 💸 Expense tracking with categories
- 👷 Worker management & daily attendance
- 💀 Mortality records & cause analysis
- 📊 Dashboard with operating profit, bird sales income & total cash

## Project Structure

FarmTrack/
├── FarmTrack.Core/ Domain entities & interfaces
├── FarmTrack.Infrastructure/ EF Core, repositories, database
├── FarmTrack.API/ ASP.NET Core Web API
└── farmtrack-client/ React frontend

## Getting Started

### Backend

1. Open FarmTrack.slnx in Visual Studio
2. Update connection string in FarmTrack.API/appsettings.json
3. Run migrations in Package Manager Console:
   Update-Database -Project FarmTrack.Infrastructure -StartupProject FarmTrack.API
4. Press F5 to run the API

### Frontend

cd farmtrack-client
npm install
npm start

## Architecture

Clean 3-layer architecture:

- Core — business logic, no dependencies
- Infrastructure — database, repositories
- API — controllers, DTOs, authentication
