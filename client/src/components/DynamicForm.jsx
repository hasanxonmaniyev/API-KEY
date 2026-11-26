import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, Dices, RefreshCw, AlertCircle, Check, Info, 
  Upload, Image as ImageIcon, X, Link as LinkIcon, Palette, CheckCircle2, Car, User, ShoppingBag 
} from 'lucide-react';
import { request, uploadImage } from '../utils/api';
import { IMAGE_GALLERIES, getGalleryForField } from '../data/galleries';

export default function DynamicForm({ templates, selectedTemplateId, setSelectedTemplateId, onApiGenerated }) {
  const [formData, setFormData] = useState({});
  const [uploadingField, setUploadingField] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRefs = useRef({});

  const currentTemplate = templates.find(t => t.id === Number(selectedTemplateId)) || templates[0];
  const fields = currentTemplate?.fields || [];

  // Shablon o'zgarganda boshlang'ich qiymatlarni o'rnatish
  useEffect(() => {
    if (fields.length > 0) {
      const initial = {};
      fields.forEach(f => {
        initial[f.key] = f.defaultValue !== undefined ? f.defaultValue : (f.type === 'boolean' ? false : '');
      });
      setFormData(initial);
      setError(null);
    }
  }, [selectedTemplateId, templates]);

  const handleInputChange = (key, value, type) => {
    let parsedVal = value;
    if (type === 'number') {
      parsedVal = value === '' ? '' : Number(value);
    } else if (type === 'boolean') {
      parsedVal = Boolean(value);
    }
    setFormData(prev => ({
      ...prev,
      [key]: parsedVal
    }));
  };

  // Galereyadan rasmni bosib tanlash
  const handleSelectGalleryItem = (fieldKey, item) => {
    handleInputChange(fieldKey, item.url, 'image');

    // Agar bu mashina rasmi bo'lsa va formda carName maydoni bo'lsa, mashina nomini ham avtomatik to'ldirish
    if (formData.carName !== undefined && item.name) {
      handleInputChange('carName', item.name, 'text');
    }
  };

  // Fayl yuklash
  const handleFileUpload = async (key, file) => {
    if (!file) return;
    setUploadingField(key);
    try {
      const uploadRes = await uploadImage(file);
      const url = uploadRes.fullUrl || uploadRes.url;
      handleInputChange(key, url, 'image');
    } catch (err) {
      alert('Rasm yuklashda xatolik yuz berdi: ' + err.message);
    } finally {
      setUploadingField(null);
    }
  };

  // Namuna ma'lumotlarni avtomatik to'ldirish
  const handleFillRandom = () => {
    const isCarTemplate = currentTemplate?.id === 1 || fields.some(f => f.key === 'carName');
    const randomCar = IMAGE_GALLERIES.cars[Math.floor(Math.random() * IMAGE_GALLERIES.cars.length)];
    const randomAvatar = IMAGE_GALLERIES.avatars[Math.floor(Math.random() * IMAGE_GALLERIES.avatars.length)];
    const randomProd = IMAGE_GALLERIES.products[Math.floor(Math.random() * IMAGE_GALLERIES.products.length)];

    const samplePeople = [
      { firstName: 'Hasan', lastName: 'Maniyev', age: 23, profession: 'Dasturiy Ta\'minot Muhandisi', city: 'Toshkent', fianceName: 'Zulayho' },
      { firstName: 'Alisher', lastName: 'Navoiy', age: 25, profession: 'Frontend Dasturchi', city: 'Samarqand', fianceName: 'Guli' },
      { firstName: 'Jasur', lastName: 'Raximov', age: 22, profession: 'Backend Dasturchi', city: 'Buxoro', fianceName: 'Madina' },
      { firstName: 'Bobur', lastName: 'Mirzayev', age: 24, profession: 'Mobil Dasturchi', city: 'Andijon', fianceName: 'Kamola' }
    ];

    const person = samplePeople[Math.floor(Math.random() * samplePeople.length)];

    const filled = {};
    fields.forEach(f => {
      if (person[f.key] !== undefined) {
        filled[f.key] = person[f.key];
      } else if (f.key === 'carName') {
        filled[f.key] = randomCar.name;
      } else if (f.key === 'avatar' || f.key === 'photo') {
        filled[f.key] = randomAvatar.url;
      } else if (f.key === 'carPhoto' || f.key === 'carImage') {
        filled[f.key] = randomCar.url;
      } else if (f.key === 'productImage') {
        filled[f.key] = randomProd.url;
      } else if (f.key === 'productName') {
        filled[f.key] = randomProd.name;
      } else if (f.type === 'number') {
        filled[f.key] = f.key === 'price' ? 1200 : 25;
      } else if (f.type === 'boolean') {
        filled[f.key] = true;
      } else if (f.type === 'color') {
        filled[f.key] = '#4f46e5';
      } else {
        filled[f.key] = f.defaultValue || `${f.name} namunasi`;
      }
    });

    setFormData(filled);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (currentTemplate?.id === 1 && formData.firstName && formData.lastName) {
        try {
          await request('/api/users', {
            method: 'POST',
            body: JSON.stringify(formData)
          });
        } catch (_) {}
      }

      const res = await request('/api/data', {
        method: 'POST',
        body: JSON.stringify({
          templateId: currentTemplate.id,
          ...formData
        })
      });

      if (res.ok) {
        onApiGenerated({
          id: res.data.apiId,
          endpoint: res.data.endpoint,
          data: res.data.data,
          templateName: currentTemplate.name
        });
      } else {
        setError(res.data?.message || (res.data?.errors ? res.data.errors.join(', ') : 'API yaratishda xatolik yuz berdi'));
      }
    } catch (err) {
      setError(err.message || 'Server bilan bog\'lanishda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  // Rasm maydonlarini ajratib olish (galereya ko'rsatish uchun)
  const imageFields = fields.filter(f => f.type === 'image');
  const regularFields = fields.filter(f => f.type !== 'image');

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* 1. Yuqori qism: Shablon tanlash */}
      <div className="p-6 sm:p-7 border-b border-slate-200 bg-slate-50/70">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-1 rounded-md bg-indigo-100 text-indigo-700">
                <Sparkles className="w-4 h-4" />
              </span>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                1-Qadam: Dars shablonini tanlang
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Kerakli mavzuni bosing. Maydonlar va tayyor rasmlar avtomatik moslashadi.
            </p>
          </div>

          <button
            type="button"
            onClick={handleFillRandom}
            className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 transition-all shadow-2xs active:scale-95"
          >
            <Dices className="w-4 h-4 text-indigo-600" />
            <span>Namunaviy ma'lumotlar bilan to'ldirish</span>
          </button>
        </div>

        {/* Shablon tugmalari */}
        <div className="mt-4 flex flex-wrap gap-2.5">
          {templates.map(tpl => {
            const isSelected = Number(selectedTemplateId) === tpl.id;
            return (
              <button
                key={tpl.id}
                type="button"
                onClick={() => setSelectedTemplateId(tpl.id)}
                className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center space-x-2.5 border ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <span>{tpl.name}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${
                  isSelected ? 'bg-indigo-700 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {tpl.fields?.length || 0} ta maydon
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Asosiy forma */}
      <form onSubmit={handleSubmit} className="p-6 sm:p-7 space-y-7">
        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start space-x-3 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
            <div>
              <p className="font-bold">Xatolik:</p>
              <p className="mt-0.5 text-rose-700">{error}</p>
            </div>
          </div>
        )}

        {/* Matnli va raqamli maydonlar */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3 flex items-center space-x-1.5">
            <span>2-Qadam: Ma'lumotlarni kiriting</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {regularFields.map((field) => {
              const val = formData[field.key] !== undefined ? formData[field.key] : '';

              if (field.type === 'boolean') {
                return (
                  <div key={field.key} className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center justify-between">
                    <div>
                      <label className="text-xs font-bold text-slate-800 flex items-center space-x-1">
                        <span>{field.name}</span>
                        {field.required && <span className="text-rose-500">*</span>}
                      </label>
                      <span className="text-[10px] font-mono text-slate-500">{field.key} (ha / yo'q)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleInputChange(field.key, !val, 'boolean')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        val ? 'bg-indigo-600' : 'bg-slate-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          val ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                );
              }

              if (field.type === 'color') {
                return (
                  <div key={field.key} className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1">
                    <label className="text-xs font-bold text-slate-800 flex items-center space-x-1">
                      <span>{field.name}</span>
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={val || '#4f46e5'}
                        onChange={(e) => handleInputChange(field.key, e.target.value, 'color')}
                        className="w-9 h-8 rounded-lg border-0 cursor-pointer p-0 bg-transparent"
                      />
                      <input
                        type="text"
                        value={val}
                        onChange={(e) => handleInputChange(field.key, e.target.value, 'color')}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-mono text-slate-700"
                      />
                    </div>
                  </div>
                );
              }

              if (field.type === 'textarea') {
                return (
                  <div key={field.key} className="sm:col-span-2 lg:col-span-3 space-y-1">
                    <label className="text-xs font-bold text-slate-800">
                      {field.name} {field.required && <span className="text-rose-500">*</span>}
                    </label>
                    <textarea
                      rows={2}
                      value={val}
                      required={field.required}
                      placeholder={`${field.name} haqida batafsil ma'lumot...`}
                      onChange={(e) => handleInputChange(field.key, e.target.value, 'textarea')}
                      className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                );
              }

              return (
                <div key={field.key} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800">
                      {field.name} {field.required && <span className="text-rose-500">*</span>}
                    </label>
                    <span className="text-[10px] font-mono text-slate-400">{field.key}</span>
                  </div>
                  <input
                    type={field.type === 'number' ? 'number' : field.type === 'email' ? 'email' : 'text'}
                    value={val}
                    required={field.required}
                    placeholder={`Masalan: ${field.defaultValue || field.name}...`}
                    onChange={(e) => handleInputChange(field.key, e.target.value, field.type)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium"
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. Rasmlar bo'limi: Tayyor rasmlar to'plamidan bitta bosish orqali tanlash */}
        {imageFields.length > 0 && (
          <div className="pt-2 border-t border-slate-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-4 flex items-center space-x-1.5">
              <span>3-Qadam: Rasmni tanlang (Bitta bosish kifoya)</span>
            </h3>

            <div className="space-y-6">
              {imageFields.map((field) => {
                const currentVal = formData[field.key] || '';
                const galleryInfo = getGalleryForField(field.key, field.name);
                const isUploading = uploadingField === field.key;

                return (
                  <div key={field.key} className="bg-slate-50/70 border border-slate-200 rounded-2xl p-5 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        <ImageIcon className="w-4 h-4 text-indigo-600" />
                        <span className="text-xs font-bold text-slate-900">{field.name}:</span>
                        <span className="text-xs text-slate-500 font-normal">{galleryInfo.title}</span>
                      </div>

                      {/* Tanlangan rasm ko'rinishi */}
                      {currentVal && (
                        <div className="flex items-center space-x-2 bg-white px-2.5 py-1 rounded-lg border border-slate-200 text-xs text-slate-600">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="font-medium text-[11px]">Rasm tanlandi</span>
                          <button
                            type="button"
                            onClick={() => handleInputChange(field.key, '', 'image')}
                            className="text-slate-400 hover:text-rose-600 ml-1"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* TAYYOR RASMLAR GALEREYASI (KATALOG) */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-8 gap-3">
                      {galleryInfo.items.map((item) => {
                        const isSelected = currentVal === item.url;
                        return (
                          <div
                            key={item.id}
                            onClick={() => handleSelectGalleryItem(field.key, item)}
                            className={`group relative rounded-xl overflow-hidden cursor-pointer border-2 transition-all duration-150 bg-white ${
                              isSelected
                                ? 'border-indigo-600 shadow-md ring-2 ring-indigo-100 scale-102'
                                : 'border-slate-200 hover:border-indigo-300 hover:shadow-xs'
                            }`}
                          >
                            <div className="aspect-4/3 w-full bg-slate-100 overflow-hidden relative">
                              <img
                                src={item.url}
                                alt={item.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                              />
                              {isSelected && (
                                <div className="absolute inset-0 bg-indigo-600/20 flex items-center justify-center">
                                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                                    <Check className="w-4 h-4 stroke-[3]" />
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="p-1.5 text-center">
                              <p className={`text-[10px] font-bold truncate ${isSelected ? 'text-indigo-700' : 'text-slate-700'}`}>
                                {item.name}
                              </p>
                              {item.badge && (
                                <span className="text-[9px] text-slate-400">{item.badge}</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Ixtiyoriy: O'z rasmini kiritish yoki fayl yuklash */}
                    <details className="text-xs text-slate-500 pt-1">
                      <summary className="cursor-pointer font-medium hover:text-indigo-600 select-none">
                        Boshqa rasm havolasini yozish yoki kompyuterdan fayl yuklash
                      </summary>
                      <div className="mt-2.5 flex flex-col sm:flex-row items-center gap-2 pt-2 border-t border-slate-200">
                        <input
                          type="url"
                          value={currentVal}
                          placeholder="Rasm internet havolasi (https://...)"
                          onChange={(e) => handleInputChange(field.key, e.target.value, 'image')}
                          className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />

                        <input
                          type="file"
                          accept="image/*"
                          ref={el => fileInputRefs.current[field.key] = el}
                          className="hidden"
                          onChange={(e) => handleFileUpload(field.key, e.target.files[0])}
                        />
                        <button
                          type="button"
                          disabled={isUploading}
                          onClick={() => fileInputRefs.current[field.key]?.click()}
                          className="w-full sm:w-auto inline-flex items-center justify-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 shrink-0"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>{isUploading ? 'Yuklanmoqda...' : 'Fayl yuklash'}</span>
                        </button>
                      </div>
                    </details>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 4. API Yaratish tugmasi */}
        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500 flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Ma'lumotlar real PostgreSQL bazasiga yoziladi va o'quvchiga individual endpoint beriladi</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2.5 px-8 py-3 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>API Yaratilmoqda...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>API Endpointni Generatsiya Qilish</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
