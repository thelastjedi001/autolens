from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session

from database import engine, SessionLocal, Base
import backend.models as models

Base.metadata.create_all(bind=engine)

app = FastAPI()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.on_event("startup")
def seed_data():
    db = SessionLocal()
    if db.query(models.Vehicle).count() == 0:
        car = models.Vehicle(
            year=2019,
            make="Mazda",
            model="Mazda6",
            trim="Grand Touring",
            mileage=78000,
            price=13500,
            score=89,
        )
        db.add(car)
        db.commit()
    db.close()

@app.get("/api/health")
def health_check():
    return {"status": "ok"}

@app.get("/api/vehicles")
def get_vehicles(db: Session = Depends(get_db)):
    return db.query(models.Vehicle).all()


