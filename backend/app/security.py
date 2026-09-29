from datetime import datetime,timedelta,timezone
from jose import jwt,JWTError
from passlib.context import CryptContext
from fastapi import Depends,HTTPException,status
from fastapi.security import HTTPBearer,HTTPAuthorizationCredentials
from app.config import settings
pwd=CryptContext(schemes=['bcrypt'],deprecated='auto'); bearer=HTTPBearer(auto_error=False)
def hash_password(x): return pwd.hash(x)
def verify_password(x,h): return pwd.verify(x,h)
def token(user): return jwt.encode({'sub':str(user.id),'exp':datetime.now(timezone.utc)+timedelta(hours=12)},settings.jwt_secret,algorithm='HS256')
def current_user(creds:HTTPAuthorizationCredentials=Depends(bearer)):
 if not creds: raise HTTPException(status_code=401,detail='Authentication required')
 try: data=jwt.decode(creds.credentials,settings.jwt_secret,algorithms=['HS256']); return int(data['sub'])
 except JWTError: raise HTTPException(status_code=401,detail='Invalid or expired token')
