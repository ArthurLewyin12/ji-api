/*
  Warnings:

  - A unique constraint covering the columns `[nom,prenoms]` on the table `Submission` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Submission_nom_prenoms_key" ON "public"."Submission"("nom", "prenoms");
