"use client";
import React from "react";
import { useI18n } from "../../components/LanguageProvider";

export default function ManagerDashboardPage() {
  const { t } = useI18n();
  
  return (
    <div className="max-w-3xl mx-auto mt-12 p-8 bg-white rounded-2xl shadow-lg border border-green-100">
      <h1 className="text-3xl font-bold text-green-700 mb-4">{t('manager.dashboard.title')}</h1>
      <p className="text-gray-700 text-lg mb-6">{t('manager.dashboard.welcome')}</p>
      <ul className="list-disc pl-6 text-gray-600 space-y-2">
        <li>{t('manager.dashboard.feature1')}</li>
        <li>{t('manager.dashboard.feature2')}</li>
        <li>{t('manager.dashboard.feature3')}</li>
      </ul>
    </div>
  );
}