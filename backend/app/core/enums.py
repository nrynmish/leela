from enum import Enum


class UserRole(str, Enum):
    MEMBER = "member"
    HEAD = "head"
    ADMIN = "admin"