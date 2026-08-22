import React, { useState } from 'react';
import { SurveyData, WebsiteData } from '../lib/api';
import { SurveyList } from '../components/SurveyList';
import { SurveyBuilder } from '../components/SurveyBuilder';

interface SurveysPageProps {
  currentWebsite: WebsiteData | null;
  surveys: SurveyData[];
  onRefreshSurveys: () => void;
}

export const SurveysPage: React.FC<SurveysPageProps> = ({
  currentWebsite,
  surveys,
  onRefreshSurveys
}) => {
  const [editingSurvey, setEditingSurvey] = useState<SurveyData | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const websiteId = currentWebsite?.id || 'site_default';

  const handleCreateNew = () => {
    setEditingSurvey(null);
    setIsCreating(true);
  };

  const handleEdit = (survey: SurveyData) => {
    setEditingSurvey(survey);
    setIsCreating(true);
  };

  const handleSaveSuccess = () => {
    setIsCreating(false);
    setEditingSurvey(null);
    onRefreshSurveys();
  };

  return (
    <div>
      {isCreating ? (
        <SurveyBuilder
          websiteId={websiteId}
          initialSurvey={editingSurvey}
          onSave={handleSaveSuccess}
          onCancel={() => {
            setIsCreating(false);
            setEditingSurvey(null);
          }}
        />
      ) : (
        <SurveyList
          surveys={surveys}
          onEdit={handleEdit}
          onCreateNew={handleCreateNew}
          onRefresh={onRefreshSurveys}
        />
      )}
    </div>
  );
};
