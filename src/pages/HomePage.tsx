import React from 'react';
import { Hero } from '../components/home/Hero.tsx';
import { KMCCollaborationBanner } from '../components/home/KMCCollaborationBanner.tsx';
import { DepartmentsOverview } from '../components/home/DepartmentsOverview.tsx';
import { DialysisSpotlight } from '../components/home/DialysisSpotlight.tsx';
import { DoctorDirectory } from '../components/home/DoctorDirectory.tsx';
import { ReviewsSection } from '../components/home/ReviewsSection.tsx';
import { LocationHoursSection } from '../components/home/LocationHoursSection.tsx';

export const HomePage: React.FC = () => {
  return (
    <div className="space-y-0">
      <Hero />
      <KMCCollaborationBanner />
      <DepartmentsOverview />
      <DialysisSpotlight />
      <DoctorDirectory />
      <ReviewsSection />
      <LocationHoursSection />
    </div>
  );
};
