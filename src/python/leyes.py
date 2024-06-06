import pandas as pd
import requests
from bs4 import BeautifulSoup
from tqdm import tqdm
import json
import grequests
import numpy as np
from prisma import Prisma
import asyncio
import time


async def add_laws() -> None:
    prisma = Prisma()
    print("Connecting")
    await prisma.connect()
    print("Done")

    df = pd.read_csv("src/python/datos/base-infoleg-normativa-nacional.csv", low_memory=False)
    df = df.replace(np.nan, None)
    rows = [dict(r) for i, r in df.iterrows()]

    print("Total rows", len(rows))
    bsize = 50000
    for i in range(0, len(rows), bsize):
        print("Batch starts at", i)
        tt = time.time()
        await prisma.law.create_many(data=rows[i:i+bsize])
        print("Time elapsed in batch", time.time() - tt)
    
    print("Disconnecting")
    await prisma.disconnect()
    print("Done")


async def remove_all_laws() -> None:
    prisma = Prisma()
    await prisma.connect()

    await prisma.law.delete_many()

    await prisma.disconnect()


if __name__ == '__main__':
    asyncio.run(add_laws())
    # asyncio.run(remove_all_laws())
