from datetime import datetime

from pydantic import BaseModel, Field


class IssueCreate(BaseModel):
    title: str = Field(min_length=3, max_length=200)
    description: str = Field(min_length=5)
    category: str
    location: str
    ward: str
    anonymous: bool = False
    image_url: str | None = None


class IssueOut(BaseModel):
    id: int
    title: str
    description: str
    category: str
    location: str
    ward: str
    status: str
    upvotes: int
    anonymous: bool
    image_url: str | None
    assigned_team: str | None
    created_at: datetime


class AssignTeamPayload(BaseModel):
    team_id: int


class StatusPayload(BaseModel):
    status: str


class TeamOut(BaseModel):
    id: int
    name: str
    category: str


class AnnouncementCreate(BaseModel):
    title: str
    content: str
    ward: str = "all"


class AnnouncementOut(BaseModel):
    id: int
    title: str
    content: str
    ward: str
    created_at: datetime


class EmergencyCreate(BaseModel):
    service_type: str
    location: str


class EmergencyOut(BaseModel):
    reference_id: str
    status: str
