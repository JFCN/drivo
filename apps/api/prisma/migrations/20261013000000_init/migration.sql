CREATE TYPE "Fuel" AS ENUM ('GASOLINE', 'ETHANOL', 'FLEX', 'DIESEL', 'HYBRID', 'ELECTRIC', 'CNG');

CREATE TYPE "VehicleType" AS ENUM ('CAR', 'MOTORCYCLE', 'PICKUP', 'TRUCK', 'VAN');

CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "vehicles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "plate" TEXT NOT NULL,
    "renavam" TEXT NOT NULL,
    "chassis" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "manufactureYear" INTEGER NOT NULL,
    "modelYear" INTEGER NOT NULL,
    "color" TEXT NOT NULL,
    "fuel" "Fuel" NOT NULL,
    "type" "VehicleType" NOT NULL,
    "nickname" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

CREATE INDEX "vehicles_userId_idx" ON "vehicles"("userId");

CREATE UNIQUE INDEX "vehicles_userId_plate_key" ON "vehicles"("userId", "plate");

ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
