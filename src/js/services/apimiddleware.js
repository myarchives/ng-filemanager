(function (angular) {
    'use strict';
    angular.module('FileManagerApp').service('apiMiddleware', ['$window', 'fileManagerConfig', 'apiHandler',
        function ($window, fileManagerConfig, ApiHandler) {

            var ApiMiddleware = function () {
                this.apiHandler = new ApiHandler();
                this.rootFolders = [];



            };


            ApiMiddleware.prototype.setrootFolders = function (array) {
                this.rootFolders = array;
                console.log(this.rootFolders)

            };
            ApiMiddleware.prototype.getPath = function (arrayPath) {
                if (angular.isArray(arrayPath))
                    return '/' + arrayPath.join('/');

                return arrayPath;
            };
            ApiMiddleware.prototype.getApiPath = function (path) {
                if (angular.isArray(path))
                    path = this.getPath(path);
                if (fileManagerConfig.multipleBridges) {
                    if (this.rootFolders.length == 0) {
                        var self = this;

                        this.apiHandler.fastList(fileManagerConfig.bridgesFolder + fileManagerConfig.listUrl, this.getPath(fileManagerConfig.basePath)).then(function (data) {
                            self.rootFolders = [];
                            angular.forEach(data.result, function (value, key) {
                                this.push(self.getPath(fileManagerConfig.basePath) + "/" + value.name);
                            }, self.rootFolders);
                        });
                    }

                    var index = this.rootFolders.indexOf(path);
                    if (index >= 0)
                        return this.rootFolders[index];
                    return fileManagerConfig.bridgesFolder;
                }
                return fileManagerConfig.bridgesFolder;
            };

            ApiMiddleware.prototype.getFileList = function (files) {
                return (files || []).map(function (file) {
                    return file && file.model.fullPath();
                });
            };

            ApiMiddleware.prototype.getFilePath = function (item) {
                return item && item.model.fullPath();
            };

            ApiMiddleware.prototype.list = function (path, customDeferredHandler) {

                return this.apiHandler.list(this.getApiPath(path) + fileManagerConfig.listUrl, this.getPath(path), customDeferredHandler);
            };

            ApiMiddleware.prototype.copy = function (files, path) {


                var items = this.getFileList(files);
                var singleFilename = items.length === 1 ? files[0].tempModel.name : undefined;
                return this.apiHandler.copy(this.getApiPath(this.getPath(path)) + fileManagerConfig.copyUrl, items, this.getPath(path), singleFilename);
            };

            ApiMiddleware.prototype.move = function (files, path) {

                var items = this.getFileList(files);
                return this.apiHandler.move(this.getApiPath(this.getPath(path)) + fileManagerConfig.moveUrl, items, this.getPath(path));
            };

            ApiMiddleware.prototype.remove = function (files) {

                var items = this.getFileList(files);

                return this.apiHandler.remove(this.getApiPath(files[0].model.fullPath()) + fileManagerConfig.removeUrl, items);
            };

            ApiMiddleware.prototype.upload = function (files, path) {
                if (!$window.FormData) {
                    throw new Error('Unsupported browser version');
                }

                var destination = this.getPath(path);

                return this.apiHandler.upload(this.getApiPath(destination) + fileManagerConfig.uploadUrl, destination, files);
            };

            ApiMiddleware.prototype.getContent = function (item) {
                var itemPath = this.getFilePath(item);
                return this.apiHandler.getContent(this.getApiPath(itemPath) + fileManagerConfig.getContentUrl, itemPath);
            };

            ApiMiddleware.prototype.edit = function (item) {
                var itemPath = this.getFilePath(item);
                return this.apiHandler.edit(this.getApiPath(itemPath) + fileManagerConfig.editUrl, itemPath, item.tempModel.content);
            };

            ApiMiddleware.prototype.rename = function (item) {
                var itemPath = this.getFilePath(item);
                var newPath = item.tempModel.fullPath();

                return this.apiHandler.rename(this.getApiPath(itemPath) + fileManagerConfig.renameUrl, itemPath, newPath);
            };

            ApiMiddleware.prototype.getUrl = function (item) {
                var itemPath = this.getFilePath(item);
                return this.apiHandler.getUrl(this.getApiPath(itemPath) + fileManagerConfig.downloadFileUrl, itemPath);
            };

            ApiMiddleware.prototype.download = function (item, forceNewWindow) {
                //TODO: add spinner to indicate file is downloading
                var itemPath = this.getFilePath(item);
                var toFilename = item.model.name;

                if (item.isFolder()) {
                    return;
                }

                return this.apiHandler.download(
                    this.getApiPath(itemPath) + fileManagerConfig.downloadFileUrl,
                    itemPath,
                    toFilename,
                    fileManagerConfig.downloadFilesByAjax,
                    forceNewWindow
                );
            };

            ApiMiddleware.prototype.downloadMultiple = function (files, forceNewWindow) {
                var items = this.getFileList(files);
                var timestamp = new Date().getTime().toString().substr(8, 13);
                var toFilename = timestamp + '-' + fileManagerConfig.multipleDownloadFileName;


                return this.apiHandler.downloadMultiple(
                    this.getApiPath(items[0]) + fileManagerConfig.downloadMultipleUrl,
                    items,
                    toFilename,
                    fileManagerConfig.downloadFilesByAjax,
                    forceNewWindow
                );
            };

            ApiMiddleware.prototype.compress = function (files, compressedFilename, path) {
                var items = this.getFileList(files);
                return this.apiHandler.compress(this.getApiPath(items[0]) + fileManagerConfig.compressUrl, items, compressedFilename, this.getPath(path));
            };

            ApiMiddleware.prototype.extract = function (item, folderName, path) {
                var itemPath = this.getFilePath(item);
                return this.apiHandler.extract(this.getApiPath(itemPath) + fileManagerConfig.extractUrl, itemPath, folderName, this.getPath(path));
            };

            ApiMiddleware.prototype.changePermissions = function (files, dataItem) {
                var items = this.getFileList(files);
                var code = dataItem.tempModel.perms.toCode();
                var octal = dataItem.tempModel.perms.toOctal();
                var recursive = !!dataItem.tempModel.recursive;

                return this.apiHandler.changePermissions(this.getApiPath(items[0]) + fileManagerConfig.permissionsUrl, items, code, octal, recursive);
            };

            ApiMiddleware.prototype.createFolder = function (path) {

                return this.apiHandler.createFolder(this.getApiPath(path) + fileManagerConfig.createFolderUrl, path);
            };

            ApiMiddleware.prototype.createFile = function (path) {

                return this.apiHandler.createFile(this.getApiPath(path) + fileManagerConfig.createFileUrl, path);
            };

            return ApiMiddleware;

        }
    ]);
})(angular);