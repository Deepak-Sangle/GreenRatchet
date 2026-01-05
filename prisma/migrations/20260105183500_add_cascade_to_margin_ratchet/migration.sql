-- DropForeignKey
ALTER TABLE "MarginRatchet" DROP CONSTRAINT "MarginRatchet_kpiId_fkey";

-- DropForeignKey
ALTER TABLE "MarginRatchet" DROP CONSTRAINT "MarginRatchet_loanId_fkey";

-- AddForeignKey
ALTER TABLE "MarginRatchet" ADD CONSTRAINT "MarginRatchet_loanId_fkey" FOREIGN KEY ("loanId") REFERENCES "Loan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarginRatchet" ADD CONSTRAINT "MarginRatchet_kpiId_fkey" FOREIGN KEY ("kpiId") REFERENCES "KPI"("id") ON DELETE CASCADE ON UPDATE CASCADE;
