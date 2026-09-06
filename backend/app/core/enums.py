from enum import Enum


class UserRole(str, Enum):
    MEMBER = "member"
    HEAD = "head"
    ADMIN = "admin"

class ProjectStatus(str, Enum):
    ACTIVE = "active"
    PAUSED = "paused"
    DONE = "done"

class TicketStatus(str, Enum):
    BACKLOG = "backlog"
    TODO = "todo"
    IN_PROGRESS = "in-progress"
    REVIEW = "review"
    DONE = "done"


class TicketPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"