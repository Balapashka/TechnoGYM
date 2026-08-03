-- CreateTable
CREATE TABLE "QuoteRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT,
    "productName" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "comment" TEXT,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "QuoteRequest_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "QuoteRequest_createdAt_idx" ON "QuoteRequest"("createdAt");
