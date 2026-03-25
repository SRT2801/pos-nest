export enum Permission {

  CREATE_PRODUCT = 'create_product',
  EDIT_PRODUCT = 'edit_product',
  DELETE_PRODUCT = 'delete_product',


  CREATE_CATEGORY = 'create_category',
  EDIT_CATEGORY = 'edit_category',
  DELETE_CATEGORY = 'delete_category',


  VIEW_COUPONS = 'view_coupons',
  CREATE_COUPON = 'create_coupon',
  EDIT_COUPON = 'edit_coupon',
  DELETE_COUPON = 'delete_coupon',


  DELETE_TRANSACTION = 'delete_transaction',


  UPLOAD_IMAGE = 'upload_image',
}

export const ADMIN_DEFAULT_PERMISSIONS: Permission[] =
  Object.values(Permission);
