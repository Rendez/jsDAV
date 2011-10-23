require.paths.unshift(__dirname + '/../../../support/node-dropbox/support');

/*
 * @package jsDAV
 * @subpackage DAV
 * @copyright Copyright(c) 2011 Luis Merino
 * @author Luis Merino <mail AT luismerino DOT name>
 * @license http://github.com/mikedeboer/jsDAV/blob/master/LICENSE MIT License
 */

var jsDAV               = require("../../jsdav");
var jsDAV_Tree          = require("../tree").jsDAV_Tree;
var jsDAV_Dropbox_Directory = require("../dropbox/directory").jsDAV_Dropbox_Directory;
var jsDAV_Dropbox_File      = require("../dropbox/file").jsDAV_Dropbox_File;

var Client              = require("../../../support/node-dropbox");
var Auth                = require("../../../support/node-dropbox/lib/auth.js");
var Util                = require("../util");
var Exc                 = require("../exceptions");
var Path                = require('path');

/**
 * jsDAV_Tree_Dropbox
 *
 * Creates the Dropbox tree.
 *
 * @param {Object} options
 * @contructor
 */

function jsDAV_Tree_Dropbox(options) {
    this.options  = options;
    this.root = options.root;
    this.basePath = "/";    
    this.dropbox = this.setup();
}

exports.jsDAV_Tree_Dropbox = jsDAV_Tree_Dropbox;

(function() {

    this.setup = function() {
        var config = this.options;
        var apiHost = config.server;
        var contentHost = config.contentServer;
        var port = config.port;
        
        var oa = new Auth.getInstance(config);
        var at = config.accessToken;
        var atSecret = config.accessTokenSecret;
        
        return new Client(apiHost, contentHost, port, oa, at, atSecret);
    };

    /**
     * Returns a new node for the given path
     *
     * @param string path
     * @return void
     */
    this.getNodeForPath = function(path, cbfstree) {
        var realPath = this.getRealPath(path);
        var dropbox = this.dropbox;
        var root = this.root;
        
        var hash = null;
        var list = false;
        var limit = 0;
        
        dropbox.metadata(root, encodeURI(realPath), limit, hash, list, function(err, stat) {
            if (!Util.empty(err))
                return cbfstree(new Exc.jsDAV_Exception_FileNotFound("File at location " + realPath + " not found"));
            
            cbfstree(null, stat.is_dir
                ? new jsDAV_Dropbox_Directory(dropbox, root, realPath)
                : new jsDAV_Dropbox_File(dropbox, root, realPath))
        });
    };

    /**
     * Returns the real filesystem path for a webdav url.
     *
     * @param {String} publicPath
     * @return {String}
     */
    this.getRealPath = function(path) {
        return Path.normalize(Path.join(this.basePath, path));
    };

    /**
     * Copies a file or directory.
     *
     * This method must work recursively and delete the destination
     * if it exists
     *
     * @param string source
     * @param string destination
     * @return void
     */
    this.copy = function(source, destination, next) {
        
    };

    /**
     * Moves a file or directory recursively.
     * In case the ide crashed, the nodes cache was cleared and the source's parent will have to be pre-cached
     * and so will have its children using $getParentNodeRecall(), this way we will be able to come back to this method
     * to rename the source effectively.
     * Once the MOVE has been executed, the node need's to be updated in the cache, and if it's a Directory type its
     * children will have to be updated in the cache as well, so the new keys correspond to the new path.
     *
     * If the destination exists, delete it first.
     *
     * @param string source
     * @param string destination
     * @return void
     */
    this.move = function(source, destination, next) {
       
    };

    this.unmount = function() {
        if (this.client) {
            this.client = null;
            this.root = null;
        }
    };

}).call(jsDAV_Tree_Dropbox.prototype = new jsDAV_Tree());

