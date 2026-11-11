import React from 'react';
import {
  Utensils,
  Plane,
  Home,
  ShoppingBag,
  Film,
  Zap,
  Tag,
} from 'lucide-react';

export const getCategoryMeta = (category = '') => {
  const norm = category.toLowerCase().trim();

  switch (norm) {
    case 'food':
    case 'dining':
    case 'dinner':
    case 'lunch':
    case 'breakfast':
      return {
        icon: <Utensils className="w-5 h-5 text-amber-600" />,
        bg: 'bg-amber-50 border-amber-100',
        label: 'Food & Dining',
      };
    case 'travel':
    case 'transport':
    case 'flight':
    case 'cab':
      return {
        icon: <Plane className="w-5 h-5 text-sky-600" />,
        bg: 'bg-sky-50 border-sky-100',
        label: 'Travel',
      };
    case 'stay':
    case 'rent':
    case 'hotel':
    case 'accommodation':
      return {
        icon: <Home className="w-5 h-5 text-indigo-600" />,
        bg: 'bg-indigo-50 border-indigo-100',
        label: 'Stay',
      };
    case 'groceries':
    case 'shopping':
      return {
        icon: <ShoppingBag className="w-5 h-5 text-emerald-600" />,
        bg: 'bg-emerald-50 border-emerald-100',
        label: 'Groceries',
      };
    case 'entertainment':
    case 'movie':
    case 'outing':
      return {
        icon: <Film className="w-5 h-5 text-purple-600" />,
        bg: 'bg-purple-50 border-purple-100',
        label: 'Entertainment',
      };
    case 'utilities':
    case 'bills':
      return {
        icon: <Zap className="w-5 h-5 text-yellow-600" />,
        bg: 'bg-yellow-50 border-yellow-100',
        label: 'Utilities',
      };
    default:
      return {
        icon: <Tag className="w-5 h-5 text-slate-600" />,
        bg: 'bg-slate-100 border-slate-200',
        label: category || 'General',
      };
  }
};