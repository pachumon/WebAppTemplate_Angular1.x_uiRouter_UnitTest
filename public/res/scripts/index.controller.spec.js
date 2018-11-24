//run below commands to setup karma and jasmine 
//npm install karma karma-jasmine jasmine-core karma-chrome-launcher --save-dev
//npm install -g karma-cli
//karma init (check karma.conf.js for karma conf file details)

// Be descriptive with titles here. The describe and it titles combined read like a sentence.
describe('booklistController', function () {
    var $controller;
    var productsdeferred, productRepositorydeferred;
    var booklistController, mockProducts, mockproductRepository;
    var productRepositorydeferred;

    beforeEach(module('ui.router'));
    beforeEach(module('Appservice'));
    beforeEach(module('Capstone'));

    beforeEach(inject(function (_$controller_, $q, productRepository) {
        $controller = _$controller_;
        productsdeferred = $q.defer();
        productRepositorydeferred = $q.defer();
        productRepositoryservice = productRepository;

        mockProducts = sinon.stub({
            query: function () { }
        });

        mockproductRepository = sinon.stub({
            delete: function () { }
        });
    }));

    var product = {
        _id: "5bf1c8786405c332e4dd477b",
        price: 14999,
        description: "Great",
        category: "Smart",
        name: "Moto G"
    }

    it('should be set to an Object', function () {
        booklistController = $controller('booklistController', {});
        expect(booklistController).toBeDefined();
    });

    it('should have products collection populated by products service', inject(function ($rootScope) {
        mockProducts.query.returns({ $promise: productsdeferred.promise });
        productsdeferred.resolve({ data: [product] });
        booklistController = $controller('booklistController', { products: mockProducts });
        $rootScope.$apply();
        expect(booklistController.allProducts.length).toEqual(1);
        expect(booklistController.categories.length).toEqual(1);
    }));

    //this test uses the inherent spy feature of a sinon stub 
    it('should modify the query method of products service invoked once for initial load', inject(function ($rootScope) {
        mockProducts.query.returns({ $promise: productsdeferred.promise });
        productsdeferred.resolve({ data: [product] });
        productRepositorydeferred.resolve({ status: 'success' });
        booklistController = $controller('booklistController', { products: mockProducts, productRepository: mockproductRepository });
        $rootScope.$apply();
        expect(mockProducts.query.calledOnce).toEqual(true);
    }));

    //this test uses a spy explicitly for testing if method was called same as above method but this one use httpBackend
    fit('should invoke product service delete method once', inject(function ($rootScope, _products_, $httpBackend) {
        var httpBackend = $httpBackend;
        httpBackend.whenGET('http:\/\/localhost:3000\/products').respond(200, []);
        var products = _products_;
        var productsMock = {
            query: sinon.spy(products, 'query')
        };
        booklistController = $controller('booklistController', { products: products });
        $rootScope.$apply();
        expect(productsMock.query.calledOnce).toEqual(true);
    }));

    it('should have products collection empty if products service returns error', inject(function ($rootScope) {
        mockProducts.query.returns({ $promise: productsdeferred.promise });
        productsdeferred.reject({});
        booklistController = $controller('booklistController', { products: mockProducts });
        $rootScope.$apply();
        expect(booklistController.allProducts.length).toEqual(0);
        expect(booklistController.categories.length).toEqual(0);
    }));



    describe('removeProduct method', function () {

        beforeEach(function () {
            mockProducts.query.returns({ $promise: productsdeferred.promise });
            mockproductRepository.delete.returns({ $promise: productRepositorydeferred.promise });
        });

        it('should be defined', inject(function ($rootScope) {
            productsdeferred.resolve({ data: [product] });
            productRepositorydeferred.resolve({ status: 'success' });
            booklistController = $controller('booklistController', { products: mockProducts, productRepository: mockproductRepository });
            $rootScope.$apply();
            expect(booklistController.removeProduct).toBeDefined();
        }));



        

    })

});