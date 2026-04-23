from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
import random
import stripe
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Config
JWT_SECRET = os.environ.get('JWT_SECRET_KEY')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

# Stripe Config
STRIPE_API_KEY = os.environ.get('STRIPE_API_KEY')

# SendGrid Config
SENDGRID_API_KEY = os.environ.get('SENDGRID_API_KEY')
SENDER_EMAIL = os.environ.get('SENDER_EMAIL')

# Subscription Plans - amounts defined server-side only
SUBSCRIPTION_PLANS = {
    "monthly": {"name": "Monthly", "amount": 9.99, "currency": "usd", "interval": "month", "days": 30},
    "yearly": {"name": "Yearly", "amount": 99.99, "currency": "usd", "interval": "year", "days": 365},
}

# Prize pool contribution per subscription
PRIZE_POOL_PERCENTAGE = 0.40  # 40% of subscription goes to prize pool
CHARITY_MIN_PERCENTAGE = 0.10  # Minimum 10% to charity

app = FastAPI()
api_router = APIRouter(prefix="/api")
security = HTTPBearer(auto_error=False)

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ============ UTILITY FUNCTIONS ============

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str, is_admin: bool = False) -> str:
    payload = {
        "sub": user_id,
        "is_admin": is_admin,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS),
        "iat": datetime.now(timezone.utc)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not credentials:
        raise HTTPException(status_code=401, detail="Not authenticated")
    payload = decode_token(credentials.credentials)
    user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

async def get_admin_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    user = await get_current_user(credentials)
    if not user.get("is_admin", False):
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

def send_email_notification(to_email: str, subject: str, html_content: str):
    try:
        if not SENDGRID_API_KEY or not SENDER_EMAIL:
            logger.warning("SendGrid not configured, skipping email")
            return False
        message = Mail(from_email=SENDER_EMAIL, to_emails=to_email, subject=subject, html_content=html_content)
        sg = SendGridAPIClient(SENDGRID_API_KEY)
        sg.send(message)
        return True
    except Exception as e:
        logger.error(f"Email send failed: {e}")
        return False

# ============ PYDANTIC MODELS ============

