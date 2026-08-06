import mongoose from 'mongoose'
import {
  TEA_DEMO_CATEGORIES,
  TEA_DEMO_DEFAULT_PRODUCT_SPECS,
  TEA_DEMO_PRODUCT_CATEGORY_CODES,
  TEA_DEMO_PRODUCT_STATUS
} from '#modules/teaDemo/constants/teaDemo.constants.js'

const categoryMap = new Map(TEA_DEMO_CATEGORIES.map((category) => [category.code, category]))

const sizeSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    nameEn: { type: String, default: '', trim: true },
    extraPrice: { type: Number, default: 0 }
  },
  { _id: false }
)

const sweetnessSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    nameEn: { type: String, default: '', trim: true }
  },
  { _id: false }
)

const toppingSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    nameEn: { type: String, default: '', trim: true },
    price: { type: Number, default: 0 }
  },
  { _id: false }
)

const productSpecsSchema = new mongoose.Schema(
  {
    sizes: { type: [sizeSchema], default: () => structuredClone(TEA_DEMO_DEFAULT_PRODUCT_SPECS.sizes) },
    sweetness: { type: [sweetnessSchema], default: () => structuredClone(TEA_DEMO_DEFAULT_PRODUCT_SPECS.sweetness) },
    toppings: { type: [toppingSchema], default: () => structuredClone(TEA_DEMO_DEFAULT_PRODUCT_SPECS.toppings) }
  },
  { _id: false }
)

const teaDemoProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80
    },
    nameEn: {
      type: String,
      default: '',
      trim: true,
      maxlength: 120
    },
    description: {
      type: String,
      default: '',
      trim: true,
      maxlength: 300
    },
    descriptionEn: {
      type: String,
      default: '',
      trim: true,
      maxlength: 300
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    categoryCode: {
      type: String,
      required: true,
      enum: TEA_DEMO_PRODUCT_CATEGORY_CODES,
      trim: true
    },
    image: {
      type: String,
      default: '/images/logo.webp',
      trim: true
    },
    imageUrl: {
      type: String,
      default: '',
      trim: true
    },
    bannerImages: {
      type: [String],
      default: []
    },
    isNew: {
      type: Boolean,
      default: false
    },
    isHot: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      enum: Object.values(TEA_DEMO_PRODUCT_STATUS),
      default: TEA_DEMO_PRODUCT_STATUS.ON_SALE
    },
    stock: {
      type: Number,
      default: 999,
      min: 0
    },
    sortOrder: {
      type: Number,
      default: 0
    },
    specs: {
      type: productSpecsSchema,
      default: () => structuredClone(TEA_DEMO_DEFAULT_PRODUCT_SPECS)
    }
  },
  {
    timestamps: true,
    suppressReservedKeysWarning: true
  }
)

teaDemoProductSchema.index({ categoryCode: 1, status: 1, sortOrder: 1 })
teaDemoProductSchema.index({ name: 1 })

function resolveCategory(product) {
  const category = categoryMap.get(product.categoryCode)
  return {
    category: product.categoryCode,
    categoryCode: product.categoryCode,
    categoryName: category?.name || product.categoryCode,
    categoryNameEn: category?.nameEn || product.categoryCode
  }
}

function commonProductJSON(product) {
  const image = product.image || product.imageUrl || '/images/logo.webp'
  const imageUrl = product.imageUrl || image

  return {
    id: product._id.toString(),
    name: product.name,
    nameEn: product.nameEn || product.name,
    desc: product.description,
    descEn: product.descriptionEn || product.description,
    description: product.description,
    descriptionEn: product.descriptionEn || product.description,
    price: product.price,
    ...resolveCategory(product),
    image,
    imageUrl,
    isNew: !!product.isNew,
    isHot: !!product.isHot,
    status: product.status,
    stock: product.stock,
    sort: product.sortOrder,
    sortOrder: product.sortOrder
  }
}

teaDemoProductSchema.methods.toListJSON = function toListJSON() {
  return commonProductJSON(this)
}

teaDemoProductSchema.methods.toDetailJSON = function toDetailJSON() {
  return {
    ...commonProductJSON(this),
    bannerImages: this.bannerImages?.length ? this.bannerImages : [this.image || this.imageUrl || '/images/logo.webp'],
    specs: this.specs || structuredClone(TEA_DEMO_DEFAULT_PRODUCT_SPECS),
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  }
}

export const TeaDemoProduct = mongoose.model('TeaDemoProduct', teaDemoProductSchema, 'tea_demo_products')
