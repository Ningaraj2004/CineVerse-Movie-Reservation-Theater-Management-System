# 🎬 CineVerse — Movie Reservation & Theater Management System

CineVerse is a modern, responsive web application for movie discovery, seat reservations, digital ticketing, and theater management. It provides an interactive booking experience for users and a dashboard for administrators to manage movies, showtimes, screens, and booking analytics.

## ✨ Features

### 🎟️ Movie Booking

- Browse and discover movies through an interactive catalog.
- View movie details and available showtimes.
- Select seats using an interactive seating layout.
- Choose Standard, Premium, and VIP seating options with different prices.
- Prevent duplicate seat bookings within the application's booking flow.
- Add concessions and optional extras during booking.

### 🎫 Digital Tickets

- View booking confirmations and digital ticket passes.
- Display ticket details in a QR-code modal.
- Review booking information after reservation.

### ⭐ Reviews & Ratings

- Submit movie ratings and reviews.
- Browse feedback from other users.

### 📊 Admin Dashboard

- View booking revenue and seat occupancy analytics.
- Manage movie catalog information.
- Manage theater screens and show schedules.
- Explore administrative features using the demo role-switching interface.

### 🧪 API Explorer

- Explore the application's mock REST API architecture.
- Demonstrate application data operations without requiring a separately deployed backend.

## 🛠️ Tech Stack

| Technology            | Purpose                                          |
| --------------------- | ------------------------------------------------ |
| React 19              | User interface                                   |
| TypeScript            | Type-safe JavaScript                             |
| Vite                  | Development server and build tool                |
| Tailwind CSS v4       | Responsive styling                               |
| Lucide React          | Icons                                            |
| Motion                | UI animations                                    |
| Canvas Confetti       | Booking success effects                          |
| Browser Local Storage | Local persistence for supported application data |

## 🏗️ Architecture

CineVerse uses a frontend-based mock REST architecture. Application operations are simulated in the browser, and supported data is stored in Local Storage.

```text
                CineVerse
                    |
             React + TypeScript
                    |
          UI Components and Pages
                    |
          Mock REST Service Layer
                    |
             Browser Storage
                    |
       Movies, Bookings, Reviews,
       Showtimes and Demo Settings
```

**Note:** This is a local demonstration application, not a production booking platform with a centralized backend. Browser Local Storage does not synchronize bookings between different users or devices.

## 🚀 Getting Started

### Prerequisites

Install the following:

- [Node.js](https://nodejs.org/) — use a version supported by the project's Vite dependencies.
- npm — included with Node.js.
- [Git](https://git-scm.com/) — for version control.

### 1. Clone the repository

Replace `YOUR_GITHUB_USERNAME` with your GitHub username.

```bash
git clone https://github.com/Ningaraj2004/CineVerse-Movie-Reservation-Theater-Management-System.git
```

### 2. Navigate to the project

```bash
cd CineVerse-Movie-Reservation-Theater-Management-System
```

### 3. Install dependencies

```bash
npm install
```

### 4. Start the development server

```bash
npm run dev
```

Open the local URL printed in your terminal. Vite commonly uses `http://localhost:5173`, unless the project is configured differently.

### 5. Build for production

```bash
npm run build
```

### 6. Preview the production build

```bash
npm run preview
```

## 📜 Available Scripts

| Command           | Description                                      |
| ----------------- | ------------------------------------------------ |
| `npm run dev`     | Start the local development server               |
| `npm run build`   | Build the application for production             |
| `npm run preview` | Preview the production build                     |
| `npm run lint`    | Run lint checks, if configured in `package.json` |

## 💾 Data Storage

CineVerse stores supported demo data in the browser using Local Storage.

- Data may remain available after refreshing the page in the same browser.
- Clearing browser storage may remove saved demo data.
- Data is not automatically shared between browsers or devices.
- Mock booking and seat availability logic should not be treated as a secure, centralized reservation system.

## 🔐 Security & Production Considerations

CineVerse is intended for demonstration and learning purposes.

Before using a similar application for real bookings, implement:

- A secure backend and centralized database.
- Server-side authentication and role-based authorization.
- Transaction-safe seat reservations to prevent concurrent bookings.
- Secure payment processing through a trusted payment provider.
- Server-side validation, logging, monitoring, and error handling.
- Appropriate protection for personal and booking information.

The frontend demo role switch is not a substitute for real access control.

## 🔮 Future Enhancements

- FastAPI backend with a relational database.
- Secure user authentication and authorization.
- Real-time seat availability.
- Payment gateway integration.
- QR-code ticket verification.
- Email and booking notifications.
- Movie recommendations based on user preferences.
- Cloud deployment and automated testing.

## 🤝 Contributing

Contributions and suggestions are welcome.

1. Fork the repository.
2. Create a feature branch.
3. Make your changes and test them.
4. Commit and push your changes.
5. Open a pull request.

## 👨‍💻 Author

**Ningaraja G M**

- GitHub: [Ningaraj2004](https://github.com/Ningaraj2004)

---

If you find this project useful, consider giving the repository a ⭐ on GitHub.
