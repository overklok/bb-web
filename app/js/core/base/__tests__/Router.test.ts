import Router, {Route} from "../Router";

describe('Router', () => {
    class FooRouter extends Router<string> {
        routes: Route<string>[] = [

        ];

        protected direct(destination: string): void {}

        launch(): void {}
    }
});