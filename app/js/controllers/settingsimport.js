(function () {
  'use strict';

  angular
    .module('ffxivCraftOptWeb.controllers')
    .controller('SettingsImportController', controller);

  function controller($scope, $window) {
    //noinspection AssignmentResultUsedJS
    var vm = $scope.vm = {};

    vm.generateFile = generateFile;
    vm.handleDrop = handleDrop;

    //////////////////////////////////////////////////////////////////////////

    function generateFile() {
      var zip = new JSZip();
      zip.file("settings.json", generateExportText());
      zip.generateAsync({type:"blob"})
        .then(function(content) {
          // see FileSaver.js
          saveAs(content, "settings.zip");
        });
    }

    function handleDrop(file) {
      JSZip.loadAsync(file.content)
        .then(function (zip) {
          var settingsJsonFile = zip.file('settings.json');
          if (!settingsJsonFile) {
            throw new Error('没有找到“settings.json”文件！');
          }
          settingsJsonFile.async('text')
            .then(function (text) {
              $scope.$apply(function () {
                try {
                  importSettings(text);
                }
                catch (err) {
                  $window.alert('上传的压缩包有错误，请检查！\n\n' + err.message);
                }
              });
            })
            .catch(function (err) {
              $window.alert('上传的压缩包有错误，请检查！\n\n' + err.message);
            });
        })
        .catch(function (err) {
          $window.alert('上传的压缩包有错误，请检查！\n\n' + err.message);
        });
    }

    function importSettings(text) {
      var data;
      data = JSON.parse(text);
      if (!$window.confirm('您确定要导入此设置文件吗？所有的现有设置都将被覆盖。')) {
        return;
      }
      console.log('将设置导入本地存储：', data);
      for (var key in data) {
        if (data.hasOwnProperty(key)) {
          localStorage[key] = data[key];
        }
      }
      $window.alert('设置已经成功导入，页面将重新加载以应用最新的设置。');
      $window.location.reload();
    }

    function generateExportText() {
      var settings = {};

      var keys = [
        'NG_TRANSLATE_LANG_KEY',
        'crafterStats',
        'pageStage_v2',
        'synths',
        'character'
      ];
      for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        settings[key] = localStorage[key];
      }

      return JSON.stringify(settings);
    }
  }

})();
