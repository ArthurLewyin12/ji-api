-- CreateTable
CREATE TABLE "public"."Submission" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "nom" TEXT NOT NULL,
    "prenoms" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "annee" TEXT NOT NULL DEFAULT 'L1',
    "email" TEXT NOT NULL,
    "telephone" TEXT NOT NULL,
    "hobbies" TEXT[],
    "personnalite" TEXT NOT NULL,
    "specialisationInteresse" TEXT[],
    "objectifsEtudes" TEXT[],
    "styleApprentissage" TEXT NOT NULL,
    "niveauTechnique" TEXT NOT NULL,
    "participationAsso" TEXT NOT NULL,
    "attentesParrainage" TEXT NOT NULL,
    "genreParrain" TEXT NOT NULL,
    "typeRelation" TEXT NOT NULL,
    "frequenceContact" TEXT NOT NULL,
    "modeCommunication" TEXT NOT NULL,
    "commentaires" TEXT,
    "accepteConditions" BOOLEAN NOT NULL,
    "photoPath" TEXT NOT NULL,

    CONSTRAINT "Submission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Submission_email_key" ON "public"."Submission"("email");
