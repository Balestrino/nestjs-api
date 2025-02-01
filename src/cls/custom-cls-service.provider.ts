import { ClsService } from 'nestjs-cls';
import { ICustomClsServiceStore } from './custom-cls-service-store.interface';

/**
 * Use only as a class provider and as a type, do NOT use a real service
 * @see https://papooch.github.io/nestjs-cls/features-and-use-cases/type-safety-and-type-inference#using-a-custom-provider
 */
export class CustomClsServiceProvider extends ClsService<ICustomClsServiceStore> {}
