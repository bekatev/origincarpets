/** Admin dashboard strings (EN / GEO). */
export const adminTranslations = {
  en: {
    admin: {
      title: 'Admin',
      subtitle: 'Manage orders, customers, categories, and products.',
      backToShop: 'Back to shop',
      loading: 'Loading dashboard…',
      loadFailed: 'Failed to load admin data',
      tabs: {
        overview: 'Overview',
        orders: 'Orders',
        customers: 'Customers',
        categories: 'Categories',
        products: 'Products'
      },
      metrics: {
        orders: 'Orders',
        revenue: 'Revenue',
        products: 'Products',
        customers: 'Customers'
      },
      sync: {
        sync: 'Sync catalog',
        full: 'Full reimport',
        success: 'Origin Carpets {mode} completed: imported {imported}, skipped {skipped}, total {total}.',
        failed: 'Failed to sync Origin Carpets products'
      },
      orders: {
        title: 'Order management',
        empty: 'No orders yet.',
        items: '{count} item(s)',
        statusUpdated: 'Order status updated to {status}',
        updateFailed: 'Failed to update order status',
        status: {
          PENDING: 'Pending',
          PAID: 'Paid',
          SHIPPED: 'Shipped',
          DELIVERED: 'Delivered',
          CANCELLED: 'Cancelled',
          CONFIRMED: 'Confirmed',
          FULFILLED: 'Fulfilled',
          REFUNDED: 'Refunded'
        }
      },
      customers: {
        title: 'Customers',
        empty: 'No customers yet.',
        unnamed: 'Unnamed',
        orders: 'Orders',
        spent: 'Spent'
      },
      categories: {
        title: 'Categories',
        create: 'New category',
        name: 'Name',
        slug: 'Slug',
        description: 'Description',
        add: 'Add category',
        delete: 'Delete',
        deleteConfirm: 'Delete this category?',
        created: 'Category created',
        deleted: 'Category deleted',
        createFailed: 'Failed to create category',
        deleteFailed: 'Failed to delete category',
        empty: 'No categories yet.'
      },
      products: {
        title: 'Products',
        create: 'New product',
        edit: 'Edit product',
        existing: 'Catalog',
        empty: 'No products yet.',
        titleLabel: 'Title',
        slug: 'Slug',
        sku: 'SKU',
        description: 'Description',
        price: 'Price (USD)',
        category: 'Category',
        selectCategory: 'Select category',
        size: 'Size',
        color: 'Color',
        material: 'Material',
        active: 'Active on storefront',
        uploadImage: 'Upload image',
        imageUrls: 'Image URLs (one per line)',
        createBtn: 'Create product',
        saveBtn: 'Save changes',
        cancelEdit: 'Cancel edit',
        editBtn: 'Edit',
        deleteBtn: 'Delete',
        deleteConfirm: 'Delete this product?',
        created: 'Product created',
        updated: 'Product updated',
        deleted: 'Product deleted',
        saveFailed: 'Failed to save product',
        deleteFailed: 'Failed to delete product',
        uploadSuccess: 'Image uploaded',
        uploadFailed: 'Image upload failed',
        inactive: 'Hidden'
      }
    }
  },
  ka: {
    admin: {
      title: 'ადმინისტრაცია',
      subtitle: 'შეკვეთების, მომხმარებლების, კატეგორიებისა და პროდუქტების მართვა.',
      backToShop: 'მაღაზიაში დაბრუნება',
      loading: 'პანელის ჩატვირთვა…',
      loadFailed: 'ადმინ პანელის ჩატვირთვა ვერ მოხერხდა',
      tabs: {
        overview: 'მიმოხილვა',
        orders: 'შეკვეთები',
        customers: 'მომხმარებლები',
        categories: 'კატეგორიები',
        products: 'პროდუქტები'
      },
      metrics: {
        orders: 'შეკვეთები',
        revenue: 'შემოსავალი',
        products: 'პროდუქტები',
        customers: 'მომხმარებლები'
      },
      sync: {
        sync: 'კატალოგის სინქრონიზაცია',
        full: 'სრული რეიმპორტი',
        success:
          'Origin Carpets {mode} დასრულდა: იმპორტირებული {imported}, გამოტოვებული {skipped}, სულ {total}.',
        failed: 'Origin Carpets პროდუქტების სინქრონიზაცია ვერ მოხერხდა'
      },
      orders: {
        title: 'შეკვეთების მართვა',
        empty: 'შეკვეთები ჯერ არ არის.',
        items: '{count} ნივთი',
        statusUpdated: 'შეკვეთის სტატუსი განახლდა: {status}',
        updateFailed: 'სტატუსის განახლება ვერ მოხერხდა',
        status: {
          PENDING: 'მოლოდინში',
          PAID: 'გადახდილი',
          SHIPPED: 'გაგზავნილი',
          DELIVERED: 'მიწოდებული',
          CANCELLED: 'გაუქმებული',
          CONFIRMED: 'დადასტურებული',
          FULFILLED: 'შესრულებული',
          REFUNDED: 'დაბრუნებული'
        }
      },
      customers: {
        title: 'მომხმარებლები',
        empty: 'მომხმარებლები ჯერ არ არის.',
        unnamed: 'უსახელო',
        orders: 'შეკვეთები',
        spent: 'დახარჯული'
      },
      categories: {
        title: 'კატეგორიები',
        create: 'ახალი კატეგორია',
        name: 'სახელი',
        slug: 'სლაგი',
        description: 'აღწერა',
        add: 'კატეგორიის დამატება',
        delete: 'წაშლა',
        deleteConfirm: 'წავშალოთ ეს კატეგორია?',
        created: 'კატეგორია შეიქმნა',
        deleted: 'კატეგორია წაიშალა',
        createFailed: 'კატეგორიის შექმნა ვერ მოხერხდა',
        deleteFailed: 'კატეგორიის წაშლა ვერ მოხერხდა',
        empty: 'კატეგორიები ჯერ არ არის.'
      },
      products: {
        title: 'პროდუქტები',
        create: 'ახალი პროდუქტი',
        edit: 'პროდუქტის რედაქტირება',
        existing: 'კატალოგი',
        empty: 'პროდუქტები ჯერ არ არის.',
        titleLabel: 'სათაური',
        slug: 'სლაგი',
        sku: 'SKU',
        description: 'აღწერა',
        price: 'ფასი (USD)',
        category: 'კატეგორია',
        selectCategory: 'აირჩიეთ კატეგორია',
        size: 'ზომა',
        color: 'ფერი',
        material: 'მასალა',
        active: 'აქტიურია მაღაზიაში',
        uploadImage: 'სურათის ატვირთვა',
        imageUrls: 'სურათის URL-ები (თითო ხაზზე ერთი)',
        createBtn: 'პროდუქტის შექმნა',
        saveBtn: 'შენახვა',
        cancelEdit: 'გაუქმება',
        editBtn: 'რედაქტირება',
        deleteBtn: 'წაშლა',
        deleteConfirm: 'წავშალოთ ეს პროდუქტი?',
        created: 'პროდუქტი შეიქმნა',
        updated: 'პროდუქტი განახლდა',
        deleted: 'პროდუქტი წაიშალა',
        saveFailed: 'პროდუქტის შენახვა ვერ მოხერხდა',
        deleteFailed: 'პროდუქტის წაშლა ვერ მოხერხდა',
        uploadSuccess: 'სურათი აიტვირთა',
        uploadFailed: 'სურათის ატვირთვა ვერ მოხერხდა',
        inactive: 'დამალული'
      }
    }
  }
} as const;
