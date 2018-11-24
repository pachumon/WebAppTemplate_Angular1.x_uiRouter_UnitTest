//*NOTE: All response from API Call will contain the following structure
/*


 {
 "status": "success",=====> will contain either 'success' or 'failure'
 "code": 200,======> status code Ex:404,500,200
 "data": {},====>>requested data
 "error": ""====>>if any errors
 }


 */

/*Service Factory for API Calls*/
var appservice = angular.module('Appservice', ['ngResource']);

appservice.factory('products', ['$resource', function ($resource) {
    return $resource('http://localhost:3000/products', null,
        {
            'query': { method: 'GET', isArray: false }
        })
}]);

appservice.factory('productRepository', ['$resource', function ($resource) {
    return $resource('http://localhost:3000/product/:id', { id: '@id' },
        {
            'update': { method: 'PUT' }
        });
}]);

/*

 create a service module using factory and 'ngResource' as dependency.

 This Service Should contain the configuration objects for the following APIs.

 1.To create a book
 =======================
 url:http://localhost:3000/book
 method:POST
 input data format:{name:'', description:'', price:'', category:''}

 2.To update a book
 =======================
 url:http://localhost:3000/book/id
 method:PUT
 input data format:{name:'', description:'', price:'', category:''}
 note:Here id is the id of book.

 3.To remove a book
 ========================
 url:http://localhost:3000/book/id
 method:DELETE
 note:Here id is the id of book.

 */

/*End of Service Factory*/

/*Create Angular Module*/

/*
 create a angular module in the name of 'Capstone' and put 'ui.router' as first dependency
 and the Service you have created above as a second dependency.
 */
var app = angular.module('Capstone', ['ui.router', 'Appservice', 'ngMessages']);

/*End Of Module Creation*/

/*App Route Config*/
app.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
    $stateProvider
        .state('booklist', {
            url: '/booklist',
            templateUrl: '../../pages/list.html',
            controller: 'booklistController',
            controllerAs: 'vm'
        }).state('bookActions', {
            url: '/bookActions/:action/:id',
            templateUrl: '../../pages/book.html',
            controller: 'bookCreateController',
            controllerAs: 'vm'
        });

    $urlRouterProvider.otherwise('booklistController');

}])
/*
 create following states here for Capstone for navigation.using the state provider.
 
 1.book List
 ================
 *use the page public/pages/list.html
 *define your own controller for this state.
 
 2.book creation
 ===================
 *use the page public/pages/book.html
 *define your own controller for this state.
 
 
 3.book update
 =================
 *use the page public/pages/book.html
 *define your own controller for this state.
 
 use the Url route provider to set the default opening page.
 */


/*End of Route Config*/


app.controller('booklistController', booklistController);

booklistController.$inject = ['products', 'productRepository', '$timeout'];
function booklistController(products, productRepository, $timeout) {
    var vm = this;
    vm.categories = [];
    vm.products = [];
    vm.allProducts = []
    vm.itemDeleted = false;
    vm.alertMessage = '';
    init();
    
    function init() {
        products.query().$promise.then(function (reponse) {
            
            vm.products = reponse.data;
            if (vm.products.length > 0) {
                vm.allProducts = vm.products;
                vm.categories = _.uniq(_.map(vm.products, 'category'));
            }
        }).catch(function (error) {
            console.log('error');
        });
    }
    vm.removeProduct = function (productId) {
        debugger;
        productRepository.delete({ id: productId }).$promise.then(function (response) {
            debugger;
            if (response.status === 'success') {
                init();
                vm.alertMessage = 'Successfully Removed';
                vm.itemDeleted = 'true';
            }
            else {
                vm.alertMessage = 'Removal Failure';
            }
        })
            .catch(function (error) {
                vm.alertMessage = 'Removal Failure';
            })
        vm.resetAlert();
    }

    vm.applyCategoryFilter = function (category) {
        if (category !== undefined && category !== '') {
            vm.products = _.filter(vm.allProducts, { 'category': category });
        }
        else {
            vm.products = vm.allProducts;
        }
    }

    vm.resetAlert = function () {
        $timeout(function () {
            vm.alertMessage = '';
        }, 3000);
    }

}




