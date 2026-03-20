from collections import Counter

from fastapi import Depends, FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.database import Base, engine, get_db
from app.models import Announcement, EmergencyRequest, Issue, Team
from app.schemas import (
    AnnouncementCreate,
    AnnouncementOut,
    AssignTeamPayload,
    EmergencyCreate,
    EmergencyOut,
    IssueCreate,
    IssueOut,
    StatusPayload,
    TeamOut,
)

app = FastAPI(title="FixMyCommunity API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

CATEGORIES = [
    {"id": "water", "name": "Water Issues", "icon": "💧"},
    {"id": "electricity", "name": "Electricity", "icon": "⚡"},
    {"id": "roads", "name": "Roads", "icon": "🛣️"},
    {"id": "sewage", "name": "Sewage", "icon": "🚰"},
    {"id": "lights", "name": "Street Lights", "icon": "💡"},
    {"id": "other", "name": "Other", "icon": "📋"},
]
VALID_STATUSES = {"reported", "assigned", "in_progress", "fixed"}


def issue_to_schema(issue: Issue) -> IssueOut:
    return IssueOut(
        id=issue.id,
        title=issue.title,
        description=issue.description,
        category=issue.category,
        location=issue.location,
        ward=issue.ward,
        status=issue.status,
        upvotes=issue.upvotes,
        anonymous=issue.anonymous,
        image_url=issue.image_url,
        assigned_team=issue.assigned_team.name if issue.assigned_team else None,
        created_at=issue.created_at,
    )


@app.on_event("startup")
def startup() -> None:
    Base.metadata.create_all(bind=engine)


@app.get("/")
def root() -> dict[str, str]:
    return {"message": "FixMyCommunity API is running"}


@app.get("/api/categories")
def get_categories() -> dict[str, list[dict[str, str]]]:
    return {"categories": CATEGORIES}


@app.get("/api/teams", response_model=list[TeamOut])
def get_teams(db: Session = Depends(get_db)) -> list[Team]:
    return db.query(Team).order_by(Team.name.asc()).all()


@app.post("/api/teams", response_model=TeamOut)
def create_team(team: TeamOut, db: Session = Depends(get_db)) -> Team:
    if db.query(Team).filter(Team.name == team.name).first():
        raise HTTPException(status_code=400, detail="Team name already exists")
    new_team = Team(name=team.name, category=team.category)
    db.add(new_team)
    db.commit()
    db.refresh(new_team)
    return new_team


@app.get("/api/issues", response_model=list[IssueOut])
def get_issues(
    category: str | None = Query(default=None),
    status: str | None = Query(default=None),
    db: Session = Depends(get_db),
) -> list[IssueOut]:
    query = db.query(Issue)
    if category and category != "all":
        query = query.filter(Issue.category == category)
    if status:
        query = query.filter(Issue.status == status)
    rows = query.order_by(Issue.created_at.desc()).all()
    return [issue_to_schema(row) for row in rows]


@app.post("/api/issues", response_model=IssueOut, status_code=201)
def create_issue(payload: IssueCreate, db: Session = Depends(get_db)) -> IssueOut:
    issue = Issue(**payload.model_dump())
    db.add(issue)
    db.commit()
    db.refresh(issue)
    return issue_to_schema(issue)


@app.post("/api/issues/{issue_id}/upvote", response_model=IssueOut)
def upvote_issue(issue_id: int, db: Session = Depends(get_db)) -> IssueOut:
    issue = db.get(Issue, issue_id)
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")
    issue.upvotes += 1
    db.commit()
    db.refresh(issue)
    return issue_to_schema(issue)


@app.put("/api/issues/{issue_id}/assign", response_model=IssueOut)
def assign_issue(issue_id: int, payload: AssignTeamPayload, db: Session = Depends(get_db)) -> IssueOut:
    issue = db.get(Issue, issue_id)
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")
    team = db.get(Team, payload.team_id)
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    issue.assigned_team_id = team.id
    issue.status = "assigned"
    db.commit()
    db.refresh(issue)
    return issue_to_schema(issue)


@app.put("/api/issues/{issue_id}/status", response_model=IssueOut)
def update_issue_status(issue_id: int, payload: StatusPayload, db: Session = Depends(get_db)) -> IssueOut:
    issue = db.get(Issue, issue_id)
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")
    if payload.status not in VALID_STATUSES:
        raise HTTPException(status_code=400, detail="Invalid status")
    issue.status = payload.status
    db.commit()
    db.refresh(issue)
    return issue_to_schema(issue)


@app.get("/api/announcements", response_model=list[AnnouncementOut])
def get_announcements(db: Session = Depends(get_db)) -> list[Announcement]:
    return db.query(Announcement).order_by(Announcement.created_at.desc()).all()


@app.post("/api/announcements", response_model=AnnouncementOut, status_code=201)
def create_announcement(payload: AnnouncementCreate, db: Session = Depends(get_db)) -> Announcement:
    item = Announcement(**payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@app.post("/api/emergency", response_model=EmergencyOut, status_code=201)
def create_emergency(payload: EmergencyCreate, db: Session = Depends(get_db)) -> EmergencyOut:
    item = EmergencyRequest(service_type=payload.service_type, location=payload.location)
    db.add(item)
    db.commit()
    db.refresh(item)
    return EmergencyOut(reference_id=f"EMG{item.id:06d}", status=item.status)


@app.get("/api/stats")
def get_stats(db: Session = Depends(get_db)) -> dict:
    issues = db.query(Issue).all()
    by_category = Counter(i.category for i in issues)
    return {
        "total_reports": len(issues),
        "open_reports": sum(1 for i in issues if i.status in {"reported", "assigned", "in_progress"}),
        "fixed_reports": sum(1 for i in issues if i.status == "fixed"),
        "category_breakdown": dict(by_category),
    }
