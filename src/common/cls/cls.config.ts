import { ClsModuleOptions } from 'nestjs-cls';

export const CLS_STORE_KEY = 'storeId';
export const CLS_USER_KEY = 'userId';
export const CLS_ROLE_KEY = 'role';

export const clsModuleConfig: ClsModuleOptions = {
  global: true,
  middleware: {
    mount: true,
  },
};