app.directive("dialogForm", ['$timeout', function ($timeout) {
    return {
        restrict: "A",
        link: function (scope, element, attrs) {

            element.bind('click', function () {

                $("#removeItem").unbind();
                $('#currentItem').val(element.attr('id'));
                $('#myModal').modal('show');

                $("#removeItem").bind('click', function (e) {
                    $('#myModal').modal('hide');
                    var productId = $('#currentItem').val();
                    $timeout(function () {
                        scope.$parent.vm.removeProduct(productId);
                    }, 100);

                });
            });

        }
    };
}]);

/*Book List Controller
 ==============================
 

 1.write your code to get list of Books using http provider in angularJs.

 URL: url:http://localhost:3000/Books
 method:GET

 2.after getting the list of Books, iterate the html elements to show all the Books as shown in requirement Document and
 iterate the Book list and get the unique category list.

 using this unique category list, display the categories in category filter section as shown in requirement Document .
 add "All Categories" as default in category filer section.

 3.write a function to filter the Books when a category is clicked in category filter section
 when "All categories" Clicked, show All Books.

 4.when edit button clicked, app should go to Book edit state.write a function to do that.

 5.when remove button clicked, a bootstrap modal should open to confirm the removal. upon confirmation,
 Book should be removed from the database. an alert message should be shown in green/Red upon successful/unsuccessful removal

 this alert messages should be hidden in 3 seconds. use timeout provider in angularJs for that.

 use the configured service object to make API call for removal.


 * */

/*End of Book List Controller*/
app.controller('bookCreateController', bookCreateController);

bookCreateController.$inject = ['productRepository', '$stateParams', '$state', '$timeout'];
function bookCreateController(productRepository, $stateParams, $state, $timeout) {
    vm = this;

    vm.productFormMode = $stateParams.action;
    vm.productId = $stateParams.id;
    vm.formTitle = ''
    vm.book = {
        _id: 0,
        price: '',
        description: '',
        category: '',
        name: ''
    };
    vm.alertMessage = '';
    vm.productchanged = false;



    if (vm.productFormMode === 'edit') {
        vm.formTitle = 'Update Product';
        productRepository.get({ id: vm.productId }).$promise.then(function (response) {
            vm.book = _.merge(vm.book, response.data);
        });

    }
    else {
        vm.formTitle = 'Add Product';
    }

    vm.reset = function () {
        $state.reload();
    }

    vm.formsubmit = function () {
        console.log(vm.book);
        if (vm.productFormMode === 'edit') {
            productRepository.update({ id: vm.book._id }, vm.book).$promise.then(function (response) {
                vm.alertMessage = 'Successfully updated Product';
                vm.productchanged = true;
            })
                .catch(function () {
                    vm.alertMessage = 'Failure updating Product';
                });
        }
        else if (vm.productFormMode === 'create') {
            productRepository.save(vm.book).$promise.then(function (response) {
                vm.alertMessage = 'Successfully created Product';
                vm.productchanged = true;
            })
                .catch(function () {
                    vm.alertMessage = 'Failure creating Product';
                });;
        }
        vm.resetAlert();
    };

    vm.resetAlert = function () {
        $timeout(function () {
            vm.alertMessage = '';
        }, 3000);
    }

};
/*Book Create Controller
 ================================
 1. write a function to save the Book.
 call this function when submit button in Book page clicked.

 an alert message should be shown in green/Red upon successful/unsuccessful creation of Book

 after successful creation of Book, app should navigate to list page(Book list state)
 use the configured service object to make API call for Creating Book.

 2.write a function to remove the form values in the Book page.
 call this function when cancel button in Book page clicked.

 * */


/*End of Book Create Controller*/

/*Book edit Controller
 ================================

 1.populate the details of the Book which is going to be updated into form using 2 way binding.

 2. write a function to update the Book.
 call this function when submit button in Book page clicked.

 an alert message should be shown in green/Red upon successful/unsuccessful update of Book

 after successful update of Book, app should navigate to list page(Book list state)

 3.write a function to remove the form values in the Book page.
 call this function when cancel button in Book page clicked.

 * */
/*End of Book edit Controller*/