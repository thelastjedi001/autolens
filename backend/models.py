from sqlalchemy import Column, Integer, String, Float
from database import Base

class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(Integer, primary_key=True, index=True)
    year = Column(Integer)
    make = Column(String)
    model = Column(String)
    trim = Column(String)
    mileage = Column(Integer)
    price = Column(Float)
    score = Column(Integer)
    