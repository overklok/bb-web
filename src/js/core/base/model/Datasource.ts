/**
 * Root class for all data resource types that may be presented in the system.
 * They isolate low-level data collection and distribution logic.
 * 
 * @category Core
 * @subcategory Model
 */
export default abstract class Datasource {

}

/**
 * Root class for middleware that can be applied to data resources.
 * It is arbitrary at this level but its field of usage should be kept inside the scope of Datasource inheritors.
 *
 * TODO: Make Middleware related to Datasource via generics
 * 
 * @category Core
 * @subcategory Model
 */
export abstract class Middleware {

}