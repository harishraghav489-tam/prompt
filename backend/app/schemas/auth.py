from pydantic import BaseModel, EmailStr


class LoginRequest(BaseModel):
    email: EmailStr
    password: str | None = None


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    name: str
    college: str
    department: str


class UserOut(BaseModel):
    id: str
    email: str
    name: str
    college: str
    department: str
    role: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut
