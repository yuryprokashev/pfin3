describe('Personal Finance Input Form.', function() {

    //this.timeout(5000);

    var injector;
    var element;
    var scope;
    var intercepts;
    var httpBackend;
    var succeeded = 0;

    beforeEach(function () {
        injector = angular.injector(['personalFinance.components', 'ngMockE2E']);
        intercepts = {};

        injector.invoke(function ($rootScope, $compile, $httpBackend) {
            scope = $rootScope.$new();

            $httpBackend.whenGET(/.*\/templates\/.*/i).passThrough();
            httpBackend = $httpBackend;

            element = $compile('<expense-input-form></expense-input-form>')(scope);
            form = scope.form;
            scope.$apply();
        });
    });

    it('Once loaded, it displays date field with today date.', function (done) {

        scope.$on('ExpenseInputFormCtrl', function () {
            try {
                // Tests go here since we need to wait template to finish loading.

                //console.log(element);
                var e = element.find("#date-input");
                //console.log(e.val());
                assert.equal(e.val().month, new Date().month, 'input value month must = today month');
                assert.equal(e.val().year, new Date().year, 'input value year must = today year');
                assert.equal(e.val().date, new Date().date, 'input value date must = today date');
                succeeded ++;
                done();
            }
            catch (err) {
                console.log(err);
            }

        });
    });

    it('Once loaded, default selected currency is RUB', function (done) {

        scope.$on( 'ExpenseInputFormCtrl', function () {
            try {
                var e = element.find('#currency-option-1');
                //console.log(e.attr('class'));
                assert.equal(e.attr('class'), 'btn fa fa-rub btn-primary', 'default selected currency is not RUB');
                succeeded++;
                done();
            }
            catch (err) {
                console.log(err);
            }
        });

    });

    it( 'Once lodaded, default amount is undefined', function(done) {
        scope.$on( 'ExpenseInputFormCtrl', function() {
            try {
                var e = element.find('#amount-input');
                assert.equal(e.val(), undefined, 'default amount is not zero');
                succeeded++;
                done();
            }
            catch (err) {
                console.log(err);
            }
        })

    });

    it( 'Once loaded, it has category id set to 1', function (done) {
        try {
            $scope.$on('ExpenseInputCtrl', function () {
                var e = element.find('#category-input');
                assert.equal(e.val(), 1, 'default category is food (_id = 1) ');
                succeeded++;
                done();
            })
        }
        catch ( err) { console.log(err); }
    });

    // TODO write test for two digits in amount input field

    it( 'Has two digits allowed in the amount input field', function(done){
        scope.$on( 'ExpenseInputFormCtrl', function () {
            try {
                //console.log(scope);
                succeeded++;
                done();
            }
            catch (err) {
                console.log(err);
            }

        })
    });

});
    //
    //it('makes an HTTP request to `/api/v1/product/text/test` and exposes results to scope', function(done) {
    //    httpBackend.expectGET('/api/v1/product/text/test').respond({
    //        products: [{ name: 'test1' }, { name: 'test2' }]
    //    });
    //
    //    scope.$on('SearchBarController', function() {
    //        element.find('input').val('test');
    //        element.find('input').trigger('input');
    //        assert.equal(scope.searchText, 'test');
    //
    //        httpBackend.flush();
    //        assert.equal(scope.results.length, 2);
    //        assert.equal(scope.results[0].name, 'test1');
    //        assert.equal(scope.results[1].name, 'test2');
    //
    //        ++succeeded;
    //        done();
    //    });
    //});
    //
    //it('displays autocomplete results in HTML', function(done) {
    //    httpBackend.expectGET('/api/v1/product/text/test').respond({
    //        products: [{ name: 'test1' }, { name: 'test2' }]
    //    });
    //
    //    scope.$on('SearchBarController', function() {
    //        element.find('input').val('test');
    //        element.find('input').trigger('input');
    //        assert.equal(scope.searchText, 'test');
    //
    //        httpBackend.flush();
    //
    //        assert.equal(element.find('.autocomplete-result').length, 2);
    //        assert.equal(element.find('.autocomplete-result').eq(0).text().trim(), 'test1');
    //        assert.equal(element.find('.autocomplete-result').eq(1).text().trim(), 'test2');
    //
    //        ++succeeded;
    //        done();
    //    });
    //});