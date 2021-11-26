/**
 * An implementation of a mechanism (protocol) for interacting with some kind of data source 
 * 
 * This is the root class for all data resource types that may be presented in the system.
 * Isolates low-level data collection and distribution logic.
 * 
 * @category Core
 * @subcategory Model
 */
export default abstract class Datasource {

}

/**
 * A mediator inside the {@link Datasource} that modifies data passed to the source
 * in some specific way that the response takes required effect
 * 
 * This is the root class for middleware that can be applied to data resources.
 * It is arbitrary at this level but its usage should be kept inside the scope of {@link Datasource} inheritors.
 * 
 * TODO: Make Middleware related to Datasource via generics
 *
 * @category Core
 * @subcategory Model
 */
export abstract class Middleware {

}