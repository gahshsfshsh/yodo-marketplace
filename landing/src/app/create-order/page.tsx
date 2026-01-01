'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Briefcase,
  MapPin,
  Calendar,
  DollarSign,
  Upload,
  FileText,
  Clock,
  CheckCircle,
  ArrowRight,
  AlertCircle
} from 'lucide-react';

const categories = [
  { id: 'repair', name: 'Ремонт квартир', icon: '🏠' },
  { id: 'electric', name: 'Электрика', icon: '⚡' },
  { id: 'plumbing', name: 'Сантехника', icon: '🚰' },
  { id: 'design', name: 'Дизайн интерьера', icon: '🎨' },
  { id: 'construction', name: 'Строительство', icon: '🏗️' },
  { id: 'cleaning', name: 'Уборка', icon: '🧹' },
  { id: 'landscaping', name: 'Ландшафт', icon: '🌳' },
  { id: 'furniture', name: 'Мебель на заказ', icon: '🪑' }
];

export default function CreateOrderPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Шаг 1: Категория и описание
    category: '',
    title: '',
    description: '',
    
    // Шаг 2: Детали
    location: '',
    address: '',
    deadline: '',
    urgency: 'medium' as 'low' | 'medium' | 'high',
    
    // Шаг 3: Бюджет и файлы
    budgetType: 'range' as 'fixed' | 'range' | 'negotiable',
    budgetFixed: '',
    budgetMin: '',
    budgetMax: '',
    
    // Файлы
    photos: [] as File[],
    documents: [] as File[],
    
    // Дополнительные требования
    requiresLicense: false,
    requiresInsurance: false,
    requiresExperience: '',
    
    // Контакты
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    preferredContactMethod: 'phone' as 'phone' | 'email' | 'chat'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'photos' | 'documents') => {
    const files = e.target.files;
    if (!files) return;

    const fileArray = Array.from(files);
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], ...fileArray]
    }));
  };

  const removeFile = (field: 'photos' | 'documents', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const validateStep = (currentStep: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 1) {
      if (!formData.category) newErrors.category = 'Выберите категорию';
      if (!formData.title.trim()) newErrors.title = 'Укажите название заказа';
      if (formData.title.length < 10) newErrors.title = 'Минимум 10 символов';
      if (!formData.description.trim()) newErrors.description = 'Опишите задачу';
      if (formData.description.length < 50) newErrors.description = 'Минимум 50 символов';
    }

    if (currentStep === 2) {
      if (!formData.location.trim()) newErrors.location = 'Укажите город';
      if (!formData.deadline) newErrors.deadline = 'Укажите срок выполнения';
      
      const deadlineDate = new Date(formData.deadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (deadlineDate < today) {
        newErrors.deadline = 'Дата не может быть в прошлом';
      }
    }

    if (currentStep === 3) {
      if (formData.budgetType === 'fixed' && !formData.budgetFixed) {
        newErrors.budgetFixed = 'Укажите бюджет';
      }
      if (formData.budgetType === 'range') {
        if (!formData.budgetMin) newErrors.budgetMin = 'Укажите минимум';
        if (!formData.budgetMax) newErrors.budgetMax = 'Укажите максимум';
        if (Number(formData.budgetMin) >= Number(formData.budgetMax)) {
          newErrors.budgetMin = 'Минимум должен быть меньше максимума';
        }
      }
      if (!formData.contactName.trim()) newErrors.contactName = 'Укажите имя';
      if (!formData.contactPhone.trim()) newErrors.contactPhone = 'Укажите телефон';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setStep(step - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep(3)) return;

    setIsSubmitting(true);

    try {
      // TODO: Отправка на backend
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (Array.isArray(value) && value.length > 0 && value[0] instanceof File) {
          value.forEach(file => formDataToSend.append(key, file));
        } else if (Array.isArray(value)) {
          formDataToSend.append(key, JSON.stringify(value));
        } else {
          formDataToSend.append(key, String(value));
        }
      });

      // Симуляция отправки
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Успешное создание заказа
      router.push('/orders?created=true');
    } catch (error) {
      console.error('Ошибка создания заказа:', error);
      setErrors({ submit: 'Произошла ошибка. Попробуйте позже.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-4">
            <span className="text-2xl font-bold text-primary-600">YoDo</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Создать заказ
          </h1>
          <p className="text-gray-600">
            Заполните форму и получите отклики от проверенных специалистов
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex-1 flex items-center">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-semibold
                  ${step >= s 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-gray-200 text-gray-500'
                  }
                  transition-all duration-300
                `}>
                  {step > s ? <CheckCircle className="w-6 h-6" /> : s}
                </div>
                {s < 3 && (
                  <div className={`
                    flex-1 h-1 mx-2
                    ${step > s ? 'bg-primary-600' : 'bg-gray-200'}
                    transition-all duration-300
                  `} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between max-w-2xl mx-auto mt-2 px-2">
            <span className="text-xs text-gray-600">Описание</span>
            <span className="text-xs text-gray-600">Детали</span>
            <span className="text-xs text-gray-600">Бюджет</span>
          </div>
        </div>

        {/* Form */}
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          <form onSubmit={handleSubmit}>
            {/* Шаг 1: Категория и описание */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Выберите категорию *
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {categories.map(cat => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, category: cat.id })}
                        className={`
                          p-4 rounded-xl border-2 transition-all text-center
                          ${formData.category === cat.id
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:border-gray-300'
                          }
                        `}
                      >
                        <div className="text-3xl mb-2">{cat.icon}</div>
                        <div className="text-sm font-medium text-gray-900">{cat.name}</div>
                      </button>
                    ))}
                  </div>
                  {errors.category && <p className="mt-2 text-sm text-red-600">{errors.category}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Название заказа *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none ${
                      errors.title ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Например: Косметический ремонт квартиры 50 м²"
                  />
                  {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Подробное описание *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={6}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none resize-none ${
                      errors.description ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Опишите подробно что нужно сделать, какие материалы использовать, особые требования..."
                  />
                  <div className="flex justify-between items-center mt-1">
                    {errors.description ? (
                      <p className="text-sm text-red-600">{errors.description}</p>
                    ) : (
                      <p className="text-sm text-gray-500">Минимум 50 символов</p>
                    )}
                    <p className="text-sm text-gray-400">{formData.description.length} символов</p>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="button"
                    onClick={handleNext}
                    className="w-full py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    Далее
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* Шаг 2: Детали */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Город *
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        className={`w-full pl-11 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none ${
                          errors.location ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Москва"
                      />
                    </div>
                    {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Адрес (опционально)
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                      placeholder="Улица, дом, квартира"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Срок выполнения *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="date"
                      name="deadline"
                      value={formData.deadline}
                      onChange={handleInputChange}
                      min={new Date().toISOString().split('T')[0]}
                      className={`w-full pl-11 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none ${
                        errors.deadline ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  {errors.deadline && <p className="mt-1 text-sm text-red-600">{errors.deadline}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Срочность
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'low', label: 'Не срочно', color: 'gray' },
                      { value: 'medium', label: 'Средне', color: 'yellow' },
                      { value: 'high', label: 'Срочно!', color: 'red' }
                    ].map(urgency => (
                      <button
                        key={urgency.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, urgency: urgency.value as typeof formData.urgency })}
                        className={`
                          p-3 rounded-xl border-2 transition-all font-medium
                          ${formData.urgency === urgency.value
                            ? `border-${urgency.color}-500 bg-${urgency.color}-50 text-${urgency.color}-700`
                            : 'border-gray-200 hover:border-gray-300'
                          }
                        `}
                      >
                        {urgency.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Требования к специалисту (опционально)
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        name="requiresLicense"
                        checked={formData.requiresLicense}
                        onChange={handleInputChange}
                        className="w-5 h-5 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700">Требуется лицензия</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        name="requiresInsurance"
                        checked={formData.requiresInsurance}
                        onChange={handleInputChange}
                        className="w-5 h-5 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700">Требуется страховка</span>
                    </label>
                    <div>
                      <select
                        name="requiresExperience"
                        value={formData.requiresExperience}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                      >
                        <option value="">Опыт не важен</option>
                        <option value="1">От 1 года</option>
                        <option value="3">От 3 лет</option>
                        <option value="5">От 5 лет</option>
                        <option value="10">От 10 лет</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex-1 py-3 border-2 border-gray-300 rounded-xl font-semibold hover:bg-gray-50 transition-all"
                  >
                    Назад
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    className="flex-1 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    Далее
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* Шаг 3: Бюджет и контакты */}
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Бюджет *
                  </label>
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {[
                      { value: 'fixed', label: 'Фиксированная сумма' },
                      { value: 'range', label: 'Диапазон' },
                      { value: 'negotiable', label: 'Договорная' }
                    ].map(type => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, budgetType: type.value as typeof formData.budgetType })}
                        className={`
                          p-3 rounded-xl border-2 transition-all text-sm font-medium
                          ${formData.budgetType === type.value
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : 'border-gray-200 hover:border-gray-300'
                          }
                        `}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>

                  {formData.budgetType === 'fixed' && (
                    <div>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="number"
                          name="budgetFixed"
                          value={formData.budgetFixed}
                          onChange={handleInputChange}
                          className={`w-full pl-11 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none ${
                            errors.budgetFixed ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="50000"
                          min="0"
                        />
                      </div>
                      {errors.budgetFixed && <p className="mt-1 text-sm text-red-600">{errors.budgetFixed}</p>}
                    </div>
                  )}

                  {formData.budgetType === 'range' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <input
                          type="number"
                          name="budgetMin"
                          value={formData.budgetMin}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none ${
                            errors.budgetMin ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="От 30000"
                          min="0"
                        />
                        {errors.budgetMin && <p className="mt-1 text-sm text-red-600">{errors.budgetMin}</p>}
                      </div>
                      <div>
                        <input
                          type="number"
                          name="budgetMax"
                          value={formData.budgetMax}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none ${
                            errors.budgetMax ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="До 70000"
                          min="0"
                        />
                        {errors.budgetMax && <p className="mt-1 text-sm text-red-600">{errors.budgetMax}</p>}
                      </div>
                    </div>
                  )}

                  {formData.budgetType === 'negotiable' && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <div className="flex gap-3">
                        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-blue-900">
                          Вы сможете обсудить стоимость со специалистами после получения откликов
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Файлы */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Фотографии (опционально)
                  </label>
                  <label className="flex items-center justify-center gap-2 px-4 py-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-primary-500 cursor-pointer transition-all">
                    <Upload className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {formData.photos.length > 0 
                        ? `Загружено фото: ${formData.photos.length}`
                        : 'Загрузить фото'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, 'photos')}
                    />
                  </label>
                  {formData.photos.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.photos.map((file, index) => (
                        <div key={index} className="relative group">
                          <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                            <img 
                              src={URL.createObjectURL(file)} 
                              alt={file.name}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile('photos', index)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Контакты */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Контактные данные</h3>
                  
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <input
                        type="text"
                        name="contactName"
                        value={formData.contactName}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none ${
                          errors.contactName ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Ваше имя *"
                      />
                      {errors.contactName && <p className="mt-1 text-sm text-red-600">{errors.contactName}</p>}
                    </div>

                    <div>
                      <input
                        type="tel"
                        name="contactPhone"
                        value={formData.contactPhone}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none ${
                          errors.contactPhone ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Телефон *"
                      />
                      {errors.contactPhone && <p className="mt-1 text-sm text-red-600">{errors.contactPhone}</p>}
                    </div>
                  </div>

                  <input
                    type="email"
                    name="contactEmail"
                    value={formData.contactEmail}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none mb-4"
                    placeholder="Email (опционально)"
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Предпочитаемый способ связи
                    </label>
                    <select
                      name="preferredContactMethod"
                      value={formData.preferredContactMethod}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                    >
                      <option value="phone">Телефон</option>
                      <option value="email">Email</option>
                      <option value="chat">Чат в YoDo</option>
                    </select>
                  </div>
                </div>

                {errors.submit && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-sm text-red-600">{errors.submit}</p>
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex-1 py-3 border-2 border-gray-300 rounded-xl font-semibold hover:bg-gray-50 transition-all"
                    disabled={isSubmitting}
                  >
                    Назад
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Создание...
                      </>
                    ) : (
                      <>
                        Создать заказ
                        <CheckCircle className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>
        </motion.div>

        {/* Footer */}
        <p className="text-center mt-6 text-sm text-gray-600">
          Создавая заказ, вы соглашаетесь с{' '}
          <Link href="/terms" className="text-primary-600 hover:underline">
            условиями использования
          </Link>
        </p>
      </div>
    </div>
  );
}

