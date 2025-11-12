# ⚽ Prem Pulse - Premier League Analytics Platform

A full-stack web application for tracking Premier League statistics, match results, and AI-powered match predictions.

![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.1.5-brightgreen)
![React](https://img.shields.io/badge/React-18.2.0-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED)

## 🎯 Features

- **Live Standings**: Real-time Premier League table with team statistics
- **Match Tracking**: View past results and upcoming fixtures
- **Team Details**: Click any team to see full squad information with country flags
- **AI Predictions**: Smart match outcome predictions based on:
  - Team form (last 5 matches)
  - League position & points
  - Home advantage
  - Head-to-head analysis
- **Responsive Design**: Modern, minimalist UI with Material-UI
- **Automated Updates**: Hourly data refresh from Football-Data.org API

## 🛠️ Tech Stack

### Backend
- **Spring Boot 3.1.5** - RESTful API
- **PostgreSQL** - Database
- **JPA/Hibernate** - ORM
- **Maven** - Dependency management
- **Scheduled Tasks** - Automated data updates

### Frontend
- **React 18** - UI Framework
- **Material-UI (MUI)** - Component library
- **React Router** - Navigation
- **Axios** - HTTP client
- **date-fns** - Date formatting

### DevOps
- **Docker & Docker Compose** - Containerization
- **Nginx** - Frontend web server

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Football-Data.org API key ([Get one here](https://www.football-data.org/client/register))

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/prem-pulse.git
cd prem-pulse
```

2. **Set up environment variables**
```bash
# Frontend
echo "REACT_APP_FOOTBALL_DATA_API_KEY=your_api_key_here" > frontend/.env
echo "REACT_APP_API_URL=http://localhost:8080/api" >> frontend/.env
```

3. **Start the application**
```bash
docker-compose up -d --build
```

4. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080/api

5. **Wait for initial data load** (2-3 minutes)
   - The app automatically fetches Premier League data on startup
   - Check logs: `docker-compose logs -f backend`

## 📊 API Endpoints

### Clubs
- `GET /api/clubs` - Get all clubs with standings
- `GET /api/clubs/{id}` - Get club details
- `POST /api/clubs/{id}/fetch-squad` - Fetch squad from API

### Matches
- `GET /api/matches` - Get all matches
- `GET /api/matches/upcoming` - Get upcoming matches
- `GET /api/matches/week/{week}` - Get matches by week

### Predictions
- `GET /api/predictions/upcoming` - Get predictions for next 10 matches
- `POST /api/predictions/generate` - Generate new predictions
- `DELETE /api/predictions/clear` - Clear all predictions

### Data Management
- `POST /api/data/refresh` - Manual data refresh
- `GET /api/data/status` - Check API status

## 🎨 Screenshots

### Dashboard
Overview of league statistics and top scorers

### Standings
Complete league table with team performance metrics

### Team Details
Full squad roster with player information and country flags

### Match Predictions
AI-powered predictions for upcoming fixtures

## 🧠 Prediction Algorithm

The prediction system analyzes:

1. **Recent Form (20%)** - Last 5 match results (W=3pts, D=1pt, L=0pts)
2. **League Position (30%)** - Current standing in the table
3. **Points Difference (20%)** - Total points accumulated
4. **Home Advantage (10-15%)** - Playing at home stadium
5. **Elite vs Relegation Bonus** - Extra weight for top 4 vs bottom 4 matchups

Win probabilities are normalized and capped between 5-85% for realistic predictions.

## 🏗️ Project Structure

```
prem-pulse/
├── backend/
│   ├── src/main/java/com/premierleague/analytics/
│   │   ├── controller/     # REST controllers
│   │   ├── entity/         # JPA entities
│   │   ├── repository/     # Data repositories
│   │   ├── service/        # Business logic
│   │   └── AnalyticsApplication.java
│   ├── src/main/resources/
│   │   └── application.yml # Configuration
│   └── pom.xml
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   └── App.js
│   └── package.json
├── docker-compose.yml
└── README.md
```

## 🔧 Configuration

### Backend (`backend/src/main/resources/application.yml`)
```yaml
server:
  port: 8080
  servlet:
    context-path: /api

spring:
  datasource:
    url: jdbc:postgresql://postgres:5432/premierleague
    username: admin
    password: admin123
```

### Frontend Environment Variables
```env
REACT_APP_FOOTBALL_DATA_API_KEY=your_api_key
REACT_APP_API_URL=http://localhost:8080/api
```

## 🐳 Docker Commands

```bash
# Build and start all services
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Restart a service
docker-compose restart backend
docker-compose restart frontend

# Remove all containers and volumes
docker-compose down -v
```

## 📝 Development

### Backend Development
```bash
cd backend
mvn spring-boot:run
```

### Frontend Development
```bash
cd frontend
npm install
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [Football-Data.org](https://www.football-data.org/) for providing the API
- [Material-UI](https://mui.com/) for the component library
- Premier League for the inspiration

## 📧 Contact

Your Name - [@yourtwitter](https://twitter.com/yourtwitter)

Project Link: [https://github.com/yourusername/prem-pulse](https://github.com/yourusername/prem-pulse)

---

⭐ Star this repo if you find it helpful!
