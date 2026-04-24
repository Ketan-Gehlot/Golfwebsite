import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()
client = AsyncIOMotorClient(os.environ['MONGO_URL'])
db = client[os.environ['DB_NAME']]

async def run():
    draws = await db.draws.find().sort("draw_date", -1).to_list(100)
    print("Total draws fetched:", len(draws))
    print("Top 20 draw dates:", [d.get("draw_date") for d in draws[:20]])
    
asyncio.run(run())
