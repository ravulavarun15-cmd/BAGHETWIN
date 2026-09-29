from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker,DeclarativeBase
from app.config import settings

engine=create_engine(settings.database_url,pool_pre_ping=True)
SessionLocal=sessionmaker(bind=engine,autocommit=False,autoflush=False)
class Base(DeclarativeBase): pass

def get_db():
 db=SessionLocal()
 try: yield db
 finally: db.close()

def seed_demo_users():
    from app.database.models import User
    from app.security import hash_password

    demo_users = [
        {"name": "Admin User", "email": "admin@sih26120.local", "password_hash": hash_password("admin123"), "role": "admin"},
        {"name": "Demo User", "email": "user@sih26120.local", "password_hash": hash_password("user123"), "role": "user"},
    ]

    with SessionLocal() as db:
        for payload in demo_users:
            if not db.query(User).filter(User.email == payload["email"]).first():
                db.add(User(**payload))
        db.commit()

def init_db():
    try:
        Base.metadata.create_all(bind=engine)
        seed_demo_users()
    except Exception as e:
        print(f"[BAGHETWIN] Notice: PostgreSQL not connected ({e}). Running in resilient mode with physics simulator and dataset fallbacks.")
