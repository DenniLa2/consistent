// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic'])

  .run(function ($ionicPlatform) {
    $ionicPlatform.ready(function () {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      if (window.cordova && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      }
      if (window.StatusBar) {
        StatusBar.styleDefault();
      }
    });
  })

// ! >> Consistent Controller >>----------------------------->
  .controller('ConsCtrl', function ($scope, $timeout, $q, SQ) {

    $scope.runTest = function () {
      console.log('i am test');
      var foo = function (el) {
        var deferred = $q.defer();

        $timeout(function () {
          console.log('arr = ' + el.arr + ', el.num = ' + el.num + ', to = ' + el.to);
          if (el.to === 0) {
            deferred.resolve({state: 'error'});
          } else {
            deferred.resolve({state: 'ok'});
          }

        }, el.to);

        return deferred.promise;
      };

      var arr1 = [];
      arr1.push({arr: 1, num: 1, to: 1000});
      arr1.push({arr: 1, num: 2, to: 4000});
      arr1.push({arr: 1, num: 3, to: 3000});
      arr1.push({arr: 1, num: 4, to: 1000});
      arr1.push({arr: 1, num: 5, to: 10});
      arr1.push({arr: 1, num: 6, to: 6000});
      arr1.push({arr: 1, num: 7, to: 1000});

      var arr2 = [];
      arr2.push({arr: 2, num: 1, to: 1000});
      arr2.push({arr: 2, num: 2, to: 4000});
      arr2.push({arr: 2, num: 3, to: 3000});
      arr2.push({arr: 2, num: 4, to: 1000});
      arr2.push({arr: 2, num: 5, to: 2000});
      arr2.push({arr: 2, num: 6, to: 6000});
      arr2.push({arr: 2, num: 7, to: 1000});

      SQ.serialStarter(foo, arr1, {flowCnt: 3, isStrict: true})
        .then(function (data) {
          console.debug('I am great serialisator!, data.state = ' + data.state);
        })
      ;


      //var ser2 = SequencingF.serialStarter(foo, arr2, {flowCnt: 2});

      /*
       $q.all([ser1, ser2])
       .then(function (data) {
       console.debug('I am greate serialisator!');
       })
       ;
       */
    };


  })

// >> Sequencing Factory >>
  .factory('SQ', function ($timeout, $q) {
    /**
     * за дубликатами следить во внешнем коде
     *
     * Запускает последовательные события в 1 и больше потоков
     * @param {function} fx - последовательная функция, которая должна вернуть обещание
     * @param {array} array - массив обектов,
     *    которые должны обработаться внутри последовательной функции
     * @param {object} options - принимает 2 переменных:
     * @param {number} options.flowCnt - количество потоков
     * @param {boolean} options.isStrict -
     *    если true - то очередь прерывается на ошибке
     *    и обработка происходит в 1 поток
     * */

    var serialStarter = function (fx, array, options) {
      var deferred = $q.defer();
      var proms = [];
      /** options = {flowCnt, isStrict} */

      options = options || {};
      var isStrict = options.isStrict || false;
      var flowCnt = options.flowCnt || 1;
      if (isStrict) {
        flowCnt = 1;
      } else if (flowCnt > array.length) {
        flowCnt = array.length;
      }

      for (var i = 0; i < flowCnt; i++) {
        proms.push(_serialManager(fx, array, isStrict))
      }

      $q.all(proms)
        .then(function (data) {
          //serialInProgress = false;
          deferred.resolve({state: 'finish'});
        });


      return deferred.promise;
    };

    var _serialManager = function (fx, array, isStrict) {
      var deferred = $q.defer();

      if (array.length > 0) {
        var element = array.pop();
        _SerialDoer(fx, element)
          .then(function (data) {
            if ((data.state === 'ok' && isStrict) || !isStrict) {
              return _serialManager(fx, array, isStrict);
            } else {
              return {state: 'error'}
            }
          })

          .then(function (data) {
            if (data.state === 'ok') {
              deferred.resolve({state: 'ok'});
            } else {
              deferred.resolve({state: 'error'});
            }
          });

      } else {
        deferred.resolve({state: 'finish'});
      }

      return deferred.promise;
    };
    var _SerialDoer = function (fx, element) {
      var deferred = $q.defer();

      fx(element)
        .then(function (data) {
          if (data.state === 'ok') {
            deferred.resolve({state: 'ok'});
          } else {
            deferred.resolve({state: 'error'});
          }
        });

      return deferred.promise;
    };

    /* >>=====> return SQ >>=====> */
    return {
      serialStarter: serialStarter
    }
  })
// << Sequencing Factory <<
;

