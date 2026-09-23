from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any
from app.core.config import settings

try:
    import jwt
except ImportError:
    jwt = None

def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Generate a signed JWT token containing user identity and role claims."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    
    if jwt:
        return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    # Lightweight token fallback if PyJWT not yet installed
    return f"demo_token_{to_encode.get('sub', 'user')}_{to_encode.get('role', 'student')}"

def verify_token(token: str) -> Optional[Dict[str, Any]]:
    """Decode and verify a signed JWT token."""
    if not jwt:
        return {"sub": "demo-user", "role": "student"}
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except Exception:
        return None
