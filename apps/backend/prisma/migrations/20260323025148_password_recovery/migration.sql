-- CreateTable
CREATE TABLE "RecoverPasswordToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMPTZ(3) NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecoverPasswordToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RecoverPasswordToken_token_key" ON "RecoverPasswordToken"("token");

-- CreateIndex
CREATE INDEX "RecoverPasswordToken_userId_idx" ON "RecoverPasswordToken"("userId");

-- CreateIndex
CREATE INDEX "RecoverPasswordToken_token_idx" ON "RecoverPasswordToken"("token");

-- AddForeignKey
ALTER TABLE "RecoverPasswordToken" ADD CONSTRAINT "RecoverPasswordToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("did") ON DELETE CASCADE ON UPDATE CASCADE;
