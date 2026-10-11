import { ASSET_URL } from '../services/api';

export const getCategoryFallback = (category) => {
  switch (category) {
    case 'Snacks':
      return '/images/products/peanut-butter.jpg';
    case 'Protein':
      return '/images/products/whey-protein.jpg';
    case 'Vitamins':
      return '/images/products/multivitamin.jpg';
    case 'Supplements':
      return '/images/products/creatine.jpg';
    case 'Equipment':
      return '/images/products/dumbbells.jpg';
    default:
      return '/images/products/whey-protein.jpg';
  }
};

export const resolveProductImage = (productOrImage, category) => {
  if (!productOrImage) return getCategoryFallback(category);

  let imagePath = productOrImage;
  let cat = category;

  // Handle case where full product object is passed
  if (typeof productOrImage === 'object') {
    imagePath = productOrImage.image || (Array.isArray(productOrImage.images) && productOrImage.images[0]) || '';
    cat = cat || productOrImage.category;
  }

  if (typeof imagePath !== 'string' || !imagePath.trim()) {
    return getCategoryFallback(cat);
  }

  imagePath = imagePath.trim();

  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  if (imagePath.startsWith('/images/')) {
    return imagePath;
  }

  return `${ASSET_URL}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
};