class SignupRequest(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    last_name: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class ScoreCreate(BaseModel):
    score: int = Field(ge=1, le=45)
    score_date: str

class ScoreUpdate(BaseModel):
    score: Optional[int] = Field(None, ge=1, le=45)
    score_date: Optional[str] = None

class CharityCreate(BaseModel):
    name: str
    description: str
    category: Optional[str] = ""
    logo_url: Optional[str] = ""
    website_url: Optional[str] = ""
    images: Optional[List[str]] = []
    upcoming_events: Optional[List[dict]] = []
    is_featured: Optional[bool] = False

class CharityUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    logo_url: Optional[str] = None
    website_url: Optional[str] = None
    images: Optional[List[str]] = None
    upcoming_events: Optional[List[dict]] = None
    is_featured: Optional[bool] = None

class CharitySelection(BaseModel):
    charity_id: str
    contribution_percentage: float = Field(ge=10, le=100)

class DrawCreate(BaseModel):
    draw_date: str
    draw_logic_type: str = "random"  # random | manual | algorithmic
    prize_amount: Optional[float] = None  # Admin can manually set prize pool amount

class DrawPublish(BaseModel):
    winning_numbers: List[int]

class DrawManualWinners(BaseModel):
    winner_entry_ids: List[str]
    match_overrides: dict = {}  # entry_id -> match_count (3, 4, or 5)

class VerificationSubmit(BaseModel):
    proof_url: str

class VerificationReview(BaseModel):
    status: str  # approved or rejected

class PayoutUpdate(BaseModel):
    payout_status: str  # paid

class DonationRequest(BaseModel):
    charity_id: str
    amount: float = Field(gt=0)
    origin_url: str

class CheckoutRequest(BaseModel):
    plan_id: str
    origin_url: str

class ProfileUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None

class AdminUserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    subscription_status: Optional[str] = None
    is_admin: Optional[bool] = None

class AdminScoreUpdate(BaseModel):
    score: Optional[int] = Field(None, ge=1, le=45)
    score_date: Optional[str] = None

# ============ AUTH ROUTES ============

@api_router.post("/auth/signup")
async def signup(req: SignupRequest):
    existing = await db.users.find_one({"email": req.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    user_doc = {
        "id": user_id,
        "email": req.email,
        "password_hash": hash_password(req.password),
        "first_name": req.first_name,
        "last_name": req.last_name,
        "is_admin": False,
        "subscription_status": "inactive",
        "subscription_plan": None,
        "subscription_start_date": None,
        "subscription_end_date": None,
        "created_at": now,
        "updated_at": now,
    }
    await db.users.insert_one(user_doc)
    token = create_token(user_id, False)
    return {
        "token": token,
        "user": {
            "id": user_id, "email": req.email, "first_name": req.first_name,
            "last_name": req.last_name, "is_admin": False, "subscription_status": "inactive"
        }
    }

@api_router.post("/auth/login")
async def login(req: LoginRequest):
    user = await db.users.find_one({"email": req.email}, {"_id": 0})
    if not user or not verify_password(req.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_token(user["id"], user.get("is_admin", False))
    return {
        "token": token,
        "user": {
            "id": user["id"], "email": user["email"], "first_name": user["first_name"],
            "last_name": user["last_name"], "is_admin": user.get("is_admin", False),
            "subscription_status": user.get("subscription_status", "inactive")
        }
    }

@api_router.get("/users/me")
async def get_profile(user=Depends(get_current_user)):
    charity_contrib = await db.user_charity_contributions.find_one(
        {"user_id": user["id"]}, {"_id": 0}
    )
    return {
        "id": user["id"], "email": user["email"],
        "first_name": user["first_name"], "last_name": user["last_name"],
        "is_admin": user.get("is_admin", False),
        "subscription_status": user.get("subscription_status", "inactive"),
        "subscription_plan": user.get("subscription_plan"),
        "subscription_start_date": user.get("subscription_start_date"),
        "subscription_end_date": user.get("subscription_end_date"),
        "charity_contribution": charity_contrib,
        "created_at": user.get("created_at"),
    }

@api_router.put("/users/me")
async def update_profile(req: ProfileUpdate, user=Depends(get_current_user)):
    update_data = {}
    if req.first_name is not None:
        update_data["first_name"] = req.first_name
    if req.last_name is not None:
        update_data["last_name"] = req.last_name
    if update_data:
        update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
        await db.users.update_one({"id": user["id"]}, {"$set": update_data})
    updated = await db.users.find_one({"id": user["id"]}, {"_id": 0, "password_hash": 0})
    return updated

# ============ SUBSCRIPTION & PAYMENT ROUTES ============

@api_router.post("/subscriptions/checkout")
async def create_checkout(req: CheckoutRequest, user=Depends(get_current_user)):
    if req.plan_id not in SUBSCRIPTION_PLANS:
        raise HTTPException(status_code=400, detail="Invalid plan")
    
    plan = SUBSCRIPTION_PLANS[req.plan_id]
    stripe.api_key = STRIPE_API_KEY
    
    success_url = f"{req.origin_url}/subscription/success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{req.origin_url}/subscription"
    
    try:
        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=[{
                "price_data": {
                    "currency": plan["currency"],
                    "product_data": {"name": plan["name"]},
                    "unit_amount": int(float(plan["amount"]) * 100),
                },
                "quantity": 1,
            }],
            mode="payment",
            success_url=success_url,
            cancel_url=cancel_url,
            metadata={
                "user_id": user["id"],
                "plan_id": req.plan_id,
                "user_email": user["email"]
            },
        )
    except Exception as e:
        logger.error(f"Stripe checkout error: {e}")
        raise HTTPException(status_code=500, detail=f"Payment error: {str(e)}")
    
    # Create payment transaction record
    now = datetime.now(timezone.utc).isoformat()
    await db.payment_transactions.insert_one({
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "session_id": session.id,
        "amount": float(plan["amount"]),
        "currency": plan["currency"],
        "plan_id": req.plan_id,
        "payment_status": "initiated",
        "status": "pending",
        "created_at": now,
    })
    
    return {"url": session.url, "session_id": session.id}

@api_router.get("/subscriptions/status/{session_id}")
async def check_payment_status(session_id: str, user=Depends(get_current_user)):
    stripe.api_key = STRIPE_API_KEY
    
    transaction = await db.payment_transactions.find_one({"session_id": session_id}, {"_id": 0})
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    # If already processed, return cached status
    if transaction.get("payment_status") == "paid":
        return {"status": "complete", "payment_status": "paid"}
    
    try:
        checkout_session = stripe.checkout.Session.retrieve(session_id)
    except Exception as e:
        logger.error(f"Stripe status check error: {e}")
        return {"status": "unknown", "payment_status": "unknown"}
    
    now = datetime.now(timezone.utc).isoformat()
    
    if checkout_session.payment_status == "paid" and transaction.get("payment_status") != "paid":
        plan_id = transaction.get("plan_id", "monthly")
        plan = SUBSCRIPTION_PLANS.get(plan_id, SUBSCRIPTION_PLANS["monthly"])
        
        start_date = now
        end_date = (datetime.now(timezone.utc) + timedelta(days=plan["days"])).isoformat()
        
        await db.payment_transactions.update_one(
            {"session_id": session_id},
            {"$set": {"payment_status": "paid", "status": "completed", "completed_at": now}}
        )
        
        await db.users.update_one(
            {"id": user["id"]},
            {"$set": {
                "subscription_status": "active",
                "subscription_plan": plan_id,
                "subscription_start_date": start_date,
                "subscription_end_date": end_date,
                "updated_at": now,
            }}
        )
        
        # Add to prize pool
        prize_contribution = float(plan["amount"]) * PRIZE_POOL_PERCENTAGE
        current_month = datetime.now(timezone.utc).strftime("%Y-%m")
        await db.prize_pools.update_one(
            {"month": current_month},
            {"$inc": {"total_amount": prize_contribution}, "$set": {"updated_at": now}},
            upsert=True
        )
        
        send_email_notification(
            user["email"],
            "Subscription Confirmed - Golf Charity Platform",
            f"<h2>Welcome!</h2><p>Your {plan['name']} subscription is now active.</p>"
        )
        
        return {"status": "complete", "payment_status": "paid"}
    
    elif checkout_session.status == "expired":
        await db.payment_transactions.update_one(
            {"session_id": session_id},
            {"$set": {"payment_status": "expired", "status": "expired"}}
        )
        return {"status": "expired", "payment_status": "expired"}
    
    return {"status": checkout_session.status, "payment_status": checkout_session.payment_status}

@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    stripe.api_key = STRIPE_API_KEY
    body = await request.body()
    
    try:
        # Parse the event directly (no webhook secret verification for dev)
        import json
        event = json.loads(body)
        
        if event.get("type") == "checkout.session.completed":
            session_data = event["data"]["object"]
            session_id = session_data["id"]
            metadata = session_data.get("metadata", {})
            
            if metadata.get("type") == "independent_donation":
                await db.donations.update_one(
                    {"session_id": session_id},
                    {"$set": {"status": "completed", "completed_at": datetime.now(timezone.utc).isoformat()}}
                )
            else:
                transaction = await db.payment_transactions.find_one({"session_id": session_id}, {"_id": 0})
                if transaction and transaction.get("payment_status") != "paid":
                    now = datetime.now(timezone.utc).isoformat()
                    plan_id = transaction.get("plan_id", "monthly")
                    plan = SUBSCRIPTION_PLANS.get(plan_id, SUBSCRIPTION_PLANS["monthly"])
                    end_date = (datetime.now(timezone.utc) + timedelta(days=plan["days"])).isoformat()
                    
                    await db.payment_transactions.update_one(
                        {"session_id": session_id},
                        {"$set": {"payment_status": "paid", "status": "completed", "completed_at": now}}
                    )
                    await db.users.update_one(
                        {"id": transaction["user_id"]},
                        {"$set": {
                            "subscription_status": "active",
                            "subscription_plan": plan_id,
                            "subscription_start_date": now,
                            "subscription_end_date": end_date,
                        }}
                    )
        return {"status": "ok"}
    except Exception as e:
        logger.error(f"Webhook error: {e}")
        return {"status": "error"}

@api_router.get("/subscriptions/plans")
async def get_plans():
    return {
        "plans": [
            {"id": "monthly", "name": "Monthly", "amount": 9.99, "currency": "usd", "interval": "month"},
            {"id": "yearly", "name": "Yearly", "amount": 99.99, "currency": "usd", "interval": "year", "savings": "Save 17%"},
        ]
    }

@api_router.delete("/subscriptions")
async def cancel_subscription(user=Depends(get_current_user)):
    now = datetime.now(timezone.utc).isoformat()
    await db.users.update_one(
        {"id": user["id"]},
        {"$set": {"subscription_status": "cancelled", "updated_at": now}}
    )
    return {"message": "Subscription cancelled"}

# ============ DONATION SYSTEM ============

@api_router.post("/donations/checkout")
async def create_donation_checkout(req: DonationRequest, user=Depends(get_current_user)):
    charity = await db.charities.find_one({"id": req.charity_id})
    if not charity:
        raise HTTPException(status_code=404, detail="Charity not found")
    
    stripe.api_key = STRIPE_API_KEY
    
    success_url = f"{req.origin_url}/donation/success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{req.origin_url}/charities"
    
    try:
        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=[{
                "price_data": {
                    "currency": "usd",
                    "product_data": {"name": f"Donation to {charity['name']}"},
                    "unit_amount": int(float(req.amount) * 100),
                },
                "quantity": 1,
            }],
            mode="payment",
            success_url=success_url,
            cancel_url=cancel_url,
            metadata={
                "user_id": user["id"],
                "charity_id": req.charity_id,
                "charity_name": charity["name"],
                "type": "independent_donation"
            },
        )
    except Exception as e:
        logger.error(f"Stripe donation checkout error: {e}")
        raise HTTPException(status_code=500, detail=f"Payment error: {str(e)}")
    
    # Create donation record
    now = datetime.now(timezone.utc).isoformat()
    await db.donations.insert_one({
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "charity_id": req.charity_id,
        "charity_name": charity["name"],
        "amount": float(req.amount),
        "session_id": session.id,
        "status": "pending",
        "created_at": now,
    })
    
    return {"url": session.url, "session_id": session.id}

@api_router.get("/donations/status/{session_id}")
async def check_donation_status(session_id: str, user=Depends(get_current_user)):
    donation = await db.donations.find_one({"session_id": session_id}, {"_id": 0})
    if not donation:
        raise HTTPException(status_code=404, detail="Donation not found")
    
    if donation.get("status") == "completed":
        return {"status": "complete"}
    
    stripe.api_key = STRIPE_API_KEY
    try:
        checkout_session = stripe.checkout.Session.retrieve(session_id)
    except Exception as e:
        logger.error(f"Stripe donation status error: {e}")
        return {"status": "unknown"}
    
    if checkout_session.payment_status == "paid":
        now = datetime.now(timezone.utc).isoformat()
        await db.donations.update_one(
            {"session_id": session_id},
            {"$set": {"status": "completed", "completed_at": now}}
        )
        return {"status": "complete"}
    
    return {"status": checkout_session.status}

# ============ SCORE MANAGEMENT ============

@api_router.post("/scores")
async def add_score(req: ScoreCreate, user=Depends(get_current_user)):
    if user.get("subscription_status") != "active":
        raise HTTPException(status_code=403, detail="Active subscription required")
    
    count = await db.golf_scores.count_documents({"user_id": user["id"]})
    if count >= 5:
        oldest = await db.golf_scores.find({"user_id": user["id"]}).sort("score_date", 1).limit(1).to_list(1)
        if oldest:
            await db.golf_scores.delete_one({"id": oldest[0]["id"]})
    
    score_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    score_doc = {
        "id": score_id,
        "user_id": user["id"],
        "score": req.score,
        "score_date": req.score_date,
        "created_at": now,
    }
    await db.golf_scores.insert_one(score_doc)
    return {"id": score_id, "score": req.score, "score_date": req.score_date, "created_at": now}

@api_router.get("/scores")
async def get_scores(user=Depends(get_current_user)):
    scores = await db.golf_scores.find(
        {"user_id": user["id"]}, {"_id": 0}
    ).sort("score_date", -1).to_list(5)
    return {"scores": scores}

@api_router.put("/scores/{score_id}")
async def update_score(score_id: str, req: ScoreUpdate, user=Depends(get_current_user)):
    score = await db.golf_scores.find_one({"id": score_id, "user_id": user["id"]})
    if not score:
        raise HTTPException(status_code=404, detail="Score not found")
    update_data = {}
    if req.score is not None:
        update_data["score"] = req.score
    if req.score_date is not None:
        update_data["score_date"] = req.score_date
    if update_data:
        await db.golf_scores.update_one({"id": score_id}, {"$set": update_data})
    updated = await db.golf_scores.find_one({"id": score_id}, {"_id": 0})
    return updated

@api_router.delete("/scores/{score_id}")
async def delete_score(score_id: str, user=Depends(get_current_user)):
    result = await db.golf_scores.delete_one({"id": score_id, "user_id": user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Score not found")
    return {"message": "Score deleted"}

# ============ CHARITY SYSTEM ============

@api_router.get("/charities")
async def list_charities(search: Optional[str] = None, featured: Optional[bool] = None, category: Optional[str] = None):
    query = {}
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}}
        ]
    if featured is not None:
        query["is_featured"] = featured
    if category:
        query["category"] = category
    charities = await db.charities.find(query, {"_id": 0}).to_list(100)
    return {"charities": charities}

@api_router.get("/charities/{charity_id}")
async def get_charity(charity_id: str):
    charity = await db.charities.find_one({"id": charity_id}, {"_id": 0})
    if not charity:
        raise HTTPException(status_code=404, detail="Charity not found")
    return charity

@api_router.post("/charities")
async def create_charity(req: CharityCreate, admin=Depends(get_admin_user)):
    charity_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    doc = {
        "id": charity_id,
        **req.model_dump(),
        "created_at": now,
        "updated_at": now,
    }
    await db.charities.insert_one(doc)
    return {k: v for k, v in doc.items() if k != "_id"}

@api_router.put("/charities/{charity_id}")
async def update_charity(charity_id: str, req: CharityUpdate, admin=Depends(get_admin_user)):
    update_data = {k: v for k, v in req.model_dump().items() if v is not None}
    if update_data:
        update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
        await db.charities.update_one({"id": charity_id}, {"$set": update_data})
    charity = await db.charities.find_one({"id": charity_id}, {"_id": 0})
    if not charity:
        raise HTTPException(status_code=404, detail="Charity not found")
    return charity

@api_router.delete("/charities/{charity_id}")
async def delete_charity(charity_id: str, admin=Depends(get_admin_user)):
    result = await db.charities.delete_one({"id": charity_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Charity not found")
    return {"message": "Charity deleted"}

@api_router.post("/users/me/charity")
async def set_charity(req: CharitySelection, user=Depends(get_current_user)):
    charity = await db.charities.find_one({"id": req.charity_id})
    if not charity:
        raise HTTPException(status_code=404, detail="Charity not found")
    
    now = datetime.now(timezone.utc).isoformat()
    await db.user_charity_contributions.update_one(
        {"user_id": user["id"]},
        {"$set": {
            "user_id": user["id"],
            "charity_id": req.charity_id,
            "charity_name": charity["name"],
            "contribution_percentage": req.contribution_percentage,
            "updated_at": now,
        }},
        upsert=True
    )
    return {"message": "Charity selection updated", "charity_id": req.charity_id, "contribution_percentage": req.contribution_percentage}

@api_router.get("/users/me/charity")
async def get_my_charity(user=Depends(get_current_user)):
    contrib = await db.user_charity_contributions.find_one({"user_id": user["id"]}, {"_id": 0})
    return contrib or {"message": "No charity selected"}

# ============ DRAW SYSTEM ============

@api_router.get("/draws")
async def list_draws(user=Depends(get_current_user)):
    draws = await db.draws.find({}, {"_id": 0}).sort("draw_date", -1).to_list(50)
    return {"draws": draws}

@api_router.get("/draws/{draw_id}")
async def get_draw(draw_id: str, user=Depends(get_current_user)):
    draw = await db.draws.find_one({"id": draw_id}, {"_id": 0})
    if not draw:
        raise HTTPException(status_code=404, detail="Draw not found")
    result = await db.draw_results.find_one({"draw_id": draw_id}, {"_id": 0})
    user_entry = await db.draw_entries.find_one({"draw_id": draw_id, "user_id": user["id"]}, {"_id": 0})
    winners = await db.draw_entries.find({"draw_id": draw_id, "is_winner": True}, {"_id": 0, "user_name": 1, "match_count": 1, "winnings_amount": 1}).to_list(100)
    return {"draw": draw, "result": result, "user_entry": user_entry, "winners": winners}

@api_router.post("/draws/{draw_id}/enter")
async def enter_draw(draw_id: str, user=Depends(get_current_user)):
    if user.get("subscription_status") != "active":
        raise HTTPException(status_code=403, detail="Active subscription required")
    
    draw = await db.draws.find_one({"id": draw_id})
    if not draw:
        raise HTTPException(status_code=404, detail="Draw not found")
    if draw.get("status") != "scheduled":
        raise HTTPException(status_code=400, detail="Draw not accepting entries")
    
    existing = await db.draw_entries.find_one({"draw_id": draw_id, "user_id": user["id"]})
    if existing:
        raise HTTPException(status_code=400, detail="Already entered this draw")
    
    # Use user's latest 5 scores as entry numbers
    scores = await db.golf_scores.find(
        {"user_id": user["id"]}, {"_id": 0}
    ).sort("score_date", -1).to_list(5)
    
    if len(scores) < 5:
        raise HTTPException(status_code=400, detail="You need 5 scores to enter a draw")
    
    entry_numbers = [s["score"] for s in scores]
    entry_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    
    await db.draw_entries.insert_one({
        "id": entry_id,
        "draw_id": draw_id,
        "user_id": user["id"],
        "user_email": user["email"],
        "user_name": f"{user['first_name']} {user['last_name']}",
        "entry_numbers": entry_numbers,
        "is_winner": False,
        "match_count": 0,
        "winnings_amount": 0,
        "verification_status": "none",
        "proof_url": None,
        "payout_status": "none",
        "created_at": now,
    })
    
    return {"id": entry_id, "entry_numbers": entry_numbers, "message": "Entered draw successfully"}

@api_router.get("/users/me/draws")
async def get_my_draws(user=Depends(get_current_user)):
    entries = await db.draw_entries.find({"user_id": user["id"]}, {"_id": 0}).to_list(100)
    return {"entries": entries}

@api_router.get("/users/me/winnings")
async def get_my_winnings(user=Depends(get_current_user)):
    entries = await db.draw_entries.find(
        {"user_id": user["id"], "is_winner": True}, {"_id": 0}
    ).to_list(100)
    total_won = sum(e.get("winnings_amount", 0) for e in entries)
    pending = sum(e.get("winnings_amount", 0) for e in entries if e.get("payout_status") != "paid")
    paid = sum(e.get("winnings_amount", 0) for e in entries if e.get("payout_status") == "paid")
    return {"entries": entries, "total_won": total_won, "pending_payout": pending, "paid_out": paid}

# ============ WINNER VERIFICATION ============

@api_router.post("/winners/{entry_id}/verify")
async def submit_verification(entry_id: str, req: VerificationSubmit, user=Depends(get_current_user)):
    entry = await db.draw_entries.find_one({"id": entry_id, "user_id": user["id"], "is_winner": True})
    if not entry:
        raise HTTPException(status_code=404, detail="Winning entry not found")
    
    await db.draw_entries.update_one(
        {"id": entry_id},
        {"$set": {"proof_url": req.proof_url, "verification_status": "pending"}}
    )
    return {"message": "Verification submitted"}

# ============ ADMIN ROUTES ============

@api_router.get("/admin/users")
async def admin_list_users(admin=Depends(get_admin_user)):
    users = await db.users.find({}, {"_id": 0, "password_hash": 0}).to_list(1000)
    return {"users": users}

@api_router.get("/admin/users/{user_id}")
async def admin_get_user(user_id: str, admin=Depends(get_admin_user)):
    user = await db.users.find_one({"id": user_id}, {"_id": 0, "password_hash": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    scores = await db.golf_scores.find({"user_id": user_id}, {"_id": 0}).sort("score_date", -1).to_list(5)
    charity = await db.user_charity_contributions.find_one({"user_id": user_id}, {"_id": 0})
    return {"user": user, "scores": scores, "charity": charity}

@api_router.put("/admin/users/{user_id}")
async def admin_update_user(user_id: str, req: AdminUserUpdate, admin=Depends(get_admin_user)):
    update_data = {k: v for k, v in req.model_dump().items() if v is not None}
    if update_data:
        update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
        await db.users.update_one({"id": user_id}, {"$set": update_data})
    user = await db.users.find_one({"id": user_id}, {"_id": 0, "password_hash": 0})
    return user

@api_router.put("/admin/users/{user_id}/scores/{score_id}")
async def admin_update_score(user_id: str, score_id: str, req: AdminScoreUpdate, admin=Depends(get_admin_user)):
    update_data = {k: v for k, v in req.model_dump().items() if v is not None}
    if update_data:
        await db.golf_scores.update_one({"id": score_id, "user_id": user_id}, {"$set": update_data})
    score = await db.golf_scores.find_one({"id": score_id}, {"_id": 0})
    return score

# Admin Draw Management
@api_router.post("/admin/draws")
async def admin_create_draw(req: DrawCreate, admin=Depends(get_admin_user)):
    if req.draw_logic_type not in ("random", "manual", "algorithmic"):
        raise HTTPException(status_code=400, detail="draw_logic_type must be random, manual, or algorithmic")
    draw_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    
    # Use admin-specified prize amount, or auto-calculate from prize pool
    rollover_amount = 0
    if req.prize_amount is not None and req.prize_amount > 0:
        total_pool = req.prize_amount
    else:
        # Get prize pool
        current_month = datetime.now(timezone.utc).strftime("%Y-%m")
        pool = await db.prize_pools.find_one({"month": current_month}, {"_id": 0})
        pool_amount = pool.get("total_amount", 0) if pool else 0
        
        # Check for jackpot rollover
        jackpot = await db.jackpot_rollover.find_one({"status": "active"}, {"_id": 0})
        rollover_amount = jackpot.get("amount", 0) if jackpot else 0
        total_pool = pool_amount + rollover_amount
    
    draw_doc = {
        "id": draw_id,
        "draw_date": req.draw_date,
        "draw_logic_type": req.draw_logic_type,
        "status": "scheduled",
        "prize_pool_amount": total_pool,
        "five_match_pool": total_pool * 0.40,
        "four_match_pool": total_pool * 0.35,
        "three_match_pool": total_pool * 0.25,
        "rollover_amount": rollover_amount,
        "created_at": now,
        "updated_at": now,
    }
    await db.draws.insert_one(draw_doc)
    return {k: v for k, v in draw_doc.items() if k != "_id"}

@api_router.delete("/admin/draws/{draw_id}")
async def admin_delete_draw(draw_id: str, admin=Depends(get_admin_user)):
    draw = await db.draws.find_one({"id": draw_id})
    if not draw:
        raise HTTPException(status_code=404, detail="Draw not found")
    await db.draws.delete_one({"id": draw_id})
    await db.draw_entries.delete_many({"draw_id": draw_id})
    await db.draw_results.delete_many({"draw_id": draw_id})
    return {"message": "Draw and related data deleted"}

@api_router.post("/admin/draws/{draw_id}/simulate")
async def admin_simulate_draw(draw_id: str, admin=Depends(get_admin_user)):
    draw = await db.draws.find_one({"id": draw_id}, {"_id": 0})
    if not draw:
        raise HTTPException(status_code=404, detail="Draw not found")
    
    entries = await db.draw_entries.find({"draw_id": draw_id}, {"_id": 0}).to_list(10000)
    logic = draw.get("draw_logic_type", "random")
    
    if logic == "manual":
        # Manual mode: return all entries so admin can hand-pick winners
        all_entries = []
        for entry in entries:
            all_entries.append({
                "entry_id": entry["id"],
                "user_id": entry["user_id"],
                "user_name": entry.get("user_name", ""),
                "entry_numbers": entry["entry_numbers"],
            })
        return {
            "mode": "manual",
            "winning_numbers": [],
            "all_entries": all_entries,
            "simulation_results": {"5_match": [], "4_match": [], "3_match": []},
            "total_entries": len(entries),
        }
    
    if logic == "algorithmic":
        # Algorithmic: pick winning numbers as the LEAST common scores across all entries
        all_scores = []
        for entry in entries:
            all_scores.extend(entry["entry_numbers"])
        if all_scores:
            freq = {}
            for s in all_scores:
                freq[s] = freq.get(s, 0) + 1
            sorted_scores = sorted(freq.keys(), key=lambda x: freq[x])
            winning = sorted_scores[:5] if len(sorted_scores) >= 5 else sorted_scores + random.sample(range(1, 46), 5 - len(sorted_scores))
        else:
            winning = random.sample(range(1, 46), 5)
    else:
        # Random: pure random winning numbers
        winning = random.sample(range(1, 46), 5)
    
    # Analyze matches
    results = {"5_match": [], "4_match": [], "3_match": []}
    for entry in entries:
        matches = len(set(entry["entry_numbers"]) & set(winning))
        if matches >= 3:
            results[f"{matches}_match"].append({
                "entry_id": entry["id"], "user_id": entry["user_id"],
                "user_name": entry.get("user_name", ""), "matches": matches,
                "entry_numbers": entry["entry_numbers"]
            })
    
    all_entries = []
    if logic == "algorithmic":
        for entry in entries:
            all_entries.append({
                "entry_id": entry["id"],
                "user_id": entry["user_id"],
                "user_name": entry.get("user_name", ""),
                "entry_numbers": entry["entry_numbers"],
            })
    
    return {
        "mode": logic,
        "winning_numbers": winning,
        "all_entries": all_entries,
        "simulation_results": results,
        "total_entries": len(entries),
    }

@api_router.post("/admin/draws/{draw_id}/publish")
async def admin_publish_draw(draw_id: str, req: DrawPublish, admin=Depends(get_admin_user)):
    draw = await db.draws.find_one({"id": draw_id}, {"_id": 0})
    if not draw:
        raise HTTPException(status_code=404, detail="Draw not found")
    
    now = datetime.now(timezone.utc).isoformat()
    winning = req.winning_numbers
    
    # Store draw results
    result_id = str(uuid.uuid4())
    await db.draw_results.insert_one({
        "id": result_id,
        "draw_id": draw_id,
        "winning_numbers": winning,
        "published_at": now,
    })
    
    # Process entries
    entries = await db.draw_entries.find({"draw_id": draw_id}, {"_id": 0}).to_list(10000)
    five_winners = []
    four_winners = []
    three_winners = []
    
    for entry in entries:
        matches = len(set(entry["entry_numbers"]) & set(winning))
        if matches >= 5:
            five_winners.append(entry)
        elif matches >= 4:
            four_winners.append(entry)
        elif matches >= 3:
            three_winners.append(entry)
    
    pool = draw.get("prize_pool_amount", 0)
    five_pool = pool * 0.40
    four_pool = pool * 0.35
    three_pool = pool * 0.25
    
    # Handle jackpot rollover
    if not five_winners:
        await db.jackpot_rollover.update_one(
            {"status": "active"},
            {"$inc": {"amount": five_pool}, "$set": {"updated_at": now}},
            upsert=True
        )
    else:
        prize_each = five_pool / len(five_winners)
        for w in five_winners:
            await db.draw_entries.update_one(
                {"id": w["id"]},
                {"$set": {"is_winner": True, "match_count": 5, "winnings_amount": prize_each, "verification_status": "pending_upload"}}
            )
        await db.jackpot_rollover.update_one({"status": "active"}, {"$set": {"amount": 0, "status": "cleared"}})
    
    if four_winners:
        prize_each = four_pool / len(four_winners)
        for w in four_winners:
            await db.draw_entries.update_one(
                {"id": w["id"]},
                {"$set": {"is_winner": True, "match_count": 4, "winnings_amount": prize_each, "verification_status": "pending_upload"}}
            )
    
    if three_winners:
        prize_each = three_pool / len(three_winners)
        for w in three_winners:
            await db.draw_entries.update_one(
                {"id": w["id"]},
                {"$set": {"is_winner": True, "match_count": 3, "winnings_amount": prize_each, "verification_status": "pending_upload"}}
            )
    
    await db.draws.update_one({"id": draw_id}, {"$set": {"status": "published", "updated_at": now}})
    
    # Send emails to winners
    all_winners = five_winners + four_winners + three_winners
    for w in all_winners:
        send_email_notification(
            w.get("user_email", ""),
            "You Won! - Golf Charity Platform",
            f"<h2>Congratulations!</h2><p>You matched numbers in our monthly draw. Log in to verify and claim your prize.</p>"
        )
    
    return {
        "message": "Draw published",
        "winning_numbers": winning,
        "five_match_winners": len(five_winners),
        "four_match_winners": len(four_winners),
        "three_match_winners": len(three_winners),
        "jackpot_rolled_over": len(five_winners) == 0,
    }

@api_router.post("/admin/draws/{draw_id}/publish-manual")
async def admin_publish_manual_draw(draw_id: str, req: DrawManualWinners, admin=Depends(get_admin_user)):
    """Publish a manual draw where admin hand-picks winners and assigns match tiers."""
    draw = await db.draws.find_one({"id": draw_id}, {"_id": 0})
    if not draw:
        raise HTTPException(status_code=404, detail="Draw not found")
    
    now = datetime.now(timezone.utc).isoformat()
    pool = draw.get("prize_pool_amount", 0)
    five_pool = pool * 0.40
    four_pool = pool * 0.35
    three_pool = pool * 0.25
    
    # Group winners by match tier
    five_winners = []
    four_winners = []
    three_winners = []
    
    for eid in req.winner_entry_ids:
        match_count = req.match_overrides.get(eid, 3)
        entry = await db.draw_entries.find_one({"id": eid}, {"_id": 0})
        if not entry:
            continue
        if match_count >= 5:
            five_winners.append(entry)
        elif match_count >= 4:
            four_winners.append(entry)
        else:
            three_winners.append(entry)
    
    # Distribute prizes
    if five_winners:
        prize_each = five_pool / len(five_winners)
        for w in five_winners:
            await db.draw_entries.update_one({"id": w["id"]}, {"$set": {
                "is_winner": True, "match_count": 5, "winnings_amount": prize_each, "verification_status": "pending_upload"
            }})
    else:
        await db.jackpot_rollover.update_one(
            {"status": "active"}, {"$inc": {"amount": five_pool}, "$set": {"updated_at": now}}, upsert=True
        )
    
    if four_winners:
        prize_each = four_pool / len(four_winners)
        for w in four_winners:
            await db.draw_entries.update_one({"id": w["id"]}, {"$set": {
                "is_winner": True, "match_count": 4, "winnings_amount": prize_each, "verification_status": "pending_upload"
            }})
    
    if three_winners:
        prize_each = three_pool / len(three_winners)
        for w in three_winners:
            await db.draw_entries.update_one({"id": w["id"]}, {"$set": {
                "is_winner": True, "match_count": 3, "winnings_amount": prize_each, "verification_status": "pending_upload"
            }})
    
    # Store result
    result_id = str(uuid.uuid4())
    await db.draw_results.insert_one({
        "id": result_id, "draw_id": draw_id,
        "winning_numbers": [], "manual_winners": req.winner_entry_ids,
        "published_at": now,
    })
    
    await db.draws.update_one({"id": draw_id}, {"$set": {"status": "published", "updated_at": now}})
    
    total = len(five_winners) + len(four_winners) + len(three_winners)
    return {"message": f"Manual draw published with {total} winners", "total_winners": total}

# Admin Winner Management
@api_router.get("/admin/winners")
async def admin_list_winners(admin=Depends(get_admin_user)):
    winners = await db.draw_entries.find({"is_winner": True}, {"_id": 0}).to_list(1000)
    return {"winners": winners}

@api_router.put("/admin/winners/{entry_id}/review")
async def admin_review_winner(entry_id: str, req: VerificationReview, admin=Depends(get_admin_user)):
    if req.status not in ["approved", "rejected"]:
        raise HTTPException(status_code=400, detail="Status must be approved or rejected")
    await db.draw_entries.update_one(
        {"id": entry_id, "is_winner": True},
        {"$set": {"verification_status": req.status}}
    )
    return {"message": f"Winner {req.status}"}

@api_router.put("/admin/winners/{entry_id}/payout")
async def admin_mark_payout(entry_id: str, req: PayoutUpdate, admin=Depends(get_admin_user)):
    entry = await db.draw_entries.find_one({"id": entry_id, "is_winner": True, "verification_status": "approved"})
    if not entry:
        raise HTTPException(status_code=404, detail="Approved winner not found")
    await db.draw_entries.update_one(
        {"id": entry_id},
        {"$set": {"payout_status": req.payout_status}}
    )
    if req.payout_status == "paid":
        send_email_notification(
            entry.get("user_email", ""),
            "Payout Completed - Golf Charity Platform",
            "<h2>Payment Sent!</h2><p>Your winnings have been paid out. Thank you for playing!</p>"
        )
    return {"message": "Payout updated"}

# Admin Charity management reuses existing charity CRUD

# ============ ADMIN ANALYTICS ============

@api_router.get("/admin/analytics")
async def admin_analytics(admin=Depends(get_admin_user)):
    total_users = await db.users.count_documents({})
    active_subs = await db.users.count_documents({"subscription_status": "active"})
    total_charities = await db.charities.count_documents({})
    total_draws = await db.draws.count_documents({})
    total_winners = await db.draw_entries.count_documents({"is_winner": True})
    
    # Prize pool
    current_month = datetime.now(timezone.utc).strftime("%Y-%m")
    pool = await db.prize_pools.find_one({"month": current_month}, {"_id": 0})
    prize_pool = pool.get("total_amount", 0) if pool else 0
    
    # Charity contributions
    contribs = await db.user_charity_contributions.find({}, {"_id": 0}).to_list(10000)
    charity_totals = {}
    for c in contribs:
        cname = c.get("charity_name", "Unknown")
        charity_totals[cname] = charity_totals.get(cname, 0) + 1
    
    # Revenue
    paid_transactions = await db.payment_transactions.find({"payment_status": "paid"}, {"_id": 0}).to_list(10000)
    total_revenue = sum(t.get("amount", 0) for t in paid_transactions)
    
    return {
        "total_users": total_users,
        "active_subscribers": active_subs,
        "total_charities": total_charities,
        "total_draws": total_draws,
        "total_winners": total_winners,
        "current_prize_pool": prize_pool,
        "total_revenue": total_revenue,
        "charity_distribution": charity_totals,
    }

# ============ SEED DATA ============

@api_router.post("/seed")
async def seed_data():
    """Seed initial data - admin user and charities"""
    # Create admin user if not exists
    admin = await db.users.find_one({"email": "admin@golfcharity.com"})
    if not admin:
        admin_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc).isoformat()
        await db.users.insert_one({
            "id": admin_id,
            "email": "admin@golfcharity.com",
            "password_hash": hash_password("admin123"),
            "first_name": "Admin",
            "last_name": "User",
            "is_admin": True,
            "subscription_status": "active",
            "subscription_plan": "yearly",
            "subscription_start_date": now,
            "subscription_end_date": (datetime.now(timezone.utc) + timedelta(days=365)).isoformat(),
            "created_at": now,
            "updated_at": now,
        })
    
    # Seed charities
    charity_count = await db.charities.count_documents({})
    if charity_count == 0:
        now = datetime.now(timezone.utc).isoformat()
        charities = [
            {
                "id": str(uuid.uuid4()), "name": "Green Earth Foundation",
                "description": "Dedicated to reforestation and environmental conservation worldwide. We plant trees, restore ecosystems, and educate communities about sustainable practices.",
                "category": "Environmental Conservation",
                "logo_url": "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=200&h=200&fit=crop",
                "website_url": "https://example.com/green-earth",
                "images": ["https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600"],
                "upcoming_events": [{"name": "Charity Golf Day 2026", "date": "2026-06-15", "location": "St Andrews"}],
                "is_featured": True, "created_at": now, "updated_at": now,
            },
            {
                "id": str(uuid.uuid4()), "name": "Youth Sports Initiative",
                "description": "Providing sports equipment and coaching to underprivileged youth. Every child deserves the chance to play and grow through sport.",
                "category": "Youth Sports",
                "logo_url": "https://images.unsplash.com/photo-1526232761682-d26e03ac148e?w=200&h=200&fit=crop",
                "website_url": "https://example.com/youth-sports",
                "images": ["https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600"],
                "upcoming_events": [{"name": "Summer Camp Fundraiser", "date": "2026-07-20", "location": "London"}],
                "is_featured": True, "created_at": now, "updated_at": now,
            },
            {
                "id": str(uuid.uuid4()), "name": "Ocean Conservation Society",
                "description": "Protecting marine life and cleaning our oceans. From coral reef restoration to beach cleanups, we fight for cleaner seas.",
                "category": "Environmental Conservation",
                "logo_url": "https://images.unsplash.com/photo-1484291470158-b8f8d608850d?w=200&h=200&fit=crop",
                "website_url": "https://example.com/ocean-conservation",
                "images": ["https://images.unsplash.com/photo-1483683804023-6ccdb62f86ef?w=600"],
                "upcoming_events": [],
                "is_featured": False, "created_at": now, "updated_at": now,
            },
            {
                "id": str(uuid.uuid4()), "name": "Mental Health Alliance",
                "description": "Breaking stigma and providing mental health support. We offer counselling, workshops, and community programs for wellbeing.",
                "category": "Health & Wellness",
                "logo_url": "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=200&h=200&fit=crop",
                "website_url": "https://example.com/mental-health",
                "images": ["https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=600"],
                "upcoming_events": [{"name": "Wellness Walk", "date": "2026-05-10", "location": "Edinburgh"}],
                "is_featured": False, "created_at": now, "updated_at": now,
            },
            {
                "id": str(uuid.uuid4()), "name": "Community Food Bank Network",
                "description": "Fighting hunger in local communities. We collect, sort, and distribute food to those who need it most.",
                "category": "Education",
                "logo_url": "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=200&h=200&fit=crop",
                "website_url": "https://example.com/food-bank",
                "images": ["https://images.unsplash.com/photo-1593113598332-cd288d649433?w=600"],
                "upcoming_events": [],
                "is_featured": True, "created_at": now, "updated_at": now,
            },
        ]
        await db.charities.insert_many(charities)
    else:
        # Backfill category for existing charities that don't have one
        category_map = {
            "Green Earth Foundation": "Environmental Conservation",
            "Youth Sports Initiative": "Youth Sports",
            "Ocean Conservation Society": "Environmental Conservation",
            "Mental Health Alliance": "Health & Wellness",
            "Community Food Bank Network": "Education",
        }
        missing_category = await db.charities.find(
            {"category": {"$exists": False}}, {"_id": 0, "id": 1, "name": 1}
        ).to_list(100)
        for charity in missing_category:
            cat = category_map.get(charity["name"], "Education")
            await db.charities.update_one(
                {"id": charity["id"]}, {"$set": {"category": cat}}
            )
    
    return {"message": "Seed data created", "admin_email": "admin@golfcharity.com", "admin_password": "admin123"}

# Include router
app.include_router(api_router)

# CORS: Allow all Vercel deployment URLs (preview, production, branch)
# plus localhost for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:8000",
    ],
    allow_origin_regex=r"https://golfwebsite.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
