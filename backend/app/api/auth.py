from fastapi import APIRouter,Depends,HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database.db import get_db
from app.database.models import User
from app.security import hash_password,verify_password,token,current_user
router=APIRouter()
class Login(BaseModel): email:str; password:str
class Signup(BaseModel): name:str; email:str; password:str
@router.post('/signup')
def signup(p:Signup,db:Session=Depends(get_db)):
 if len(p.name.strip())<2: raise HTTPException(400,'Name must be at least 2 characters')
 if len(p.password)<6: raise HTTPException(400,'Password must be at least 6 characters')
 if db.query(User).filter(User.email==p.email).first(): raise HTTPException(409,'An account with this email already exists')
 u=User(name=p.name.strip(),email=p.email,password_hash=hash_password(p.password),role='user')
 db.add(u); db.commit(); db.refresh(u)
 return {'id':u.id,'name':u.name,'email':u.email,'role':u.role}
@router.post('/login')
def login(p:Login,db:Session=Depends(get_db)):
 u=db.query(User).filter(User.email==p.email).first()
 if not u: raise HTTPException(404,'Please signin before you login')
 if not verify_password(p.password,u.password_hash): raise HTTPException(401,'Invalid username or password')
 return {'access_token':token(u),'token_type':'bearer','user':{'id':u.id,'name':u.name,'email':u.email,'role':u.role}}
@router.get('/me')
def me(uid:int=Depends(current_user),db:Session=Depends(get_db)):
 u=db.get(User,uid)
 if not u:raise HTTPException(404,'User not found')
 return {'id':u.id,'name':u.name,'email':u.email,'role':u.role}
@router.post('/logout')
def logout(): return {'ok':True}
