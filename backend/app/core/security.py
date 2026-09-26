import logging
import hashlib
import hmac
import base64
import json
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any, List

try:
    from fastapi import Depends, HTTPException, status
    from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
    security_bearer = HTTPBearer(auto_error=False)
except ImportError:
    def Depends(dependency=None):
        return dependency
    class HTTPAuthorizationCredentials:
        credentials: str = ""
    class HTTPException(Exception):
        def __init__(self, status_code: int = 500, detail: str = "", headers: dict = None):
            super().__init__(detail)
            self.status_code = status_code
            self.detail = detail
            self.headers = headers
    class StatusMock:
        HTTP_400_BAD_REQUEST = 400
        HTTP_401_UNAUTHORIZED = 401
        HTTP_403_FORBIDDEN = 403
        HTTP_503_SERVICE_UNAVAILABLE = 503
    status = StatusMock()
    security_bearer = None

try:
    from app.core.config import settings
except ImportError:
    import os
    class DefaultSettings:
        SECRET_KEY = os.getenv("JWT_SECRET") or os.getenv("SECRET_KEY", "ai-storywizard-super-secret-jwt-key-2026")
        ALGORITHM = os.getenv("JWT_ALGORITHM") or os.getenv("ALGORITHM", "HS256")
        ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))
    settings = DefaultSettings()

logger = logging.getLogger("ai_storywizard.security")

# Gracefully import bcrypt
try:
    import bcrypt
except ImportError:
    bcrypt = None

# Gracefully import jwt (PyJWT)
try:
    import jwt
except ImportError:
    jwt = None

def hash_password(password: str) -> str:
    """
    Generate salted bcrypt hash for a user password.
    Falls back to secure PBKDF2-HMAC-SHA256 if native bcrypt driver is unavailable in runtime.
    """
    if not password:
        raise ValueError("Password cannot be empty")
    if bcrypt:
        salt = bcrypt.gensalt(rounds=12)
        return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")
    
    # Secure cryptographic fallback using hashlib PBKDF2 with 100,000 iterations and salt
    salt = settings.SECRET_KEY[:16].encode("utf-8")
    derived = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 100000)
    return "pbkdf2_sha256$" + base64.b64encode(derived).decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against a stored hash."""
    if not plain_password or not hashed_password:
        return False
    try:
        if hashed_password.startswith("$2b$") or hashed_password.startswith("$2a$"):
            if bcrypt:
                return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
            logger.warning("Bcrypt hash detected but native bcrypt module is not importable.")
            return False
        
        if hashed_password.startswith("pbkdf2_sha256$"):
            salt = settings.SECRET_KEY[:16].encode("utf-8")
            derived = hashlib.pbkdf2_hmac("sha256", plain_password.encode("utf-8"), salt, 100000)
            expected = "pbkdf2_sha256$" + base64.b64encode(derived).decode("utf-8")
            return hmac.compare_digest(hashed_password, expected)

        # Standard direct compare as last resort for non-hashed legacy records
        return False
    except Exception as exc:
        logger.warning("Password verification failed with exception: %s", exc)
        return False

def hash_pin(pin: str) -> str:
    """Generate salted hash for a child/student PIN."""
    return hash_password(pin)

def verify_pin(plain_pin: str, hashed_pin: str) -> bool:
    """Verify an entered PIN against a stored hash."""
    return verify_password(plain_pin, hashed_pin)

def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Generate a signed JWT token containing user identity and role claims."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": int(expire.timestamp())})
    
    if jwt:
        return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    
    # Standalone signed HMAC-SHA256 token if PyJWT is not installed in the execution environment
    header = base64.urlsafe_b64encode(json.dumps({"alg": "HS256", "typ": "JWT"}).encode()).decode().rstrip("=")
    payload = base64.urlsafe_b64encode(json.dumps(to_encode).encode()).decode().rstrip("=")
    signing_input = f"{header}.{payload}"
    signature = hmac.new(settings.SECRET_KEY.encode(), signing_input.encode(), hashlib.sha256).digest()
    sig_b64 = base64.urlsafe_b64encode(signature).decode().rstrip("=")
    return f"{signing_input}.{sig_b64}"

def verify_token(token: str) -> Optional[Dict[str, Any]]:
    """Decode and verify a signed token."""
    if not token:
        return None
    if jwt:
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
            return payload
        except Exception:
            pass

    # Standalone fallback validation
    try:
        parts = token.split(".")
        if len(parts) != 3:
            return None
        header_b64, payload_b64, sig_b64 = parts
        signing_input = f"{header_b64}.{payload_b64}"
        expected_sig = hmac.new(settings.SECRET_KEY.encode(), signing_input.encode(), hashlib.sha256).digest()
        actual_sig = base64.urlsafe_b64decode(sig_b64 + "=" * (-len(sig_b64) % 4))
        if not hmac.compare_digest(expected_sig, actual_sig):
            return None
        
        payload_json = base64.urlsafe_b64decode(payload_b64 + "=" * (-len(payload_b64) % 4)).decode()
        payload = json.loads(payload_json)
        
        # Check expiry
        exp = payload.get("exp")
        if exp and datetime.now(timezone.utc).timestamp() > exp:
            return None
        return payload
    except Exception:
        return None

async def get_current_user_payload(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_bearer)
) -> Dict[str, Any]:
    """FastAPI dependency to extract and validate the JWT Bearer payload."""
    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token is missing or malformed",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    payload = verify_token(credentials.credentials)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session has expired or token is invalid",
            headers={"WWW-Authenticate": "Bearer"}
        )
    return payload

def require_role(allowed_roles: List[str]):
    """Role-based access control (RBAC) dependency factory."""
    async def role_checker(
        payload: Dict[str, Any] = Depends(get_current_user_payload)
    ) -> Dict[str, Any]:
        role = payload.get("role")
        if role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access forbidden: user role '{role}' is not in authorized list {allowed_roles}"
            )
        return payload
    return role_checker
