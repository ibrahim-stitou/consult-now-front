// src/app/medecin/calendrier/page.tsx
"use client";

import React from 'react';
import { CalendrierMedecin } from '@/features/medecin/calendrier-medecin';
import PageContainer from '@/components/layout/page-container';

export default function CalendrierPage() {
  return (
    <PageContainer>
      <div className="container mx-auto py-6">
        <CalendrierMedecin />
      </div>
    </PageContainer>
  );
}