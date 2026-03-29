import React from 'react';
import { useTranslations } from 'next-intl';

export default function StudentsPage() {
  const t = useTranslations('StudentsPage');

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">{t('title')}</h1>
      <form className="space-y-4 max-w-md">
        <div>
          <label className="block text-sm font-medium mb-1">{t('nameLabel')}</label>
          <input type="text" className="w-full border p-2 rounded" placeholder="Jan Novak" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">{t('emailLabel')}</label>
          <input type="email" className="w-full border p-2 rounded" placeholder="jan@example.com" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">{t('courseCategoryLabel')}</label>
          <select className="w-full border p-2 rounded">
            <option value="A">{t('categoryA')}</option>
            <option value="B">{t('categoryB')}</option>
            <option value="C">{t('categoryC')}</option>
          </select>
        </div>
        <button type="button" className="bg-blue-600 text-white px-4 py-2 rounded">
          {t('registerButton')}
        </button>
      </form>
    </div>
  );
}
