import Application from "../Application";

export default interface IConstructable {
     new (app: Application): any;
}