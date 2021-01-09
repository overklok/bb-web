import Router, {route, Route} from "../Router";
import ModelService from "../../services/ModelService";
import Presenter from "../Presenter";
import Model from "../model/Model";
import Datasource from "../model/Datasource";

describe('Router', () => {
    const show_album_photo_mock = jest.fn();
    const list_albums_mock = jest.fn();
    const direct_mock = jest.fn();
    const call_mock = jest.fn();

    const model_svc = new ModelService();
    let router: FooRouter = undefined;

    class FooRouter extends Router<string> {
        routes: Route<string>[] = [
            // simple routes
            {pathexp: '/books',                     destination: 'booklist', name: 'book-list'},
            {pathexp: '/books/{str}',               destination: 'bookview', name: 'book-view'},
            {pathexp: '/books/{str}/pages',         destination: 'pagelist', name: 'page-list'},
            {pathexp: '/books/{str}/pages/{int}',   destination: 'pageview', name: 'page-view'},

            // regexp route
            {pathexp: /regexroute/g,                destination: 'regexroute', name: 'regex-route'},
            // duplicated routes
            {pathexp: '/books',                     destination: 'booklist-alt', name: 'book-list-alt'},
        ];

        protected direct(destination: string, params?: (number|string)[]) {
            direct_mock(destination, params);
        }

        public callModelMethod() {
            return this.getModel(FooModel).callMockFunction();
        }

        @route('/albums', 'album-list')
        public listAlbums() {
            list_albums_mock();
        }

        @route('/albums/{str}', 'album-view')
        public showAlbum(album_slug: string) {

        }

        @route('/albums/{str}/photos/{int}', 'photo-view')
        public showAlbumPhoto(album_slug: string, photo_id: number) {
            show_album_photo_mock(album_slug, photo_id);
        }
    }

    class FooModel extends Model<{}, Datasource> {
        protected defaultState: {};

        public callMockFunction() {
            call_mock();
        }
    }

    beforeEach(() => {
        model_svc.register(FooModel, new class extends Datasource {});
        call_mock.mockClear();
        direct_mock.mockClear();

        router = new FooRouter(model_svc, null);
        router.launch();
    });

    describe('resolve', () => {
        it('should resolve static routes', () => {
            const [route, params] = router.resolve('/books');

            expect(route.destination).toBe('booklist');

            expect(params).toHaveLength(0);
        });

        it('should resolve dynamic routes', () => {
            const [route, params] = router.resolve('/books/lolita');

            expect(route.destination).toBe('bookview');

            expect(params).toEqual(['lolita']);
        });

        it('should resolve dynamic routes with parameter in the middle of the path', () => {
            const [route, params] = router.resolve('/books/lolita/pages');

            expect(route.destination).toBe('pagelist');

            expect(params).toEqual(['lolita']);
        });

        it('should resolve dynamic routes with multiple parameters', () => {
            const [route, params] = router.resolve('/books/lolita/pages/42');

            expect(route.destination).toBe('pageview');

            expect(params).toEqual(['lolita', 42]);
        });

        it('should not resolve non-existent routes', () => {
            const result = router.resolve('/nonexistent');

            expect(result).toBeNull();
        });

        it('should resolve method routes', () => {
            const [route, params] = router.resolve('/albums');

            expect(route.method_name).toEqual('listAlbums');
        });
    });

    describe('reverse', () => {
        it('should reverse static routes', () => {
            const path = router.reverse('book-list');

            expect(path).toEqual('/books');
        });

        it('should reverse dynamic routes', () => {
            const path = router.reverse('book-view', ['despair']);

            expect(path).toEqual('/books/despair');
        });

        it('should reverse dynamic routes with multiple parameters', () => {
            const path = router.reverse('page-view', ['the-gift', 112]);

            expect(path).toEqual('/books/the-gift/pages/112');
        });

        it('should throw an error for dynamic routes when a number of provided parameters is insufficient', () => {
            const fn = () => {
                router.reverse('page-view', ['pnin']);
            };

            expect(fn).toThrowError();
        });

        it('should throw an error for regexp routes', () => {
            const fn = () => {
                router.reverse('regex-route');
            };

            expect(fn).toThrowError();
        });

        it('should throw an error for non-existent routes', () => {
            const fn = () => {
                router.reverse('nonexistent');
            };

            expect(fn).toThrowError();
        });
    });

    describe('redirect', () => {
        it('should direct to correct destination', () => {
            router.redirect('/books');

            expect(direct_mock).toBeCalledWith('booklist', []);
        });

        it('should direct to correct destination and parameters', () => {
            router.redirect('/books/pnin/pages/42');

            expect(direct_mock).toBeCalledWith('pageview', ['pnin', 42]);
        });

        it('should call method to method routes', () => {
            router.redirect('/albums');

            expect(list_albums_mock).toBeCalledTimes(1);
        });

        it('should pass parameters to method routes', () => {
            router.redirect('/albums/foo/photos/34');

            expect(show_album_photo_mock).toBeCalledWith('foo', 34);
        });

        it('should return nothing if path cannot be resolved', async () => {
            const result = await router.redirect('/nonexistent/path');

            expect(result).toBeUndefined();
        });
    });

    // Configuration

    it('should throw an error if any route has invalid type literal in the path', () => {
        class InvalidRouter extends Router<string> {
            routes: Route<string>[] = [
                // simple routes
                {pathexp: '/books/{invalid}', destination: 'bl', name: 'bl'},
            ];

            protected direct(destination: string): void {}
        }

        const router = new InvalidRouter(model_svc, null);

        expect(router.launch).toThrowError();
    });

    it('should throw an error if a method route has not enough arguments in path', () => {
        class InvalidRouter extends Router<string> {
            routes: Route<string>[] = [];

            protected direct(destination: string): void {}

            @route('/path/with/{int}/argument', 'invalid-path')
            public methodWithTwoArguments(arg_1: any, arg_2: any) {}
        }

        const router = new InvalidRouter(model_svc, null);

        expect(router.launch).toThrowError();
    });

    // TODO: Functional routes

    // TODO: Promises

    // working with Models

    it('can extract a Model instance from repository and call its method', () => {
        router.callModelMethod();

        expect(call_mock).toBeCalledTimes(1);
    });
});