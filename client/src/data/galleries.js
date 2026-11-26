// O'quvchilar va o'qituvchilar uchun tayyor rasmlar to'plami (Galleries)

export const IMAGE_GALLERIES = {
  cars: [
    {
      id: 'car-tracker',
      name: 'Chevrolet Tracker 2',
      url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80',
      badge: 'Krossover'
    },
    {
      id: 'car-malibu',
      name: 'Chevrolet Malibu 2',
      url: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=600&q=80',
      badge: 'Sedan'
    },
    {
      id: 'car-gentra',
      name: 'Chevrolet Gentra Black',
      url: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=600&q=80',
      badge: 'Sedan'
    },
    {
      id: 'car-bmw',
      name: 'BMW M5 Competition',
      url: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=600&q=80',
      badge: 'Sport'
    },
    {
      id: 'car-mercedes',
      name: 'Mercedes-Benz E-Class',
      url: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=600&q=80',
      badge: 'Biznes'
    },
    {
      id: 'car-kia',
      name: 'Kia K5 Fastback',
      url: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=600&q=80',
      badge: 'Sedan'
    },
    {
      id: 'car-byd',
      name: 'BYD Song Plus EV',
      url: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=600&q=80',
      badge: 'Elektromobil'
    },
    {
      id: 'car-audi',
      name: 'Audi RS7 Sportback',
      url: 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=600&q=80',
      badge: 'Sport'
    }
  ],

  avatars: [
    {
      id: 'avatar-1',
      name: 'Dasturchi yigit',
      url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
      badge: 'Frontend'
    },
    {
      id: 'avatar-2',
      name: 'Muhandis',
      url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
      badge: 'Backend'
    },
    {
      id: 'avatar-3',
      name: 'Talaba qiz',
      url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80',
      badge: 'UI/UX'
    },
    {
      id: 'avatar-4',
      name: 'Talaba yigit',
      url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
      badge: 'Full-Stack'
    },
    {
      id: 'avatar-5',
      name: 'Dasturchi qiz',
      url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=600&q=80',
      badge: 'Mobile'
    },
    {
      id: 'avatar-6',
      name: 'O\'quvchi',
      url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=600&q=80',
      badge: 'Junior'
    }
  ],

  products: [
    {
      id: 'prod-iphone',
      name: 'iPhone 17 Pro',
      url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02560?auto=format&fit=crop&w=600&q=80',
      badge: 'Smartfon'
    },
    {
      id: 'prod-macbook',
      name: 'MacBook Pro M3',
      url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80',
      badge: 'Noutbuk'
    },
    {
      id: 'prod-watch',
      name: 'Apple Watch Ultra',
      url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
      badge: 'Soat'
    },
    {
      id: 'prod-sony',
      name: 'Sony WH-1000XM5',
      url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
      badge: 'Audio'
    }
  ]
};

// Yordamchi: maydon kaliti bo'yicha qaysi galereyani ko'rsatishni aniqlash
export function getGalleryForField(fieldKey = '', fieldName = '') {
  const combined = (fieldKey + ' ' + fieldName).toLowerCase();
  if (combined.includes('car') || combined.includes('mashina') || combined.includes('avto')) {
    return { title: 'Mashinalar to\'plami (Tanlash uchun bosing):', items: IMAGE_GALLERIES.cars };
  }
  if (combined.includes('avatar') || combined.includes('user') || combined.includes('talaba') || combined.includes('profil') || combined.includes('photo') || combined.includes('rasm')) {
    return { title: 'O\'quvchi / Talaba rasmlari (Tanlash uchun bosing):', items: IMAGE_GALLERIES.avatars };
  }
  if (combined.includes('product') || combined.includes('tovar') || combined.includes('gadget') || combined.includes('buyum')) {
    return { title: 'Mahsulotlar to\'plami (Tanlash uchun bosing):', items: IMAGE_GALLERIES.products };
  }
  return { title: 'Tavsiya etilgan rasmlar (Tanlash uchun bosing):', items: [...IMAGE_GALLERIES.cars.slice(0, 4), ...IMAGE_GALLERIES.avatars.slice(0, 4)] };
}
