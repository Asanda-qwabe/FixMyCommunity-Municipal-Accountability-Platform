# FixMyCommunity – Municipal Accountability Platform

FixMyCommunity is a civic-tech platform focused on transparent, real-time issue reporting between residents and municipalities.

## Current Stack (Free/Open Source)
- **Frontend:** HTML, CSS, JavaScript (`fixmycommunity/frontend`)
- **Backend:** FastAPI + SQLAlchemy (`fixmycommunity/backend/app`)
- **Database:** SQLite (default local file `fixmycommunity.db`)

## Project Structure
```text
fixmycommunity/
  backend/
    app/
      main.py         # FastAPI routes and business flow
      database.py     # SQLAlchemy engine + session
      models.py       # DB tables (Issue, Team, Announcement, EmergencyRequest)
      schemas.py      # API request/response models
  frontend/
    index.html        # Multi-screen civic app UI
    assets/
      css/styles.css  # Styling
      js/app.js       # Frontend app logic and API integration
```

## MVP Features Implemented
- Issue reporting (category, location, ward, description, anonymous option)
- Issue list + category filtering
- Upvoting reports
- Municipal assignment to teams
- Status workflow: `reported -> assigned -> in_progress -> fixed`
- Community announcements feed
- Emergency request creation with reference IDs
- Basic municipal stats endpoint for dashboard cards

## Run Locally
From `fixmycommunity/backend`:

```bash
pip install fastapi uvicorn sqlalchemy pydantic
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Then open `fixmycommunity/frontend/index.html` (or serve it with a local static server).

## Goal Alignment
This MVP aligns with your core goals by enabling:
- Citizen reporting + tracking
- Municipality operational visibility
- Transparency through status updates and feed updates
- Emergency intake and reference tracking

Next steps can add authentication, GIS mapping, media upload storage, notifications, and real-time sockets.
