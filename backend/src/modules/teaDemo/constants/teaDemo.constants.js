export const TEA_DEMO_ROUTE_PREFIX = '/api/tea-demo/v1'

export const TEA_DEMO_ROLES = Object.freeze({
  USER: 'user',
  ADMIN: 'admin'
})

export const TEA_DEMO_ROLE_LABELS = Object.freeze({
  [TEA_DEMO_ROLES.USER]: 'USER',
  [TEA_DEMO_ROLES.ADMIN]: 'ADMIN'
})

export const TEA_DEMO_PRODUCT_STATUS = Object.freeze({
  ON_SALE: 'ON_SALE',
  OFF_SALE: 'OFF_SALE',
  SOLD_OUT: 'SOLD_OUT'
})

export const TEA_DEMO_PERMISSIONS = Object.freeze({
  PRODUCT_VIEW: 'product:view',
  PRODUCT_CREATE: 'product:create',
  PRODUCT_UPDATE: 'product:update',
  PRODUCT_DELETE: 'product:delete',
  PRODUCT_PUBLISH: 'product:publish',
  AUTH_REFRESH: 'auth:refresh',
  AUTH_LOGOUT: 'auth:logout'
})

export const TEA_DEMO_ROLE_PERMISSIONS = Object.freeze({
  [TEA_DEMO_ROLES.USER]: [
    TEA_DEMO_PERMISSIONS.PRODUCT_VIEW,
    TEA_DEMO_PERMISSIONS.AUTH_REFRESH,
    TEA_DEMO_PERMISSIONS.AUTH_LOGOUT
  ],
  [TEA_DEMO_ROLES.ADMIN]: [
    TEA_DEMO_PERMISSIONS.PRODUCT_VIEW,
    TEA_DEMO_PERMISSIONS.PRODUCT_CREATE,
    TEA_DEMO_PERMISSIONS.PRODUCT_UPDATE,
    TEA_DEMO_PERMISSIONS.PRODUCT_DELETE,
    TEA_DEMO_PERMISSIONS.PRODUCT_PUBLISH,
    TEA_DEMO_PERMISSIONS.AUTH_REFRESH,
    TEA_DEMO_PERMISSIONS.AUTH_LOGOUT
  ]
})

export const TEA_DEMO_CATEGORIES = Object.freeze([
  { id: 'all', code: 'all', name: '全部', nameEn: 'All', sort: 0 },
  { id: 'fruit', code: 'fruit', name: '水果茶', nameEn: 'Fruit Tea', sort: 10 },
  { id: 'cheese', code: 'cheese', name: '芝士茶', nameEn: 'Cheese Tea', sort: 20 },
  { id: 'tea', code: 'tea', name: '纯茶', nameEn: 'Pure Tea', sort: 30 },
  { id: 'coffee', code: 'coffee', name: '咖啡', nameEn: 'Coffee', sort: 40 },
  { id: 'ice', code: 'ice', name: '冰淇淋', nameEn: 'Ice Cream', sort: 50 }
])

export const TEA_DEMO_PRODUCT_CATEGORY_CODES = TEA_DEMO_CATEGORIES
  .filter((category) => category.code !== 'all')
  .map((category) => category.code)

export const TEA_DEMO_DEFAULT_PRODUCT_SPECS = Object.freeze({
  sizes: [
    { code: 'small', name: '小杯', nameEn: 'Small', extraPrice: -2 },
    { code: 'medium', name: '中杯', nameEn: 'Medium', extraPrice: 0 },
    { code: 'large', name: '大杯', nameEn: 'Large', extraPrice: 3 }
  ],
  sweetness: [
    { code: 'none', name: '无糖', nameEn: 'No Sugar' },
    { code: 'less', name: '少糖', nameEn: 'Less Sugar' },
    { code: 'normal', name: '正常糖', nameEn: 'Normal Sugar' },
    { code: 'more', name: '多糖', nameEn: 'More Sugar' }
  ],
  toppings: [
    { code: 'pearl', name: '珍珠', nameEn: 'Pearl', price: 3 },
    { code: 'coconut', name: '椰果', nameEn: 'Coconut Jelly', price: 3 },
    { code: 'pudding', name: '布丁', nameEn: 'Pudding', price: 4 }
  ]
})

