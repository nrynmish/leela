from enum import Enum


class UserRole(str, Enum):
    MEMBER = "member"
    HEAD = "head"
    ADMIN = "admin"

class ProjectStatus(str, Enum):
    ACTIVE = "active"
    PAUSED = "paused"
    DONE = "done"