export const TEA_DEMO_DEFAULT_USERS = Object.freeze([
  {
    username: 'admin',
    email: 'admin@tea-demo.local',
    password: '123456',
    nickname: '茶饮管理员',
    role: TEA_DEMO_ROLES.ADMIN,
    avatar: '/images/default-avatar.png'
  },
  {
    username: 'user',
    email: 'user@tea-demo.local',
    password: '123456',
    nickname: '演示用户',
    role: TEA_DEMO_ROLES.USER,
    avatar: '/images/default-avatar.png'
  }
])

export const TEA_DEMO_DEFAULT_PRODUCTS = Object.freeze([
  {
    name: '芝士莓莓',
    nameEn: 'Cheese Berry',
    description: '新鲜草莓搭配绵密芝士奶盖，酸甜清爽。',
    descriptionEn: 'Fresh strawberries with creamy cheese foam.',
    price: 28,
    categoryCode: 'cheese',
    image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=900&q=82',
    isNew: true,
    isHot: true,
    stock: 999,
    sortOrder: 10
  },
  {
    name: '多肉葡萄',
    nameEn: 'Juicy Grape',
    description: '满杯葡萄果肉和清爽茶底，每一口都有果香。',
    descriptionEn: 'Grape pulp with refreshing tea, bright and juicy.',
    price: 26,
    categoryCode: 'fruit',
    image: 'https://images.unsplash.com/photo-1558857563-b371033873b8?auto=format&fit=crop&w=900&q=82',
    isNew: false,
    isHot: true,
    stock: 999,
    sortOrder: 20
  },
  {
    name: '金凤茶王',
    nameEn: 'Golden Phoenix Tea',
    description: '经典纯茶系列，原叶茶香干净持久。',
    descriptionEn: 'Classic pure tea with clean and lasting aroma.',
    price: 16,
    categoryCode: 'tea',
    image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=900&q=82',
    isNew: false,
    isHot: false,
    stock: 999,
    sortOrder: 30
  },
  {
    name: '芝芝桃桃',
    nameEn: 'Cheese Peach',
    description: '水蜜桃果香与芝士奶盖结合，甜润不腻。',
    descriptionEn: 'Peach aroma meets cheese foam for a soft sweet sip.',
    price: 29,
    categoryCode: 'cheese',
    image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=900&q=82',
    isNew: false,
    isHot: true,
    stock: 999,
    sortOrder: 40
  },
  {
    name: '生打椰椰',
    nameEn: 'Fresh Coconut',
    description: '椰子水与椰肉融合，清爽适合夏天。',
    descriptionEn: 'Coconut water and coconut meat, fresh for summer.',
    price: 25,
    categoryCode: 'fruit',
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=900&q=82',
    isNew: true,
    isHot: false,
    stock: 999,
    sortOrder: 50
  },
  {
    name: '厚芋泥波波茶',
    nameEn: 'Taro Boba Tea',
    description: '浓郁芋泥配弹牙波波，口感绵密扎实。',
    descriptionEn: 'Rich taro with boba pearls and a creamy texture.',
    price: 27,
    categoryCode: 'tea',
    image: 'https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?auto=format&fit=crop&w=900&q=82',
    isNew: false,
    isHot: true,
    stock: 999,
    sortOrder: 60
  },
  {
    name: '生椰拿铁',
    nameEn: 'Coconut Latte',
    description: '咖啡香与椰香平衡，入口顺滑。',
    descriptionEn: 'Coffee and coconut balance in a smooth latte.',
    price: 24,
    categoryCode: 'coffee',
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=82',
    isNew: false,
    isHot: false,
    stock: 999,
    sortOrder: 70
  },
  {
    name: '冰淇淋红茶',
    nameEn: 'Ice Cream Black Tea',
    description: '红茶搭配香草冰淇淋，甜感轻盈。',
    descriptionEn: 'Black tea with vanilla ice cream, light and sweet.',
    price: 22,
    categoryCode: 'ice',
    image: 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?auto=format&fit=crop&w=900&q=82',
    isNew: false,
    isHot: false,
    stock: 999,
    sortOrder: 80
  }
])
